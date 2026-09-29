import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'service-prices';
const STORE_KEY = 'ranges';
const MAX_ITEMS = 250;
const MAX_PRICE = 100000000;

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
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
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    return session.exp > Date.now() && session.uid ? session : null;
  } catch { return null; }
}

function normalizeRanges(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { error: '價格資料格式錯誤' };
  }
  const entries = Object.entries(value);
  if (entries.length > MAX_ITEMS) return { error: '價格項目數量超過限制' };
  const ranges = {};
  for (const [id, range] of entries) {
    if (!/^[a-z0-9-]{1,80}$/.test(id) || !range || typeof range !== 'object' || Array.isArray(range)) {
      return { error: '價格項目格式錯誤' };
    }
    const min = Number(range.min);
    const max = Number(range.max);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < 0 || min > MAX_PRICE || max > MAX_PRICE) {
      return { error: `「${id}」的價格區間無效` };
    }
    ranges[id] = { min: Math.min(min, max), max: Math.max(min, max) };
  }
  return { ranges };
}

export default async (req) => {
  const session = sessionFromRequest(req);
  if (!session) return json(401, { ok: false, error: '請先登入工作台', code: 'unauthenticated' });
  const store = getStore(STORE_NAME);

  try {
    if (req.method === 'GET') {
      const saved = await store.get(STORE_KEY, { type: 'json' });
      return json(200, {
        ok: true,
        exists: !!saved,
        ranges: saved?.ranges || {},
        updatedAt: saved?.updatedAt || null,
        updatedBy: saved?.updatedBy || null,
      });
    }

    if (req.method === 'PUT') {
      let input;
      try { input = await req.json(); } catch { return json(400, { ok: false, error: '價格資料格式錯誤' }); }
      const normalized = normalizeRanges(input?.ranges);
      if (normalized.error) return json(400, { ok: false, error: normalized.error });
      const saved = {
        ranges: normalized.ranges,
        updatedAt: new Date().toISOString(),
        updatedBy: session.email || session.name || session.uid,
      };
      await store.setJSON(STORE_KEY, saved);
      return json(200, { ok: true, ...saved });
    }

    return json(405, { ok: false, error: '不支援此請求方式' });
  } catch (error) {
    const detail = error instanceof Error && error.message ? `（${error.message}）` : '';
    return json(502, { ok: false, error: `無法讀寫共用價格${detail}` });
  }
};

export const config = { path: '/api/service-prices' };
