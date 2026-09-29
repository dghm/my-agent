import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'monthly-footprints';
const MONTH_PATTERN = /^(20\d{2}|2100)-(0[1-9]|1[0-2])$/;
const YEAR_PATTERN = /^(20\d{2}|2100)$/;
const MAX_TITLE_LENGTH = 60;
const MAX_NOTE_LENGTH = 140;

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
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    return session.exp > Date.now() && session.uid ? session : null;
  } catch {
    return null;
  }
}

function userPrefix(uid) {
  return crypto.createHash('sha256').update(String(uid)).digest('hex').slice(0, 24);
}

function normalizeInput(input) {
  const month = String(input?.month || '').trim();
  const title = String(input?.title || '').trim();
  const note = String(input?.note || '').trim();

  if (!MONTH_PATTERN.test(month)) return { error: '月份格式錯誤' };
  if (!title) return { error: '請填寫這個月完成的事項' };
  if (title.length > MAX_TITLE_LENGTH) return { error: `完成事項不可超過 ${MAX_TITLE_LENGTH} 字` };
  if (note.length > MAX_NOTE_LENGTH) return { error: `備註不可超過 ${MAX_NOTE_LENGTH} 字` };
  return { month, title, note };
}

export default async (req) => {
  const session = sessionFromRequest(req);
  if (!session) return json(401, { ok: false, error: '請先登入工作台', code: 'unauthenticated' });

  const owner = userPrefix(session.uid);
  const store = getStore({ name: STORE_NAME, consistency: 'strong' });

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const month = String(url.searchParams.get('month') || '').trim();
      const year = String(url.searchParams.get('year') || '').trim();

      if (month) {
        if (!MONTH_PATTERN.test(month)) return json(400, { ok: false, error: '月份格式錯誤' });
        const footprint = await store.get(`${owner}/${month}`, { type: 'json' });
        return json(200, { ok: true, footprint: footprint || null });
      }

      if (!YEAR_PATTERN.test(year)) return json(400, { ok: false, error: '年份格式錯誤' });
      const result = await store.list({ prefix: `${owner}/${year}-` });
      const footprints = (await Promise.all(
        result.blobs.map((blob) => store.get(blob.key, { type: 'json' }))
      ))
        .filter(Boolean)
        .sort((a, b) => b.month.localeCompare(a.month));
      return json(200, { ok: true, year, footprints });
    }

    if (req.method === 'PUT') {
      let input;
      try { input = await req.json(); } catch { return json(400, { ok: false, error: '足跡資料格式錯誤' }); }
      const normalized = normalizeInput(input);
      if (normalized.error) return json(400, { ok: false, error: normalized.error });

      const key = `${owner}/${normalized.month}`;
      const existing = await store.get(key, { type: 'json' });
      const now = new Date().toISOString();
      const footprint = {
        month: normalized.month,
        title: normalized.title,
        note: normalized.note,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };
      await store.setJSON(key, footprint);
      return json(200, { ok: true, footprint });
    }

    return json(405, { ok: false, error: '不支援此請求方式' });
  } catch (error) {
    const detail = error instanceof Error && error.message ? `（${error.message}）` : '';
    return json(502, { ok: false, error: `無法讀寫月度足跡${detail}` });
  }
};

export const config = { path: '/api/monthly-footprints' };
