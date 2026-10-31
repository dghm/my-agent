(function () {
  'use strict';

  var STATUS_LABELS = {
    draft: '製作中',
    preview: '預覽',
    published: '公開中',
    archived: '已封存'
  };
  var FESTIVAL_ORDER = { 'mid-autumn': 0, christmas: 1, 'lunar-new-year': 2 };
  var MODE_LABELS = { public: '公版', client: '客戶', friend: '親友', family: '家人', vendor: '廠商' };
  var state = {
    campaigns: new Map(),
    activeCampaign: null,
    selectedId: null,
    selectedCard: null,
    device: 'desktop',
    previewItems: [],
    previewSource: 'local-fixture',
    previewWarning: '',
    previewMode: 'public',
    selectedPreviewId: 'public-default'
  };

  var cardList = document.getElementById('gc-card-list');
  var campaignSelect = document.getElementById('gc-campaign-select');
  var catalogStatus = document.getElementById('gc-catalog-status');
  var previewTitle = document.getElementById('gc-preview-title');
  var placeholder = document.getElementById('gc-preview-placeholder');
  var deviceFrame = document.getElementById('gc-device-frame');
  var iframe = document.getElementById('gc-card-preview');
  var previewAddress = document.getElementById('gc-preview-address');
  var previewState = document.getElementById('gc-preview-state');
  var previewUrl = document.getElementById('gc-preview-url');
  var openCard = document.getElementById('gc-open-card');
  var contentPreview = document.getElementById('gc-content-preview');
  var recipientField = document.getElementById('gc-recipient-field');
  var recipientSelect = document.getElementById('gc-preview-recipient');
  var previewContentLabel = document.getElementById('gc-preview-content-label');
  var previewSignature = document.getElementById('gc-preview-signature');
  var previewSource = document.getElementById('gc-preview-source');

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function buildCampaigns(cards) {
    var campaigns = new Map();
    cards.forEach(function (card) {
      if (!campaigns.has(card.campaign)) campaigns.set(card.campaign, []);
      campaigns.get(card.campaign).push(card);
    });
    campaigns.forEach(function (items) {
      items.sort(function (a, b) {
        return (FESTIVAL_ORDER[a.festival] == null ? 9 : FESTIVAL_ORDER[a.festival]) -
          (FESTIVAL_ORDER[b.festival] == null ? 9 : FESTIVAL_ORDER[b.festival]);
      });
    });
    return campaigns;
  }

  function renderCampaignOptions() {
    var years = Array.from(state.campaigns.keys()).sort(function (a, b) { return b - a; });
    campaignSelect.innerHTML = years.map(function (year) {
      return '<option value="' + year + '">' + year + ' 檔期（' + state.campaigns.get(year).length + ' 張）</option>';
    }).join('');
  }

  function statusBadge(card) {
    return '<span class="gc-status gc-status-' + escapeHtml(card.status) + '">' +
      escapeHtml(STATUS_LABELS[card.status] || card.status) + '</span>';
  }

  function renderCards() {
    var cards = state.campaigns.get(state.activeCampaign) || [];
    campaignSelect.value = String(state.activeCampaign);
    catalogStatus.textContent = state.activeCampaign + ' 檔期 · ' + cards.length + ' 張';

    cardList.innerHTML = cards.map(function (card) {
      var planned = card.personalization && card.personalization.enabled
        ? '<span class="gc-kind">個人化本機預覽</span>' : '';
      return '<button type="button" class="gc-card-row" data-card-id="' + escapeHtml(card.id) + '">' +
        '<span class="gc-card-copy"><strong class="gc-card-title">' + escapeHtml(card.title) + '</strong>' +
        '<span class="gc-card-meta">' + statusBadge(card) + planned +
        '<code>' + escapeHtml(card.canonicalPath) + '</code></span></span>' +
        '<span class="gc-card-arrow" aria-hidden="true">›</span></button>';
    }).join('');

    var requested = state.selectedId && cards.find(function (card) { return card.id === state.selectedId; });
    selectCard(requested || cards[0]);
  }

  function previewItemsForMode(mode) {
    return state.previewItems.filter(function (item) { return item.mode === mode; });
  }

  function activePreviewItem() {
    return state.previewItems.find(function (item) { return item.id === state.selectedPreviewId; }) || null;
  }

  function signatureSummary(item) {
    if (!item || item.signatureType === 'none' || item.logoVariant === 'none') return '不顯示署名';
    if (item.signatureType === 'personal') return '個人署名 · 中文名字樣式';
    return '公司署名 · DGHM 中文 Logo';
  }

  function renderContentControls(card) {
    var enabled = Boolean(card && card.personalization && card.personalization.enabled && state.previewItems.length);
    contentPreview.hidden = !enabled;
    if (!enabled) return;

    var items = previewItemsForMode(state.previewMode);
    if (!items.length) {
      state.previewMode = 'public';
      items = previewItemsForMode('public');
    }
    if (!items.some(function (item) { return item.id === state.selectedPreviewId; })) {
      state.selectedPreviewId = items[0] ? items[0].id : null;
    }

    document.querySelectorAll('[data-gc-content-mode]').forEach(function (button) {
      var active = button.dataset.gcContentMode === state.previewMode;
      var available = previewItemsForMode(button.dataset.gcContentMode).length > 0;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
      button.disabled = !available;
    });

    previewSource.textContent = state.previewSource === 'airtable' ? 'Airtable 即時資料' : '本機模擬資料';
    previewSource.title = state.previewWarning || '';

    recipientField.hidden = state.previewMode === 'public';
    recipientSelect.innerHTML = items.map(function (item) {
      return '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.label) + '</option>';
    }).join('');
    recipientSelect.value = state.selectedPreviewId || '';

    var item = activePreviewItem();
    previewContentLabel.textContent = item ? item.label : (MODE_LABELS[state.previewMode] || state.previewMode);
    previewSignature.textContent = signatureSummary(item);
  }

  function previewPath(card, includeDevice) {
    var path = 'greeting-cards/' + card.cardPath;
    var params = [];
    if (includeDevice) params.push('preview=' + encodeURIComponent(state.device));
    var item = activePreviewItem();
    if (card.personalization && card.personalization.enabled && item) {
      params.push('demo=' + encodeURIComponent(item.id));
    }
    return path + (params.length ? '?' + params.join('&') : '');
  }

  function refreshPreview() {
    var card = state.selectedCard;
    if (!card || card.previewAvailable === false) return;
    var item = card.personalization && card.personalization.enabled ? activePreviewItem() : null;
    var iframeUrl = previewPath(card, true);
    iframe.src = iframeUrl;
    iframe.title = card.title + '預覽';
    openCard.href = card.publicUrl || previewPath(card, false);
    openCard.hidden = state.previewSource === 'airtable';
    previewAddress.textContent = card.canonicalPath + (item ? '?demo=' + item.id : '');
    previewUrl.textContent = item
      ? (state.previewSource === 'airtable' ? 'Airtable 即時 · ' : '本機模擬 · ') + item.label
      : (card.publicUrl || '正式網址尚未設定');
  }

  function sendPreviewContent() {
    var item = activePreviewItem();
    if (!item || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage({
      type: 'dghm:greeting-card-preview',
      content: item
    }, location.origin);
  }

  iframe.addEventListener('load', sendPreviewContent);

  function selectCard(card) {
    if (!card) return;
    state.selectedId = card.id;
    state.selectedCard = card;
    history.replaceState(null, '', '#card=' + encodeURIComponent(card.id));
    cardList.querySelectorAll('.gc-card-row').forEach(function (button) {
      var selected = button.dataset.cardId === card.id;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    previewTitle.textContent = card.title;
    previewState.textContent = STATUS_LABELS[card.status] || card.status;
    previewState.className = 'gc-status gc-status-' + card.status;
    renderContentControls(card);

    if (card.previewAvailable === false) {
      iframe.removeAttribute('src');
      deviceFrame.hidden = true;
      placeholder.innerHTML = '<strong>賀卡視覺尚未建立</strong><span>卡片資料已納入檔期，完成視覺後即可在此預覽。</span>';
      placeholder.hidden = false;
      openCard.hidden = true;
      return;
    }

    placeholder.hidden = true;
    deviceFrame.hidden = false;
    openCard.hidden = false;
    refreshPreview();
  }

  function setDevice(device) {
    state.device = device;
    deviceFrame.dataset.device = device;
    document.querySelectorAll('[data-gc-device]').forEach(function (button) {
      var active = button.dataset.gcDevice === device;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    refreshPreview();
  }

  campaignSelect.addEventListener('change', function () {
    state.activeCampaign = Number(campaignSelect.value);
    state.selectedId = null;
    renderCards();
  });

  cardList.addEventListener('click', function (event) {
    var button = event.target.closest('[data-card-id]');
    if (!button) return;
    var cards = state.campaigns.get(state.activeCampaign) || [];
    selectCard(cards.find(function (card) { return card.id === button.dataset.cardId; }));
  });

  document.querySelectorAll('[data-gc-device]').forEach(function (button) {
    button.addEventListener('click', function () { setDevice(button.dataset.gcDevice); });
  });

  document.querySelectorAll('[data-gc-content-mode]').forEach(function (button) {
    button.addEventListener('click', function () {
      state.previewMode = button.dataset.gcContentMode;
      var first = previewItemsForMode(state.previewMode)[0];
      state.selectedPreviewId = first ? first.id : null;
      renderContentControls(state.selectedCard);
      refreshPreview();
    });
  });

  recipientSelect.addEventListener('change', function () {
    state.selectedPreviewId = recipientSelect.value;
    renderContentControls(state.selectedCard);
    refreshPreview();
  });

  function loadPreviewData() {
    var localStaticPreview = (location.hostname === '127.0.0.1' || location.hostname === 'localhost') &&
      location.port === '4174';
    var liveRequest = localStaticPreview
      ? Promise.reject(new Error('本機靜態預覽使用模擬資料'))
      : fetch('/api/greeting-cards?year=2026&festival=' + encodeURIComponent('聖誕') + '&template=2026-christmas', {
        credentials: 'same-origin',
        cache: 'no-store'
      });

    return liveRequest
      .then(function (response) {
        if (!response.ok) throw new Error('Airtable API HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.items)) throw new Error('Airtable API payload invalid');
        return data;
      })
      .catch(function (error) {
        return fetch('greeting-cards/preview-personalizations.json', { cache: 'no-store' })
          .then(function (response) {
            if (!response.ok) throw new Error('Preview fixture HTTP ' + response.status);
            return response.json();
          })
          .then(function (data) {
            data.source = 'local-fixture';
            data.warning = error.message;
            return data;
          });
      });
  }

  Promise.all([
    fetch('greeting-cards/data/cards.json', { cache: 'no-store' }).then(function (response) {
      if (!response.ok) throw new Error('Cards HTTP ' + response.status);
      return response.json();
    }),
    loadPreviewData()
  ])
    .then(function (payloads) {
      var data = payloads[0];
      var previewData = payloads[1];
      var cards = Array.isArray(data.cards) ? data.cards : [];
      if (!cards.length) {
        catalogStatus.textContent = '目前沒有賀卡';
        return;
      }
      state.previewItems = Array.isArray(previewData.items) ? previewData.items : [];
      state.previewSource = previewData.source || 'local-fixture';
      state.previewWarning = previewData.warning || '';
      state.campaigns = buildCampaigns(cards);
      var hashId = new URLSearchParams(location.hash.slice(1)).get('card');
      var linked = cards.find(function (card) { return card.id === hashId; });
      state.selectedId = linked ? linked.id : null;
      state.activeCampaign = linked ? linked.campaign : Math.max.apply(null, Array.from(state.campaigns.keys()));
      renderCampaignOptions();
      renderCards();
    })
    .catch(function (error) {
      catalogStatus.textContent = '資料讀取失敗';
      catalogStatus.classList.add('is-error');
      console.error('Failed to load greeting cards:', error);
    });
})();
