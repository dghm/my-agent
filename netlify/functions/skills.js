import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

const MAX_SKILL_SIZE = 10 * 1024 * 1024;
const INDEX_KEY = 'workspace/index';

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function safeFilename(value) {
  const filename = String(value || 'skill.skill')
    .replace(/[\r\n"]/g, '')
    .replace(/[\\/]/g, '-')
    .slice(0, 180);
  return filename.toLowerCase().endsWith('.skill') ? filename : `${filename}.skill`;
}

function normalizeMetadata(raw, fallbackFilename, size) {
  const metadata = raw && typeof raw === 'object' ? raw : {};
  const summary = metadata.summary && typeof metadata.summary === 'object'
    ? metadata.summary
    : {};
  const files = Array.isArray(metadata.files) ? metadata.files.slice(0, 500) : [];
  return {
    filename: safeFilename(metadata.filename || fallbackFilename),
    size,
    source: String(metadata.source || '').slice(0, 1024 * 1024),
    summary: {
      name: String(summary.name || fallbackFilename.replace(/\.skill$/i, '')).slice(0, 200),
      purpose: String(summary.purpose || '').slice(0, 2000),
      when: String(summary.when || '').slice(0, 2000),
      output: String(summary.output || '').slice(0, 2000),
      source: String(summary.source || '').slice(0, 1000),
    },
    files: files.map((entry) => ({
      name: String(entry && entry.name || '').slice(0, 600),
      size: Math.max(0, Number(entry && entry.size) || 0),
    })),
  };
}

async function readIndex(store) {
  return (await store.get(INDEX_KEY, {
    type: 'json',
    consistency: 'strong',
  })) || [];
}

async function writeIndex(store, records) {
  await store.setJSON(INDEX_KEY, records);
}

export default async (req, context) => {
  const action = context.params.action;
  const store = getStore({ name: 'ai-skills', consistency: 'strong' });

  try {
    if (req.method === 'GET' && action === 'list') {
      const records = await readIndex(store);
      return json(200, { ok: true, skills: records });
    }

    if (req.method === 'POST' && action === 'upload') {
      const form = await req.formData();
      const file = form.get('file');
      if (!file || typeof file.arrayBuffer !== 'function' || !file.size) {
        return json(400, { ok: false, error: '請選擇要保存的 .skill 檔案。' });
      }
      if (!String(file.name || '').toLowerCase().endsWith('.skill')) {
        return json(400, { ok: false, error: '只接受 .skill 檔案。' });
      }
      if (file.size > MAX_SKILL_SIZE) {
        return json(400, { ok: false, error: 'Skill 檔案不可超過 10 MB。' });
      }

      const data = await file.arrayBuffer();
      const signature = new Uint8Array(data, 0, Math.min(4, data.byteLength));
      if (signature[0] !== 0x50 || signature[1] !== 0x4b) {
        return json(400, { ok: false, error: '.skill 內容不是有效的 ZIP 套件。' });
      }

      let parsedMetadata = {};
      try {
        parsedMetadata = JSON.parse(String(form.get('metadata') || '{}'));
      } catch {
        return json(400, { ok: false, error: 'Skill 摘要資料格式錯誤。' });
      }

      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const normalized = normalizeMetadata(parsedMetadata, file.name, file.size);
      const record = {
        id,
        ...normalized,
        uploadedAt: now,
        updatedAt: now,
      };

      await store.set(`workspace/packages/${id}`, data, {
        metadata: {
          filename: record.filename,
          mimeType: 'application/zip',
        },
      });
      const records = await readIndex(store);
      const duplicate = records.findIndex((item) => item.filename === record.filename);
      if (duplicate >= 0) {
        await store.delete(`workspace/packages/${records[duplicate].id}`);
        records.splice(duplicate, 1);
      }
      records.unshift(record);
      await writeIndex(store, records);
      return json(200, { ok: true, skill: record });
    }

    if (req.method === 'GET' && action === 'download') {
      const id = String(new URL(req.url).searchParams.get('id') || '').trim();
      const records = await readIndex(store);
      const record = records.find((item) => item.id === id);
      if (!record) return json(404, { ok: false, error: '找不到這個 Skill。' });

      const data = await store.get(`workspace/packages/${id}`, {
        type: 'arrayBuffer',
        consistency: 'strong',
      });
      if (!data) return json(404, { ok: false, error: '找不到 Skill 原始檔。' });

      return new Response(data, {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(record.filename)}`,
          'Cache-Control': 'private, no-store',
        },
      });
    }

    if (req.method === 'POST' && action === 'delete') {
      const body = await req.json();
      const id = String(body.id || '').trim();
      const records = await readIndex(store);
      const record = records.find((item) => item.id === id);
      if (!record) return json(404, { ok: false, error: '找不到這個 Skill。' });

      await store.delete(`workspace/packages/${id}`);
      await writeIndex(store, records.filter((item) => item.id !== id));
      return json(200, { ok: true });
    }

    return json(404, { ok: false, error: 'Not Found' });
  } catch (error) {
    return json(500, {
      ok: false,
      error: error instanceof Error ? error.message : 'Skill 儲存發生未知錯誤。',
    });
  }
};

export const config = { path: '/api/skills/:action' };
