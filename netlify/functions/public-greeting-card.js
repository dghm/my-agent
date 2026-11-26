import { timingSafeEqual } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import {
  buildPreviewItems,
  loadGreetingCardData,
} from './greeting-cards.js';

const ALLOWED_ORIGINS = new Set([
  'https://my-agent.dghm.tw',
  'https://cards.dghm.tw',
]);

function responseHeaders(req) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    Vary: 'Origin',
  };
  const origin = req.headers.get('origin');
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
  }
  return headers;
}

function json(req, status, body) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(req) });
}

function unavailable(req) {
  return json(req, 404, {
    ok: false,
    code: 'card_unavailable',
    error: '這張賀卡目前尚未開放，或連結已失效',
  });
}

export function withinAvailability(item, now = Date.now()) {
  if (!item || item.websiteStatus !== 'published') return false;
  const enabledAt = item.enabledAt ? Date.parse(item.enabledAt) : NaN;
  const expiresAt = item.expiresAt ? Date.parse(item.expiresAt) : NaN;
  if (Number.isFinite(enabledAt) && now < enabledAt) return false;
  if (Number.isFinite(expiresAt) && now >= expiresAt) return false;
  return true;
}

export function publicContent(item) {
  return {
    mode: item.mode,
    greetingLines: item.greetingLines,
    signatureType: item.signatureType,
    signatureText: item.signatureText,
    logoVariant: item.logoVariant,
    signatureSvg: item.signatureSvg || '',
  };
}

function canReadReactions(req, secret) {
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(req.headers.get('authorization') || '');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function handlePublicGreetingCard(req, openStore) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: responseHeaders(req) });
  if (!['GET', 'POST'].includes(req.method)) return json(req, 405, { ok: false, error: '不支援此請求方式' });

  const url = new URL(req.url);
  const secret = process.env.GREETING_CARD_REACTIONS_SYNC_SECRET;
  const reactionsEnabled = Boolean(secret) && url.hostname !== 'my-agent.dghm.tw';
  if (url.searchParams.get('reactions') === '1') {
    if (req.method !== 'GET') return json(req, 405, { ok: false });
    if (!reactionsEnabled || !canReadReactions(req, secret)) return json(req, 401, { ok: false });
    try {
      const store = openStore();
      const { blobs } = await store.list();
      const entries = [];
      for (let start = 0; start < blobs.length; start += 12) {
        const batch = await Promise.all(blobs.slice(start, start + 12).map(async ({ key }) => [
          key, await store.get(key),
        ]));
        entries.push(...batch.filter(([, timestamp]) => timestamp));
      }
      return json(req, 200, { ok: true, reactions: Object.fromEntries(entries) });
    } catch {
      return json(req, 503, { ok: false });
    }
  }

  if (req.method === 'POST') {
    const origin = req.headers.get('origin');
    if (origin && origin !== url.origin && !ALLOWED_ORIGINS.has(origin)) return json(req, 403, { ok: false });
    if (!reactionsEnabled) return json(req, 503, { ok: false });
    if (!/^application\/json(?:;|$)/i.test(req.headers.get('content-type') || '')) return json(req, 415, { ok: false });
  }

  const token = process.env.AIRTABLE_GREETING_CARDS_TOKEN;
  if (!token) return json(req, 503, { ok: false, code: 'service_unavailable', error: '賀卡服務尚未設定' });

  const code = String(url.searchParams.get('c') || '').trim();
  if (!/^[A-Za-z0-9_-]{12,64}$/.test(code)) return unavailable(req);

  try {
    const { cards, recipients, greetings } = await loadGreetingCardData(token);
    const items = buildPreviewItems(cards, recipients, greetings, {
      year: '2026',
      festival: '聖誕',
      template: '2026-christmas',
    });
    const matches = items.filter((candidate) => (
      code.length >= 32
        ? candidate.publicCode === code
        : candidate.publicCode?.startsWith(code)
    ));
    const item = matches.length === 1 ? matches[0] : null;
    if (!withinAvailability(item)) return unavailable(req);
    if (req.method === 'POST') {
      await openStore().set(item.id, new Date().toISOString(), { onlyIfNew: true });
      return json(req, 200, { ok: true, liked: true });
    }
    let reaction = null;
    if (reactionsEnabled) {
      try {
        reaction = { liked: Boolean(await openStore().get(item.id)) };
      } catch {
        // A reaction-store outage must not prevent reading the card.
      }
    }
    return json(req, 200, { ok: true, content: publicContent(item), ...(reaction && { reaction }) });
  } catch {
    return json(req, 502, { ok: false, code: 'service_unavailable', error: '目前無法讀取這張賀卡' });
  }
}

export function createPublicGreetingCardHandler({
  openStore = () => getStore({ name: 'greeting-card-reactions', consistency: 'strong' }),
} = {}) {
  return (req) => handlePublicGreetingCard(req, openStore);
}

export default createPublicGreetingCardHandler();

export const config = { path: '/api/public-greeting-card' };

