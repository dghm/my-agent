(function () {
  var button = document.getElementById('create-docs-btn');
  var status = document.getElementById('docs-export-status');
  var authLink = document.getElementById('docs-auth-link');
  var resultLink = document.getElementById('docs-result-link');

  authLink.addEventListener('click', function (e) {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(collectDraft()));
    } catch (err) {
      e.preventDefault();
      status.textContent = '目前無法暫存草稿，請先下載草稿 JSON，再前往 Google 授權。';
    }
  });

  button.addEventListener('click', async function () {
    if (button.disabled) return;
    authLink.hidden = true;
    resultLink.hidden = true;
    if (window.location.protocol === 'file:') {
      status.textContent = '請從線上網站開啟報價工具，才能登入 Google 並建立文件。';
      return;
    }
    button.disabled = true;
    button.textContent = '建立中…';
    status.textContent = '正在建立可編輯的 Google 文件，請稍候。';
    try {
      var response = await fetch('/api/quote-docs/create', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectDraft())
      });
      var data = await response.json().catch(function () {
        throw new Error('Google 文件功能尚未部署，請更新線上網站後再試。');
      });
      if (!response.ok || !data.ok) {
        if (data.authUrl) authLink.hidden = false;
        if (data.partialUrl && /^https:\/\/docs\.google\.com\/document\/d\/[A-Za-z0-9_-]+\/edit$/.test(data.partialUrl)) {
          resultLink.href = data.partialUrl;
          resultLink.textContent = '查看未完成的文件';
          resultLink.hidden = false;
        }
        throw new Error(data.error || 'Google 文件建立失敗，請稍後再試。');
      }
      if (!/^https:\/\/docs\.google\.com\/document\/d\/[A-Za-z0-9_-]+\/edit$/.test(data.url || '')) {
        throw new Error('文件連結格式錯誤，請稍後再試。');
      }
      status.textContent = '已建立 Google 文件，可開啟後編輯或分享給客戶。';
      resultLink.href = data.url;
      resultLink.textContent = '開啟 Google 文件';
      resultLink.hidden = false;
    } catch (err) {
      status.textContent = err.message || '無法連線，請稍後再試。';
    } finally {
      button.disabled = false;
      button.textContent = '建立 Google 文件';
    }
  });

  var url = new URL(window.location.href);
  var authResult = url.searchParams.get('docsAuth');
  if (authResult) {
    status.textContent = authResult === 'ready'
      ? '已完成 Google 登入，按「建立 Google 文件」即可匯出目前報價。'
      : 'Google 授權未完成，請重新授權後再建立文件。';
    authLink.hidden = authResult === 'ready';
    url.searchParams.delete('docsAuth');
    window.history.replaceState(null, '', url.href);
  }
})();
