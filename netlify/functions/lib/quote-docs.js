const NAVY = { red: 13 / 255, green: 47 / 255, blue: 110 / 255 };
const ORANGE = { red: 229 / 255, green: 98 / 255, blue: 42 / 255 };
const GRAY = { red: 90 / 255, green: 101 / 255, blue: 128 / 255 };
const WHITE = { red: 1, green: 1, blue: 1 };
const LIGHT = { red: 244 / 255, green: 247 / 255, blue: 251 / 255 };
const pt = (magnitude) => ({ magnitude, unit: 'PT' });
const color = (rgbColor) => ({ color: { rgbColor } });
const text = (value) => String(value ?? '').replace(/[\u0000-\u0008\u000c-\u001f\ue000-\uf8ff]/g, '').trim();
const lines = (value) => text(value).split('\n').map((line) => line.trim()).filter(Boolean);
const money = (amount) => `NT$ ${Math.round(amount).toLocaleString('zh-TW')}`;
const amountText = (value) => {
  const raw = text(value);
  return /^\d+(?:\.\d+)?$/.test(raw) ? money(Number(raw)) : raw;
};
const date = (value) => text(value).replace(/^(\d{4})-(\d{2})-(\d{2})$/, (_, y, m, d) => `${Number(y)} 年 ${Number(m)} 月 ${Number(d)} 日`);
const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

export function validateQuoteDraft(draft) {
  if (!isObject(draft) || draft.kind !== 'dghm-quote-draft' || !isObject(draft.fields)) {
    throw new Error('請提供報價單草稿資料');
  }
  if (Object.values(draft.fields).some((value) => !['string', 'boolean', 'number'].includes(typeof value))) {
    throw new Error('報價欄位格式錯誤');
  }
  for (const [name, nested] of [['sections', 'rows'], ['totals', 'rows'], ['payments', 'cards'], ['sched', null]]) {
    const items = draft[name];
    if (!Array.isArray(items) || items.length > 50 || items.some((item) => !isObject(item))) {
      throw new Error('報價區塊格式錯誤或數量過多');
    }
    for (const item of items) {
      if (nested && (!Array.isArray(item[nested]) || item[nested].length > 100 || item[nested].some((row) => !isObject(row)))) {
        throw new Error('報價表格格式錯誤或列數過多');
      }
      if (name === 'sections' && !['spec', 'price', 'option'].includes(item.type)) {
        throw new Error('報價表格型式錯誤');
      }
      const records = nested ? [item, ...item[nested]] : [item];
      for (const record of records) {
        if (Object.entries(record).some(([key, value]) => key !== nested && !['string', 'number'].includes(typeof value))) {
          throw new Error('報價內容格式錯誤');
        }
      }
    }
  }
  const rate = text(draft.fields.f_tax_rate);
  if (rate && (!Number.isFinite(Number(rate)) || Number(rate) < 0 || Number(rate) > 100)) {
    throw new Error('稅率必須介於 0% 與 100%');
  }
  for (const group of draft.totals) {
    if (group.rows.some((row) => text(row.amount) && !Number.isFinite(Number(row.amount)))) {
      throw new Error('總計金額格式錯誤');
    }
    const sum = group.rows.reduce((value, row) => value + Number(row.amount || 0), 0);
    if (!Number.isFinite(sum + Math.round(sum * (rate === '' ? 5 : Number(rate)) / 100))) {
      throw new Error('總計金額超出可處理範圍');
    }
  }
  return draft;
}

export function buildQuoteModel(draft) {
  validateQuoteDraft(draft);
  const f = draft.fields;
  const blocks = [];
  const paragraph = (value, role = 'body') => {
    for (const line of lines(value)) blocks.push({ type: 'paragraph', text: line, role });
  };
  const table = (rows, widths, options = {}) => {
    blocks.push({ type: 'table', rows: rows.map((row) => row.map(text)), widths, header: true, ...options });
  };
  paragraph('萬能數維有限公司 DGHM', 'brand');
  paragraph('服務報價單', 'title');
  paragraph(f.f_doc_title || f.f_client_name, 'subtitle');
  paragraph(f.f_subtitle, 'note');
  paragraph(`報價單編號：${text(f.f_qt_no) || 'DH-XX-PJX-QT-X'}`, 'note');
  if (text(f.f_proj_code)) paragraph(`專案代碼：${text(f.f_proj_code)}`, 'note');
  paragraph(`報價日期：${date(f.f_issue_date)}　有效期限：${date(f.f_valid_date)}`, 'note');
  if (text(f.f_duration)) paragraph(`預估工期：${text(f.f_duration)}`, 'note');
  table([
    ['客戶方', '服務方'],
    [
      [text(f.f_client_name) || '＿＿＿＿＿＿', text(f.f_client_addr), `統一編號：${text(f.f_client_vat)}`, `聯絡人：${text(f.f_client_contact)}`, `電話 / Email：${text(f.f_client_phone)} / ${text(f.f_client_email)}`].filter(Boolean).join('\n'),
      '萬能數維有限公司\n桃園市楊梅區梅高路 120 巷 33 號\n統一編號：60458287\n聯絡人：謝萬錤 Aries Hsieh\n電話 / Email：0937-805149 / help@dghm.tw',
    ],
  ], [0.5, 0.5]);

  // Keep the editor's page-based ordering, while letting Docs paginate naturally.
  const groups = [];
  const group = (page, write) => groups.push({ page: Math.max(1, Number.parseInt(page, 10) || 1), write });
  draft.sections.forEach((section) => group(section.page, () => {
    const rows = section.rows.filter((row) => ['name', 'spec', 'desc', 'price'].some((key) => text(row[key])));
    if (!text(section.title) && !rows.length) return;
    paragraph(section.title, 'heading');
    paragraph(section.desc, 'note');
    const priceHead = text(section.priceHead) || '費用（未稅）';
    if (rows.length && section.type === 'spec') {
      table([['項目', '規格', '說明'], ...rows.map((r) => [r.name, r.spec, r.desc])], [0.24, 0.24, 0.52]);
    } else if (rows.length && section.type === 'price') {
      table([['項目', '說明', priceHead], ...rows.map((r) => [r.name, r.desc, amountText(r.price)])], [0.24, 0.56, 0.2], { rightColumn: 2 });
    } else if (rows.length) {
      table([['勾選', '方案', '說明', priceHead], ...rows.map((r) => ['☐', r.name, r.desc, amountText(r.price)])], [0.08, 0.24, 0.48, 0.2], { rightColumn: 3 });
    }
    paragraph(section.chip, 'notice');
    for (const line of lines(section.note)) paragraph(`※ ${line.replace(/^※\s*/, '')}`, 'note');
  }));
  const rate = text(f.f_tax_rate) === '' ? 5 : Number(f.f_tax_rate);
  draft.totals.forEach((total) => group(total.page, () => {
    const rows = total.rows.filter((row) => text(row.label) || text(row.amount));
    if (!rows.length) return;
    const sum = rows.reduce((value, row) => value + Number(row.amount || 0), 0);
    const tax = Math.round(sum * rate / 100);
    paragraph('報價總覽', 'heading');
    table([
      ...rows.map((row) => [row.label, money(Number(row.amount || 0))]),
      [`${text(f.f_tax_label) || '營業稅'}（${rate}%）`, money(tax)],
      [text(total.totalLabel) || '總計（含稅）', money(sum + tax)],
    ], [0.7, 0.3], { header: false, totalRow: true, rightColumn: 1 });
  }));
  draft.payments.forEach((payment) => group(payment.page, () => {
    const cards = payment.cards.filter((card) => ['phase', 'amount', 'timing'].some((key) => text(card[key])));
    if (!cards.length && !text(payment.note)) return;
    paragraph(payment.title || '付款條件', 'heading');
    if (cards.length) table([['期別', '金額', '付款時點'], ...cards.map((c) => [c.phase, amountText(c.amount), c.timing])], [0.25, 0.22, 0.53], { rightColumn: 1 });
    paragraph(payment.note, 'note');
  }));
  group(f.f_sched_page, () => {
    const rows = draft.sched.filter((row) => text(row.week) || text(row.desc));
    if (!rows.length) return;
    paragraph(f.f_sched_title || '預估時程', 'heading');
    const content = [['週次／階段', '工作內容'], ...rows.map((row) => [row.week, row.desc])];
    if (text(f.f_sched_total)) content.push(['合計', f.f_sched_total]);
    table(content, [0.2, 0.8], { totalRow: !!text(f.f_sched_total) });
    paragraph(f.f_sched_risk, 'notice');
  });
  group(f.f_excl_page, () => {
    if (!lines(f.f_excl_items).length) return;
    paragraph('不含項目', 'heading');
    paragraph(f.f_excl_intro, 'note');
    for (const line of lines(f.f_excl_items)) paragraph(line.replace(/^[·•]\s*/, ''), 'bullet');
  });
  group(f.f_coop_page, () => {
    if (!text(f.f_coop_items) && !text(f.f_coop_note)) return;
    paragraph('請客戶配合事項', 'heading');
    for (const line of lines(f.f_coop_items)) paragraph(line.replace(/^[·•]\s*/, ''), 'bullet');
    paragraph(f.f_coop_note, 'note');
  });
  group(f.f_sig_page, () => {
    if (!f.f_sig_on) return;
    paragraph('確認簽署', 'heading');
    paragraph(f.f_sig_desc, 'note');
    table([['甲方', '乙方'], [text(f.f_client_name) || '＿＿＿＿＿＿', '萬能數維有限公司'], ['授權代表簽名：\n\n日期：', '授權代表簽名：\n\n日期：']], [0.5, 0.5]);
  });
  group(f.f_validity_page, () => {
    if (f.f_validity_on && text(f.f_valid_date)) paragraph(`本報價單有效期至 ${date(f.f_valid_date)}${text(f.f_validity_tail) || '，逾期請重新詢價。'}`, 'notice');
  });
  groups.sort((a, b) => a.page - b.page).forEach(({ write }) => write());
  paragraph('本文件由萬能數維有限公司出具，未經授權不得轉作其他用途', 'note');
  const cells = blocks.filter((b) => b.type === 'table').reduce((n, b) => n + b.rows.length * b.widths.length, 0);
  if (cells > 1000 || blocks.length > 400 || JSON.stringify(blocks).length > 200000) {
    throw new Error('報價內容過多，請拆成較小的文件後建立 Google 文件');
  }
  return { title: [text(f.f_qt_no), text(f.f_client_name), '服務報價單'].filter(Boolean).join(' ').slice(0, 250), blocks };
}

export function buildSkeletonRequests(model) {
  // Inserting at index 1 in reverse order avoids predicting table index lengths.
  return [...model.blocks].reverse().map((block) => block.type === 'table'
    ? { insertTable: { rows: block.rows.length, columns: block.widths.length, location: { index: 1 } } }
    : { insertText: { text: `${block.text}\n`, location: { index: 1 } } });
}

function contentOf(document) {
  return document.body?.content || document.tabs?.[0]?.documentTab?.body?.content || [];
}

function matchTables(model, document) {
  const tables = contentOf(document).filter((element) => element.table);
  const specs = model.blocks.filter((block) => block.type === 'table');
  if (tables.length !== specs.length) throw new Error('Google 文件表格結構不符，請重新建立');
  return tables.map((element, i) => {
    if (element.table.tableRows.length !== specs[i].rows.length || element.table.tableRows.some((r) => r.tableCells.length !== specs[i].widths.length)) {
      throw new Error('Google 文件表格欄位不符，請重新建立');
    }
    return { element, spec: specs[i] };
  });
}

export function buildCellRequests(model, document) {
  const requests = [];
  for (const { element, spec } of matchTables(model, document)) {
    element.table.tableRows.forEach((row, r) => row.tableCells.forEach((cell, c) => {
      const value = spec.rows[r][c];
      if (value) requests.push({ insertText: { text: value, location: { index: cell.content.find((p) => p.paragraph).startIndex } } });
    }));
  }
  return requests.sort((a, b) => b.insertText.location.index - a.insertText.location.index);
}

function styleText(range, textStyle) {
  return { updateTextStyle: { range, textStyle, fields: Object.keys(textStyle).join(',') } };
}
function styleParagraph(range, paragraphStyle) {
  return { updateParagraphStyle: { range, paragraphStyle, fields: Object.keys(paragraphStyle).join(',') } };
}

export function buildStyleRequests(model, document) {
  const requests = [
    { updateDocumentStyle: { documentStyle: { documentFormat: { documentMode: 'PAGES' }, pageSize: { width: pt(595.28), height: pt(841.89) }, marginTop: pt(40), marginBottom: pt(40), marginLeft: pt(40), marginRight: pt(40) }, fields: 'documentFormat,pageSize,marginTop,marginBottom,marginLeft,marginRight' } },
    styleText({ startIndex: 1, endIndex: contentOf(document).at(-1).endIndex - 1 }, { weightedFontFamily: { fontFamily: 'Noto Sans TC' }, fontSize: pt(10), foregroundColor: color(GRAY), bold: false }),
    styleParagraph({ startIndex: 1, endIndex: contentOf(document).at(-1).endIndex - 1 }, { lineSpacing: 135, spaceAbove: pt(0), spaceBelow: pt(5) }),
  ];
  const paragraphs = contentOf(document).filter((element) => element.paragraph && element.paragraph.elements.some((e) => e.textRun?.content.trim()));
  const specs = model.blocks.filter((block) => block.type === 'paragraph');
  if (paragraphs.length !== specs.length) throw new Error('Google 文件段落結構不符，請重新建立');
  paragraphs.forEach((element, i) => {
    const role = specs[i].role;
    const range = { startIndex: element.startIndex, endIndex: element.endIndex - 1 };
    if (role === 'title' || role === 'subtitle' || role === 'brand' || role === 'heading') {
      requests.push(styleParagraph(range, { keepWithNext: true, spaceAbove: pt(role === 'heading' ? 12 : 3), spaceBelow: pt(6), namedStyleType: role === 'heading' ? 'HEADING_1' : 'NORMAL_TEXT' }));
      requests.push(styleText(range, { bold: true, foregroundColor: color(role === 'heading' ? ORANGE : NAVY), fontSize: pt(role === 'title' ? 22 : role === 'subtitle' ? 15 : 11) }));
    } else if (role === 'note') {
      requests.push(styleText(range, { fontSize: pt(9) }));
    } else if (role === 'notice') {
      requests.push(styleText(range, { foregroundColor: color(ORANGE), fontSize: pt(9) }));
    } else if (role === 'bullet') {
      requests.push({ createParagraphBullets: { range, bulletPreset: 'BULLET_DISC_CIRCLE_SQUARE' } });
    }
  });
  for (const { element, spec } of matchTables(model, document)) {
    const location = { index: element.startIndex };
    const cellStyle = { paddingTop: pt(6), paddingBottom: pt(6), paddingLeft: pt(7), paddingRight: pt(7) };
    requests.push({ updateTableCellStyle: { tableStartLocation: location, tableCellStyle: cellStyle, fields: Object.keys(cellStyle).join(',') } });
    spec.widths.forEach((width, c) => requests.push({ updateTableColumnProperties: { tableStartLocation: location, columnIndices: [c], tableColumnProperties: { widthType: 'FIXED_WIDTH', width: pt(515.28 * width) }, fields: 'widthType,width' } }));
    if (spec.header) requests.push({ pinTableHeaderRows: { tableStartLocation: location, pinnedHeaderRowsCount: 1 } });
    element.table.tableRows.forEach((row, r) => {
      const highlight = (spec.header && r === 0) || (spec.totalRow && r === spec.rows.length - 1);
      requests.push({ updateTableCellStyle: {
        tableRange: { tableCellLocation: { tableStartLocation: location, rowIndex: r, columnIndex: 0 }, rowSpan: 1, columnSpan: spec.widths.length },
        tableCellStyle: { backgroundColor: color(highlight ? NAVY : r % 2 ? LIGHT : WHITE) }, fields: 'backgroundColor',
      } });
      row.tableCells.forEach((cell, c) => {
        for (const p of cell.content.filter((part) => part.paragraph)) {
          const range = { startIndex: p.startIndex, endIndex: p.endIndex };
          requests.push(styleText(range, { foregroundColor: color(highlight ? WHITE : GRAY), bold: highlight }));
          requests.push(styleParagraph(range, { spaceAbove: pt(0), spaceBelow: pt(2), lineSpacing: 130, alignment: c === spec.rightColumn ? 'END' : 'START' }));
        }
      });
    });
  }
  return requests;
}

export async function populateQuoteDocument(model, documentId, call) {
  const path = `/documents/${documentId}`;
  async function batch(requests) {
    for (let i = 0; i < requests.length; i += 150) {
      await call(`${path}:batchUpdate`, { method: 'POST', body: JSON.stringify({ requests: requests.slice(i, i + 150) }) });
    }
  }
  await batch(buildSkeletonRequests(model));
  const skeleton = await call(path);
  await batch(buildCellRequests(model, skeleton));
  const filled = await call(path);
  await batch(buildStyleRequests(model, filled));
}
