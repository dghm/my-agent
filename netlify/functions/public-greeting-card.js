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
    headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
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
  if (!item || !['preview', 'published'].includes(item.websiteStatus)) return false;
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
  };
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: responseHeaders(req) });
  if (req.method !== 'GET') return json(req, 405, { ok: false, error: '不支援此請求方式' });

  const token = process.env.AIRTABLE_GREETING_CARDS_TOKEN;
  if (!token) return json(req, 503, { ok: false, code: 'service_unavailable', error: '賀卡服務尚未設定' });

  const url = new URL(req.url);
  const code = String(url.searchParams.get('c') || '').trim();
  if (!/^[A-Za-z0-9_-]{32,64}$/.test(code)) return unavailable(req);

  try {
    const { cards, recipients, greetings } = await loadGreetingCardData(token);
    const items = buildPreviewItems(cards, recipients, greetings, {
      year: '2026',
      festival: '聖誕',
      template: '2026-christmas',
    });
    const item = items.find((candidate) => candidate.publicCode === code);
    if (!withinAvailability(item)) return unavailable(req);
    return json(req, 200, { ok: true, content: publicContent(item) });
  } catch {
    return json(req, 502, { ok: false, code: 'service_unavailable', error: '目前無法讀取這張賀卡' });
  }
};

export const config = { path: '/api/public-greeting-card' };

