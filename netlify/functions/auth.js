import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

/* ============================================================
   會員第三方登入（OAuth）後端
   目前支援：Google
   路由（config.path = /api/auth/*）：
     GET  /api/auth/login/google     → 導向 Google 授權頁
     GET  /api/auth/callback/google  → Google 回呼，換 token、建立會員、發登入 cookie
     GET  /api/auth/me               → 回傳目前登入的會員（未登入回 { user: null }）
     GET  /api/auth/logout           → 清除登入 cookie
   會員資料存於 Netlify Blobs（store: members, key: users）。
   ============================================================ */

const SESSION_COOKIE = 'dghm_session';
const STATE_COOKIE = 'dghm_oauth_state';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 天
const STATE_MAX_AGE = 10 * 60; // 10 分鐘

const SESSION_SECRET = process.env.SESSION_SECRET || 'insecure-dev-secret-please-set-SESSION_SECRET';

/* ---- 小工具 ---- */

function siteOrigin(req) {
  // OAuth 的 redirect_uri 必須跟 Google 後台登記的完全一致。
  // 正式站用請求本身的來源；可用 SITE_URL 覆寫（例如本機測試）。
  return process.env.SITE_URL || new URL(req.url).origin;
}

function hmac(data) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
}

function createSession(user) {
  const payload = {
    uid: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    provider: user.provider,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${data}.${hmac(data)}`;
}

function verifySession(token) {
  if (!token) return null;
  const [data, sig] = token.split('.');
  if (!data || !sig || hmac(data) !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function getCookie(req, name) {
  const header = req.headers.get('cookie') || '';
  const match = header.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function buildCookie(name, value, maxAge, secure) {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (secure) parts.push('Secure');
  parts.push(`Max-Age=${maxAge}`);
  return parts.join('; ');
}

function redirect(location, cookies = []) {
  const headers = new Headers({ Location: location });
  for (const c of cookies) headers.append('Set-Cookie', c);
  return new Response(null, { status: 302, headers });
}

function json(status, payload, cookies = []) {
  const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });
  for (const c of cookies) headers.append('Set-Cookie', c);
  return new Response(JSON.stringify(payload), { status, headers });
}

/* ---- 會員儲存（Netlify Blobs） ---- */

async function findOrCreateUser(profile) {
  const store = getStore('members');
  const users = (await store.get('users', { type: 'json' })) || [];
  const now = new Date().toISOString();

  let user = users.find(
    (u) => u.provider === profile.provider && u.providerId === profile.providerId
  );

  if (user) {
    user.email = profile.email || user.email;
    user.name = profile.name || user.name;
    user.avatar = profile.avatar || user.avatar;
    user.lastLoginAt = now;
  } else {
    user = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      provider: profile.provider,
      providerId: profile.providerId,
      email: profile.email || '',
      name: profile.name || '',
      avatar: profile.avatar || '',
      createdAt: now,
      lastLoginAt: now,
    };
    users.push(user);
  }

  await store.setJSON('users', users);
  return user;
}

/* ---- Google OAuth ---- */

function googleLogin(req) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return json(500, { ok: false, error: '尚未設定 GOOGLE_CLIENT_ID 環境變數' });
  }

  const origin = siteOrigin(req);
  const secure = origin.startsWith('https');
  const state = crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/auth/callback/google`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });

  return redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, [
    buildCookie(STATE_COOKIE, state, STATE_MAX_AGE, secure),
  ]);
}

async function googleCallback(req) {
  const origin = siteOrigin(req);
  const secure = origin.startsWith('https');
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = getCookie(req, STATE_COOKIE);

  if (url.searchParams.get('error')) {
    return redirect('/login.html?error=denied');
  }
  if (!code || !state || !cookieState || state !== cookieState) {
    return redirect('/login.html?error=state');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return redirect('/login.html?error=config');
  }

  // 1) 用 code 換 access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${origin}/api/auth/callback/google`,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) return redirect('/login.html?error=token');
  const token = await tokenRes.json();

  // 2) 用 access token 取得使用者資料
  const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!infoRes.ok) return redirect('/login.html?error=userinfo');
  const info = await infoRes.json();

  // 3) 建立／更新會員
  const user = await findOrCreateUser({
    provider: 'google',
    providerId: info.sub,
    email: info.email || '',
    name: info.name || '',
    avatar: info.picture || '',
  });

  // 4) 發登入 cookie，清除 state，導回首頁
  return redirect('/index.html', [
    buildCookie(SESSION_COOKIE, createSession(user), SESSION_MAX_AGE, secure),
    buildCookie(STATE_COOKIE, '', 0, secure),
  ]);
}

/* ---- 進入點 ---- */

export default async (req) => {
  const path = new URL(req.url).pathname;
  const secure = siteOrigin(req).startsWith('https');

  try {
    if (path.endsWith('/login/google')) return googleLogin(req);
    if (path.endsWith('/callback/google')) return googleCallback(req);

    if (path.endsWith('/me')) {
      const session = verifySession(getCookie(req, SESSION_COOKIE));
      if (!session) return json(200, { ok: true, user: null });
      return json(200, {
        ok: true,
        user: {
          id: session.uid,
          email: session.email,
          name: session.name,
          avatar: session.avatar,
          provider: session.provider,
        },
      });
    }

    if (path.endsWith('/logout')) {
      return redirect('/login.html', [buildCookie(SESSION_COOKIE, '', 0, secure)]);
    }

    return json(404, { ok: false, error: 'Not Found' });
  } catch (err) {
    return json(500, { ok: false, error: err instanceof Error ? err.message : '未知錯誤' });
  }
};

export const config = { path: '/api/auth/*' };
