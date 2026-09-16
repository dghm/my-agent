import crypto from 'node:crypto';

const BASE_ID = 'appnhALSuMU5xcGVf';
const COMPANY_TABLE_ID = 'tblyASlHqnsSu7s9K';
const CONTACT_TABLE_ID = 'tbl5iKkQNSF3YIG9w';
const COMPANY_FIELDS = {
  clientName: 'fldWSOeAw6qdzrijU',
  fullName: 'fldgs3sMEsU7qbjx6',
  taxId: 'fldgph0fceCJN7UfR',
  clientAddress: 'fldw7o8zA0YMm8Y3c',
  payment: 'flddMyXt7jOCnAeDm',
  industry: 'fldra4NwWFmVZoz44',
  source: 'fldGRByW07YWIfb2u',
  brandName: 'fldf8z9B8e5L47TVp',
  website: 'fld5oL2VbQ5qk8ISJ',
};
const CONTACT_FIELDS = {
  contactName: 'fld15dpMtA64y76nS',
  contactFirstName: 'fldCtV7mJ9mFVfzRJ',
  contactTitle: 'fldHy7Yb1X5NxZoY9',
  company: 'fldJJqNB7czIafp8y',
  phone: 'fldra3eQ3plGTGXhe',
  email: 'fldaaHDvUiKUlQtIy',
  address: 'fldphkQTHtKBNu9mF',
  notes: 'fldFMSkgVnswij3l5',
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

async function airtableRequest(token, tableId, options) {
  const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const result = await response.json().catch(() => ({}));
  return { response, result };
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { ok: false, error: '只接受 POST 請求' });
  if (!sessionFromRequest(req)) return json(401, { ok: false, error: '請先登入工作台', code: 'unauthenticated' });

  const token = process.env.FOR_AIRTABLE_DGHM_BASE;
  if (!token) return json(503, { ok: false, error: 'Airtable 尚未設定：請在 Netlify 設定 FOR_AIRTABLE_DGHM_BASE' });

  let input;
  try { input = await req.json(); } catch { return json(400, { ok: false, error: '表單資料格式錯誤' }); }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return json(400, { ok: false, error: '表單資料格式錯誤' });

  const companyFields = {};
  for (const [key, fieldId] of Object.entries(COMPANY_FIELDS)) {
    const value = input[key];
    if (value == null || value === '') continue;
    if (typeof value !== 'string') return json(400, { ok: false, error: `${key} 格式錯誤` });
    const trimmed = value.trim();
    if (!trimmed) continue;
    if (trimmed.length > 500) return json(400, { ok: false, error: `${key} 內容過長` });
    if (SELECTS[key] && !SELECTS[key].includes(trimmed)) return json(400, { ok: false, error: `${key} 選項無效` });
    companyFields[fieldId] = trimmed;
  }
  if (!companyFields[COMPANY_FIELDS.clientName]) return json(400, { ok: false, error: '請填寫客戶名' });

  const contactFields = {};
  for (const [key, fieldId] of Object.entries(CONTACT_FIELDS)) {
    if (key === 'company' || key === 'contactFirstName') continue;
    const value = input[key];
    if (value == null || value === '') continue;
    if (typeof value !== 'string') return json(400, { ok: false, error: `${key} 格式錯誤` });
    const trimmed = value.trim();
    if (!trimmed) continue;
    if (trimmed.length > (key === 'notes' ? 5000 : 500)) return json(400, { ok: false, error: `${key} 內容過長` });
    contactFields[fieldId] = trimmed;
  }
  const hasContactDetails = Object.keys(contactFields).some((fieldId) => fieldId !== CONTACT_FIELDS.contactName);
  if (hasContactDetails && !contactFields[CONTACT_FIELDS.contactName]) {
    return json(400, { ok: false, error: '填寫聯絡資訊時，請一併填寫聯絡人姓名' });
  }
  if (contactFields[CONTACT_FIELDS.contactName]) {
    contactFields[CONTACT_FIELDS.contactFirstName] = contactFields[CONTACT_FIELDS.contactName];
  }
  if (contactFields[CONTACT_FIELDS.email] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactFields[CONTACT_FIELDS.email])) {
    return json(400, { ok: false, error: '電子郵件格式錯誤' });
  }
  if (companyFields[COMPANY_FIELDS.website]) {
    try {
      const url = new URL(companyFields[COMPANY_FIELDS.website]);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid');
    } catch { return json(400, { ok: false, error: '網站請填完整的 http:// 或 https:// 網址' }); }
  }

  try {
    const companyCreate = await airtableRequest(token, COMPANY_TABLE_ID, {
      method: 'POST',
      body: JSON.stringify({ fields: companyFields }),
    });
    if (!companyCreate.response.ok) {
      const detail = companyCreate.result.error?.type || `HTTP ${companyCreate.response.status}`;
      return json(502, { ok: false, error: `Airtable 公司寫入失敗（${detail}）` });
    }

    let contactId = null;
    if (contactFields[CONTACT_FIELDS.contactName]) {
      contactFields[CONTACT_FIELDS.company] = [companyCreate.result.id];
      const contactCreate = await airtableRequest(token, CONTACT_TABLE_ID, {
        method: 'POST',
        body: JSON.stringify({ fields: contactFields }),
      });
      if (!contactCreate.response.ok) {
        const rollback = await airtableRequest(token, `${COMPANY_TABLE_ID}/${companyCreate.result.id}`, { method: 'DELETE' }).catch(() => null);
        const detail = contactCreate.result.error?.type || `HTTP ${contactCreate.response.status}`;
        const rollbackMessage = rollback?.response.ok
          ? '公司紀錄已自動取消'
          : `公司紀錄 ${companyCreate.result.id} 已建立，請先確認後再重試`;
        return json(502, { ok: false, error: `Airtable 聯絡人寫入失敗（${detail}）；${rollbackMessage}` });
      }
      contactId = contactCreate.result.id;
    }

    return json(201, {
      ok: true,
      id: companyCreate.result.id,
      contactId,
      clientName: companyFields[COMPANY_FIELDS.clientName],
    });
  } catch {
    return json(502, { ok: false, error: '無法連線到 Airtable，請稍後重試' });
  }
};

export const config = { path: '/api/airtable/client' };
