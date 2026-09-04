(function (global) {
  'use strict';

  /* ============================================================
     導覽資料 — 以「功能類別」為主軸
     每個群組是側邊選單裡的一個可折疊區塊。
     status: 'integrated'（已套用新版外框）｜'legacy'（待升級）｜'planned'（尚未開發）
     keywords: 側欄搜尋用的別名，涵蓋口語稱呼與英文（例如「請款」找得到「應收帳款通知」）
     ============================================================ */
  var groups = [
    {
      id: 'workspace',
      label: '工作台',
      icon: 'home',
      description: '本週工作、目前案件與快速入口',
      defaultTool: 'home',
      tools: [
        { id: 'home',     label: '總覽',       href: 'index.html',         status: 'integrated', keywords: ['首頁','總覽','dashboard'] },
        { id: 'schedule', label: '週工作排程', href: 'work-schedule.html', status: 'integrated', keywords: ['排程','行事曆','工作比例'] },
        { id: 'todo',     label: 'Clear 待辦', href: 'clear-todo.html',    status: 'legacy', keywords: ['待辦','todo','清單'] },
      ],
    },
    {
      id: 'clients',
      label: '案件與溝通',
      icon: 'briefcase',
      description: '從初談、需求整理到執行會議',
      defaultTool: 'brief',
      tools: [
        { id: 'brief',    label: '客戶 Brief', href: 'client-brief.html',  status: 'integrated', keywords: ['訪談','需求','brief','初談'] },
        { id: 'meetings', label: '會議記錄',   href: 'meeting-notes.html', status: 'legacy', keywords: ['會議','紀錄','meeting','notes'] },
      ],
    },
    {
      id: 'business',
      label: '商務文件',
      icon: 'receipt',
      description: '報價、合約、分期請款與收入追蹤',
      defaultTool: 'quote',
      tools: [
        { id: 'quote',    label: '服務報價單',   href: 'Quote-Generator.html',    status: 'integrated', keywords: ['報價','報價單','quote','估價'] },
        { id: 'contract', label: '合約文件',     href: 'Contract-Generator.html', status: 'integrated', keywords: ['合約','契約','contract'] },
        { id: 'invoice',  label: '應收帳款通知', href: 'Invoice-Generator.html',  status: 'integrated', keywords: ['請款','請款單','發票','invoice','應收'] },
        { id: 'income',   label: '收入登記',     href: 'income-tracker.html',     status: 'legacy', keywords: ['收入','收款','對帳','記帳','報稅'] },
      ],
    },
    {
      id: 'delivery',
      label: '交付文件',
      icon: 'file-check',
      description: '專案資產、操作手冊與驗收準備',
      defaultTool: 'design-system',
      tools: [
        { id: 'design-system', label: '客戶設計系統',    href: 'design-system.html',              status: 'integrated', keywords: ['設計系統','design system','tokens'] },
        { id: 'style',         label: 'Style Guideline', href: 'brand-guideline-generator.html',  status: 'legacy', keywords: ['品牌','指南','style','guideline','ci'] },
        { id: 'guide',         label: 'User Guide 骨架', href: 'user-guide-generator.html',       status: 'legacy', keywords: ['手冊','操作','user guide','sop','教學'] },
        { id: 'uat',           label: 'UAT 問答與 JSON', href: '',                                status: 'planned', keywords: ['驗收','uat','測試'] },
      ],
    },
    {
      id: 'ai',
      label: 'AI 生成',
      icon: 'sparkles',
      description: 'Skill 套件與 AI 內容產生器',
      defaultTool: 'skills',
      tools: [
        { id: 'skills',   label: 'AI Skill 總覽',     href: 'skill-toolbox.html',                  status: 'integrated', keywords: ['skill','技能','ai','套件'] },
        { id: 'social',   label: '社群文案',           href: 'social-ui.html',                      status: 'legacy', keywords: ['社群','貼文','文案','facebook','post'] },
        { id: 'sections', label: 'Breakdance Section', href: 'breakdance-section-generator.html',   status: 'legacy', keywords: ['版型','section','breakdance','wireframe','區塊'] },
      ],
    },
    {
      id: 'aux',
      label: '輔助工具',
      icon: 'qr',
      description: '低頻但隨時可用的分享工具',
      defaultTool: 'qr',
      tools: [
        { id: 'qr', label: 'QR Code',      href: 'qr-generator.html',  status: 'legacy', keywords: ['qr','條碼','二維碼'] },
        { id: 'h5', label: '微信 H5 名片', href: 'wechat-h5-card.html', status: 'legacy', keywords: ['微信','名片','wechat','h5','card'] },
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

  /** 群組中第一個可開啟的工具，供收合狀態下點擊群組圖示使用。 */
  function firstAvailableTool(group) {
    for (var i = 0; i < group.tools.length; i += 1) {
      if (group.tools[i].href) return group.tools[i];
    }
    return null;
  }

  global.DGHMToolRegistry = {
    groups: groups,
    findTool: findTool,
    firstAvailableTool: firstAvailableTool,
  };
})(window);
