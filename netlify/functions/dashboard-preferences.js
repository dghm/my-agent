import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'dashboard-preferences';
export const DASHBOARD_PANEL_IDS = ['today', 'reminders', 'review', 'monitoring', 'primary', 'workflow', 'tools'];

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function sessionFromRequest(req) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  const match = (req.headers.get('cookie') || '').match(/(?:^|;\s*)dghm_session=([^;]*)/);
  if (!match) return null;
  let token;
  try { token = decodeURIComponent(match[1]); } catch { return null; }
  const [data, signature] = token.split('.');
  if (!data || !signature) return null;
  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const session = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    return session.exp > Date.now() && session.uid ? session : null;
  } catch { return null; }
}

function ownerPrefix(uid) {
  return crypto.createHash('sha256').update(String(uid)).digest('hex').slice(0, 24);
}

export function sanitizeHiddenPanels(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id) => DASHBOARD_PANEL_IDS.includes(id)))];
}

export default async (req) => {
  const session = sessionFromRequest(req);
  if (!session) return json(401, { ok: false, error: '請先登入工作台', code: 'unauthenticated' });

  const store = getStore({ name: STORE_NAME, consistency: 'strong' });
  const key = `${ownerPrefix(session.uid)}/preferences`;
  try {
    if (req.method === 'GET') {
      const preferences = await store.get(key, { type: 'json' });
      return json(200, { ok: true, hiddenPanels: sanitizeHiddenPanels(preferences?.hiddenPanels) });
    }
    if (req.method !== 'POST') return json(405, { ok: false, error: '不支援此請求方式' });

    let input;
    try { input = await req.json(); } catch { return json(400, { ok: false, error: '版面設定格式錯誤' }); }
    if (!Array.isArray(input?.hiddenPanels)) return json(400, { ok: false, error: '版面設定格式錯誤' });
    const hiddenPanels = sanitizeHiddenPanels(input.hiddenPanels);
    await store.setJSON(key, { version: 1, hiddenPanels, updatedAt: new Date().toISOString() });
    return json(200, { ok: true, hiddenPanels });
  } catch (error) {
    const detail = error instanceof Error && error.message ? `（${error.message}）` : '';
    return json(502, { ok: false, error: `無法讀寫總覽版面設定${detail}` });
  }
};

export const config = { path: '/api/dashboard-preferences' };
