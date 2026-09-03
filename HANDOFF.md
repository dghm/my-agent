# my-agent 工作交接

更新日期：2026 年 8 月 3 日  
專案路徑：`/Users/arieshsieh/Desktop/projects/my-agent`  
目前分支：`agent/phase-1-workspace`

## 交接目的

這份文件供另一台電腦接續 `my-agent` 的介面改版、工具整合與 AI Skill 工作台開發。專案資料已透過 iCloud 同步，但開始工作前仍應先核對 Git 狀態，不要直接 pull、reset 或切換分支，以免覆蓋尚未推送的本機 commit。

## 目前 Git 狀態

撰寫本文件前的狀態：

```text
branch: agent/phase-1-workspace
tracking: origin/agent/phase-1-workspace
status: ahead 3 commits

710ec6e Align invoice generator UI with quote workspace
78f1706 Refine quote editor controls
6024a16 Merge pull request #7 from dghm/agent/phase-1-workspace
```

遠端狀態摘要：

- `origin/main`：`1662bc5 Align invoice generator UI with quote workspace`
- `origin/agent/phase-1-workspace`：`66a10fe Use two-column Skill workspace`
- 本機 `agent/phase-1-workspace`：`710ec6e Align invoice generator UI with quote workspace`

工作目錄另有兩個與功能無關的 macOS 檔案：

```text
M  .DS_Store
?? auth-core/.DS_Store
```

不要把這兩個 `.DS_Store` 納入功能 commit，也不要為了清理它們執行破壞性的 Git 指令。

> 注意：建立本文件後，`HANDOFF.md` 也會成為新的未追蹤檔案，除非後續決定將它提交。

## 產品定位與已確認方向

`my-agent` 是 DGHM 萬能數維有限公司的一人公司內部工作台，以桌面電腦使用為主。現階段重點是把分散的工具依日常工作流程整理起來，不急著建立多人 SaaS、完整手機版或大型專案管理系統。

已確認的三欄介面：

1. 左側窄欄：主要功能群組，以 icon 表現。
2. 第二欄：目前群組的子功能選單。
3. 中央區域：實際操作工具。

不使用 iframe。各工具仍是獨立 HTML 頁面，由共用 App Shell 包起來。

## 已完成項目

### 1. 共用工作台殼層

主要檔案：

- `app-shell.js`
- `app-shell.css`
- `tool-registry.js`
- `project-context.js`
- `dghm-ui.js`
- `dghm-ui.css`

功能包括：

- 三欄式桌面工作台。
- 六個主要群組與第二欄子選單。
- 亮色／深色模式。
- 目前案件切換。
- 目前案件資料暫存於瀏覽器 `localStorage`。
- 工具狀態區分為 `integrated`、`legacy`、`planned`。

目前案件只是模擬資料，共有：

- 昇威包裝／官方網站改版
- TailorMed／品牌網站與預約流程
- DGHM／my-agent 工作台

`project-context.js` 是未來改接 Airtable 或其他資料來源時的轉接層。

### 2. 已整合進工作台的工具

- `index.html`：工作台總覽。
- `work-schedule.html`：週工作排程。
- `client-brief.html`：客戶 Brief，會依目前案件預填部分資料。
- `skill-toolbox.html`：AI Skill 總覽。
- `Quote-Generator.html`：服務報價單。
- `Invoice-Generator.html`：應收帳款通知。

其他工具仍標示為舊版；UAT 問答與 JSON 仍是規劃中。

### 3. AI Skill 總覽 MVP

主要檔案：

- `skill-toolbox.html`
- `skill-overview.js`
- `skill-overview.css`
- `netlify/functions/skills.js`

目前能力：

- 從本機選擇多個 `.skill` 檔。
- 在瀏覽器端解析 `.skill` ZIP 套件，不需先上傳。
- 尋找並讀取套件內的 `SKILL.md`。
- 解析 YAML frontmatter 的 `name`、`description`。
- 顯示用途、使用時機、輸出結果、來源格式／平台推測。
- 顯示套件檔案清單與原始 `SKILL.md`。
- 限制單一解壓檔案 20 MB、總解壓大小 50 MB。
- 不支援加密 ZIP 與非 Store／Deflate 壓縮方式。
- 支援 Netlify Blobs 保存、下載與刪除 Skill 套件。

Netlify Skill API：

```text
GET  /api/skills/list
POST /api/skills/upload
GET  /api/skills/download?id=...
POST /api/skills/delete
```

本機用一般靜態伺服器預覽時，Skill 的「本機解析」可使用，但 Netlify Blobs 保存功能不可用；需在 Netlify Functions 環境測試雲端保存。

原始測試 Skill 曾位於：

```text
/Users/arieshsieh/Desktop/quote-step1-md.skill
```

該檔不在 repository 中；需要確認它也已透過 iCloud 同步到另一台電腦。

### 4. 報價與 Invoice 介面

`Quote-Generator.html` 已整合 App Shell，並完成較寬的編輯／預覽工作區與控制項整理。

`Invoice-Generator.html` 已比照報價工具整合 App Shell；最新本機 commit 為：

```text
710ec6e Align invoice generator UI with quote workspace
```

## 目前功能群組

以 `tool-registry.js` 為準：

```text
首頁
├── 工作台總覽
└── AI Skill 總覽

本週工作
├── 週工作排程
└── Clear 待辦（舊版）

客戶案件
├── 客戶 Brief
└── 會議記錄（舊版）

商務財務
├── 服務報價單
├── 應收帳款通知
└── 收入登記（舊版）

文件與驗收
├── Style Guideline（舊版）
├── User Guide 骨架（舊版）
└── UAT 問答與 JSON（規劃中）

輔助工具
├── 微信 H5 名片（舊版）
└── QR Code（舊版）
```

## 已知問題與待決事項

### 優先處理

1. **右上角登入入口應移除**
   - 使用者已確認目前沒有登入需求。
   - `app-shell.js` 仍包含 `/api/auth/me`、`login.html` 與 `/api/auth/logout` 的 UI 邏輯。
   - `auth-core/` 是既有 OAuth 實驗模組，不代表目前產品需要登入。
   - Phase 1 應維持單人內部工具，不要求帳號驗證。

2. **目前案件名稱與空狀態**
   - 已討論可將「目前案件」改成較自然的「目前專案」。
   - 應提供「一般工作／尚未指定專案」。
   - 週排程、AI Skill 總覽等公司層級功能不應強迫綁定案件。
   - 報價、Invoice、會議、操作手冊、UAT 才需要較明確的專案情境。

3. **Git 分支需要整理**
   - 本機分支相對 `origin/agent/phase-1-workspace` ahead 3。
   - `origin/main` 已有與最新 Invoice commit 同內容但不同 commit id 的提交。
   - 在另一台電腦開始 merge、rebase 或 push 前，先畫清楚 commit graph；不要直接 pull。

### 後續產品方向

- Airtable 暫不急著接；目前專案切換仍使用 `localStorage` 模擬資料。
- 手機 RWD 不是當前優先級，先維持桌面工具體驗。
- UAT 工具預計以問答方式研擬驗收項目，最後輸出 JSON。
- H5 名片與 QR Code 屬於輔助功能，不放入日常主流程。
- Style Guideline 是客戶專案設計資產，不是正式交付流程的必要步驟。
- AI Skill 單元先維持 MVP：匯入、閱讀、理解；暫不做 Skill 編輯器、AI API 執行、跨平台轉換或複雜版本管理。

## 在另一台電腦開始工作

### 1. 確認同步結果

```bash
cd /Users/arieshsieh/Desktop/projects/my-agent
pwd
git status --short --branch
git branch --show-current
git log --oneline --decorate --graph --all -12
```

預期目前分支為：

```text
agent/phase-1-workspace
```

如果路徑、分支或 commit 不一致，先停下來比較 iCloud 與 Git 現況，不要執行 `git reset --hard`、`git checkout --` 或直接 pull。

### 2. 安裝 Node 依賴

若 `node_modules` 沒有同步或無法使用：

```bash
npm install
```

主要依賴：

- `@anthropic-ai/sdk`
- `@netlify/blobs`
- `@tavily/core`
- `dotenv`

### 3. 啟動靜態本機預覽

在專案根目錄執行：

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

瀏覽：

```text
http://127.0.0.1:8765/index.html
```

如果 8765 已被占用，可改用其他 port。

### 4. 建議的基本驗證

- 首頁、週工作排程、客戶 Brief 可正常切換。
- 左側群組與第二欄 active 狀態正確。
- 目前案件切換可跨頁保留。
- 亮色／深色模式可切換。
- `Quote-Generator.html` 編輯與預覽正常。
- `Invoice-Generator.html` 編輯與預覽正常。
- `skill-toolbox.html` 可匯入 `quote-step1-md.skill`。
- Skill 摘要、檔案清單與原始 `SKILL.md` 可顯示。
- 瀏覽器 console 沒有新的 JavaScript error。

## iCloud 同步注意事項

iCloud 主要同步檔案；以下狀態不能假設會完整延續：

- 瀏覽器 `localStorage` 中的目前案件與主題選擇。
- 瀏覽器分頁與登入狀態。
- 正在執行的 `python3 -m http.server` process。
- Netlify 本機開發環境與環境變數。
- 未在 repository 內的桌面測試檔，例如 `quote-step1-md.skill`。
- `node_modules` 的可用性。

若 iCloud 同步 `.git` 目錄時兩台電腦曾同時改動，Git metadata 也可能出現衝突。因此另一台電腦開始工作後，先以 `git status`、`git log` 和實際檔案內容為準。

## 給下一個 Codex Session 的起始 Prompt

```text
請先閱讀 /Users/arieshsieh/Desktop/projects/my-agent/HANDOFF.md，接著只做唯讀檢查：確認 Git 分支、未提交檔案、最近 commit、tool-registry.js 與 app-shell.js 的現況。不要 pull、reset、rebase、commit 或 push。

確認交接狀態一致後，請先回報：
1. 目前所在分支與相對遠端狀態
2. 有哪些未提交檔案
3. Phase 1 已完成哪些工具整合
4. HANDOFF 中的已知問題是否仍存在

後續工作以桌面版 MVP 為原則，不擴張多人登入、完整手機 RWD、Airtable、AI API 或大型管理功能。保留使用者既有變更，不處理 .DS_Store。
```

