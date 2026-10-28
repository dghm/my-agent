import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'accounting-checklists';
const CYCLE_PATTERN = /^(20\d{2}|2100)-(0[2468]|1[02])$/;
const ID_PATTERN = /^[a-z0-9-]{6,80}$/;
const MAX_LABEL_LENGTH = 100;

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
  } catch { return null; }
}

function ownerPrefix(uid) {
  return crypto.createHash('sha256').update(String(uid)).digest('hex').slice(0, 24);
}

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
}

function taipeiDateParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now).reduce((result, part) => {
    if (part.type !== 'literal') result[part.type] = part.value;
    return result;
  }, {});
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

function cycleKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function previousEvenCycle(year, month) {
  let targetMonth = month - 1;
  let targetYear = year;
  if (targetMonth === 0) { targetMonth = 12; targetYear -= 1; }
  return cycleKey(targetYear, targetMonth);
}

function nextEvenCycle(year, month) {
  return cycleKey(year, month + 1);
}

function cycleIsComplete(cycle) {
  return !cycle?.items?.length || cycle.items.every((item) => item.completed === true);
}

function dueDateForCycle(key) {
  const [year, month] = key.split('-').map(Number);
  const day = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${key}-${String(day).padStart(2, '0')}`;
}

export function getCycleContext(state, now = new Date()) {
  const { year, month, day } = taipeiDateParts(now);
  const isEvenMonth = month % 2 === 0;
  let key;
  let overdue = false;
  if (isEvenMonth) {
    key = cycleKey(year, month);
  } else {
    const previousKey = previousEvenCycle(year, month);
    const previous = state.cycles?.[previousKey];
    if (previous && !cycleIsComplete(previous)) {
      key = previousKey;
      overdue = true;
    } else {
      key = nextEvenCycle(year, month);
    }
  }
  return {
    key,
    dueDate: dueDateForCycle(key),
    isCurrentEvenMonth: isEvenMonth,
    urgent: isEvenMonth && day >= 20,
    overdue,
  };
}

function defaultState() {
  return { version: 1, templateItems: [], cycles: {} };
}

function normalizeState(value) {
  const state = value && typeof value === 'object' ? value : defaultState();
  if (!Array.isArray(state.templateItems)) state.templateItems = [];
  if (!state.cycles || typeof state.cycles !== 'object' || Array.isArray(state.cycles)) state.cycles = {};
  state.version = 1;
  return state;
}

export function ensureCycle(state, key, idFactory = newId) {
  if (state.cycles[key]) return false;
  const now = new Date().toISOString();
  state.cycles[key] = {
    key,
    items: state.templateItems.map((template) => ({
      id: idFactory('item'),
      templateId: template.id,
      label: template.label,
      persistent: true,
      completed: false,
      createdAt: now,
      completedAt: null,
    })),
    createdAt: now,
    updatedAt: now,
  };
  return true;
}

function publicPayload(state, context) {
  const cycle = state.cycles[context.key];
  const completedCount = cycle.items.filter((item) => item.completed).length;
  return {
    ok: true,
    cycle: context.key,
    dueDate: context.dueDate,
    isCurrentEvenMonth: context.isCurrentEvenMonth,
    urgent: context.urgent,
    overdue: context.overdue,
    items: cycle.items,
    completedCount,
    totalCount: cycle.items.length,
    complete: cycleIsComplete(cycle) && cycle.items.length > 0,
  };
}

function validateLabel(value) {
  const label = String(value || '').trim();
  if (!label) return { error: '請輸入要準備的項目' };
  if (label.length > MAX_LABEL_LENGTH) return { error: `項目不可超過 ${MAX_LABEL_LENGTH} 字` };
  return { label };
}

function findItem(state, cycleKeyValue, itemId) {
  const cycle = state.cycles[cycleKeyValue];
  if (!cycle) return {};
  return { cycle, item: cycle.items.find((candidate) => candidate.id === itemId) };
}

export function renameItem(state, requestedCycle, item, label) {
  item.label = label;
  if (!item.persistent || !item.templateId) return;
  const template = state.templateItems.find((candidate) => candidate.id === item.templateId);
  if (template) template.label = label;
  Object.entries(state.cycles).forEach(([key, cycle]) => {
    if (key < requestedCycle) return;
    cycle.items.forEach((candidate) => {
      if (candidate.templateId === item.templateId) candidate.label = label;
    });
  });
}

export default async (req) => {
  const session = sessionFromRequest(req);
  if (!session) return json(401, { ok: false, error: '請先登入工作台', code: 'unauthenticated' });

  const owner = ownerPrefix(session.uid);
  const store = getStore({ name: STORE_NAME, consistency: 'strong' });
  const key = `${owner}/state`;

  try {
    const state = normalizeState(await store.get(key, { type: 'json' }));
    const context = getCycleContext(state);
    const created = ensureCycle(state, context.key);

    if (req.method === 'GET') {
      if (created) await store.setJSON(key, state);
      return json(200, publicPayload(state, context));
    }

    if (req.method !== 'POST') return json(405, { ok: false, error: '不支援此請求方式' });

    let input;
    try { input = await req.json(); } catch { return json(400, { ok: false, error: 'Checklist 資料格式錯誤' }); }
    const action = String(input?.action || '').trim();
    const requestedCycle = String(input?.cycle || context.key).trim();
    if (!CYCLE_PATTERN.test(requestedCycle) || !state.cycles[requestedCycle]) {
      return json(400, { ok: false, error: 'Checklist 期別錯誤，請重新整理頁面' });
    }
    const cycle = state.cycles[requestedCycle];
    const now = new Date().toISOString();

    if (action === 'add') {
      const normalized = validateLabel(input?.label);
      if (normalized.error) return json(400, { ok: false, error: normalized.error });
      const persistent = input?.persistent === true;
      let templateId = null;
      if (persistent) {
        templateId = newId('template');
        state.templateItems.push({ id: templateId, label: normalized.label, createdAt: now });
      }
      cycle.items.push({
        id: newId('item'), templateId, label: normalized.label, persistent,
        completed: false, createdAt: now, completedAt: null,
      });
    } else if (action === 'toggle') {
      const itemId = String(input?.itemId || '').trim();
      if (!ID_PATTERN.test(itemId)) return json(400, { ok: false, error: 'Checklist 項目編號錯誤' });
      const { item } = findItem(state, requestedCycle, itemId);
      if (!item) return json(404, { ok: false, error: '找不到這個 Checklist 項目' });
      item.completed = input?.completed === true;
      item.completedAt = item.completed ? now : null;
    } else if (action === 'edit') {
      const itemId = String(input?.itemId || '').trim();
      if (!ID_PATTERN.test(itemId)) return json(400, { ok: false, error: 'Checklist 項目編號錯誤' });
      const normalized = validateLabel(input?.label);
      if (normalized.error) return json(400, { ok: false, error: normalized.error });
      const { item } = findItem(state, requestedCycle, itemId);
      if (!item) return json(404, { ok: false, error: '找不到這個 Checklist 項目' });
      renameItem(state, requestedCycle, item, normalized.label);
    } else if (action === 'promote') {
      const itemId = String(input?.itemId || '').trim();
      if (!ID_PATTERN.test(itemId)) return json(400, { ok: false, error: 'Checklist 項目編號錯誤' });
      const { item } = findItem(state, requestedCycle, itemId);
      if (!item) return json(404, { ok: false, error: '找不到這個 Checklist 項目' });
      if (!item.persistent) {
        item.templateId = newId('template');
        item.persistent = true;
        state.templateItems.push({ id: item.templateId, label: item.label, createdAt: now });
      }
    } else if (action === 'remove') {
      const itemId = String(input?.itemId || '').trim();
      if (!ID_PATTERN.test(itemId)) return json(400, { ok: false, error: 'Checklist 項目編號錯誤' });
      const itemIndex = cycle.items.findIndex((item) => item.id === itemId);
      if (itemIndex < 0) return json(404, { ok: false, error: '找不到這個 Checklist 項目' });
      const [removed] = cycle.items.splice(itemIndex, 1);
      if (input?.removeFromTemplate === true && removed.templateId) {
        state.templateItems = state.templateItems.filter((template) => template.id !== removed.templateId);
      }
    } else {
      return json(400, { ok: false, error: '不支援此 Checklist 操作' });
    }

    cycle.updatedAt = now;
    await store.setJSON(key, state);
    const responseContext = requestedCycle === context.key
      ? context
      : { ...context, key: requestedCycle, dueDate: dueDateForCycle(requestedCycle) };
    return json(200, publicPayload(state, responseContext));
  } catch (error) {
    const detail = error instanceof Error && error.message ? `（${error.message}）` : '';
    return json(502, { ok: false, error: `無法讀寫會計交件 Checklist${detail}` });
  }
};

export const config = { path: '/api/accounting-checklist' };
