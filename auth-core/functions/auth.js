// ============================================================
// auth.js — 第三方登入（OAuth）認證核心 · Netlify Function
// ------------------------------------------------------------
// 這是「第 ① 層：認證核心」，不含任何專案專屬邏輯。
// provider 定義在 providers.js；專案設定在 config.js；授權在 config.authorize。
//
// 路由（config.path = /api/auth/*）：
//   GET /api/auth/login/:provider     → 導向該平台授權頁
//   GET /api/auth/callback/:provider  → 換 token、建立會員、（授權）、發登入 cookie
//   GET /api/auth/me                  → 回傳目前登入的會員（未登入 { user: null }）
//   GET /api/auth/logout              → 清除登入 cookie
//
// 會員資料存於 Netlify Blobs（store 由 config.memberStore 指定，key 'users'）。
// ============================================================

import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';
import { PROVIDERS } from './providers.js';
import { CONFIG } from './config.js';

const SESSION_COOKIE = 'app_session';
const STATE_COOKIE = 'app_oauth_state';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 天
const STATE_MAX_AGE = 10 * 60; // 10 分鐘

const SESSION_SECRET =
  process.env.SESSION_SECRET || 'insecure-dev-secret-please-set-SESSION_SECRET';

/* ---- 小工具 ---- */

function siteOrigin(req) {
  // OAuth 的 redirect_uri 必須跟各平台後台登記的一致。
  // 預設用請求本身的來源；本機測試可用 SITE_URL 覆寫。
  return process.env.SITE_URL || new URL(req.url).origin;
}

function hmac(data) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
}

function createSession(member, extra = {}) {
  const payload = {
    uid: member.id,
    email: member.email,
    name: member.name,
    avatar: member.avatar,
    provider: member.provider,
    ...extra,
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

function creds(provider) {
  const p = PROVIDERS[provider];
  return { id: process.env[p.env.id], secret: process.env[p.env.secret] };
}

/* ---- 會員儲存（Netlify Blobs） ---- */

async function findOrCreateUser(profile) {
  const store = getStore(CONFIG.memberStore);
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

/* ---- OAuth 流程（provider 無關） ---- */

function startLogin(req, provider) {
  const p = PROVIDERS[provider];
  const c = creds(provider);
  if (!c.id) return json(500, { ok: false, error: `未設定 ${p.env.id} 環境變數` });

  const origin = siteOrigin(req);
  const secure = origin.startsWith('https');
  const state = crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id: c.id,
    redirect_uri: `${origin}/api/auth/callback/${provider}`,
    response_type: 'code',
    scope: p.scope,
    state,
    ...(p.extraAuthParams || {}),
  });

  return redirect(`${p.authorizeUrl}?${params}`, [
    buildCookie(STATE_COOKIE, state, STATE_MAX_AGE, secure),
  ]);
}

async function finishLogin(req, provider) {
  const p = PROVIDERS[provider];
  const origin = siteOrigin(req);
  const secure = origin.startsWith('https');
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = getCookie(req, STATE_COOKIE);

  if (url.searchParams.get('error')) return redirect(`${CONFIG.loginPage}?error=denied`);
  if (!code || !state || !cookieState || state !== cookieState) {
    return redirect(`${CONFIG.loginPage}?error=state`);
  }

  const c = creds(provider);
  if (!c.id || !c.secret) return redirect(`${CONFIG.loginPage}?error=config`);

  const redirectUri = `${origin}/api/auth/callback/${provider}`;

  const token = await p.exchange(code, redirectUri, c);
  if (!token) return redirect(`${CONFIG.loginPage}?error=token`);

  const prof = await p.profile(token, c);
  if (!prof || !prof.providerId) return redirect(`${CONFIG.loginPage}?error=userinfo`);

  const member = await findOrCreateUser({ provider, ...prof });

  // ── 第 ③ 層：授權 ──
  const decision = (await CONFIG.authorize(member)) || {};
  if (!decision.allow) {
    return redirect(`${CONFIG.loginPage}?error=unauthorized`, [
      buildCookie(STATE_COOKIE, '', 0, secure),
    ]);
  }

  return redirect(decision.redirect || CONFIG.defaultRedirect, [
    buildCookie(SESSION_COOKIE, createSession(member, decision.session || {}), SESSION_MAX_AGE, secure),
    buildCookie(STATE_COOKIE, '', 0, secure),
  ]);
}

/* ---- 進入點 ---- */

export default async (req) => {
  const path = new URL(req.url).pathname;
  const secure = siteOrigin(req).startsWith('https');

  try {
    const m = path.match(/\/api\/auth\/(login|callback)\/([a-z0-9_-]+)/i);
    if (m) {
      const action = m[1];
      const provider = m[2];
      if (!PROVIDERS[provider] || !CONFIG.enabledProviders.includes(provider)) {
        return json(404, { ok: false, error: '未啟用的 provider' });
      }
      return action === 'login' ? startLogin(req, provider) : finishLogin(req, provider);
    }

    if (path.endsWith('/me')) {
      const session = verifySession(getCookie(req, SESSION_COOKIE));
      if (!session) return json(200, { ok: true, user: null });
      const { exp, ...user } = session;
      return json(200, { ok: true, user });
    }

    if (path.endsWith('/logout')) {
      return redirect(CONFIG.loginPage, [buildCookie(SESSION_COOKIE, '', 0, secure)]);
    }

    return json(404, { ok: false, error: 'Not Found' });
  } catch (err) {
    return json(500, { ok: false, error: err instanceof Error ? err.message : '未知錯誤' });
  }
};

export const config = { path: '/api/auth/*' };
