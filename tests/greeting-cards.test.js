import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import handler, { buildPreviewItems } from '../netlify/functions/greeting-cards.js';

const CARD = {
  year: 'flddlYmss0faJe03E', festival: 'fldeUIsh9wBncgniM', recipient: 'fld4dZDrUQVIkJQtY',
  category: 'fldCWeUDJoFdBv7NV', greeting: 'fldMGXuTJQU5zBhCA', template: 'fldwFU60KWNU6DDSO',
  recipientLabel: 'fld7VjnmfMSDPxfTt', signatureType: 'fldoFfIhXP7xFZBns', signatureText: 'fldMUV5TYeFKvcGSN',
  logoVariant: 'fldVmZeqkd1B4pjiv', websiteStatus: 'fldsQ6TklClpsV78A',
};
const RECIPIENT = { name: 'fldnpDUlEhbqfuzGz', category: 'fldzUAZDgjfXl61mf', displayName: 'fldhzttF6DtLL7ctq' };
const GREETING = { year: 'fldZB5YwTMbpcgfl2', festival: 'fld36XYxl9rkBBGFI', greeting: 'fldKX7bCblbPt3NNQ' };

function fixtureRecords() {
  return {
    cards: [{
      id: 'recPrivateAirtableId',
      fields: {
        [CARD.year]: '2026', [CARD.festival]: '聖誕', [CARD.recipient]: ['recRecipient'], [CARD.category]: ['家人'],
        [CARD.greeting]: '暄晴聖誕節開心', [CARD.template]: '2026-christmas', [CARD.signatureType]: '個人',
        [CARD.signatureText]: '萬錤', [CARD.logoVariant]: '個人中文名', [CARD.websiteStatus]: '預覽',
      },
    }],
    recipients: [{ id: 'recRecipient', fields: { [RECIPIENT.name]: '完整姓名', [RECIPIENT.displayName]: '晴晴', [RECIPIENT.category]: '家人' } }],
    greetings: [{ id: 'recGreeting', fields: { [GREETING.year]: '2026', [GREETING.festival]: '聖誕', [GREETING.greeting]: '上帝賜你全家平安喜樂' } }],
  };
}

function sessionCookie(secret) {
  const data = Buffer.from(JSON.stringify({ uid: 'user-1', exp: Date.now() + 60_000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `dghm_session=${data}.${signature}`;
}

test('buildPreviewItems returns public and personalized safe preview data', () => {
  const data = fixtureRecords();
  const items = buildPreviewItems(data.cards, data.recipients, data.greetings, { year: '2026', festival: '聖誕', template: '2026-christmas' });
  assert.equal(items.length, 2);
  assert.equal(items[0].mode, 'family');
  assert.equal(items[0].recipientName, '晴晴');
  assert.deepEqual(items[0].greetingLines, ['暄晴聖誕節開心']);
  assert.equal(items[0].signatureType, 'personal');
  assert.equal(items[0].signatureText, '萬錤');
  assert.equal(items[1].mode, 'public');
  assert.deepEqual(items[1].greetingLines, ['上帝賜你全家平安喜樂']);
  assert.equal(JSON.stringify(items).includes('recPrivateAirtableId'), false);
});

test('endpoint requires a valid my-agent session', async () => {
  const previousSecret = process.env.SESSION_SECRET;
  const previousToken = process.env.AIRTABLE_GREETING_CARDS_TOKEN;
  process.env.SESSION_SECRET = 'test-secret';
  process.env.AIRTABLE_GREETING_CARDS_TOKEN = 'pat-test';
  try {
    const response = await handler(new Request('https://example.test/api/greeting-cards'));
    assert.equal(response.status, 401);
    assert.equal((await response.json()).code, 'unauthenticated');
  } finally {
    if (previousSecret === undefined) delete process.env.SESSION_SECRET; else process.env.SESSION_SECRET = previousSecret;
    if (previousToken === undefined) delete process.env.AIRTABLE_GREETING_CARDS_TOKEN; else process.env.AIRTABLE_GREETING_CARDS_TOKEN = previousToken;
  }
});

test('endpoint reads Airtable server-side and omits private fields', async () => {
  const previousSecret = process.env.SESSION_SECRET;
  const previousToken = process.env.AIRTABLE_GREETING_CARDS_TOKEN;
  const previousFetch = globalThis.fetch;
  const secret = 'test-secret';
  const data = fixtureRecords();
  process.env.SESSION_SECRET = secret;
  process.env.AIRTABLE_GREETING_CARDS_TOKEN = 'pat-test';
  globalThis.fetch = async (url, options) => {
    assert.equal(options.headers.Authorization, 'Bearer pat-test');
    const value = String(url);
    if (value.includes('tblFxLv8DgbIVyPkW')) return Response.json({ records: data.cards });
    if (value.includes('tblyMZJSwfayCFu8G')) return Response.json({ records: data.recipients });
    if (value.includes('tblsQVFkqi8pXGsE4')) return Response.json({ records: data.greetings });
    return Response.json({ error: { type: 'NOT_FOUND' } }, { status: 404 });
  };
  try {
    const response = await handler(new Request('https://example.test/api/greeting-cards?year=2026&festival=%E8%81%96%E8%AA%95&template=2026-christmas', {
      headers: { cookie: sessionCookie(secret) },
    }));
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.source, 'airtable');
    assert.equal(payload.items.length, 2);
    assert.equal(JSON.stringify(payload).includes('recPrivateAirtableId'), false);
    assert.equal(JSON.stringify(payload).includes('pat-test'), false);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousSecret === undefined) delete process.env.SESSION_SECRET; else process.env.SESSION_SECRET = previousSecret;
    if (previousToken === undefined) delete process.env.AIRTABLE_GREETING_CARDS_TOKEN; else process.env.AIRTABLE_GREETING_CARDS_TOKEN = previousToken;
  }
});
