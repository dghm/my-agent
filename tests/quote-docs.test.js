import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import vm from 'node:vm';
import { buildQuoteModel, buildSkeletonRequests, buildCellRequests, buildStyleRequests, populateQuoteDocument } from '../netlify/functions/lib/quote-docs.js';
import { createQuoteDocsHandler } from '../netlify/functions/quote-docs.js';

process.env.SESSION_SECRET = 'quote-docs-test-secret';
process.env.GOOGLE_CLIENT_ID = 'test-client';
process.env.GOOGLE_CLIENT_SECRET = 'test-secret';
const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const fixture = () => ({
  kind: 'dghm-quote-draft', version: 1,
  fields: { f_qt_no: 'QT-測試', f_client_name: '測試客戶', f_doc_title: '網站製作\n第二行', f_issue_date: '2026-10-06', f_valid_date: '2026-11-06', f_tax_rate: '5', f_tax_label: '營業稅', f_excl_items: '長條款'.repeat(100) + '\n第二項', f_excl_page: '3', f_coop_items: '提供素材', f_coop_page: '3', f_sig_on: true, f_sig_page: '3', f_validity_on: true, f_validity_page: '3' },
  sections: [
    { title: '一、服務範圍', type: 'spec', page: '1', rows: [{ name: '功能 😀', spec: '第一行\n第二行', desc: '完整說明' }] },
    { title: '二、計價', type: 'price', page: '1', rows: [{ name: '網站', desc: '設計製作', price: '1001' }] },
    { title: '三、方案', type: 'option', page: '2', rows: [{ name: '維護', desc: '每月服務', price: 'NT$ 500 / 月' }] },
  ],
  totals: [{ page: '1', totalLabel: '工程總計（含稅）', rows: [{ label: '工程費', amount: '1001' }] }],
  payments: [{ title: '付款條件', page: '2', note: '匯款', cards: [{ phase: '簽約款', amount: '500', timing: '簽約後\n五工作日內' }] }],
  sched: [{ week: '第一週', desc: '開發' }],
});

// Representative Docs response with real UTF-16 paragraph offsets, including the
// empty paragraphs created around tables. Filled cells have different indexes.
function documentFixture(model, filled = false) {
  let index = 1;
  const content = [{ startIndex: 0, endIndex: 1, sectionBreak: {} }];
  function p(value) {
    const startIndex = index;
    const valueWithNewline = `${value}\n`;
    index += valueWithNewline.length;
    return { startIndex, endIndex: index, paragraph: { elements: [{ startIndex, endIndex: index, textRun: { content: valueWithNewline } }] } };
  }
  for (const block of model.blocks) {
    if (block.type === 'paragraph') { content.push(p(block.text)); continue; }
    content.push(p(''));
    const startIndex = index++;
    const tableRows = block.rows.map((row) => {
      index++;
      return { tableCells: row.map((value) => {
        const cellStart = index++;
        const paragraphs = (filled ? value.split('\n') : ['']).map(p);
        return { startIndex: cellStart, endIndex: index, content: paragraphs };
      }) };
    });
    content.push({ startIndex, endIndex: ++index, table: { tableRows } });
  }
  content.push(p(''));
  return { body: { content } };
}

test('all quote content stays editable; tax and ordering match the quote', () => {
  const model = buildQuoteModel(fixture());
  const tables = model.blocks.filter((b) => b.type === 'table');
  const total = tables.find((b) => b.totalRow);
  assert.deepEqual(total.rows.at(-1), ['工程總計（含稅）', 'NT$ 1,051']);
  assert.ok(model.blocks.findIndex((b) => b.text === '報價總覽') < model.blocks.findIndex((b) => b.text === '三、方案'));
  assert.equal(model.blocks.filter((b) => b.role === 'bullet').length, 3);
  assert.equal(model.blocks.find((b) => b.role === 'bullet').text, '長條款'.repeat(100));
  assert.ok(tables.some((b) => b.rows.some((r) => r[0] === '☐')));
  assert.ok(tables.some((b) => b.rows.some((r) => r.includes('簽約後\n五工作日內'))));
  const zero = fixture(); zero.fields.f_tax_rate = '0';
  assert.equal(buildQuoteModel(zero).blocks.find((b) => b.totalRow).rows.at(-1)[1], 'NT$ 1,001');
});

test('reject malformed and oversized data before creating any Google document', () => {
  for (const value of [null, {}, { ...fixture(), sections: [{}] }, { ...fixture(), payments: [{ cards: null }] }]) assert.throws(() => buildQuoteModel(value));
  const invalidRate = fixture(); invalidRate.fields.f_tax_rate = 'bad';
  assert.throws(() => buildQuoteModel(invalidRate), /稅率/);
  const invalidAmount = fixture(); invalidAmount.totals[0].rows[0].amount = 'bad';
  assert.throws(() => buildQuoteModel(invalidAmount), /金額/);
  const overflow = fixture(); overflow.totals[0].rows = [{ amount: '1e308' }, { amount: '1e308' }];
  assert.throws(() => buildQuoteModel(overflow), /金額/);
  const large = fixture(); large.fields.f_excl_items = '過長'.repeat(110000);
  assert.throws(() => buildQuoteModel(large), /過多/);
});

test('native table writes use Google-returned cell positions in descending order', () => {
  const model = buildQuoteModel(fixture());
  const empty = documentFixture(model);
  const writes = buildCellRequests(model, empty);
  for (let i = 1; i < writes.length; i++) assert.ok(writes[i - 1].insertText.location.index > writes[i].insertText.location.index);
  const emoji = writes.find((r) => r.insertText.text === '功能 😀');
  const matchingCell = empty.body.content.flatMap((e) => e.table?.tableRows || []).flatMap((r) => r.tableCells).find((c) => c.content[0].startIndex === emoji.insertText.location.index);
  assert.ok(matchingCell);
  assert.throws(() => buildCellRequests(model, { body: { content: [] } }), /表格/);
  const skeleton = buildSkeletonRequests(model);
  assert.equal(skeleton.at(-1).insertText.text, '萬能數維有限公司 DGHM\n');
  assert.ok(skeleton.some((r) => r.insertTable));
});

test('style pass uses fresh indexes, A4 widths, repeating headers and single-column lists', () => {
  const model = buildQuoteModel(fixture());
  const filled = documentFixture(model, true);
  const styles = buildStyleRequests(model, filled);
  assert.equal(styles[0].updateDocumentStyle.documentStyle.pageSize.width.magnitude, 595.28);
  assert.equal(styles[0].updateDocumentStyle.documentStyle.documentFormat.documentMode, 'PAGES');
  assert.equal(styles.filter((r) => r.createParagraphBullets).length, 3);
  assert.ok(styles.some((r) => r.pinTableHeaderRows?.pinnedHeaderRowsCount === 1));
  const widths = styles.filter((r) => r.updateTableColumnProperties);
  const tableLocations = filled.body.content.filter((e) => e.table).map((e) => e.startIndex);
  assert.ok(widths.every((r) => tableLocations.includes(r.updateTableColumnProperties.tableStartLocation.index)));
  assert.ok(!styles.some((r) => r.insertInlineImage || r.insertPageBreak));
});

test('populate separates skeleton, cell text and formatting into sequential API passes', async () => {
  const model = buildQuoteModel(fixture());
  const calls = [];
  let reads = 0;
  await populateQuoteDocument(model, 'test-doc', async (path, options) => {
    calls.push({ path, requests: options?.body ? JSON.parse(options.body).requests : null });
    if (!options) return documentFixture(model, reads++ > 0);
    return {};
  });
  assert.equal(reads, 2);
  assert.ok(calls.filter((c) => c.requests).every((c) => c.requests.length <= 150));
  const firstRead = calls.findIndex((c) => !c.requests);
  assert.ok(calls.slice(0, firstRead).some((c) => c.requests.some((r) => r.insertTable)));
  assert.ok(calls.slice(firstRead + 1).some((c) => c.requests?.some((r) => r.insertText?.text === '功能 😀')));
});

function cookie(exp = Date.now() + 60000) {
  const payload = Buffer.from(JSON.stringify({ uid: 'test-user', exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('base64url');
  return `dghm_session=${payload}.${signature}`;
}
function request(body = fixture(), headers = {}) {
  return new Request('https://example.test/api/quote-docs/create', { method: 'POST', headers: { cookie: cookie(), origin: 'https://example.test', ...headers }, body: JSON.stringify(body) });
}
const store = () => ({ get: async () => [{ id: 'test-user', provider: 'google', googleRefreshToken: 'fake-refresh-token' }] });
const response = (data, status = 200) => new Response(JSON.stringify(data), { status });

test('endpoint rejects missing/expired sessions and foreign-origin requests without Google calls', async () => {
  const handler = createQuoteDocsHandler({ store, fetchApi: () => { throw new Error('Must not call Google'); } });
  assert.equal((await handler(request(fixture(), { cookie: '' }))).status, 401);
  assert.equal((await handler(request(fixture(), { cookie: cookie(1) }))).status, 401);
  assert.equal((await handler(request(fixture(), { origin: 'https://other.test' }))).status, 403);
  assert.equal((await handler(request({}))).status, 400);
});

test('endpoint requests additional authorization for existing Calendar-only grants', async () => {
  const handler = createQuoteDocsHandler({ store, fetchApi: async () => response({ access_token: 'fake-token', scope: 'https://www.googleapis.com/auth/calendar.events' }) });
  const res = await handler(request());
  assert.equal(res.status, 409);
  assert.equal((await res.json()).authUrl, '/api/auth/login/google?grant=docs');
});

test('endpoint fails closed without a configured session signing secret', async () => {
  const req = request();
  const secret = process.env.SESSION_SECRET;
  const handler = createQuoteDocsHandler({ store, fetchApi: () => { throw new Error('Must not call Google'); } });
  try {
    delete process.env.SESSION_SECRET;
    const res = await handler(req);
    assert.equal(res.status, 503);
    assert.equal((await res.json()).code, 'session_not_configured');
  } finally {
    process.env.SESSION_SECRET = secret;
  }
});

test('endpoint reports disabled Docs API and provides partial document link on later failures', async () => {
  for (const partial of [false, true]) {
    const handler = createQuoteDocsHandler({ store, fetchApi: async (url) => {
      if (url.includes('oauth2')) return response({ access_token: 'fake-token', scope: SCOPE });
      if (partial && url.endsWith('/documents')) return response({ documentId: 'test-doc' });
      return response({ error: { details: [{ reason: 'SERVICE_DISABLED' }] } }, 403);
    } });
    const res = await handler(request());
    const data = await res.json();
    assert.equal(data.code, 'docs_api_disabled');
    assert.equal(data.partialUrl, partial ? 'https://docs.google.com/document/d/test-doc/edit' : undefined);
  }
});

test('successful endpoint creates only a private native document and returns no tokens', async () => {
  const model = buildQuoteModel(fixture());
  const urls = [];
  let reads = 0;
  const handler = createQuoteDocsHandler({ store, fetchApi: async (url, options = {}) => {
    urls.push(url);
    if (url.includes('oauth2')) return response({ access_token: 'fake-access-token', scope: SCOPE });
    if (url.endsWith('/documents')) return response({ documentId: 'test-doc' });
    if (options.method === 'POST') return response({ replies: [] });
    return response(documentFixture(model, reads++ > 0));
  } });
  const res = await handler(request());
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.url, 'https://docs.google.com/document/d/test-doc/edit');
  assert.ok(!JSON.stringify(data).includes('fake-'));
  assert.ok(urls.every((url) => url.includes('oauth2.googleapis.com') || url.includes('docs.googleapis.com')));
});

test('Docs authorization is optional, preserves Calendar scope and clears return cookies', async () => {
  const { default: auth } = await import('../netlify/functions/auth.js');
  const normal = await auth(new Request('https://example.test/api/auth/login/google'));
  const docs = await auth(new Request('https://example.test/api/auth/login/google?grant=docs'));
  const normalUrl = new URL(normal.headers.get('location'));
  const docsUrl = new URL(docs.headers.get('location'));
  assert.ok(!normalUrl.searchParams.get('scope').includes(SCOPE));
  assert.ok(docsUrl.searchParams.get('scope').includes(SCOPE));
  assert.ok(docsUrl.searchParams.get('scope').includes('calendar.events'));
  assert.equal(docsUrl.searchParams.get('include_granted_scopes'), 'true');
  const denied = await auth(new Request('https://example.test/api/auth/callback/google?error=access_denied', { headers: { cookie: 'dghm_oauth_return=%2FQuote-Generator.html' } }));
  assert.equal(denied.headers.get('location'), '/Quote-Generator.html?docsAuth=denied');
  assert.ok(denied.headers.get('set-cookie').includes('Max-Age=0'));
});

test('client sends draft JSON, handles authorization and restores the export button', async () => {
  const elements = new Map();
  const get = (id) => {
    if (!elements.has(id)) elements.set(id, { hidden: true, disabled: false, textContent: '', handlers: {}, addEventListener(type, fn) { this.handlers[type] = fn; } });
    return elements.get(id);
  };
  let result = { ok: false, authUrl: '/api/auth/login/google?grant=docs', error: '請先授權' };
  const context = vm.createContext({ URL, SESSION_STORAGE_KEY: 'draft', collectDraft: fixture,
    document: { getElementById: get }, localStorage: { setItem() {} },
    window: { location: { href: 'https://example.test/Quote-Generator.html', protocol: 'https:' }, history: { replaceState() {} } },
    fetch: async (_, options) => { assert.deepEqual(JSON.parse(options.body), fixture()); return { ok: result.ok, json: async () => result }; },
  });
  vm.runInContext(fs.readFileSync(new URL('../quote-docs-client.js', import.meta.url), 'utf8'), context);
  await get('create-docs-btn').handlers.click();
  assert.equal(get('docs-auth-link').hidden, false);
  assert.equal(get('create-docs-btn').disabled, false);
  result = { ok: true, url: 'https://docs.google.com/document/d/test-doc/edit' };
  await get('create-docs-btn').handlers.click();
  assert.equal(get('docs-result-link').href, result.url);
  assert.equal(get('docs-result-link').hidden, false);
});
