import crypto from 'node:crypto';

const BASE_ID = 'appnhALSuMU5xcGVf';
const CARD_TABLE_ID = 'tblFxLv8DgbIVyPkW';
const RECIPIENT_TABLE_ID = 'tblyMZJSwfayCFu8G';
const GREETING_TABLE_ID = 'tblsQVFkqi8pXGsE4';

const CARD_FIELDS = {
  name: 'fldoykuaCIECMEDHW', year: 'flddlYmss0faJe03E', festival: 'fldeUIsh9wBncgniM',
  recipient: 'fld4dZDrUQVIkJQtY', category: 'fldCWeUDJoFdBv7NV', greeting: 'fldMGXuTJQU5zBhCA',
  websiteStatus: 'fldsQ6TklClpsV78A', template: 'fldwFU60KWNU6DDSO', recipientLabel: 'fld7VjnmfMSDPxfTt',
  signatureType: 'fldoFfIhXP7xFZBns', signatureText: 'fldMUV5TYeFKvcGSN', logoVariant: 'fldVmZeqkd1B4pjiv',
  enabledAt: 'fldXg0AoXecbk8kdq', expiresAt: 'fldC7Vg0qSvIcWw80',
};
const RECIPIENT_FIELDS = { name: 'fldnpDUlEhbqfuzGz', category: 'fldzUAZDgjfXl61mf', displayName: 'fldhzttF6DtLL7ctq' };
const GREETING_FIELDS = { year: 'fldZB5YwTMbpcgfl2', festival: 'fld36XYxl9rkBBGFI', greeting: 'fldKX7bCblbPt3NNQ' };
const MODE_BY_CATEGORY = { 客戶: 'client', 親友: 'friend', 家人: 'family', 廠商: 'vendor' };

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
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

async function listAllRecords(token, tableId, fieldIds) {
  const records = [];
  let offset = '';
  do {
    const params = new URLSearchParams({ pageSize: '100', returnFieldsByFieldId: 'true' });
    fieldIds.forEach((fieldId) => params.append('fields[]', fieldId));
    if (offset) params.set('offset', offset);
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${tableId}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(result.error?.type || `HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    records.push(...(result.records || []));
    offset = result.offset || '';
  } while (offset && records.length < 500);
  return records;
}

function textValue(value) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(textValue).find(Boolean) || '';
  if (typeof value === 'object') return String(value.name || value.value || '');
  return String(value);
}

function splitGreeting(value) {
  const text = textValue(value).trim();
  if (!text) return [];
  const explicit = text.split(/\r?\n|\|/).map((line) => line.trim()).filter(Boolean);
  if (explicit.length > 1 || text.length <= 20) return explicit;
  const midpoint = Math.floor(text.length / 2);
  const punctuation = [...text].map((char, index) => '，。！？；'.includes(char) ? index + 1 : -1).filter((index) => index > 0);
  if (!punctuation.length) return [text];
  const splitAt = punctuation.sort((a, b) => Math.abs(a - midpoint) - Math.abs(b - midpoint))[0];
  return [text.slice(0, splitAt), text.slice(splitAt)].map((line) => line.trim()).filter(Boolean);
}

function previewId(recordId) {
  return `airtable-${crypto.createHash('sha256').update(recordId).digest('base64url').slice(0, 12)}`;
}

function signatureType(value, companyIdentity) {
  const normalized = textValue(value).trim().toLowerCase();
  if (['none', '不顯示', '無'].includes(normalized)) return 'none';
  if (['personal', '個人', '個人署名'].includes(normalized)) return 'personal';
  if (['company', '公司', '公司署名'].includes(normalized)) return 'company';
  return companyIdentity ? 'company' : 'personal';
}

export function buildPreviewItems(cardRecords, recipientRecords, greetingRecords, options = {}) {
  const year = String(options.year || '2026');
  const festival = String(options.festival || '聖誕');
  const template = String(options.template || '2026-christmas');
  const recipients = new Map(recipientRecords.map((record) => [record.id, record.fields || {}]));
  const items = [];
  const publicGreeting = greetingRecords.find((record) => {
    const fields = record.fields || {};
    return textValue(fields[GREETING_FIELDS.year]) === year && textValue(fields[GREETING_FIELDS.festival]) === festival;
  });
  const publicLines = splitGreeting(publicGreeting?.fields?.[GREETING_FIELDS.greeting]);
  items.push({
    id: 'public-default', mode: 'public', label: '公版預設', recipientName: '',
    greetingLines: publicLines.length ? publicLines : ['感謝這一年的同行', '祝您與團隊聖誕平安、新年順心'],
    signatureType: 'company', signatureText: '萬能數維有限公司 敬賀', logoVariant: 'dghm-zh', websiteStatus: 'preview',
  });

  for (const record of cardRecords) {
    const fields = record.fields || {};
    if (textValue(fields[CARD_FIELDS.year]) !== year || textValue(fields[CARD_FIELDS.festival]) !== festival) continue;
    const templateCode = textValue(fields[CARD_FIELDS.template]);
    if (templateCode && templateCode !== template) continue;
    const recipientId = Array.isArray(fields[CARD_FIELDS.recipient]) ? fields[CARD_FIELDS.recipient][0] : '';
    const recipient = recipients.get(recipientId) || {};
    const category = textValue(fields[CARD_FIELDS.category]) || textValue(recipient[RECIPIENT_FIELDS.category]);
    const mode = MODE_BY_CATEGORY[category];
    if (!mode) continue;
    const recipientName = textValue(fields[CARD_FIELDS.recipientLabel]) || textValue(recipient[RECIPIENT_FIELDS.displayName]) ||
      textValue(recipient[RECIPIENT_FIELDS.name]) || textValue(fields[CARD_FIELDS.name]);
    const greetingLines = splitGreeting(fields[CARD_FIELDS.greeting]);
    if (!recipientName || !greetingLines.length) continue;
    const companyIdentity = mode === 'client' || mode === 'vendor';
    const configuredLogo = textValue(fields[CARD_FIELDS.logoVariant]);
    items.push({
      id: previewId(record.id), mode, label: `${category}｜${recipientName}`, recipientName, greetingLines,
      signatureType: signatureType(fields[CARD_FIELDS.signatureType], companyIdentity),
      signatureText: textValue(fields[CARD_FIELDS.signatureText]) || (companyIdentity ? '萬能數維有限公司 敬賀' : '謝萬錤 Aries Hsieh'),
      logoVariant: configuredLogo === 'DGHM 中文' ? 'dghm-zh' : configuredLogo === '不顯示' ? 'none' :
        configuredLogo === '個人中文名' ? 'personal-name' : (companyIdentity ? 'dghm-zh' : 'personal-name'),
      websiteStatus: textValue(fields[CARD_FIELDS.websiteStatus]) || 'draft',
      enabledAt: textValue(fields[CARD_FIELDS.enabledAt]), expiresAt: textValue(fields[CARD_FIELDS.expiresAt]),
    });
  }
  return items.sort((a, b) => `${a.mode}-${a.label}`.localeCompare(`${b.mode}-${b.label}`, 'zh-Hant'));
}

export default async (req) => {
  if (req.method !== 'GET') return json(405, { ok: false, error: '不支援此請求方式' });
  if (!sessionFromRequest(req)) return json(401, { ok: false, error: '請先登入工作台', code: 'unauthenticated' });
  const token = process.env.AIRTABLE_GREETING_CARDS_TOKEN;
  if (!token) return json(503, { ok: false, error: '賀卡 Airtable Token 尚未設定', code: 'airtable_not_configured' });
  const url = new URL(req.url);
  const options = {
    year: url.searchParams.get('year') || '2026', festival: url.searchParams.get('festival') || '聖誕',
    template: url.searchParams.get('template') || '2026-christmas',
  };
  if (!/^20\d{2}$/.test(options.year) || !['中秋', '聖誕', '春節'].includes(options.festival) || !/^[a-z0-9-]{3,64}$/.test(options.template)) {
    return json(400, { ok: false, error: '查詢條件格式錯誤' });
  }
  try {
    const [cards, recipients, greetings] = await Promise.all([
      listAllRecords(token, CARD_TABLE_ID, Object.values(CARD_FIELDS)),
      listAllRecords(token, RECIPIENT_TABLE_ID, Object.values(RECIPIENT_FIELDS)),
      listAllRecords(token, GREETING_TABLE_ID, Object.values(GREETING_FIELDS)),
    ]);
    return json(200, { ok: true, source: 'airtable', template: options.template, items: buildPreviewItems(cards, recipients, greetings, options) });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (error?.status === 401 || error?.status === 403 || message === 'INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND') {
      return json(403, { ok: false, error: 'Airtable Token 權限或 Base 存取設定不正確', code: 'airtable_forbidden' });
    }
    return json(502, { ok: false, error: '目前無法讀取 Airtable 賀卡資料', code: 'airtable_unavailable' });
  }
};

export const config = { path: '/api/greeting-cards' };
