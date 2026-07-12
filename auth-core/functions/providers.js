// ============================================================
// providers.js — 各家 OAuth 供應商的描述表
// ------------------------------------------------------------
// 要新增一家 provider，就在下面多加一個條目即可，auth.js 不用改。
// 每個 provider 需提供：
//   label            顯示名稱
//   authorizeUrl     授權頁網址
//   scope            要求的權限
//   extraAuthParams  授權時額外帶的 query 參數（選用）
//   env              讀哪兩個環境變數 { id, secret }
//   exchange(code, redirectUri, creds) -> token物件 | null   用 code 換 token
//   profile(token, creds) -> { providerId, email, name, avatar } | null
// ============================================================

// 小工具：發 application/x-www-form-urlencoded 的 POST
function form(url, params) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
}

export const PROVIDERS = {
  // ---- Google (OpenID Connect) ----
  google: {
    label: 'Google',
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'openid email profile',
    extraAuthParams: { access_type: 'online', prompt: 'select_account' },
    env: { id: 'GOOGLE_CLIENT_ID', secret: 'GOOGLE_CLIENT_SECRET' },
    async exchange(code, redirectUri, creds) {
      const res = await form('https://oauth2.googleapis.com/token', {
        code,
        client_id: creds.id,
        client_secret: creds.secret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });
      return res.ok ? res.json() : null;
    },
    async profile(token) {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
      if (!res.ok) return null;
      const u = await res.json();
      return { providerId: u.sub, email: u.email || '', name: u.name || '', avatar: u.picture || '' };
    },
  },

  // ---- LINE Login (OAuth 2.1 / OIDC) ----
  line: {
    label: 'LINE',
    authorizeUrl: 'https://access.line.me/oauth2/v2.1/authorize',
    scope: 'profile openid email', // email 需在 LINE 後台另外申請許可，否則為空
    env: { id: 'LINE_CHANNEL_ID', secret: 'LINE_CHANNEL_SECRET' },
    async exchange(code, redirectUri, creds) {
      const res = await form('https://api.line.me/oauth2/v2.1/token', {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: creds.id,
        client_secret: creds.secret,
      });
      return res.ok ? res.json() : null;
    },
    async profile(token, creds) {
      // 優先用 id_token（含 email，若已取得 email 權限）
      if (token.id_token) {
        const res = await form('https://api.line.me/oauth2/v2.1/verify', {
          id_token: token.id_token,
          client_id: creds.id,
        });
        if (res.ok) {
          const v = await res.json();
          return { providerId: v.sub, email: v.email || '', name: v.name || '', avatar: v.picture || '' };
        }
      }
      // 後備：profile API（拿不到 email）
      const res = await fetch('https://api.line.me/v2/profile', {
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
      if (!res.ok) return null;
      const p = await res.json();
      return { providerId: p.userId, email: '', name: p.displayName || '', avatar: p.pictureUrl || '' };
    },
  },

  // ---- Facebook Login (OAuth 2.0) ----
  facebook: {
    label: 'Facebook',
    authorizeUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    scope: 'public_profile', // 要 email 需 Meta 審查後改成 'public_profile,email'
    env: { id: 'FACEBOOK_APP_ID', secret: 'FACEBOOK_APP_SECRET' },
    async exchange(code, redirectUri, creds) {
      const url =
        'https://graph.facebook.com/v19.0/oauth/access_token?' +
        new URLSearchParams({
          client_id: creds.id,
          client_secret: creds.secret,
          redirect_uri: redirectUri,
          code,
        });
      const res = await fetch(url);
      return res.ok ? res.json() : null;
    },
    async profile(token) {
      const url =
        'https://graph.facebook.com/me?' +
        new URLSearchParams({
          fields: 'id,name,email,picture.type(large)',
          access_token: token.access_token,
        });
      const res = await fetch(url);
      if (!res.ok) return null;
      const u = await res.json();
      return {
        providerId: u.id,
        email: u.email || '',
        name: u.name || '',
        avatar: (u.picture && u.picture.data && u.picture.data.url) || '',
      };
    },
  },
};
