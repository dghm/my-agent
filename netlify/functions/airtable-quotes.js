/* ============================================================
   讀取【DGHM】Airtable base 的報價單，供 Quote-Generator.html 的
   「從 Airtable 開啟」功能使用。

   只讀不寫（v1）：Airtable 的「報價單」表是正式資料庫，這支函式
   不會建立或修改任何 Airtable 記錄，避免離線工具意外弄髒正式資料。

   Base／Table ID 是這個整合的結構性設定，寫死在檔案裡；
   唯一需要另外設定的是 Airtable API Key（機密，不能進 git）：
     Netlify 環境變數：AIRTABLE_API_KEY
   ============================================================ */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const BASE_ID = 'appnhALSuMU5xcGVf'; // 【DGHM】
const TABLES = {
  quotes: 'tblPaZBRzMMzFFL5D',   // 報價單
  items: 'tblpclqHlfdOPugmg',    // 報價單明細
  subProjects: 'tblpPBY8XIaapWFzf', // 子專案
  contacts: 'tbl5iKkQNSF3YIG9w', // 聯絡人
};

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS },
  });
}

function apiKey() {
  const key = process.env.AIRTABLE_API_KEY;
  if (!key) throw new Error('未設定 AIRTABLE_API_KEY，請至 Netlify 環境變數設定 Airtable Personal Access Token');
  return key;
}

async function airtableFetch(path) {
  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${path}`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Airtable API ${res.status}：${body.slice(0, 300)}`);
  }
  return res.json();
}

async function getRecord(tableId, recordId) {
  return airtableFetch(`${tableId}/${recordId}`);
}

/** 巢狀 lookup 欄位在 Airtable REST API 回傳陣列（即使只有一個值），取第一個。 */
function first(value, fallback = '') {
  if (Array.isArray(value)) return value.length ? value[0] : fallback;
  return value == null ? fallback : value;
}

/** Airtable 公式算出的日期是「YYYY/MM/DD」，<input type="date"> 需要「YYYY-MM-DD」。 */
function normalizeDate(value) {
  const s = String(value || '').trim();
  if (!s || s.includes('#ERROR')) return '';
  return s.replace(/\//g, '-');
}

async function listQuotes() {
  const fields = ['ID', '客戶全稱', '報價日期', '報價總金額'].map((f) => `fields[]=${encodeURIComponent(f)}`).join('&');
  const data = await airtableFetch(
    `${TABLES.quotes}?${fields}&sort[0][field]=${encodeURIComponent('報價日期')}&sort[0][direction]=desc&pageSize=100`
  );
  const records = (data.records || []).map((r) => ({
    id: r.id,
    quoteNo: r.fields['ID'] || '（無編號）',
    clientName: first(r.fields['客戶全稱']),
    issueDate: r.fields['報價日期'] || '',
    total: r.fields['報價總金額'] || 0,
  }));
  return records;
}

async function getQuote(recordId) {
  const record = await getRecord(TABLES.quotes, recordId);
  const f = record.fields;

  // 專案代碼不在報價單表上，要跟著「子專案編號」連結多抓一次子專案記錄。
  let projectCode = '';
  const subProjectId = (f['子專案編號'] || [])[0];
  if (subProjectId) {
    try {
      const subProject = await getRecord(TABLES.subProjects, subProjectId);
      projectCode = subProject.fields['ID'] || '';
    } catch (error) {
      // 子專案連結斷掉（已知有一筆資料如此）不影響報價單其餘欄位的讀取
      projectCode = '';
    }
  }

  // Email 也不在報價單表上（只有姓名、電話有 lookup），跟著「聯絡人」連結多抓一次。
  let clientEmail = '';
  const contactId = (f['聯絡人'] || [])[0];
  if (contactId) {
    try {
      const contact = await getRecord(TABLES.contacts, contactId);
      clientEmail = contact.fields['電子郵件'] || '';
    } catch (error) {
      clientEmail = '';
    }
  }

  // 服務項目明細是另一張表，用報價單上的連結逐筆抓（單張報價單通常只有幾到十幾項）。
  const itemIds = f['報價單明細'] || [];
  const items = await Promise.all(
    itemIds.map(async (itemId) => {
      try {
        const item = await getRecord(TABLES.items, itemId);
        const itf = item.fields;
        const qty = itf['數量'] || 0;
        const unitPrice = itf['手輸單價'] || 0;
        return {
          name: itf['Quotation Text'] || first(itf['項目名稱']) || '',
          spec: qty && unitPrice ? `${qty} × NT$ ${unitPrice}` : '',
          desc: first(itf['說明']) || itf['備註'] || '',
          price: itf['報價小計'] ?? (qty && unitPrice ? qty * unitPrice : unitPrice || ''),
        };
      } catch (error) {
        return null;
      }
    })
  );

  return {
    id: record.id,
    quoteNo: f['ID'] || '',
    projectCode,
    issueDate: f['報價日期'] || '',
    validDate: normalizeDate(f['有效日期']),
    clientName: first(f['客戶全稱']),
    clientAddr: first(f['客戶地址']),
    clientVat: first(f['客戶統編']),
    clientContact: first(f['名字 (from 聯絡人)']),
    clientPhone: first(f['聯絡人電話']),
    clientEmail,
    note: f['備註'] || '',
    items: items.filter(Boolean),
  };
}

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const action = context.params.action;

  try {
    if (req.method === 'GET' && action === 'list') {
      const records = await listQuotes();
      return json(200, { ok: true, records });
    }

    if (req.method === 'GET' && action === 'get') {
      const url = new URL(req.url);
      const id = String(url.searchParams.get('id') || '').trim();
      if (!id) return json(400, { ok: false, error: '請提供 id' });
      const quote = await getQuote(id);
      return json(200, { ok: true, quote });
    }

    return json(404, { ok: false, error: 'Not Found' });
  } catch (err) {
    return json(500, { ok: false, error: err instanceof Error ? err.message : '未知錯誤' });
  }
};

export const config = { path: '/api/airtable-quotes/:action' };
