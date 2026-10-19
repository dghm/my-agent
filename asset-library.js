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
    writable: false,
    destinations: [],
    uploadFiles: [],
    activeAsset: null,
  };

  var els = {
    gate: document.getElementById('asset-gate'),
    gateTitle: document.getElementById('asset-gate-title'),
    gateMessage: document.getElementById('asset-gate-message'),
    authorize: document.getElementById('asset-authorize'),
    browser: document.getElementById('asset-browser'),
    refresh: document.getElementById('asset-refresh'),
    manageAuthorize: document.getElementById('asset-manage-authorize'),
    uploadOpen: document.getElementById('asset-upload-open'),
    accessNote: document.getElementById('asset-access-note'),
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
    annotationEdit: document.getElementById('asset-annotation-edit'),
    annotationView: document.getElementById('asset-annotation-view'),
    annotationForm: document.getElementById('asset-annotation-form'),
    annotationCancel: document.getElementById('asset-annotation-cancel'),
    annotationSave: document.getElementById('asset-annotation-save'),
    annotationStatus: document.getElementById('asset-annotation-status'),
    tags: document.getElementById('asset-dialog-tags'),
    description: document.getElementById('asset-dialog-description'),
    tagsInput: document.getElementById('asset-tags-input'),
    descriptionInput: document.getElementById('asset-description-input'),
    archiveOpen: document.getElementById('asset-archive-open'),
    uploadDialog: document.getElementById('asset-upload-dialog'),
    uploadForm: document.getElementById('asset-upload-form'),
    uploadClose: document.getElementById('asset-upload-close'),
    uploadCancel: document.getElementById('asset-upload-cancel'),
    uploadSubmit: document.getElementById('asset-upload-submit'),
    uploadDestination: document.getElementById('asset-upload-destination'),
    uploadInput: document.getElementById('asset-upload-input'),
    uploadList: document.getElementById('asset-upload-list'),
    uploadStatus: document.getElementById('asset-upload-status'),
    dropzone: document.getElementById('asset-dropzone'),
    archiveDialog: document.getElementById('asset-archive-dialog'),
    archiveCancel: document.getElementById('asset-archive-cancel'),
    archiveConfirm: document.getElementById('asset-archive-confirm'),
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

  async function fetchJson(url, options) {
    var settings = options || {};
    var headers = new Headers(settings.headers || {});
    headers.set('Accept', 'application/json');
    var response = await fetch(url, Object.assign({}, settings, { headers: headers }));
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      var error = new Error(data.error || '讀取失敗');
      error.data = data;
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function setWritableUI(writable, authorizeUrl) {
    state.writable = Boolean(writable);
    els.manageAuthorize.href = authorizeUrl || '/api/auth/login/google?grant=assets-manage';
    els.manageAuthorize.hidden = state.writable;
    els.uploadOpen.hidden = !state.writable;
    els.accessNote.innerHTML = state.writable
      ? '管理模式<br>移除素材會先送到 _待刪除'
      : '唯讀模式<br>啟用管理後可上傳與移到待刪除區';
  }

  function fillUploadDestinations() {
    clearNode(els.uploadDestination);
    state.destinations.forEach(function (destination) {
      var option = document.createElement('option');
      option.value = destination.id;
      option.textContent = destination.label + (destination.path && destination.path !== destination.label ? ' · ' + destination.path : '');
      els.uploadDestination.appendChild(option);
    });
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

  function updateAssetSearchText(asset) {
    asset.searchText = [
      asset.title,
      asset.stockId,
      asset.category,
      asset.sourceCategory,
      asset.directory,
      asset.formats.join(' '),
      (asset.tags || []).join(' '),
      asset.description || '',
    ].join(' ').toLocaleLowerCase('zh-Hant');
  }

  function renderAnnotation(asset) {
    clearNode(els.tags);
    var tags = asset.tags || [];
    if (tags.length) {
      tags.forEach(function (tag) {
        var chip = document.createElement('span');
        chip.className = 'asset-tag';
        chip.textContent = tag;
        els.tags.appendChild(chip);
      });
    } else {
      var empty = document.createElement('span');
      empty.className = 'asset-tag-empty';
      empty.textContent = '尚未加入標籤';
      els.tags.appendChild(empty);
    }
    els.description.textContent = asset.description || '尚未加入描述。';
    els.annotationEdit.hidden = !state.writable;
    els.annotationView.hidden = false;
    els.annotationForm.hidden = true;
    els.annotationStatus.textContent = '';
  }

  function editAnnotation() {
    if (!state.activeAsset || !state.writable) return;
    els.tagsInput.value = (state.activeAsset.tags || []).join('、');
    els.descriptionInput.value = state.activeAsset.description || '';
    els.annotationView.hidden = true;
    els.annotationForm.hidden = false;
    els.annotationStatus.textContent = '';
    els.tagsInput.focus();
  }

  function cancelAnnotationEdit() {
    if (!state.activeAsset) return;
    renderAnnotation(state.activeAsset);
  }

  function splitTags(value) {
    var seen = new Set();
    return String(value || '').split(/[,，、\n]+/).map(function (tag) { return tag.trim(); }).filter(function (tag) {
      var key = tag.toLocaleLowerCase('zh-Hant');
      if (!tag || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 20);
  }

  async function saveAnnotation(event) {
    event.preventDefault();
    if (!state.activeAsset || !state.writable) return;
    els.annotationSave.disabled = true;
    els.annotationCancel.disabled = true;
    els.annotationStatus.textContent = '正在儲存到 Google Drive…';
    try {
      var data = await fetchJson('/api/assets/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadataKey: state.activeAsset.metadataKey,
          tags: splitTags(els.tagsInput.value),
          description: els.descriptionInput.value,
        }),
      });
      state.activeAsset.tags = data.tags || [];
      state.activeAsset.description = data.description || '';
      updateAssetSearchText(state.activeAsset);
      renderAnnotation(state.activeAsset);
      render();
    } catch (error) {
      els.annotationStatus.textContent = error.message;
    } finally {
      els.annotationSave.disabled = false;
      els.annotationCancel.disabled = false;
    }
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
    state.activeAsset = asset;
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
    renderAnnotation(asset);
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

    els.archiveOpen.hidden = !state.writable;

    els.dialog.showModal();
  }

  function renderUploadFiles(states) {
    clearNode(els.uploadList);
    state.uploadFiles.forEach(function (file, index) {
      var row = document.createElement('div');
      row.className = 'asset-upload-row' + (states && states[index] ? ' is-' + states[index].kind : '');
      var name = document.createElement('span');
      name.textContent = file.name;
      var detail = document.createElement('span');
      detail.textContent = states && states[index] ? states[index].label : formatBytes(file.size);
      row.append(name, detail);
      els.uploadList.appendChild(row);
    });
    els.uploadSubmit.disabled = !state.uploadFiles.length || !els.uploadDestination.value;
  }

  function chooseUploadFiles(files) {
    state.uploadFiles = Array.from(files || []).filter(function (file) { return file && file.name; });
    els.uploadStatus.textContent = '';
    renderUploadFiles();
  }

  function openUploadDialog() {
    state.uploadFiles = [];
    els.uploadInput.value = '';
    els.uploadStatus.textContent = '';
    fillUploadDestinations();
    renderUploadFiles();
    els.uploadDialog.showModal();
  }

  async function uploadOne(file, parentId) {
    var session = await fetchJson('/api/assets/upload-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        parentId: parentId,
      }),
    });
    var response = await fetch(session.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    if (!response.ok) throw new Error('Google Drive 上傳失敗（HTTP ' + response.status + '）');
  }

  async function uploadSelectedFiles() {
    if (!state.uploadFiles.length || !els.uploadDestination.value) return;
    var states = state.uploadFiles.map(function () { return { kind: 'pending', label: '等待中' }; });
    var completed = 0;
    var failed = 0;
    els.uploadSubmit.disabled = true;
    els.uploadCancel.disabled = true;
    for (var index = 0; index < state.uploadFiles.length; index += 1) {
      states[index] = { kind: 'pending', label: '上傳中…' };
      renderUploadFiles(states);
      try {
        await uploadOne(state.uploadFiles[index], els.uploadDestination.value);
        completed += 1;
        states[index] = { kind: 'done', label: '完成' };
      } catch (error) {
        failed += 1;
        states[index] = { kind: 'error', label: '失敗' };
      }
      els.uploadStatus.textContent = '已完成 ' + completed + '／' + state.uploadFiles.length + (failed ? '，失敗 ' + failed : '');
      renderUploadFiles(states);
    }
    els.uploadCancel.disabled = false;
    await loadIndex(true);
    if (!failed) els.uploadDialog.close();
    else els.uploadSubmit.disabled = false;
  }

  async function archiveActiveAsset() {
    if (!state.activeAsset || !state.writable) return;
    els.archiveConfirm.disabled = true;
    els.archiveConfirm.textContent = '移動中…';
    try {
      await fetchJson('/api/assets/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: state.activeAsset.variants.map(function (variant) { return variant.id; }) }),
      });
      els.archiveDialog.close();
      state.activeAsset = null;
      await loadIndex(true);
    } catch (error) {
      els.archiveConfirm.textContent = error.message;
    } finally {
      els.archiveConfirm.disabled = false;
      setTimeout(function () { els.archiveConfirm.textContent = '移到待刪除區'; }, 1800);
    }
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
      state.assets.forEach(updateAssetSearchText);
      state.stats = data.stats || {};
      state.destinations = data.destinations || [];
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
      setWritableUI(status.writable, status.manageAuthorizeUrl);
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
  els.uploadOpen.addEventListener('click', openUploadDialog);
  els.uploadClose.addEventListener('click', function () { els.uploadDialog.close(); });
  els.uploadCancel.addEventListener('click', function () { els.uploadDialog.close(); });
  els.uploadInput.addEventListener('change', function () { chooseUploadFiles(els.uploadInput.files); });
  els.uploadDestination.addEventListener('change', function () { renderUploadFiles(); });
  els.uploadForm.addEventListener('submit', function (event) { event.preventDefault(); uploadSelectedFiles(); });
  ['dragenter', 'dragover'].forEach(function (name) {
    els.dropzone.addEventListener(name, function (event) {
      event.preventDefault();
      els.dropzone.classList.add('is-dragging');
    });
  });
  ['dragleave', 'drop'].forEach(function (name) {
    els.dropzone.addEventListener(name, function (event) {
      event.preventDefault();
      els.dropzone.classList.remove('is-dragging');
    });
  });
  els.dropzone.addEventListener('drop', function (event) { chooseUploadFiles(event.dataTransfer.files); });
  els.archiveOpen.addEventListener('click', function () {
    els.dialog.close();
    els.archiveDialog.showModal();
  });
  els.annotationEdit.addEventListener('click', editAnnotation);
  els.annotationCancel.addEventListener('click', cancelAnnotationEdit);
  els.annotationForm.addEventListener('submit', saveAnnotation);
  els.archiveCancel.addEventListener('click', function () { els.archiveDialog.close(); });
  els.archiveConfirm.addEventListener('click', archiveActiveAsset);
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
