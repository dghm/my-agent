import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

const SESSION_COOKIE = 'dghm_session';
const DATE_PATTERN = /^(20\d{2}|2100)-(0[1-9]|1[0-2])-([012]\d|3[01])$/;
const MAX_AMOUNT = 1000000000;

class InputError extends Error {}

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

export function canAccessIncome(session, allowedEmails = process.env.INCOME_ALLOWED_EMAILS) {
  const allowed = String(allowedEmails || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (!allowed.length) return true;
  return allowed.includes(String(session.email || '').trim().toLowerCase());
}

function validDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function text(value, field, maxLength, required = false) {
  const normalized = String(value ?? '').trim();
  if (required && !normalized) throw new InputError(`請填寫${field}`);
  if (normalized.length > maxLength) throw new InputError(`${field}不可超過 ${maxLength} 字`);
  return normalized;
}

export function normalizeIncomeInput(input) {
  const project = text(input?.project, '案件名稱', 120, true);
  const client = text(input?.client, '客戶名稱', 120, true);
  const amount = Number(input?.amount);
  const taxRate = input?.taxRate === undefined || input?.taxRate === '' ? 5 : Number(input.taxRate);
  const date = text(input?.date, '開立日期', 10, true);
  const dueDate = text(input?.dueDate, '付款期限', 10);
  const receivedDate = text(input?.receivedDate, '實際收款日', 10);
  const paymentStatus = ['unpaid', 'partial', 'paid'].includes(input?.paymentStatus) ? input.paymentStatus : 'unpaid';
  const invoiceTotal = Math.round(amount * (1 + taxRate / 100));
  let receivedAmount = input?.receivedAmount === undefined || input?.receivedAmount === ''
    ? (paymentStatus === 'paid' ? invoiceTotal : 0)
    : Number(input.receivedAmount);

  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) throw new InputError('請輸入有效金額');
  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) throw new InputError('營業稅率必須介於 0 到 100');
  if (!validDate(date)) throw new InputError('開立日期格式錯誤');
  if (dueDate && !validDate(dueDate)) throw new InputError('付款期限格式錯誤');
  if (receivedDate && !validDate(receivedDate)) throw new InputError('實際收款日格式錯誤');
  if (!Number.isFinite(receivedAmount) || receivedAmount < 0 || receivedAmount > MAX_AMOUNT * 2) throw new InputError('請輸入有效實收金額');
  if (paymentStatus === 'unpaid') receivedAmount = 0;
  if (paymentStatus !== 'unpaid' && !receivedDate) throw new InputError('部分或全額收款時，請填寫實際收款日');
  if (paymentStatus === 'partial' && (receivedAmount <= 0 || receivedAmount >= invoiceTotal)) throw new InputError('部分收款金額必須大於 0 且小於含稅總額');
  if (paymentStatus === 'paid' && receivedAmount < invoiceTotal) throw new InputError('已收款的實收金額不可小於含稅總額');

  return {
    project,
    client,
    projectCode: text(input?.projectCode, '專案代碼', 80),
    installment: text(input?.installment, '期數說明', 120),
    amount,
    taxRate,
    noticeNo: text(input?.noticeNo, '通知單號', 80),
    invoiceNo: text(input?.invoiceNo, '發票號碼', 80),
    date,
    dueDate,
    paymentTerms: text(input?.paymentTerms, '付款條件', 120),
    paymentStatus,
    receivedDate: paymentStatus === 'unpaid' ? '' : receivedDate,
    receivedAmount,
    invoiceStatus: input?.invoiceStatus === 'issued' ? 'issued' : 'not_issued',
    note: text(input?.note, '備註', 2000),
    invoiceDraft: invoiceDraft(input?.invoiceDraft),
  };
}

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

async function readRecords(store) {
  const records = await store.get('records', { type: 'json' });
  return records || [];
}

async function writeRecords(store, records) {
  await store.setJSON('records', records);
}

export function summarizeIncomeRecords(records) {
  const total = records.reduce((sum, record) => sum + (Number(record.amount) || 0), 0);
  const paid = records
    .filter((record) => record.paymentStatus === 'paid')
    .reduce((sum, record) => sum + (Number(record.amount) || 0), 0);
  const salesTax = records
    .filter((record) => record.invoiceStatus === 'issued')
    .reduce((sum, record) => {
      const amount = Number(record.amount) || 0;
      const taxRate = Number(record.taxRate) || 0;
      return sum + Math.round(amount * taxRate / 100);
    }, 0);
  const invoiceTotal = records.reduce((sum, record) => {
    const amount = Number(record.amount) || 0;
    const taxRate = Number(record.taxRate) || 0;
    return sum + Math.round(amount * (1 + taxRate / 100));
  }, 0);
  const received = records.reduce((sum, record) => {
    const fallback = record.paymentStatus === 'paid'
      ? Math.round((Number(record.amount) || 0) * (1 + (Number(record.taxRate) || 0) / 100))
      : 0;
    const value = record.receivedAmount === undefined || record.receivedAmount === '' ? fallback : Number(record.receivedAmount);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);
  const outstanding = records.reduce((sum, record) => {
    const gross = Math.round((Number(record.amount) || 0) * (1 + (Number(record.taxRate) || 0) / 100));
    const fallback = record.paymentStatus === 'paid' ? gross : 0;
    const value = record.receivedAmount === undefined || record.receivedAmount === '' ? fallback : Number(record.receivedAmount);
    return sum + Math.max(0, gross - (Number.isFinite(value) ? value : 0));
  }, 0);
  return { count: records.length, total, paid, unpaid: total - paid, salesTax, invoiceTotal, received, outstanding };
}

function invoiceDraft(value) {
  if (value == null) return null;
  if (typeof value !== 'object' || Array.isArray(value) || !value.fields || typeof value.fields !== 'object' || Array.isArray(value.fields) || !Array.isArray(value.items) || value.items.some(item => !item || typeof item !== 'object') || value.terms && (!Array.isArray(value.terms) || value.terms.some(term => typeof term !== 'string')) || JSON.stringify(value).length > 200000) {
    throw new Error('請款單 JSON 格式不正確或過大');
  }
  return value;
}

export default async (req, context) => {
  const session = sessionFromRequest(req);
  if (!session) {
    return json(401, { ok: false, error: '請先登入工作台', code: 'unauthenticated' });
  }
  if (!canAccessIncome(session)) {
    return json(403, { ok: false, error: '此帳號沒有收入登記權限', code: 'forbidden' });
  }

  const store = getStore('income');
  const action = context.params.action;

  try {
    if (req.method === 'GET' && action === 'list') {
      const records = await readRecords(store);
      return json(200, { ok: true, records });
    }

    if (req.method === 'GET' && action === 'summary') {
      const url = new URL(req.url);
      const year = url.searchParams.get('year');
      const month = url.searchParams.get('month');
      const basis = ['due', 'received'].includes(url.searchParams.get('basis')) ? url.searchParams.get('basis') : 'invoice';
      const dateField = basis === 'due' ? 'dueDate' : basis === 'received' ? 'receivedDate' : 'date';
      const records = (await readRecords(store)).filter((r) => {
        if (!r[dateField]) return false;
        const [y, m] = r[dateField].split('-');
        if (year && y !== String(year)) return false;
        if (month && m !== String(month).padStart(2, '0')) return false;
        return true;
      });
      const summary = summarizeIncomeRecords(records);
      return json(200, {
        ok: true,
        year: year || null,
        month: month || null,
        basis,
        ...summary,
        records,
      });
    }

    if (req.method === 'POST' && action === 'create') {
      const parsed = await req.json();
      const normalized = normalizeIncomeInput(parsed);

      const record = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        ...normalized,
        createdBy: session.email || session.name || session.uid,
        createdAt: new Date().toISOString(),
        updatedBy: session.email || session.name || session.uid,
        updatedAt: new Date().toISOString(),
      };

      const records = await readRecords(store);
      records.push(record);
      await writeRecords(store, records);
      return json(200, { ok: true, record });
    }

    if (req.method === 'POST' && action === 'update') {
      const parsed = await req.json();
      const id = String(parsed.id || '').trim();
      if (!id) return json(400, { ok: false, error: '請提供 id' });

      const records = await readRecords(store);
      const index = records.findIndex((r) => r.id === id);
      if (index === -1) return json(404, { ok: false, error: '找不到對應的登記紀錄' });

      const existing = records[index];
      const normalized = normalizeIncomeInput({ ...existing, ...parsed });
      const updated = {
        ...existing,
        ...normalized,
        updatedBy: session.email || session.name || session.uid,
        updatedAt: new Date().toISOString(),
      };

      records[index] = updated;
      await writeRecords(store, records);
      return json(200, { ok: true, record: updated });
    }

    if (req.method === 'POST' && action === 'attachment-upload') {
      const form = await req.formData();
      const recordId = String(form.get('recordId') || '').trim();
      const file = form.get('file');

      if (!recordId) return json(400, { ok: false, error: '請提供 recordId' });
      if (!file || typeof file.arrayBuffer !== 'function' || !file.size) {
        return json(400, { ok: false, error: '請選擇要上傳的檔案' });
      }
      if (file.size > 10 * 1024 * 1024) {
        return json(400, { ok: false, error: '檔案大小超過 10MB 限制' });
      }

      const records = await readRecords(store);
      const index = records.findIndex((r) => r.id === recordId);
      if (index === -1) return json(404, { ok: false, error: '找不到對應的登記紀錄' });

      const attachmentId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
      const filename = String(file.name || '附件');
      const mimeType = file.type || 'application/octet-stream';
      const attachmentsStore = getStore('income-attachments');
      await attachmentsStore.set(`${recordId}/${attachmentId}`, await file.arrayBuffer(), {
        metadata: { filename, mimeType },
      });

      const attachment = {
        id: attachmentId,
        filename,
        mimeType,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
      const record = records[index];
      record.attachments = Array.isArray(record.attachments) ? record.attachments : [];
      record.attachments.push(attachment);
      record.updatedBy = session.email || session.name || session.uid;
      record.updatedAt = new Date().toISOString();
      await writeRecords(store, records);

      return json(200, { ok: true, record, attachment });
    }

    if (req.method === 'GET' && action === 'attachment') {
      const url = new URL(req.url);
      const recordId = String(url.searchParams.get('recordId') || '').trim();
      const id = String(url.searchParams.get('id') || '').trim();
      if (!recordId || !id) return json(400, { ok: false, error: '請提供 recordId 與 id' });

      const attachmentsStore = getStore('income-attachments');
      const key = `${recordId}/${id}`;
      const data = await attachmentsStore.get(key, { type: 'arrayBuffer' });
      if (!data) return json(404, { ok: false, error: '找不到附件' });

      const meta = await attachmentsStore.getMetadata(key);
      const filename = meta?.metadata?.filename || 'attachment';
      const mimeType = meta?.metadata?.mimeType || 'application/octet-stream';

      return new Response(data, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
          'Cache-Control': 'private, no-store',
          'Content-Security-Policy': "sandbox; default-src 'none'; img-src data:; style-src 'unsafe-inline'",
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    if (req.method === 'POST' && action === 'attachment-delete') {
      const parsed = await req.json();
      const recordId = String(parsed.recordId || '').trim();
      const id = String(parsed.id || '').trim();
      if (!recordId || !id) return json(400, { ok: false, error: '請提供 recordId 與 id' });

      const records = await readRecords(store);
      const index = records.findIndex((r) => r.id === recordId);
      if (index === -1) return json(404, { ok: false, error: '找不到對應的登記紀錄' });

      const record = records[index];
      record.attachments = (record.attachments || []).filter((a) => a.id !== id);
      record.updatedBy = session.email || session.name || session.uid;
      record.updatedAt = new Date().toISOString();
      await writeRecords(store, records);

      const attachmentsStore = getStore('income-attachments');
      await attachmentsStore.delete(`${recordId}/${id}`);

      return json(200, { ok: true, record });
    }

    if (req.method === 'POST' && action === 'delete') {
      const parsed = await req.json();
      const id = String(parsed.id || '').trim();
      if (!id) return json(400, { ok: false, error: '請提供 id' });

      const records = await readRecords(store);
      const next = records.filter((r) => r.id !== id);
      if (next.length === records.length) {
        return json(404, { ok: false, error: '找不到對應的登記紀錄' });
      }

      await writeRecords(store, next);

      try {
        const attachmentsStore = getStore('income-attachments');
        const attachments = await attachmentsStore.list({ prefix: `${id}/` });
        await Promise.all(attachments.blobs.map((blob) => attachmentsStore.delete(blob.key)));
      } catch (cleanupError) {
        console.warn(`Income attachment cleanup failed for ${id}`, cleanupError);
      }
      return json(200, { ok: true });
    }

    return json(404, { ok: false, error: 'Not Found' });
  } catch (err) {
    if (err instanceof InputError || err instanceof SyntaxError) {
      return json(400, { ok: false, error: err.message || '請求資料格式錯誤' });
    }
    return json(500, { ok: false, error: err instanceof Error ? err.message : '未知錯誤' });
  }
};

export const config = { path: '/api/income/:action' };
