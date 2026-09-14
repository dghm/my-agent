(function () {
  'use strict';

  var STATUS_LABELS = {
    draft: '製作中',
    preview: '預覽',
    published: '公開中',
    archived: '已封存'
  };
  var FESTIVAL_ORDER = { 'mid-autumn': 0, christmas: 1, 'lunar-new-year': 2 };
  var state = { campaigns: new Map(), activeCampaign: null, selectedId: null };

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
      var planned = card.personalization && card.personalization.status === 'planned'
        ? '<span class="gc-kind">個人化規劃中</span>' : '';
      return '<button type="button" class="gc-card-row" data-card-id="' + escapeHtml(card.id) + '">' +
        '<span class="gc-card-copy"><strong class="gc-card-title">' + escapeHtml(card.title) + '</strong>' +
        '<span class="gc-card-meta">' + statusBadge(card) + planned +
        '<code>' + escapeHtml(card.canonicalPath) + '</code></span></span>' +
        '<span class="gc-card-arrow" aria-hidden="true">›</span></button>';
    }).join('');

    var requested = state.selectedId && cards.find(function (card) { return card.id === state.selectedId; });
    selectCard(requested || cards[0]);
  }

  function selectCard(card) {
    if (!card) return;
    state.selectedId = card.id;
    history.replaceState(null, '', '#card=' + encodeURIComponent(card.id));
    cardList.querySelectorAll('.gc-card-row').forEach(function (button) {
      var selected = button.dataset.cardId === card.id;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    var localUrl = 'greeting-cards/' + card.cardPath;
    previewTitle.textContent = card.title;
    previewAddress.textContent = card.canonicalPath;
    previewState.textContent = STATUS_LABELS[card.status] || card.status;
    previewState.className = 'gc-status gc-status-' + card.status;
    previewUrl.textContent = card.publicUrl || '正式網址尚未設定';

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
    iframe.src = localUrl;
    iframe.title = card.title + '預覽';
    openCard.href = card.publicUrl || localUrl;
    openCard.hidden = false;
  }

  function setDevice(device) {
    deviceFrame.dataset.device = device;
    document.querySelectorAll('[data-gc-device]').forEach(function (button) {
      var active = button.dataset.gcDevice === device;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
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

  fetch('greeting-cards/data/cards.json', { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(function (data) {
      var cards = Array.isArray(data.cards) ? data.cards : [];
      if (!cards.length) {
        catalogStatus.textContent = '目前沒有賀卡';
        return;
      }
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
