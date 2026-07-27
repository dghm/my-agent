(function (global) {
  'use strict';

  var PROJECTS_KEY = 'dghm-phase1-projects';
  var CURRENT_KEY = 'dghm-phase1-current-project';
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
    },
  ];

  function readProjects() {
    try {
      var saved = JSON.parse(localStorage.getItem(PROJECTS_KEY) || 'null');
      if (Array.isArray(saved) && saved.length) return saved;
    } catch (error) {}
    try {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(sampleProjects));
    } catch (error) {}
    return sampleProjects.slice();
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

  global.DGHMProjects = {
    list: readProjects,
    getCurrent: getCurrent,
    getCurrentId: getCurrentId,
    setCurrent: setCurrent,
  };
})(window);
