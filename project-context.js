(function (global) {
  'use strict';

  var PROJECTS_KEY = 'dghm-phase1-projects';
  var CURRENT_KEY = 'dghm-phase1-current-project';
  var SEED_V2_KEY = 'dghm-phase1-projects-seeded-v2';

  var sampleProjects = [
    {
      id: 'project-senway',
      clientName: '昇威包裝',
      projectName: '官方網站改版',
      projectCode: 'SW-WEB-2026',
      status: '執行中',
      nextAction: '確認產品分類與首頁第二版',
      startDate: '2026-07-01',
      dueDate: '2026-09-30',
      color: 'series-1',
      active: true,
    },
    {
      id: 'project-tailormed',
      clientName: 'TailorMed',
      projectName: '品牌網站與預約流程',
      projectCode: 'TM-WEB-2026',
      status: '報價中',
      nextAction: '確認第二階段工作範圍',
      startDate: '2026-07-15',
      dueDate: '2026-10-15',
      color: 'series-2',
      active: true,
    },
    {
      id: 'project-dghm',
      clientName: 'DGHM',
      projectName: 'my-agent 工作台',
      projectCode: 'DGHM-AGENT',
      status: '內部開發',
      nextAction: '體驗 Phase 1 三欄工作台',
      startDate: '2026-07-27',
      dueDate: '',
      color: 'series-3',
      active: true,
    },
  ];

  // 週工作排程工具裡實際在用的代碼，第一次載入時自動補進清單，
  // 方便代碼下拉選單一開始就有東西可選（之後可在管理面板裡編輯／停用）。
  var knownScheduleCodes = ['hs128', 'TailorMed', 'fp-deco', 'DGHM LLC', 'senway', '行政事務', 'DGHM'];

  function newId() {
    return 'project-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function readRaw() {
    try {
      var saved = JSON.parse(localStorage.getItem(PROJECTS_KEY) || 'null');
      if (Array.isArray(saved) && saved.length) return saved;
    } catch (error) {}
    try {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(sampleProjects));
    } catch (error) {}
    return sampleProjects.slice();
  }

  function writeRaw(list) {
    try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(list)); } catch (error) {}
  }

  function notifyListChange(list) {
    global.dispatchEvent(new CustomEvent('dghm:projects-change', { detail: { projects: list } }));
  }

  function ensureSeeded(list) {
    var seeded;
    try { seeded = localStorage.getItem(SEED_V2_KEY); } catch (error) { seeded = '1'; }
    if (seeded) return list;

    var existingCodes = list.map(function (p) { return p.projectCode; });
    var added = false;
    knownScheduleCodes.forEach(function (code, i) {
      if (existingCodes.indexOf(code) !== -1) return;
      list.push({
        id: newId(),
        clientName: code,
        projectName: '',
        projectCode: code,
        status: '執行中',
        nextAction: '',
        startDate: '',
        dueDate: '',
        color: 'series-' + (((list.length + i) % 8) + 1),
        active: true,
      });
      added = true;
    });
    if (added) writeRaw(list);
    try { localStorage.setItem(SEED_V2_KEY, '1'); } catch (error) {}
    return list;
  }

  function readProjects() {
    return ensureSeeded(readRaw());
  }

  function listActive() {
    return readProjects().filter(function (p) { return p.active !== false; });
  }

  function getCurrentId() {
    try {
      return localStorage.getItem(CURRENT_KEY) || '';
    } catch (error) {
      return '';
    }
  }

  function getCurrent() {
    var currentId = getCurrentId();
    return readProjects().find(function (project) {
      return project.id === currentId;
    }) || null;
  }

  function setCurrent(id) {
    try {
      if (id) localStorage.setItem(CURRENT_KEY, id);
      else localStorage.removeItem(CURRENT_KEY);
    } catch (error) {}
    global.dispatchEvent(new CustomEvent('dghm:project-change', {
      detail: { project: getCurrent() },
    }));
  }

  function addProject(input) {
    input = input || {};
    var list = readProjects();
    var code = String(input.projectCode || '').trim();
    if (!code) throw new Error('projectCode 不可空白');
    if (list.some(function (p) { return p.projectCode === code; })) {
      throw new Error('已經有相同代碼的專案了：' + code);
    }
    var record = {
      id: newId(),
      clientName: input.clientName || code,
      projectName: input.projectName || '',
      projectCode: code,
      status: input.status || '執行中',
      nextAction: input.nextAction || '',
      startDate: input.startDate || '',
      dueDate: input.dueDate || '',
      color: input.color || 'series-1',
      active: input.active !== false,
    };
    list.push(record);
    writeRaw(list);
    notifyListChange(list);
    return record;
  }

  function updateProject(id, patch) {
    var list = readProjects();
    var idx = list.findIndex(function (p) { return p.id === id; });
    if (idx === -1) return null;
    list[idx] = Object.assign({}, list[idx], patch);
    writeRaw(list);
    notifyListChange(list);
    return list[idx];
  }

  function removeProject(id) {
    var list = readProjects().filter(function (p) { return p.id !== id; });
    writeRaw(list);
    if (getCurrentId() === id) setCurrent('');
    notifyListChange(list);
  }

  global.DGHMProjects = {
    list: readProjects,
    listActive: listActive,
    getCurrent: getCurrent,
    getCurrentId: getCurrentId,
    setCurrent: setCurrent,
    add: addProject,
    update: updateProject,
    remove: removeProject,
  };
})(window);
