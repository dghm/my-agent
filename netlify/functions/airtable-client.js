import crypto from 'node:crypto';

const BASE_ID = 'appnhALSuMU5xcGVf';
const TABLE_ID = 'tblyASlHqnsSu7s9K';
const FIELDS = {
  clientName: 'fldWSOeAw6qdzrijU',
  fullName: 'fldgs3sMEsU7qbjx6',
  taxId: 'fldgph0fceCJN7UfR',
  clientAddress: 'fldw7o8zA0YMm8Y3c',
  payment: 'flddMyXt7jOCnAeDm',
  industry: 'fldra4NwWFmVZoz44',
  source: 'fldGRByW07YWIfb2u',
  contactTitle: 'fldXHj5LDRxtL8tPb',
  phone: 'fldZdjcgORRyZNV3Y',
  email: 'fldJ5PYkaIuyPjac2',
  brandName: 'fldf8z9B8e5L47TVp',
  website: 'fld5oL2VbQ5qk8ISJ',
  address: 'fld2k4EwSNSeV4aC0',
  notes: 'fldq8ZR8eKas0PQPQ',
};
const SELECTS = {
  payment: ['30 Days Net'],
  industry: ['儲配／運輸物流業', '銀髮長照', '運動用品', '食品'],
  source: ['官網', 'Facebook', 'Instagram', '介紹', '其他', '前同事'],
};

function json(status, body) {
  return new Response(JSON.stringify(body), {
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
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    return session.exp > Date.now() && session.uid ? session : null;
  } catch { return null; }
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { ok: false, error: '只接受 POST 請求' });
  if (!sessionFromRequest(req)) return json(401, { ok: false, error: '請先登入工作台', code: 'unauthenticated' });

  const token = process.env.FOR_AIRTABLE_DGHM_BASE;
  if (!token) return json(503, { ok: false, error: 'Airtable 尚未設定：請在 Netlify 設定 FOR_AIRTABLE_DGHM_BASE' });

  let input;
  try { input = await req.json(); } catch { return json(400, { ok: false, error: '表單資料格式錯誤' }); }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return json(400, { ok: false, error: '表單資料格式錯誤' });

  const fields = {};
  for (const [key, fieldId] of Object.entries(FIELDS)) {
    const value = input[key];
    if (value == null || value === '') continue;
    if (typeof value !== 'string') return json(400, { ok: false, error: `${key} 格式錯誤` });
    const trimmed = value.trim();
    if (!trimmed) continue;
    if (trimmed.length > (key === 'notes' ? 5000 : 500)) return json(400, { ok: false, error: `${key} 內容過長` });
    if (SELECTS[key] && !SELECTS[key].includes(trimmed)) return json(400, { ok: false, error: `${key} 選項無效` });
    fields[fieldId] = trimmed;
  }
  if (!fields[FIELDS.clientName]) return json(400, { ok: false, error: '請填寫客戶名' });
  if (fields[FIELDS.email] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields[FIELDS.email])) {
    return json(400, { ok: false, error: '電子郵件格式錯誤' });
  }
  if (fields[FIELDS.website]) {
    try {
      const url = new URL(fields[FIELDS.website]);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid');
    } catch { return json(400, { ok: false, error: '網站請填完整的 http:// 或 https:// 網址' }); }
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = result.error?.type || `HTTP ${response.status}`;
      return json(502, { ok: false, error: `Airtable 寫入失敗（${detail}）` });
    }
    return json(201, { ok: true, id: result.id, clientName: fields[FIELDS.clientName] });
  } catch {
    return json(502, { ok: false, error: '無法連線到 Airtable，請稍後重試' });
  }
};

export const config = { path: '/api/airtable/client' };
