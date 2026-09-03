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
