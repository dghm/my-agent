(function (global) {
  'use strict';

  var iconPaths = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    'file-check': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 15l2 2 5-5"/>',
    sparkles: '<path d="m12 3-1.2 3.2L8 7.5l2.8 1.3L12 12l1.2-3.2L16 7.5l-2.8-1.3L12 3Z"/><path d="m5 13-.8 2.2L2 16l2.2.8L5 19l.8-2.2L8 16l-2.2-.8L5 13ZM19 12l-.7 1.8-1.8.7 1.8.7L19 17l.7-1.8 1.8-.7-1.8-.7L19 12Z"/>',
  };

  function icon(name) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (iconPaths[name] || iconPaths.home) + '</svg>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function statusLabel(status) {
    if (status === 'integrated') return '新版';
    if (status === 'planned') return '規劃中';
    return '舊版';
  }

  function renderRail(groups, activeGroup) {
    return groups.map(function (group) {
      var entry = global.DGHMToolRegistry.findTool(group.defaultTool);
      var href = entry && entry.tool.href ? entry.tool.href : 'index.html';
      return '<a class="dghm-rail-link' + (group.id === activeGroup.id ? ' is-active' : '') +
        '" href="' + href + '" data-label="' + escapeHtml(group.label) +
        '" aria-label="' + escapeHtml(group.label) + '">' + icon(group.icon) + '</a>';
    }).join('');
  }

  function renderTools(group, activeToolId) {
    return group.tools.map(function (tool) {
      var disabled = !tool.href;
      var tag = disabled ? 'span' : 'a';
      var href = disabled ? '' : ' href="' + tool.href + '"';
      var classes = 'dghm-tool-link' +
        (tool.id === activeToolId ? ' is-active' : '') +
        (disabled ? ' is-disabled' : '');
      return '<' + tag + ' class="' + classes + '"' + href + '>' +
        '<span>' + escapeHtml(tool.label) + '</span>' +
        '<span class="dghm-tool-status">' + statusLabel(tool.status) + '</span>' +
        '</' + tag + '>';
    }).join('');
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
    var projectName = shell.querySelector('[data-shell-project-name]');
    var projectAction = shell.querySelector('[data-shell-project-action]');
    var menuProject = shell.querySelector('[data-shell-menu-project]');
    if (!project) {
      projectName.textContent = '未指定案件';
      projectAction.textContent = '可先進行內部工作或建立新案件';
      menuProject.innerHTML = '<strong>目前沒有綁定案件</strong><p>Phase 1 使用本機模擬資料，之後可替換為 Airtable。</p>';
      return;
    }
    projectName.textContent = project.status + ' · ' + project.clientName;
    projectAction.textContent = '下一步：' + project.nextAction;
    menuProject.innerHTML =
      '<strong>' + escapeHtml(project.projectName) + '</strong>' +
      '<p>' + escapeHtml(project.projectCode) + '<br>下一步：' + escapeHtml(project.nextAction) + '</p>';
  }

  function mountAppShell(options) {
    options = options || {};
    var workspace = document.getElementById('tool-workspace');
    var registry = global.DGHMToolRegistry;
    var projectsApi = global.DGHMProjects;
    if (!workspace || !registry || !projectsApi) return;

    var match = registry.findTool(options.activeTool || document.body.dataset.tool || 'home') ||
      registry.findTool('home');
    var shell = document.createElement('div');
    shell.className = 'dghm-shell';
    shell.innerHTML =
      '<aside class="dghm-rail" aria-label="主要功能">' +
        '<a class="dghm-rail-brand" href="index.html" aria-label="DGHM 工作台">D</a>' +
        renderRail(registry.groups, match.group) +
      '</aside>' +
      '<aside class="dghm-menu" aria-label="' + escapeHtml(match.group.label) + '功能選單">' +
        '<h2 class="dghm-menu-heading">' + escapeHtml(match.group.label) + '</h2>' +
        '<p class="dghm-menu-description">' + escapeHtml(match.group.description) + '</p>' +
        '<div class="dghm-menu-label">功能選單</div>' +
        '<nav class="dghm-tool-nav">' + renderTools(match.group, match.tool.id) + '</nav>' +
        '<div class="dghm-menu-project" data-shell-menu-project></div>' +
      '</aside>' +
      '<div class="dghm-main">' +
        '<header class="dghm-topbar">' +
          '<div class="dghm-project-control">' +
            '<label for="dghm-project-select">目前案件</label>' +
            '<select id="dghm-project-select">' +
              projectOptions(projectsApi.list(), projectsApi.getCurrentId()) +
            '</select>' +
            '<div class="dghm-project-meta">' +
              '<strong data-shell-project-name></strong>' +
              '<span data-shell-project-action></span>' +
            '</div>' +
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

  function hydrateUserArea(area) {
    if (!area) return;

    function renderLogin() {
      var login = document.createElement('a');
      login.className = 'dghm-login-link';
      login.href = 'login.html';
      login.textContent = '登入';
      area.appendChild(login);
    }

    if (location.protocol === 'file:') {
      renderLogin();
      return;
    }
    fetch('/api/auth/me')
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (!data || !data.user) {
          renderLogin();
          return;
        }
        var user = data.user;
        var chip = document.createElement('a');
        chip.className = 'user-chip';
        chip.href = '/api/auth/logout';
        chip.title = '登出';
        chip.textContent = user.name || user.email || '會員';
        area.appendChild(chip);
      })
      .catch(renderLogin);
  }

  global.mountAppShell = mountAppShell;
})(window);
