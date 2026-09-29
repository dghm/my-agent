import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'milestones';
const LEGACY_STORE_NAME = 'monthly-footprints';
const DATE_PATTERN = /^(20\d{2}|2100)-(0[1-9]|1[0-2])-([012]\d|3[01])$/;
const MONTH_PATTERN = /^(20\d{2}|2100)-(0[1-9]|1[0-2])$/;
const YEAR_PATTERN = /^(20\d{2}|2100)$/;
const ID_PATTERN = /^[a-z0-9-]{6,80}$/;

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
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  try {
    const session = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    return session.exp > Date.now() && session.uid ? session : null;
  } catch {
    return null;
  }
}

function ownerPrefix(uid) {
  return crypto.createHash('sha256').update(String(uid)).digest('hex').slice(0, 24);
}

function validDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function normalizeInput(input) {
  const date = String(input?.date || '').trim();
  const title = String(input?.title || '').trim();
  const note = String(input?.note || '').trim();
  const category = String(input?.category || '').trim();

  if (!validDate(date)) return { error: '日期格式錯誤' };
  if (!title) return { error: '請填寫大事紀標題' };
  if (title.length > 80) return { error: '標題不可超過 80 字' };
  if (note.length > 300) return { error: '說明不可超過 300 字' };
  if (category.length > 30) return { error: '分類不可超過 30 字' };
  return { date, month: date.slice(0, 7), title, note, category, isFocus: input?.isFocus === true };
}

async function readRecords(store, owner, filter = {}) {
  const result = await store.list({ prefix: `${owner}/` });
  const records = (await Promise.all(result.blobs.map((blob) => store.get(blob.key, { type: 'json' })))).filter(Boolean);
  return records
    .filter((record) => !filter.year || record.month?.slice(0, 4) === filter.year)
    .filter((record) => !filter.month || record.month === filter.month)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

async function clearMonthFocus(store, owner, month, exceptId) {
  const records = await readRecords(store, owner, { month });
  await Promise.all(records
    .filter((record) => record.isFocus && record.id !== exceptId)
    .map((record) => store.setJSON(`${owner}/${record.id}`, {
      ...record,
      isFocus: false,
      updatedAt: new Date().toISOString(),
    })));
}

async function migrateLegacyYear(owner, year, store) {
  const markerKey = `migration/${owner}/${year}`;
  if (await store.get(markerKey, { type: 'json' })) return;
  const legacyStore = getStore({ name: LEGACY_STORE_NAME, consistency: 'strong' });
  const legacyList = await legacyStore.list({ prefix: `${owner}/${year}-` });
  for (const blob of legacyList.blobs) {
    const legacy = await legacyStore.get(blob.key, { type: 'json' });
    if (!legacy?.month || !legacy?.title) continue;
    const id = `legacy-${legacy.month}`;
    const existing = await store.get(`${owner}/${id}`, { type: 'json' });
    if (existing) continue;
    const now = new Date().toISOString();
    const sameMonth = await readRecords(store, owner, { month: legacy.month });
    await store.setJSON(`${owner}/${id}`, {
      id,
      date: `${legacy.month}-01`,
      month: legacy.month,
      title: String(legacy.title).slice(0, 80),
      note: String(legacy.note || '').slice(0, 300),
      category: '',
      isFocus: sameMonth.length === 0,
      createdAt: legacy.createdAt || now,
      updatedAt: legacy.updatedAt || now,
      migratedFrom: 'monthly-footprints',
    });
  }
  await store.setJSON(markerKey, { migratedAt: new Date().toISOString() });
}

export default async (req) => {
  const session = sessionFromRequest(req);
  if (!session) return json(401, { ok: false, error: '請先登入工作台', code: 'unauthenticated' });

  const owner = ownerPrefix(session.uid);
  const store = getStore({ name: STORE_NAME, consistency: 'strong' });
  const url = new URL(req.url);

  try {
    if (req.method === 'GET') {
      const year = String(url.searchParams.get('year') || '').trim();
      const month = String(url.searchParams.get('month') || '').trim();
      if (year && !YEAR_PATTERN.test(year)) return json(400, { ok: false, error: '年份格式錯誤' });
      if (month && !MONTH_PATTERN.test(month)) return json(400, { ok: false, error: '月份格式錯誤' });
      if (!year && !month) return json(400, { ok: false, error: '請提供年份或月份' });

      await migrateLegacyYear(owner, year || month.slice(0, 4), store);
      const milestones = await readRecords(store, owner, { year, month });
      return json(200, { ok: true, milestones });
    }

    if (req.method === 'POST') {
      let input;
      try { input = await req.json(); } catch { return json(400, { ok: false, error: '大事紀資料格式錯誤' }); }
      const normalized = normalizeInput(input);
      if (normalized.error) return json(400, { ok: false, error: normalized.error });

      const isFocus = normalized.isFocus;
      const id = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
      if (isFocus) await clearMonthFocus(store, owner, normalized.month, id);
      const now = new Date().toISOString();
      const milestone = { id, ...normalized, isFocus, createdAt: now, updatedAt: now };
      await store.setJSON(`${owner}/${id}`, milestone);
      return json(201, { ok: true, milestone });
    }

    if (req.method === 'PUT') {
      let input;
      try { input = await req.json(); } catch { return json(400, { ok: false, error: '大事紀資料格式錯誤' }); }
      const id = String(input?.id || '').trim();
      if (!ID_PATTERN.test(id)) return json(400, { ok: false, error: '大事紀編號錯誤' });
      const existing = await store.get(`${owner}/${id}`, { type: 'json' });
      if (!existing) return json(404, { ok: false, error: '找不到這筆大事紀' });
      const normalized = normalizeInput(input);
      if (normalized.error) return json(400, { ok: false, error: normalized.error });

      if (normalized.isFocus) await clearMonthFocus(store, owner, normalized.month, id);
      const milestone = {
        ...existing,
        ...normalized,
        id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      };
      await store.setJSON(`${owner}/${id}`, milestone);
      return json(200, { ok: true, milestone });
    }

    if (req.method === 'DELETE') {
      const id = String(url.searchParams.get('id') || '').trim();
      if (!ID_PATTERN.test(id)) return json(400, { ok: false, error: '大事紀編號錯誤' });
      const existing = await store.get(`${owner}/${id}`, { type: 'json' });
      if (!existing) return json(404, { ok: false, error: '找不到這筆大事紀' });
      await store.delete(`${owner}/${id}`);
      return json(200, { ok: true });
    }

    return json(405, { ok: false, error: '不支援此請求方式' });
  } catch (error) {
    const detail = error instanceof Error && error.message ? `（${error.message}）` : '';
    return json(502, { ok: false, error: `無法讀寫大事紀${detail}` });
  }
};

export const config = { path: '/api/milestones' };
