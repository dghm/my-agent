(function (global) {
  'use strict';

  var groups = [
    {
      id: 'home',
      label: '首頁',
      icon: 'home',
      description: '本週工作、目前案件與快速入口',
      defaultTool: 'home',
      tools: [
        { id: 'home', label: '工作台總覽', href: 'index.html', status: 'integrated' },
        { id: 'skills', label: 'AI Skill 總覽', href: 'skill-toolbox.html', status: 'integrated' },
      ],
    },
    {
      id: 'work',
      label: '本週工作',
      icon: 'calendar',
      description: '安排本週工作比例與日常待辦',
      defaultTool: 'schedule',
      tools: [
        { id: 'schedule', label: '週工作排程', href: 'work-schedule.html', status: 'integrated' },
        { id: 'todo', label: 'Clear 待辦', href: 'clear-todo.html', status: 'legacy' },
      ],
    },
    {
      id: 'projects',
      label: '客戶案件',
      icon: 'briefcase',
      description: '從初談、需求整理到執行會議',
      defaultTool: 'brief',
      tools: [
        { id: 'brief', label: '客戶 Brief', href: 'client-brief.html', status: 'integrated' },
        { id: 'meetings', label: '會議記錄', href: 'meeting-notes.html', status: 'legacy' },
      ],
    },
    {
      id: 'finance',
      label: '商務財務',
      icon: 'receipt',
      description: '報價、分期請款與收入追蹤',
      defaultTool: 'quote',
      tools: [
        { id: 'quote', label: '服務報價單', href: 'Quote-Generator.html', status: 'integrated' },
        { id: 'contract', label: '合約文件', href: 'Contract-Generator.html', status: 'integrated' },
        { id: 'invoice', label: '應收帳款通知', href: 'Invoice-Generator.html', status: 'integrated' },
        { id: 'allowance', label: '折讓單', href: 'Allowance-Generator.html', status: 'integrated' },
        { id: 'income', label: '收入登記', href: 'income-tracker.html', status: 'legacy' },
      ],
    },
    {
      id: 'delivery',
      label: '文件與驗收',
      icon: 'file-check',
      description: '專案資產、操作手冊與驗收準備',
      defaultTool: 'style',
      tools: [
        { id: 'style', label: 'Style Guideline', href: 'brand-guideline-generator.html', status: 'legacy' },
        { id: 'guide', label: 'User Guide 骨架', href: 'user-guide-generator.html', status: 'legacy' },
        { id: 'uat', label: 'UAT 問答與 JSON', href: '', status: 'planned' },
      ],
    },
    {
      id: 'auxiliary',
      label: '輔助工具',
      icon: 'sparkles',
      description: '低頻但隨時可用的分享工具',
      defaultTool: 'h5',
      tools: [
        { id: 'h5', label: '微信 H5 名片', href: 'wechat-h5-card.html', status: 'legacy' },
        { id: 'qr', label: 'QR Code', href: 'qr-generator.html', status: 'legacy' },
      ],
    },
  ];

  function findTool(toolId) {
    for (var i = 0; i < groups.length; i += 1) {
      for (var j = 0; j < groups[i].tools.length; j += 1) {
        if (groups[i].tools[j].id === toolId) {
          return { group: groups[i], tool: groups[i].tools[j] };
        }
      }
    }
    return null;
  }

  global.DGHMToolRegistry = {
    groups: groups,
    findTool: findTool,
  };
})(window);
