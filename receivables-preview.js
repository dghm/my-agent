(function () {
  'use strict';
  var key = 'dghm-receivables-preview-v1';
  var records = [];
  try { records = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) {}
  try { validateRecords(records); } catch (_) { records = []; alert('本機追蹤資料格式異常，請載入有效備份。'); }
  var workspace = document.getElementById('tool-workspace');
  var host = document.createElement('div');
  host.style.cssText = 'display:flex;flex-direction:column;width:100%;height:100%;min-height:0';
  workspace.parentNode.insertBefore(host, workspace);
  var nav = document.createElement('div');
  nav.style.cssText = 'display:flex;gap:8px;padding:10px 20px;border-bottom:1px solid var(--surface-border)';
  nav.innerHTML = '<button type="button" data-view="editor">開立通知</button><button type="button" data-view="tracking">收款追蹤（試用）</button><button type="button" id="ar-save">儲存目前通知為草稿</button>';
  host.appendChild(nav);
  host.appendChild(workspace);
  var panel = document.createElement('section');
  panel.style.cssText = 'display:none;overflow:auto;padding:20px;flex:1;min-height:0';
  panel.innerHTML = '<h2>收款追蹤</h2><p>試用資料只保存在這台瀏覽器，不會寫入收入登記。請下載備份；清除瀏覽器資料會移除紀錄。</p><div id="ar-summary"></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin:16px 0"><input id="ar-search" placeholder="搜尋客戶、案件、單號" aria-label="搜尋"><select id="ar-filter" aria-label="狀態"><option value="open">未收清</option><option value="all">全部</option><option value="draft">草稿</option><option value="overdue">逾期</option><option value="paid">已收清</option></select><button id="ar-history" type="button">歷史補登</button><button id="ar-export" type="button">下載追蹤 JSON</button><button id="ar-import" type="button">載入追蹤 JSON</button><input id="ar-file" type="file" accept=".json" hidden></div><div style="overflow:auto"><table style="width:100%;border-collapse:collapse"><thead><tr><th>客戶／案件</th><th>單號／来源</th><th>到期日</th><th>應收</th><th>已收</th><th>未收</th><th>狀態</th><th>操作</th></tr></thead><tbody id="ar-rows"></tbody></table></div><div id="ar-detail" style="margin-top:20px"></div>';
  host.appendChild(panel);
  function el(id) { return document.getElementById(id); }
  function escape(value) { return String(value || '').replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
  function paid(r) { return r.payments.reduce(function (sum,p) { return sum + p.amount; },0); }
  function status(r) { if (!r.sent) return '草稿'; if (paid(r) >= r.amount) return '已收清'; if (r.due && r.due < today()) return '逾期'; return paid(r) ? '部分收款' : '待收'; }
  function money(n) { return 'NT$ ' + n.toLocaleString('zh-TW'); }
  function save(next) { try { localStorage.setItem(key, JSON.stringify(next)); records = next; render(); return true; } catch (_) { alert('儲存失敗，請先下載備份。'); return false; } }
  function show(tracking) { workspace.style.display = tracking ? 'none' : ''; panel.style.display = tracking ? 'block' : 'none'; render(); }
  nav.querySelectorAll('[data-view]').forEach(function (b) { b.onclick = function () { show(b.dataset.view === 'tracking'); }; });
  function render() {
    var sent = records.filter(function(r) { return r.sent; });
    var outstanding = sent.reduce(function(s,r) { return s + Math.max(0,r.amount-paid(r)); },0);
    var overdue = sent.filter(function(r) { return status(r)==='逾期'; }).reduce(function(s,r) { return s+r.amount-paid(r); },0);
    el('ar-summary').textContent = '待收：' + money(outstanding) + '　逾期：' + money(overdue) + '　未收清：' + sent.filter(function(r) { return paid(r)<r.amount; }).length + ' 張';
    var query = el('ar-search').value.toLowerCase(), filter = el('ar-filter').value;
    var list = records.filter(function(r) {
      var st = status(r);
      return (r.client+' '+r.project+' '+r.number).toLowerCase().includes(query) && (filter==='all' || filter==='open' && r.sent && paid(r)<r.amount || filter==='draft' && !r.sent || filter==='overdue' && st==='逾期' || filter==='paid' && st==='已收清');
    }).sort(function(a,b) { return (status(a)==='逾期' ? 0 : 1)-(status(b)==='逾期' ? 0 : 1) || (a.due||'9999').localeCompare(b.due||'9999'); });
    el('ar-rows').innerHTML = list.map(function(r) { return '<tr><td>'+escape(r.client)+'<br>'+escape(r.project)+'</td><td>'+escape(r.number)+'<br>'+escape(r.source)+'</td><td>'+escape(r.due || '未指定')+'</td><td>'+money(r.amount)+'</td><td>'+money(paid(r))+'</td><td>'+money(Math.max(0,r.amount-paid(r)))+'</td><td>'+status(r)+'</td><td><button type="button" data-id="'+escape(r.id)+'">查看／登記收款</button></td></tr>'; }).join('') || '<tr><td colspan="8">目前沒有符合條件的紀錄。可先儲存通知草稿，或補登歷史帳目。</td></tr>';
    panel.querySelectorAll('td,th').forEach(function(cell) { cell.style.cssText='padding:10px;text-align:left;border-bottom:1px solid var(--surface-border)'; });
  }
  el('ar-search').oninput = render; el('ar-filter').onchange = render;
  el('ar-save').onclick = function () {
    var draft = collectDraft(), f = draft.fields;
    var subtotal = Array.from(document.querySelectorAll('#items-tbody tr')).reduce(function(s,tr) { return s+(parseFloat(tr.querySelectorAll('input,textarea')[2].value)||0); },0);
    var amount = subtotal + calcTaxAmount(subtotal);
    if (!f.f_company_name || !f.f_inv_no || !Number.isFinite(amount) || amount<=0) { alert('請先填客戶、請款單號及有效金額。'); return; }
    var old = records.find(function(r) { return r.number===f.f_inv_no; });
    if (old && old.sent) { alert('這張單已發送，不能用草稿覆寫。'); return; }
    if (old && !confirm('更新同單號的草稿？')) return;
    var record = {id:old ? old.id : crypto.randomUUID(),number:f.f_inv_no,client:f.f_company_name,project:f.f_project_name || '',due:f.f_due_date || '',amount:amount,sent:'',source:'通知單',payments:[],draft:draft};
    if(save(records.filter(function(r) { return r.id!==record.id; }).concat(record))) { el('ar-filter').value='draft'; show(true); }
  };
  el('ar-history').onclick = function () {
    var client = prompt('客戶名稱'); if (!client) return;
    var project = prompt('案件名稱（可留白）'); if(project===null) return;
    var raw = prompt('應收總額（含稅）'); if(raw===null) return;
    var amount = Number(raw); if(!Number.isFinite(amount)||amount<=0) { alert('請填正確金額'); return; }
    var due = prompt('到期日 YYYY-MM-DD，不確定可留白',''); if(due===null) return;
    if(due && !validDate(due)) { alert('日期格式不正確'); return; }
    save(records.concat({id:crypto.randomUUID(),number:'歷史-'+Date.now(),client:client,project:project,due:due,amount:amount,sent:today(),source:'歷史補登',payments:[]}));
  };
  function validDate(d) { return /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(Date.parse(d)) && new Date(d).toISOString().slice(0,10)===d; }
  function validateRecords(rows) {
    if (!Array.isArray(rows)) throw Error();
    var ids = new Set();
    rows.forEach(function(r) {
      if (!r || typeof r.id !== 'string' || !r.id || ids.has(r.id) || !['client','number','project','source','due','sent'].every(function(k) { return typeof r[k] === 'string'; }) || r.due && !validDate(r.due) || r.sent && !validDate(r.sent) || !Number.isFinite(r.amount) || r.amount <= 0 || !Array.isArray(r.payments)) throw Error();
      ids.add(r.id);
      r.payments.forEach(function(p) { if (!p || !Number.isFinite(p.amount) || p.amount <= 0 || typeof p.date !== 'string' || p.date && !validDate(p.date)) throw Error(); });
      if (paid(r) > r.amount || !r.sent && r.payments.length) throw Error();
      if (r.draft && (r.draft.kind !== 'dghm-invoice-draft' || r.draft.version !== 1 || !r.draft.fields || !Array.isArray(r.draft.items) || !r.draft.items.every(function(i) { return i && ['name','desc','price'].every(function(k) { return typeof i[k] === 'string'; }); }) || !Array.isArray(r.draft.terms) || !r.draft.terms.every(function(t) { return typeof t === 'string'; }))) throw Error();
    });
  }
  el('ar-rows').onclick = function(e) {
    var button=e.target.closest('[data-id]'); if(!button) return;
    var r=records.find(function(row) { return row.id===button.dataset.id; }); if(!r) return;
    var detail=el('ar-detail');
    detail.innerHTML='<h3>'+escape(r.client)+'／'+escape(r.number)+'</h3><p>'+status(r)+' · 未收 '+money(Math.max(0,r.amount-paid(r)))+'</p>'+r.payments.map(function(p) { return '<p>'+escape(p.date||'日期未詳')+'　'+money(p.amount)+'</p>'; }).join('')+'<button id="ar-payment">登記收款</button> <button id="ar-sent">確認已發送</button> <button id="ar-reopen">開啟通知草稿</button>';
    el('ar-reopen').disabled=!r.draft; el('ar-sent').disabled=!!r.sent; el('ar-payment').disabled=!r.sent || paid(r)>=r.amount;
    el('ar-reopen').onclick=function() { applyDraft(r.draft); show(false); };
    el('ar-sent').onclick=function() { var date=prompt('實際發送日期 YYYY-MM-DD',today()); if(date===null) return; if(!validDate(date)) { alert('日期格式不正確'); return; } if(save(records.map(function(row) { return row.id===r.id ? Object.assign({},row,{sent:date}) : row; }))) detail.innerHTML=''; };
    el('ar-payment').onclick=function() {
      var raw=prompt('本次收到金額'); if(raw===null) return;
      var amount=Number(raw); if(!Number.isFinite(amount)||amount<=0||amount>r.amount-paid(r)) { alert('金額須大於零且不超過未收餘額'); return; }
      var date=prompt('收款日期 YYYY-MM-DD；歷史資料不確定可留白',today()); if(date===null) return;
      if(date && !validDate(date)) { alert('日期格式不正確'); return; }
      if(save(records.map(function(row) { return row.id===r.id ? Object.assign({},row,{payments:row.payments.concat({amount:amount,date:date})}) : row; }))) detail.innerHTML='';
    };
  };
  el('ar-export').onclick=function() { var url=URL.createObjectURL(new Blob([JSON.stringify({kind:'dghm-receivables-preview',version:1,records:records},null,2)],{type:'application/json'})); var a=document.createElement('a'); a.href=url;a.download='收款追蹤-'+today()+'.json';a.click();setTimeout(function(){URL.revokeObjectURL(url);},1000); };
  el('ar-import').onclick=function(){el('ar-file').click();};
  el('ar-file').onchange=async function(e) {
    var file=e.target.files[0]; e.target.value=''; if(!file) return;
    try {
      var data=JSON.parse(await file.text());
      if(data.kind!=='dghm-receivables-preview'||data.version!==1||!Array.isArray(data.records)) throw Error();
      validateRecords(data.records);
      if(confirm('以備份取代目前試用紀錄？')) { save(data.records);el('ar-detail').innerHTML=''; }
    } catch(_) { alert('追蹤備份格式錯誤，未變更目前資料'); }
  };
  render();
})();
