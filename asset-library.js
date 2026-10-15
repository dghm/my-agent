(function () {
  'use strict';

  var state = {
    assets: [],
    stats: null,
    category: '',
    source: '',
    format: '',
    query: '',
    sort: 'name',
    compact: false,
    limit: 120,
  };

  var els = {
    gate: document.getElementById('asset-gate'),
    gateTitle: document.getElementById('asset-gate-title'),
    gateMessage: document.getElementById('asset-gate-message'),
    authorize: document.getElementById('asset-authorize'),
    browser: document.getElementById('asset-browser'),
    refresh: document.getElementById('asset-refresh'),
    syncState: document.getElementById('asset-sync-state'),
    search: document.getElementById('asset-search'),
    format: document.getElementById('asset-format'),
    sort: document.getElementById('asset-sort'),
    source: document.getElementById('asset-source'),
    categories: document.getElementById('asset-categories'),
    clearFilters: document.getElementById('asset-clear-filters'),
    resultTitle: document.getElementById('asset-results-title'),
    resultCount: document.getElementById('asset-result-count'),
    grid: document.getElementById('asset-grid'),
    loading: document.getElementById('asset-loading'),
    empty: document.getElementById('asset-empty'),
    density: document.getElementById('asset-density'),
    loadMore: document.getElementById('asset-load-more'),
    count: document.getElementById('asset-count'),
    fileCount: document.getElementById('asset-file-count'),
    categoryCount: document.getElementById('asset-category-count'),
    updated: document.getElementById('asset-updated'),
    dialog: document.getElementById('asset-dialog'),
    dialogClose: document.getElementById('asset-dialog-close'),
    dialogPreview: document.getElementById('asset-dialog-preview'),
    dialogCategory: document.getElementById('asset-dialog-category'),
    dialogTitle: document.getElementById('asset-dialog-title'),
    dialogPath: document.getElementById('asset-dialog-path'),
    dialogStock: document.getElementById('asset-dialog-stock'),
    dialogSize: document.getElementById('asset-dialog-size'),
    dialogVariants: document.getElementById('asset-dialog-variants'),
  };

  function formatNumber(value) {
    return new Intl.NumberFormat('zh-TW').format(Number(value || 0));
  }

  function formatBytes(value) {
    var size = Number(value || 0);
    if (!size) return '—';
    var units = ['B', 'KB', 'MB', 'GB'];
    var index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
    var amount = size / Math.pow(1024, index);
    return (index === 0 ? Math.round(amount) : amount.toFixed(amount >= 10 ? 1 : 2)) + ' ' + units[index];
  }

  function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function showGate(title, message, authorizeUrl) {
    els.browser.hidden = true;
    els.gate.hidden = false;
    els.gateTitle.textContent = title;
    els.gateMessage.textContent = message;
    els.authorize.href = authorizeUrl || '/api/auth/login/google?grant=assets';
    els.authorize.hidden = !authorizeUrl;
    els.syncState.textContent = '需要授權';
  }

  async function fetchJson(url) {
    var response = await fetch(url, { headers: { Accept: 'application/json' } });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      var error = new Error(data.error || '讀取失敗');
      error.data = data;
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function fillFilters() {
    var formats = new Set();
    var sources = new Set();
    els.format.length = 1;
    els.source.length = 1;
    state.assets.forEach(function (asset) {
      asset.formats.forEach(function (format) { formats.add(format); });
      sources.add(asset.sourceCategory);
    });

    Array.from(formats).sort().forEach(function (format) {
      var option = document.createElement('option');
      option.value = format;
      option.textContent = format.toUpperCase();
      els.format.appendChild(option);
    });
    Array.from(sources).sort(function (a, b) { return a.localeCompare(b, 'zh-Hant'); }).forEach(function (source) {
      var option = document.createElement('option');
      option.value = source;
      option.textContent = source;
      els.source.appendChild(option);
    });

    renderCategories();
  }

  function renderCategories() {
    clearNode(els.categories);
    var counts = state.stats && state.stats.categories ? state.stats.categories : {};
    var rows = [['', '全部素材', state.assets.length]].concat(
      Object.keys(counts)
        .sort(function (a, b) { return a.localeCompare(b, 'zh-Hant'); })
        .map(function (name) { return [name, name, counts[name]]; })
    );
    rows.forEach(function (row) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'asset-category-button' + (state.category === row[0] ? ' is-active' : '');
      button.dataset.category = row[0];
      var label = document.createElement('span');
      label.textContent = row[1];
      var count = document.createElement('span');
      count.textContent = formatNumber(row[2]);
      button.append(label, count);
      els.categories.appendChild(button);
    });
  }

  function filteredAssets() {
    var query = state.query.trim().toLocaleLowerCase('zh-Hant');
    var result = state.assets.filter(function (asset) {
      if (state.category && asset.category !== state.category) return false;
      if (state.source && asset.sourceCategory !== state.source) return false;
      if (state.format && asset.formats.indexOf(state.format) === -1) return false;
      return !query || asset.searchText.indexOf(query) !== -1;
    });

    result.sort(function (a, b) {
      if (state.sort === 'size') return b.totalSize - a.totalSize;
      if (state.sort === 'modified') {
        var aTime = Math.max.apply(null, a.variants.map(function (item) { return Date.parse(item.modifiedTime) || 0; }));
        var bTime = Math.max.apply(null, b.variants.map(function (item) { return Date.parse(item.modifiedTime) || 0; }));
        return bTime - aTime;
      }
      return a.title.localeCompare(b.title, 'zh-Hant', { numeric: true });
    });
    return result;
  }

  function createCard(asset) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'asset-card';
    button.dataset.assetId = asset.id;

    var thumb = document.createElement('span');
    thumb.className = 'asset-thumb';
    if (asset.preview && asset.preview.thumbnailLink) {
      var image = document.createElement('img');
      image.src = asset.preview.thumbnailLink;
      image.alt = '';
      image.loading = 'lazy';
      image.referrerPolicy = 'no-referrer';
      image.addEventListener('error', function () {
        image.remove();
        var fallback = document.createElement('span');
        fallback.className = 'asset-thumb-fallback';
        fallback.textContent = asset.formats.join(' · ').toUpperCase();
        thumb.insertBefore(fallback, thumb.firstChild);
      }, { once: true });
      thumb.appendChild(image);
    } else {
      var fallback = document.createElement('span');
      fallback.className = 'asset-thumb-fallback';
      fallback.textContent = asset.formats.join(' · ').toUpperCase();
      thumb.appendChild(fallback);
    }
    var badge = document.createElement('span');
    badge.className = 'asset-thumb-badge';
    badge.textContent = asset.formats.join(' · ');
    thumb.appendChild(badge);

    var body = document.createElement('span');
    body.className = 'asset-card-body';
    var title = document.createElement('span');
    title.className = 'asset-card-title';
    title.textContent = asset.title;
    title.title = asset.title;
    var meta = document.createElement('span');
    meta.className = 'asset-card-meta';
    var source = document.createElement('span');
    source.textContent = asset.sourceCategory;
    var size = document.createElement('span');
    size.textContent = formatBytes(asset.totalSize);
    meta.append(source, size);
    body.append(title, meta);
    button.append(thumb, body);
    return button;
  }

  function render() {
    var assets = filteredAssets();
    var visibleAssets = assets.slice(0, state.limit);
    clearNode(els.grid);
    els.grid.classList.toggle('is-compact', state.compact);
    els.resultTitle.textContent = state.category || '全部素材';
    els.resultCount.textContent = '顯示 ' + formatNumber(assets.length) + '／' + formatNumber(state.assets.length) + ' 組素材';
    visibleAssets.forEach(function (asset) { els.grid.appendChild(createCard(asset)); });
    els.loadMore.hidden = visibleAssets.length >= assets.length;
    if (!els.loadMore.hidden) {
      els.loadMore.textContent = '載入更多素材（尚有 ' + formatNumber(assets.length - visibleAssets.length) + ' 組）';
    }
    els.empty.hidden = assets.length > 0;
    renderCategories();
  }

  function openAsset(asset) {
    clearNode(els.dialogPreview);
    if (asset.preview && asset.preview.thumbnailLink) {
      var image = document.createElement('img');
      image.src = asset.preview.thumbnailLink;
      image.alt = asset.title + ' 預覽';
      image.referrerPolicy = 'no-referrer';
      els.dialogPreview.appendChild(image);
    } else {
      var noPreview = document.createElement('span');
      noPreview.textContent = '此格式沒有可用預覽';
      els.dialogPreview.appendChild(noPreview);
    }

    els.dialogCategory.textContent = asset.category + ' · ' + asset.sourceCategory;
    els.dialogTitle.textContent = asset.title;
    els.dialogPath.textContent = asset.path;
    els.dialogStock.textContent = asset.stockId || '—';
    els.dialogSize.textContent = formatBytes(asset.totalSize);
    clearNode(els.dialogVariants);

    asset.variants.forEach(function (variant) {
      var row = document.createElement('div');
      row.className = 'asset-variant';
      var format = document.createElement('span');
      format.className = 'asset-format-pill';
      format.textContent = variant.extension || 'file';
      var name = document.createElement('span');
      name.className = 'asset-variant-name';
      name.textContent = variant.name;
      name.title = variant.name;
      var size = document.createElement('span');
      size.className = 'asset-variant-size';
      size.textContent = formatBytes(variant.size);
      var open = document.createElement('a');
      open.href = variant.webViewLink;
      open.target = '_blank';
      open.rel = 'noopener';
      open.textContent = 'Drive ↗';
      var download = document.createElement('a');
      download.href = '/api/assets/download?id=' + encodeURIComponent(variant.id);
      download.textContent = '下載';
      row.append(format, name, size, open, download);
      els.dialogVariants.appendChild(row);
    });

    els.dialog.showModal();
  }

  async function loadIndex(refresh) {
    els.browser.hidden = false;
    els.gate.hidden = true;
    els.loading.hidden = false;
    els.grid.hidden = true;
    els.empty.hidden = true;
    els.refresh.disabled = true;
    els.syncState.textContent = refresh ? '正在重新同步…' : '正在讀取…';
    try {
      var data = await fetchJson('/api/assets/index' + (refresh ? '?refresh=1' : ''));
      state.assets = data.assets || [];
      state.stats = data.stats || {};
      els.count.textContent = formatNumber(state.stats.assets);
      els.fileCount.textContent = formatNumber(state.stats.files);
      els.categoryCount.textContent = formatNumber(Object.keys(state.stats.categories || {}).length);
      els.updated.textContent = data.generatedAt
        ? new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(data.generatedAt))
        : '—';
      els.syncState.textContent = data.cached ? '使用快取索引' : '已同步 Google Drive';
      els.refresh.hidden = false;
      fillFilters();
      render();
    } catch (error) {
      var info = error.data || {};
      showGate(
        info.code === 'root_access_denied' ? '無法讀取素材資料夾' : '素材索引建立失敗',
        error.message,
        info.authorizeUrl || ''
      );
    } finally {
      els.loading.hidden = true;
      els.grid.hidden = false;
      els.refresh.disabled = false;
    }
  }

  async function start() {
    var params = new URLSearchParams(location.search);
    if (params.has('driveAuth')) history.replaceState(null, '', location.pathname);
    try {
      var status = await fetchJson('/api/assets/status');
      els.syncState.textContent = '已連接 ' + (status.root && status.root.name ? status.root.name : 'Google Drive');
      await loadIndex(false);
    } catch (error) {
      var info = error.data || {};
      if (info.code === 'unauthenticated') {
        showGate('請先登入 my-agent', '登入公司帳號後，才能連接內部 Google Drive 素材庫。', '/login.html');
      } else {
        showGate('連接 Google Drive 素材庫', info.error || error.message, info.authorizeUrl || '/api/auth/login/google?grant=assets');
      }
    }
  }

  els.search.addEventListener('input', function () { state.query = els.search.value; state.limit = 120; render(); });
  els.format.addEventListener('change', function () { state.format = els.format.value; state.limit = 120; render(); });
  els.source.addEventListener('change', function () { state.source = els.source.value; state.limit = 120; render(); });
  els.sort.addEventListener('change', function () { state.sort = els.sort.value; state.limit = 120; render(); });
  els.categories.addEventListener('click', function (event) {
    var button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    state.limit = 120;
    render();
  });
  els.clearFilters.addEventListener('click', function () {
    state.category = '';
    state.source = '';
    state.format = '';
    state.query = '';
    state.limit = 120;
    els.source.value = '';
    els.format.value = '';
    els.search.value = '';
    render();
  });
  els.density.addEventListener('click', function () {
    state.compact = !state.compact;
    els.density.setAttribute('aria-pressed', state.compact ? 'true' : 'false');
    els.density.textContent = state.compact ? '舒適排列' : '緊密排列';
    render();
  });
  els.refresh.addEventListener('click', function () { loadIndex(true); });
  els.loadMore.addEventListener('click', function () { state.limit += 120; render(); });
  els.grid.addEventListener('click', function (event) {
    var card = event.target.closest('[data-asset-id]');
    if (!card) return;
    var asset = state.assets.find(function (item) { return item.id === card.dataset.assetId; });
    if (asset) openAsset(asset);
  });
  els.dialogClose.addEventListener('click', function () { els.dialog.close(); });
  els.dialog.addEventListener('click', function (event) {
    if (event.target === els.dialog) els.dialog.close();
  });

  start();
})();
