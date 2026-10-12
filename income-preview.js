(function () {
  'use strict';
  const style = document.createElement('style');
  style.textContent = '.table-wrap tr[data-preview-id]{cursor:pointer}.table-wrap tr[data-preview-id]:hover{background:var(--surface-bg)}.income-preview{position:fixed;inset:0 0 0 auto;width:min(960px,100vw);z-index:101;background:var(--surface-panel-bg);display:flex;flex-direction:column;box-shadow:-12px 0 40px #0003}.income-preview[hidden]{display:none}.income-preview header{padding:16px 20px;border-bottom:1px solid var(--surface-border)}.income-preview header>div{display:flex;align-items:center;justify-content:space-between;gap:12px}.income-preview h2{margin:0;font-size:20px}.income-preview p{font-size:12px;color:var(--surface-text-muted)}.income-preview iframe{flex:1;width:100%;border:0;min-height:0}.income-preview-actions{display:flex;gap:8px}';
  document.head.appendChild(style);
  const backdrop = document.createElement('div');
  backdrop.className = 'income-backdrop';
  backdrop.hidden = true;
  const drawer = document.createElement('section');
  drawer.className = 'income-preview';
  drawer.hidden = true;
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-labelledby', 'income-preview-title');
  drawer.innerHTML = '<header><div><h2 id="income-preview-title">請款單預覽</h2><div class="income-preview-actions"><button type="button" id="income-preview-print" disabled>列印／另存 PDF</button><button type="button" class="drawer-icon-button" id="income-preview-close" aria-label="關閉預覽" title="關閉"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div></div><p id="income-preview-note" role="status"></p></header><iframe title="唯讀請款單文件" sandbox="allow-same-origin allow-modals"></iframe>';
  document.body.append(backdrop, drawer);
  const output = drawer.querySelector('iframe');
  const closeButton = drawer.querySelector('#income-preview-close');
  const printButton = drawer.querySelector('#income-preview-print');
  const note = drawer.querySelector('#income-preview-note');
  const builder = document.createElement('iframe');
  builder.hidden = true;
  builder.title = '請款單文件產生器';
  let readyResolve;
  const ready = new Promise(resolve => { readyResolve = resolve; });
  builder.onload = () => readyResolve();
  builder.src = 'Invoice-Generator.html?incomePreview=1';
  document.body.appendChild(builder);
  let focusReturn, sequence = 0;
  function close() {
    sequence++;
    drawer.hidden = backdrop.hidden = true;
    document.querySelector('.main-panel').inert = false;
    if (focusReturn) focusReturn.focus();
  }
  async function preview(id) {
    const record = records.find(r => r.id === id);
    if (!record) return;
    focusReturn = document.activeElement;
    drawer.hidden = backdrop.hidden = false;
    document.querySelector('.main-panel').inert = true;
    closeButton.focus();
    printButton.disabled = true;
    output.srcdoc = '';
    note.textContent = '載入預覽中…';
    const ticket = ++sequence;
    try {
      await Promise.race([ready, new Promise((_, reject) => setTimeout(() => reject(new Error('載入逾時，請重新開啟預覽')), 15000))]);
      if (ticket !== sequence) return;
      const draft = record.invoiceDraft ? JSON.parse(JSON.stringify(record.invoiceDraft)) : {
        kind: 'dghm-invoice-draft', version: 1,
        fields: { f_company_name: record.client, f_project_name: record.project, f_proj_code: record.projectCode || '', f_inv_no: record.noticeNo || '', f_inv_number: record.invoiceNo || '', f_issue_date: record.date, f_due_date: record.dueDate || '', f_payment_terms: record.paymentTerms || '', f_tax_rate: String(record.taxRate ?? 5), f_tax_on: Number(record.taxRate ?? 5) ? '1' : '0' },
        items: [{name: record.project, desc: record.installment || '', price: String(record.amount)}], terms: []
      };
      // Reset all fields before applying snapshots so defaults cannot leak across previews.
      const win = builder.contentWindow;
      win.FIELD_IDS.forEach(id => { if (!(id in draft.fields)) draft.fields[id] = ''; });
      win.applyDraft(draft);
      output.onload = () => { if (ticket === sequence) printButton.disabled = false; };
      output.srcdoc = win.buildDoc();
      note.textContent = record.invoiceDraft ? '依匯入時保存的請款單內容產生，非原始 PDF；收入登記的後續修改不會更動此文件快照。' : '依登記資料重建，非原始請款單；未保存的明細、備註與版面可能不同。';
    } catch (error) {
      if (ticket === sequence) note.textContent = '預覽失敗：' + error.message;
    }
  }
  closeButton.onclick = close;
  backdrop.onclick = close;
  printButton.onclick = () => { output.contentWindow.focus(); output.contentWindow.print(); };
  drawer.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Tab') {
      const first = printButton.disabled ? closeButton : printButton;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); closeButton.focus(); }
      else if (!e.shiftKey && document.activeElement === closeButton) { e.preventDefault(); first.focus(); }
    }
  });
  const tbody = document.getElementById('list-tbody');
  tbody.addEventListener('click', e => {
    if (e.target.closest('button, a')) return;
    const row = e.target.closest('[data-preview-id]');
    if (row) preview(row.dataset.previewId);
  });
  tbody.addEventListener('keydown', e => {
    if (e.target.matches('[data-preview-id]') && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault(); preview(e.target.dataset.previewId);
    }
  });
})();
