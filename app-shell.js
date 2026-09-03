(function (global) {
  'use strict';

  var iconPaths = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    'file-check': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 15l2 2 5-5"/>',
    sparkles: '<path d="m12 3-1.2 3.2L8 7.5l2.8 1.3L12 12l1.2-3.2L16 7.5l-2.8-1.3L12 3Z"/><path d="m5 13-.8 2.2L2 16l2.2.8L5 19l.8-2.2L8 16l-2.2-.8L5 13ZM19 12l-.7 1.8-1.8.7 1.8.7L19 17l.7-1.8 1.8-.7-1.8-.7L19 12Z"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM19 19h2v2h-2z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    caret: '<path d="m9 6 6 6-6 6"/>',
    'panel-collapse': '<path d="m14 6-6 6 6 6"/><path d="M20 4v16"/>',
  };

  function icon(name, className) {
    return '<svg class="' + (className || '') + '" viewBox="0 0 24 24" aria-hidden="true">' +
      (iconPaths[name] || iconPaths.home) + '</svg>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var NAV_COLLAPSE_KEY = 'dghm-shell-nav-collapsed';
  var NAV_OPEN_GROUPS_KEY = 'dghm-shell-open-groups';

  function readOpenGroups() {
    try {
      var saved = JSON.parse(localStorage.getItem(NAV_OPEN_GROUPS_KEY) || 'null');
      if (Array.isArray(saved)) return saved;
    } catch (error) {}
    return null;
  }

  function writeOpenGroups(ids) {
    try { localStorage.setItem(NAV_OPEN_GROUPS_KEY, JSON.stringify(ids)); } catch (error) {}
  }

  /* ---------- 側邊選單 ---------- */

  function renderNav(state) {
    var registry = global.DGHMToolRegistry;
    var filter = (state.filter || '').trim().toLowerCase();
    var html = '';

    registry.groups.forEach(function (group) {
      var tools = group.tools.filter(function (tool) {
        if (!filter) return true;
        if (tool.label.toLowerCase().indexOf(filter) > -1) return true;
        if (tool.id.indexOf(filter) > -1) return true;
        if (group.label.indexOf(filter) > -1) return true;
        return (tool.keywords || []).some(function (word) {
          return word.toLowerCase().indexOf(filter) > -1;
        });
      });
      if (!tools.length) return;

      var hasActive = tools.some(function (tool) { return tool.id === state.activeToolId; });
      // 搜尋時全部展開；否則依使用者紀錄，含目前工具的群組一律展開。
      var open = filter ? true : (hasActive || state.openGroups.indexOf(group.id) > -1);

      html += '<div class="dghm-group' + (open ? ' is-open' : '') + '" data-group="' + escapeHtml(group.id) + '">';
      html += '<button type="button" class="dghm-group-head' + (hasActive ? ' has-active' : '') +
        '" data-group-toggle data-label="' + escapeHtml(group.label) +
        '" aria-expanded="' + (open ? 'true' : 'false') + '">' +
        icon(group.icon, 'group-icon') +
        '<span class="group-label">' + escapeHtml(group.label) + '</span>' +
        icon('caret', 'group-caret') +
        '</button>';

      html += '<div class="dghm-tool-nav">';
      tools.forEach(function (tool) {
        var isActive = tool.id === state.activeToolId;
        var disabled = !tool.href;
        var classes = 'dghm-tool-link' +
          (isActive ? ' is-active' : '') +
          (disabled ? ' is-disabled' : '');
        var mark = tool.status === 'planned'
          ? '<span class="dghm-tool-tag">規劃中</span>'
          : tool.status === 'legacy'
            ? '<span class="dghm-tool-dot" title="尚未套用新版外框"></span>'
            : '';

        if (disabled) {
          html += '<span class="' + classes + '" aria-disabled="true">' +
            '<span>' + escapeHtml(tool.label) + '</span>' + mark + '</span>';
        } else {
          html += '<a class="' + classes + '" href="' + escapeHtml(tool.href) + '"' +
            (isActive ? ' aria-current="page"' : '') + '>' +
            '<span>' + escapeHtml(tool.label) + '</span>' + mark + '</a>';
        }
      });
      html += '</div></div>';
    });

    return html || '<p class="dghm-nav-empty">找不到符合的工具</p>';
  }

  function projectOptions(projects, currentId) {
    var options = ['<option value="">內部工作／未指定案件</option>'];
    projects.forEach(function (project) {
      options.push('<option value="' + escapeHtml(project.id) + '"' +
        (project.id === currentId ? ' selected' : '') + '>' +
        escapeHtml(project.projectCode + ' · ' + project.projectName) + '</option>');
    });
    return options.join('');
  }

  function updateProjectDisplay(shell, project) {
    var select = shell.querySelector('#dghm-project-select');
    if (!select) return;
    select.title = project
      ? project.projectName + '（' + project.status + '）下一步：' + project.nextAction
      : '尚未指定案件';
  }

  /* ---------- 掛載 ---------- */

  function mountAppShell(options) {
    options = options || {};
    var workspace = document.getElementById('tool-workspace');
    var registry = global.DGHMToolRegistry;
    var projectsApi = global.DGHMProjects;
    if (!workspace || !registry || !projectsApi) return;

    var match = registry.findTool(options.activeTool || document.body.dataset.tool || 'home') ||
      registry.findTool('home');

    var state = {
      activeToolId: match.tool.id,
      filter: '',
      openGroups: readOpenGroups() || [match.group.id],
    };

    var shell = document.createElement('div');
    shell.className = 'dghm-shell';
    shell.innerHTML =
      '<aside class="dghm-sidebar">' +
        '<a class="dghm-brand" href="index.html">' +
          '<img src="favicon.svg" alt="">' +
          '<span class="dghm-brand-text">' +
            '<strong>DGHM 工作台</strong>' +
            '<span>Tools Workspace</span>' +
          '</span>' +
        '</a>' +
        '<div class="dghm-search">' +
          icon('search') +
          '<input type="search" id="dghm-tool-search" placeholder="搜尋工具…" aria-label="搜尋工具" autocomplete="off">' +
        '</div>' +
        '<nav class="dghm-nav" aria-label="工具選單" data-shell-nav></nav>' +
        '<div class="dghm-sidebar-foot">' +
          '<button type="button" class="dghm-nav-toggle" data-shell-nav-toggle aria-label="收合側邊選單">' +
            icon('panel-collapse') +
            '<span>收合選單</span>' +
          '</button>' +
        '</div>' +
      '</aside>' +
      '<div class="dghm-main">' +
        '<header class="dghm-topbar">' +
          '<div class="dghm-breadcrumb">' +
            '<span class="crumb-group">' + escapeHtml(match.group.label) + '</span>' +
            '<span class="crumb-sep" aria-hidden="true">›</span>' +
            '<span class="crumb-tool">' + escapeHtml(match.tool.label) + '</span>' +
          '</div>' +
          '<div class="dghm-topbar-spacer"></div>' +
          '<div class="dghm-project-control">' +
            '<label for="dghm-project-select">目前案件</label>' +
            '<select id="dghm-project-select">' +
              projectOptions(projectsApi.list(), projectsApi.getCurrentId()) +
            '</select>' +
          '</div>' +
          '<div class="dghm-top-actions">' +
            '<div id="user-area"></div>' +
            '<button id="theme-toggle" type="button" aria-label="切換 Dark／Day 模式" title="切換深色／淺色模式">🌙</button>' +
          '</div>' +
        '</header>' +
        '<main class="dghm-workspace"></main>' +
      '</div>';

    document.body.classList.add('has-app-shell');
    workspace.parentNode.insertBefore(shell, workspace);
    shell.querySelector('.dghm-workspace').appendChild(workspace);

    var nav = shell.querySelector('[data-shell-nav]');
    function paintNav() { nav.innerHTML = renderNav(state); }
    paintNav();

    bindNav(shell, nav, state, paintNav);
    bindNavToggle(shell);

    var select = shell.querySelector('#dghm-project-select');
    select.addEventListener('change', function () {
      projectsApi.setCurrent(select.value);
    });
    updateProjectDisplay(shell, projectsApi.getCurrent());

    global.addEventListener('dghm:project-change', function (event) {
      select.value = event.detail.project ? event.detail.project.id : '';
      updateProjectDisplay(shell, event.detail.project);
    });

    hydrateUserArea(shell.querySelector('#user-area'));
  }

  function bindNav(shell, nav, state, paintNav) {
    nav.addEventListener('click', function (event) {
      var head = event.target.closest('[data-group-toggle]');
      if (!head) return;

      var groupEl = head.parentNode;
      var groupId = groupEl.dataset.group;

      // 收合狀態下點群組圖示 = 直接開啟該群組第一個可用工具
      if (isIconOnly(shell)) {
        var group = global.DGHMToolRegistry.groups.filter(function (g) { return g.id === groupId; })[0];
        var first = group && global.DGHMToolRegistry.firstAvailableTool(group);
        if (first) location.href = first.href;
        return;
      }

      var index = state.openGroups.indexOf(groupId);
      if (index > -1) state.openGroups.splice(index, 1);
      else state.openGroups.push(groupId);
      writeOpenGroups(state.openGroups);
      paintNav();
    });

    var search = shell.querySelector('#dghm-tool-search');
    search.addEventListener('input', function () {
      state.filter = search.value;
      paintNav();
    });
    search.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !search.value) return;
      search.value = '';
      state.filter = '';
      paintNav();
    });
  }

  /** 側欄目前是否只顯示圖示（手動收合，或視窗窄且未展開）。 */
  function isIconOnly(shell) {
    if (shell.classList.contains('is-nav-collapsed')) return true;
    return global.matchMedia('(max-width: 860px)').matches && !shell.classList.contains('is-nav-expanded');
  }

  function bindNavToggle(shell) {
    var collapsed = false;
    try { collapsed = localStorage.getItem(NAV_COLLAPSE_KEY) === '1'; } catch (error) {}

    function apply(next) {
      shell.classList.toggle('is-nav-collapsed', next);
      document.body.classList.toggle('is-nav-collapsed', next);
      var btn = shell.querySelector('[data-shell-nav-toggle]');
      btn.setAttribute('aria-expanded', next ? 'false' : 'true');
      btn.setAttribute('aria-label', next ? '展開側邊選單' : '收合側邊選單');
      btn.querySelector('span').textContent = next ? '展開選單' : '收合選單';
    }

    apply(collapsed);

    shell.querySelector('[data-shell-nav-toggle]').addEventListener('click', function () {
      // 窄視窗下側欄本來就是圖示狀態，按鈕改為切換浮層展開
      if (global.matchMedia('(max-width: 860px)').matches) {
        shell.classList.toggle('is-nav-expanded');
        return;
      }
      var next = !shell.classList.contains('is-nav-collapsed');
      apply(next);
      try { localStorage.setItem(NAV_COLLAPSE_KEY, next ? '1' : '0'); } catch (error) {}
    });
  }

  function hydrateUserArea(area) {
    if (!area || location.protocol === 'file:') return;
    fetch('/api/auth/me')
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (!data || !data.user) return;
        var user = data.user;
        var chip = document.createElement('a');
        chip.className = 'user-chip';
        chip.href = '/api/auth/logout';
        chip.title = '登出';
        chip.textContent = user.name || user.email || '會員';
        area.appendChild(chip);
      })
      .catch(function () {});
  }

  global.mountAppShell = mountAppShell;
})(window);
