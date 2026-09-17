import crypto from 'node:crypto';

const BASE_ID = 'appnhALSuMU5xcGVf';
const COMPANY_TABLE_ID = 'tblyASlHqnsSu7s9K';
const CONTACT_TABLE_ID = 'tbl5iKkQNSF3YIG9w';
const COMPANY_FIELDS = {
  clientName: 'fldWSOeAw6qdzrijU', chineseShortName: 'fldhXHV6ZIYRBVAtY', fullName: 'fldgs3sMEsU7qbjx6', taxId: 'fldgph0fceCJN7UfR',
  clientAddress: 'fldw7o8zA0YMm8Y3c', payment: 'flddMyXt7jOCnAeDm', industry: 'fldra4NwWFmVZoz44',
  source: 'fldGRByW07YWIfb2u', brandName: 'fldf8z9B8e5L47TVp', website: 'fld5oL2VbQ5qk8ISJ',
};
const COMPANY_CONTACT_LINK_FIELD = 'fldP52fgpsuKw15xm';
const COMPANY_NUMBER_FIELD = 'fld7sULDGsc3lcp3U';
const CONTACT_FIELDS = {
  contactName: 'fld15dpMtA64y76nS', contactFirstName: 'fldCtV7mJ9mFVfzRJ', contactTitle: 'fldHy7Yb1X5NxZoY9',
  company: 'fld9CDRpMjyNnomWx', phone: 'fldra3eQ3plGTGXhe', email: 'fldaaHDvUiKUlQtIy',
  address: 'fldphkQTHtKBNu9mF', notes: 'fldFMSkgVnswij3l5',
};
const SELECT_FALLBACKS = {
  payment: ['30 Days Net'],
  industry: ['儲配／運輸物流業', '銀髮長照', '運動用品', '食品'],
  source: ['官網', 'Facebook', 'Instagram', '介紹', '其他', '前同事'],
};
const SELECT_FIELD_IDS = {
  payment: COMPANY_FIELDS.payment,
  industry: COMPANY_FIELDS.industry,
  source: COMPANY_FIELDS.source,
};
const MULTI_SELECT_KEYS = new Set(['industry']);
let selectOptionsCache = null;

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
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

async function airtableRequest(token, path, options = {}) {
  const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const result = await response.json().catch(() => ({}));
  return { response, result };
}

async function getSelectOptions(token) {
  if (selectOptionsCache?.expiresAt > Date.now()) return selectOptionsCache.value;
  const response = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error?.type || `HTTP ${response.status}`);
    error.code = 'schema_unavailable';
    throw error;
  }
  const table = (result.tables || []).find((item) => item.id === COMPANY_TABLE_ID);
  if (!table) throw new Error('找不到客戶資料表結構');
  const options = {};
  for (const [key, fieldId] of Object.entries(SELECT_FIELD_IDS)) {
    const field = (table.fields || []).find((item) => item.id === fieldId);
    options[key] = (field?.options?.choices || []).map((choice) => choice.name).filter(Boolean);
  }
  selectOptionsCache = { value: options, expiresAt: Date.now() + 5 * 60 * 1000 };
  return options;
}

async function selectOptionsWithFallback(token) {
  try {
    return { options: await getSelectOptions(token), warning: '' };
  } catch (error) {
    return {
      options: SELECT_FALLBACKS,
      warning: 'Airtable Token 缺少 schema.bases:read 權限，目前暫用既有選項；新增權限後會自動同步。',
    };
  }
}

async function listAllRecords(token, tableId, sortField) {
  const records = [];
  let offset = '';
  do {
    const params = new URLSearchParams({ pageSize: '100', returnFieldsByFieldId: 'true' });
    if (offset) params.set('offset', offset);
    if (sortField) {
      params.set('sort[0][field]', sortField);
      params.set('sort[0][direction]', 'desc');
    }
    const result = await airtableRequest(token, `${tableId}?${params}`);
    if (!result.response.ok) throw new Error(result.result.error?.type || `HTTP ${result.response.status}`);
    records.push(...(result.result.records || []));
    offset = result.result.offset || '';
  } while (offset && records.length < 500);
  return records;
}

function textValue(value) {
  if (value == null) return '';
  if (typeof value === 'object' && !Array.isArray(value)) return String(value.name || '');
  return String(value);
}

function choiceNames(value) {
  if (!Array.isArray(value)) return value ? [textValue(value)] : [];
  return value.map(textValue).filter(Boolean);
}

function publicContact(record) {
  const fields = record.fields || {};
  return {
    id: record.id,
    contactName: textValue(fields[CONTACT_FIELDS.contactName]), contactTitle: textValue(fields[CONTACT_FIELDS.contactTitle]),
    phone: textValue(fields[CONTACT_FIELDS.phone]), email: textValue(fields[CONTACT_FIELDS.email]),
    address: textValue(fields[CONTACT_FIELDS.address]), notes: textValue(fields[CONTACT_FIELDS.notes]),
  };
}

function publicCompany(record, contactsById) {
  const fields = record.fields || {};
  const contactIds = fields[COMPANY_CONTACT_LINK_FIELD] || [];
  const company = { id: record.id, clientNumber: textValue(fields[COMPANY_NUMBER_FIELD]) };
  for (const [key, fieldId] of Object.entries(COMPANY_FIELDS)) {
    company[key] = MULTI_SELECT_KEYS.has(key) ? choiceNames(fields[fieldId]) : textValue(fields[fieldId]);
  }
  company.contacts = contactIds.map((id) => contactsById.get(id)).filter(Boolean).map(publicContact);
  return company;
}

function buildFields(input, mapping, { includeEmpty = false, skip = [], noteKey = '', selectOptions = SELECT_FALLBACKS } = {}) {
  const fields = {};
  for (const [key, fieldId] of Object.entries(mapping)) {
    if (skip.includes(key) || !Object.prototype.hasOwnProperty.call(input, key)) continue;
    const value = input[key];
    if (MULTI_SELECT_KEYS.has(key)) {
      if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) return { error: `${key} 格式錯誤` };
      const choices = [...new Set(value.map((item) => item.trim()).filter(Boolean))];
      if (choices.some((choice) => choice.length > 500 || (selectOptions[key] && !selectOptions[key].includes(choice)))) return { error: `${key} 選項無效` };
      if (choices.length || includeEmpty) fields[fieldId] = choices;
      continue;
    }
    if (typeof value !== 'string') return { error: `${key} 格式錯誤` };
    const trimmed = value.trim();
    if (!trimmed) {
      if (includeEmpty) fields[fieldId] = null;
      continue;
    }
    if (trimmed.length > (key === noteKey ? 5000 : 500)) return { error: `${key} 內容過長` };
    if (selectOptions[key] && !selectOptions[key].includes(trimmed)) return { error: `${key} 選項無效` };
    fields[fieldId] = trimmed;
  }
  return { fields };
}

function validatePayload(input, includeEmpty, selectOptions) {
  const company = buildFields(input, COMPANY_FIELDS, { includeEmpty, selectOptions });
  if (company.error) return { error: company.error };
  const contact = buildFields(input, CONTACT_FIELDS, { includeEmpty, skip: ['company', 'contactFirstName'], noteKey: 'notes' });
  if (contact.error) return { error: contact.error };
  if (!company.fields[COMPANY_FIELDS.clientName]) return { error: '請填寫英文簡稱' };
  const contactName = contact.fields[CONTACT_FIELDS.contactName];
  const hasContactDetails = Object.entries(contact.fields).some(([fieldId, value]) => fieldId !== CONTACT_FIELDS.contactName && value != null && value !== '');
  if (hasContactDetails && !contactName) return { error: '填寫聯絡資訊時，請一併填寫聯絡人姓名' };
  if (contactName) contact.fields[CONTACT_FIELDS.contactFirstName] = contactName;
  else if (includeEmpty) contact.fields[CONTACT_FIELDS.contactFirstName] = null;
  const email = contact.fields[CONTACT_FIELDS.email];
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: '電子郵件格式錯誤' };
  const website = company.fields[COMPANY_FIELDS.website];
  if (website) {
    try {
      const url = new URL(website);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid');
    } catch { return { error: '網站請填完整的 http:// 或 https:// 網址' }; }
  }
  return { companyFields: company.fields, contactFields: contact.fields };
}

function validRecordId(value) {
  return typeof value === 'string' && /^rec[A-Za-z0-9]+$/.test(value);
}

function linkContactToCompany(fields, companyId, existingFields = {}) {
  fields[CONTACT_FIELDS.company] = [...new Set([...(existingFields[CONTACT_FIELDS.company] || []), companyId])];
}

async function createRecords(token, input) {
  const { options: selectOptions } = await selectOptionsWithFallback(token);
  const parsed = validatePayload(input, false, selectOptions);
  if (parsed.error) return json(400, { ok: false, error: parsed.error });
  const companyCreate = await airtableRequest(token, COMPANY_TABLE_ID, { method: 'POST', body: JSON.stringify({ fields: parsed.companyFields }) });
  if (!companyCreate.response.ok) {
    const detail = companyCreate.result.error?.type || `HTTP ${companyCreate.response.status}`;
    return json(502, { ok: false, error: `Airtable 公司寫入失敗（${detail}）` });
  }
  let contactId = null;
  if (parsed.contactFields[CONTACT_FIELDS.contactName]) {
    linkContactToCompany(parsed.contactFields, companyCreate.result.id);
    const contactCreate = await airtableRequest(token, CONTACT_TABLE_ID, { method: 'POST', body: JSON.stringify({ fields: parsed.contactFields }) });
    if (!contactCreate.response.ok) {
      const rollback = await airtableRequest(token, `${COMPANY_TABLE_ID}/${companyCreate.result.id}`, { method: 'DELETE' }).catch(() => null);
      const detail = contactCreate.result.error?.type || `HTTP ${contactCreate.response.status}`;
      const rollbackMessage = rollback?.response.ok ? '公司紀錄已自動取消' : `公司紀錄 ${companyCreate.result.id} 已建立，請先確認後再重試`;
      return json(502, { ok: false, error: `Airtable 聯絡人寫入失敗（${detail}）；${rollbackMessage}` });
    }
    contactId = contactCreate.result.id;
  }
  return json(201, { ok: true, id: companyCreate.result.id, contactId, clientName: parsed.companyFields[COMPANY_FIELDS.clientName] });
}

async function updateRecords(token, input) {
  if (!validRecordId(input.recordId)) return json(400, { ok: false, error: '客戶紀錄 ID 無效' });
  if (input.contactId && !validRecordId(input.contactId)) return json(400, { ok: false, error: '聯絡人紀錄 ID 無效' });
  const { options: selectOptions } = await selectOptionsWithFallback(token);
  const parsed = validatePayload(input, true, selectOptions);
  if (parsed.error) return json(400, { ok: false, error: parsed.error });
  const companyUpdate = await airtableRequest(token, `${COMPANY_TABLE_ID}/${input.recordId}`, { method: 'PATCH', body: JSON.stringify({ fields: parsed.companyFields }) });
  if (!companyUpdate.response.ok) {
    const detail = companyUpdate.result.error?.type || `HTTP ${companyUpdate.response.status}`;
    return json(502, { ok: false, error: `Airtable 公司更新失敗（${detail}）` });
  }
  let contactId = input.contactId || null;
  const hasContactName = Boolean(parsed.contactFields[CONTACT_FIELDS.contactName]);
  if (contactId) {
    const contactUpdate = await airtableRequest(token, `${CONTACT_TABLE_ID}/${contactId}`, { method: 'PATCH', body: JSON.stringify({ fields: parsed.contactFields }) });
    if (!contactUpdate.response.ok) {
      const detail = contactUpdate.result.error?.type || `HTTP ${contactUpdate.response.status}`;
      return json(502, { ok: false, error: `公司已更新，但聯絡人更新失敗（${detail}）` });
    }
  } else if (hasContactName) {
    linkContactToCompany(parsed.contactFields, input.recordId);
    const contactCreate = await airtableRequest(token, CONTACT_TABLE_ID, { method: 'POST', body: JSON.stringify({ fields: parsed.contactFields }) });
    if (!contactCreate.response.ok) {
      const detail = contactCreate.result.error?.type || `HTTP ${contactCreate.response.status}`;
      return json(502, { ok: false, error: `公司已更新，但聯絡人新增失敗（${detail}）` });
    }
    contactId = contactCreate.result.id;
  }
  return json(200, { ok: true, id: input.recordId, contactId, clientName: parsed.companyFields[COMPANY_FIELDS.clientName] });
}

export default async (req) => {
  if (!sessionFromRequest(req)) return json(401, { ok: false, error: '請先登入工作台', code: 'unauthenticated' });
  const token = process.env.FOR_AIRTABLE_DGHM_BASE;
  if (!token) return json(503, { ok: false, error: 'Airtable 尚未設定：請在 Netlify 設定 FOR_AIRTABLE_DGHM_BASE' });
  try {
    if (req.method === 'GET') {
      const [companies, contacts, selectResult] = await Promise.all([listAllRecords(token, COMPANY_TABLE_ID, COMPANY_NUMBER_FIELD), listAllRecords(token, CONTACT_TABLE_ID), selectOptionsWithFallback(token)]);
      const contactsById = new Map(contacts.map((record) => [record.id, record]));
      return json(200, { ok: true, records: companies.map((record) => publicCompany(record, contactsById)), selectOptions: selectResult.options, optionsWarning: selectResult.warning });
    }
    if (req.method !== 'POST' && req.method !== 'PUT') return json(405, { ok: false, error: '不支援此請求方式' });
    let input;
    try { input = await req.json(); } catch { return json(400, { ok: false, error: '表單資料格式錯誤' }); }
    if (!input || typeof input !== 'object' || Array.isArray(input)) return json(400, { ok: false, error: '表單資料格式錯誤' });
    return req.method === 'POST' ? createRecords(token, input) : updateRecords(token, input);
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND') {
      return json(403, { ok: false, error: 'Airtable Token 缺少 data.records:read 權限，請更新 FOR_AIRTABLE_DGHM_BASE 後重新載入' });
    }
    const detail = error instanceof Error && error.message ? `（${error.message}）` : '';
    return json(502, { ok: false, error: `無法讀寫 Airtable${detail}` });
  }
};

export const config = { path: '/api/airtable/client' };
