import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';
import { buildQuoteModel, populateQuoteDocument } from './lib/quote-docs.js';

const DOCS_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const AUTH_URL = '/api/auth/login/google?grant=docs';

function json(status, payload) {
  return new Response(JSON.stringify(payload), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
  } });
}

function sessionOf(req) {
  const cookie = (req.headers.get('cookie') || '').match(/(?:^|;\s*)dghm_session=([^;]*)/);
  if (!cookie) return null;
  try {
    const [data, signature] = decodeURIComponent(cookie[1]).split('.');
    if (!data || !signature) return null;
    const expected = crypto.createHmac('sha256', process.env.SESSION_SECRET).update(data).digest('base64url');
    const actual = Buffer.from(signature);
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, Buffer.from(expected))) return null;
    const session = JSON.parse(Buffer.from(data, 'base64url').toString());
    return session.uid && session.exp > Date.now() ? session : null;
  } catch { return null; }
}

function googleError(response, data) {
  const details = data.error?.details || [];
  const reasons = [...(data.error?.errors || []), ...details].map((item) => item.reason);
  if (reasons.includes('SERVICE_DISABLED') || reasons.includes('accessNotConfigured')) {
    return { status: 503, code: 'docs_api_disabled', error: 'Google 文件功能尚未啟用，請在 Google Cloud 的登入專案啟用 Google Docs API' };
  }
  if (response.status === 401 || reasons.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT') || reasons.includes('insufficientPermissions')) {
    return { status: 409, code: 'no_docs_grant', error: '請重新授權 Google 文件存取後再建立文件', authUrl: AUTH_URL };
  }
  return { status: response.status === 429 ? 429 : 502, code: 'docs_export_failed', error: response.status === 429
    ? 'Google 文件建立次數暫時達到限制，請稍後再試'
    : 'Google 文件建立未完成，請稍後再試或確認帳號的文件存取權限' };
}

export function createQuoteDocsHandler({ store = getStore, fetchApi = fetch } = {}) {
  return async (req) => {
    if (req.method !== 'POST') return json(405, { ok: false, error: '請使用 POST 建立文件' });
    const origin = req.headers.get('origin');
    if (origin && origin !== new URL(req.url).origin) return json(403, { ok: false, error: '請從本站建立文件' });
    if (!process.env.SESSION_SECRET) return json(503, { ok: false, code: 'session_not_configured', error: 'Google 文件功能需要設定 SESSION_SECRET 後才能使用' });
    const session = sessionOf(req);
    if (!session) return json(401, { ok: false, code: 'unauthenticated', error: '請先使用 Google 登入並授權建立文件', authUrl: AUTH_URL });
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) return json(503, { ok: false, code: 'google_not_configured', error: 'Google 登入尚未設定，請先完成 GOOGLE_CLIENT_ID 與 GOOGLE_CLIENT_SECRET 設定' });

    let model;
    try {
      const raw = await req.text();
      if (Buffer.byteLength(raw) > 300000) return json(413, { ok: false, error: '報價資料過大，請拆成較小的文件' });
      model = buildQuoteModel(JSON.parse(raw));
    } catch (err) {
      return json(400, { ok: false, error: err instanceof SyntaxError ? '報價資料不是有效的 JSON' : err.message });
    }

    let documentId;
    try {
      const users = await store('members').get('users', { type: 'json' }) || [];
      const user = users.find((member) => member.id === session.uid);
      if (user?.provider !== 'google' || !user.googleRefreshToken) {
        return json(409, { ok: false, code: 'no_docs_grant', error: '請使用 Google 帳號授權建立文件', authUrl: AUTH_URL });
      }
      const tokenResponse = await fetchApi('https://oauth2.googleapis.com/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: user.googleRefreshToken, grant_type: 'refresh_token' }),
        signal: AbortSignal.timeout(15000),
      });
      const token = await tokenResponse.json();
      if (!tokenResponse.ok || !token.access_token) {
        return json(409, { ok: false, code: 'no_docs_grant', error: 'Google 授權已失效，請重新授權建立文件', authUrl: AUTH_URL });
      }
      if (token.scope && !token.scope.split(' ').includes(DOCS_SCOPE)) {
        return json(409, { ok: false, code: 'no_docs_grant', error: '請先授權 Google 文件功能', authUrl: AUTH_URL });
      }
      async function call(path, options = {}) {
        const response = await fetchApi(`https://docs.googleapis.com/v1${path}`, {
          ...options, headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(15000),
        });
        const data = await response.json();
        if (!response.ok) throw Object.assign(new Error('Google Docs request failed'), { result: googleError(response, data) });
        return data;
      }
      const created = await call('/documents', { method: 'POST', body: JSON.stringify({ title: model.title }) });
      if (!/^[A-Za-z0-9_-]+$/.test(created.documentId || '')) throw new Error('Missing document ID');
      documentId = created.documentId;
      await populateQuoteDocument(model, documentId, call);
      return json(200, { ok: true, documentId, title: model.title, url: `https://docs.google.com/document/d/${documentId}/edit` });
    } catch (err) {
      const result = err.result || { status: 502, code: 'docs_export_failed', error: 'Google 文件建立未完成，請稍後再試' };
      const { status, ...payload } = result;
      return json(status, { ok: false, ...payload,
        ...(documentId ? { partialUrl: `https://docs.google.com/document/d/${documentId}/edit` } : {}),
      });
    }
  };
}

export default createQuoteDocsHandler();
export const config = { path: '/api/quote-docs/create' };
