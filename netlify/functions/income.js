import { getStore } from '@netlify/blobs';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS },
  });
}

async function readRecords(store) {
  const records = await store.get('records', { type: 'json' });
  return records || [];
}

async function writeRecords(store, records) {
  await store.setJSON('records', records);
}

export default async (req, context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
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
      const records = (await readRecords(store)).filter((r) => {
        if (!r.date) return false;
        const [y, m] = r.date.split('-');
        if (year && y !== String(year)) return false;
        if (month && m !== String(month).padStart(2, '0')) return false;
        return true;
      });
      const total = records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      const paid = records
        .filter((r) => r.paymentStatus === 'paid')
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      return json(200, {
        ok: true,
        year: year || null,
        month: month || null,
        count: records.length,
        total,
        paid,
        unpaid: total - paid,
        records,
      });
    }

    if (req.method === 'POST' && action === 'create') {
      const parsed = await req.json();
      const project = String(parsed.project || '').trim();
      const client = String(parsed.client || '').trim();
      const amount = Number(parsed.amount);
      const date = String(parsed.date || '').trim();

      if (!project || !client || !date || !Number.isFinite(amount) || amount <= 0) {
        return json(400, { ok: false, error: '請完整填寫案件名稱、客戶、日期與有效金額' });
      }

      const record = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        project,
        client,
        projectCode: String(parsed.projectCode || '').trim(),
        installment: String(parsed.installment || '').trim(),
        amount,
        taxRate: Number.isFinite(Number(parsed.taxRate)) ? Number(parsed.taxRate) : 5,
        noticeNo: String(parsed.noticeNo || '').trim(),
        invoiceNo: String(parsed.invoiceNo || '').trim(),
        date,
        dueDate: String(parsed.dueDate || '').trim(),
        paymentTerms: String(parsed.paymentTerms || '').trim(),
        paymentStatus: parsed.paymentStatus === 'paid' ? 'paid' : 'unpaid',
        invoiceStatus: parsed.invoiceStatus === 'issued' ? 'issued' : 'not_issued',
        note: String(parsed.note || '').trim(),
        createdAt: new Date().toISOString(),
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
      const updated = {
        ...existing,
        project: parsed.project !== undefined ? String(parsed.project).trim() : existing.project,
        client: parsed.client !== undefined ? String(parsed.client).trim() : existing.client,
        projectCode: parsed.projectCode !== undefined ? String(parsed.projectCode).trim() : existing.projectCode,
        installment: parsed.installment !== undefined ? String(parsed.installment).trim() : existing.installment,
        amount: parsed.amount !== undefined ? Number(parsed.amount) : existing.amount,
        taxRate: parsed.taxRate !== undefined ? Number(parsed.taxRate) : existing.taxRate,
        noticeNo: parsed.noticeNo !== undefined ? String(parsed.noticeNo).trim() : existing.noticeNo,
        invoiceNo: parsed.invoiceNo !== undefined ? String(parsed.invoiceNo).trim() : existing.invoiceNo,
        date: parsed.date !== undefined ? String(parsed.date).trim() : existing.date,
        dueDate: parsed.dueDate !== undefined ? String(parsed.dueDate).trim() : existing.dueDate,
        paymentTerms: parsed.paymentTerms !== undefined ? String(parsed.paymentTerms).trim() : existing.paymentTerms,
        paymentStatus:
          parsed.paymentStatus !== undefined
            ? (parsed.paymentStatus === 'paid' ? 'paid' : 'unpaid')
            : existing.paymentStatus,
        invoiceStatus:
          parsed.invoiceStatus !== undefined
            ? (parsed.invoiceStatus === 'issued' ? 'issued' : 'not_issued')
            : existing.invoiceStatus,
        note: parsed.note !== undefined ? String(parsed.note).trim() : existing.note,
        updatedAt: new Date().toISOString(),
      };

      records[index] = updated;
      await writeRecords(store, records);
      return json(200, { ok: true, record: updated });
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
      return json(200, { ok: true });
    }

    return json(404, { ok: false, error: 'Not Found' });
  } catch (err) {
    return json(500, { ok: false, error: err instanceof Error ? err.message : '未知錯誤' });
  }
};

export const config = { path: '/api/income/:action' };
