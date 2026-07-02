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
