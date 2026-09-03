/* ============================================================
   DGHM Agent Tools — Shared UI Utilities
   ============================================================ */

/**
 * Initialise the #theme-toggle button with persistent dark/light mode.
 * @param {string} storageKey - localStorage key unique to each tool,
 *   e.g. 'dghm-income-tracker-theme'
 */
function initTheme(storageKey) {
  var root = document.documentElement;
  var btn  = document.getElementById('theme-toggle');
  if (!btn) return;

  var saved;
  try { saved = localStorage.getItem(storageKey); } catch (e) {}

  if (saved === 'dark') {
    root.setAttribute('data-theme', 'dark');
    btn.textContent = '☀️';
  } else {
    btn.textContent = '🌙';
  }

  btn.addEventListener('click', function () {
    var isDark = root.getAttribute('data-theme') === 'dark';
    if (isDark) {
      root.removeAttribute('data-theme');
      btn.textContent = '🌙';
      try { localStorage.setItem(storageKey, 'light'); } catch (e) {}
    } else {
      root.setAttribute('data-theme', 'dark');
      btn.textContent = '☀️';
      try { localStorage.setItem(storageKey, 'dark'); } catch (e) {}
    }
  });
}

/**
 * Drag handle between a fixed-width editor column and a flexible preview pane.
 * Stores the editor base width in localStorage.
 */
function initColumnResize(options) {
  var page = document.querySelector(options.page);
  var editor = document.querySelector(options.editor);
  var handle = document.querySelector(options.handle);
  if (!page || !editor || !handle) return;

  var storageKey = options.storageKey;
  var minEditor = options.minEditor || 360;
  var minPreview = options.minPreview || 280;

  function applyBase(width) {
    page.style.setProperty('--editor-col-width', Math.round(width) + 'px');
  }

  var saved;
  try { saved = parseInt(localStorage.getItem(storageKey), 10); } catch (e) {}
  if (saved >= minEditor) applyBase(saved);

  handle.addEventListener('pointerdown', function (event) {
    if (event.button !== 0) return;
    event.preventDefault();
    handle.classList.add('is-dragging');
    document.body.classList.add('is-col-resizing');
    var startX = event.clientX;
    var startWidth = editor.getBoundingClientRect().width;

    function onMove(moveEvent) {
      // 側欄收合後多出來的寬度直接留給預覽區，編輯欄維持設定寬度，
      // 因此不再需要針對收合狀態做補償計算。
      var pageWidth = page.getBoundingClientRect().width;
      var handleWidth = handle.getBoundingClientRect().width;
      var maxWidth = pageWidth - minPreview - handleWidth;
      var next = startWidth + (moveEvent.clientX - startX);
      applyBase(Math.max(minEditor, Math.min(maxWidth, next)));
    }

    function onUp() {
      handle.classList.remove('is-dragging');
      document.body.classList.remove('is-col-resizing');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      try {
        var current = parseInt(getComputedStyle(page).getPropertyValue('--editor-col-width'), 10);
        if (current >= minEditor) localStorage.setItem(storageKey, String(current));
      } catch (err) {}
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });
}


/* ============================================================
   草稿 JSON 的格式辨識

   各工具的草稿都帶有 kind 標記（dghm-quote-draft / dghm-invoice-draft
   / dghm-contract-draft）。載入前先驗，避免把報價草稿餵給請款單這類
   「不會報錯、但欄位全空」的情況。

   舊版草稿沒有 kind，改以結構特徵判斷，維持可載入。
   ============================================================ */
var DGHM_DRAFT_LABELS = {
  'dghm-quote-draft': '報價單草稿',
  'dghm-invoice-draft': '請款單草稿',
  'dghm-contract-draft': '合約草稿',
  'dghm-quote-to-invoice': '報價單交接資料'
};

/**
 * 檢查草稿是否屬於預期的工具。
 * @param {*} draft 解析後的 JSON
 * @param {string} expected 預期的 kind，例如 'dghm-invoice-draft'
 * @param {function(object):boolean} [looksRight] 舊版草稿（無 kind）的結構判斷
 * @returns {{ok: boolean, reason: string}}
 */
function checkDraftKind(draft, expected, looksRight) {
  if (!draft || typeof draft !== 'object' || Array.isArray(draft)) {
    return { ok: false, reason: '這不是有效的草稿檔案。' };
  }

  var kind = draft.kind;

  if (kind === expected) return { ok: true, reason: '' };

  if (typeof kind === 'string' && kind) {
    var name = DGHM_DRAFT_LABELS[kind] || ('「' + kind + '」');
    var want = DGHM_DRAFT_LABELS[expected] || expected;
    return { ok: false, reason: '這是' + name + '，不是' + want + '，無法在這裡載入。' };
  }

  // 沒有 kind：可能是加上標記之前存的舊草稿
  if (typeof looksRight === 'function' && looksRight(draft)) {
    return { ok: true, reason: '' };
  }
  return { ok: false, reason: '無法辨識這個草稿的格式，請確認選到正確的檔案。' };
}
