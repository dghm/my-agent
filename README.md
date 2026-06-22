# my-agent 功能總覽（繁中）

這份文件整理 `my-agent` 目前主要檔案的用途，方便快速了解「有什麼工具可以用、怎麼啟動」。

## 快速啟動

1. 安裝套件（首次）
   - `npm install`
2. 啟動 API Server（供前端工具呼叫）
   - `npm run social:server`
   - （等同 `npm run tools:server`）
3. 開啟 Dashboard（由你的靜態伺服器提供）
   - 例如：`http://localhost:8765/index.html`

## 主要檔案用途

- `index.html`
  - Dashboard 主頁（左側工具選單 + 右側預覽區）。
  - 可切換各工具頁面（客戶訪談、Section 生成、社群文案）或查看 CLI 工具資訊。

- `tool-api-server.js`
  - 本專案的 API 後端（Node.js HTTP server）。
  - 提供：
    - `GET /health`
    - `POST /api/social/generate`
    - `POST /api/sections/generate`
    - `GET /api/income/list`、`GET /api/income/summary`
    - `POST /api/income/create`、`POST /api/income/update`、`POST /api/income/delete`
  - 會讀 `.env` 的金鑰，並呼叫 AI / 子腳本處理任務。
  - 收入登記資料存放於 `data/income.json`（不進版控）。

- `client-brief.html`
  - 客戶網站需求訪談表單工具（可在 Dashboard 內使用）。
  - 功能包含：欄位填寫、草稿保存、Markdown 匯出、Markdown 匯入還原等。

- `income-tracker.html`
  - 接案收入登記系統前端。
  - 登記案件名稱、客戶、金額、發票號碼／開立日期、預計收款日、實際收款日，狀態（待開票／已開票待收／逾期未收／已收款）由日期欄位自動判斷，不需手動勾選。
  - 依年／月篩選彙整，支援匯出 CSV（報稅用）。
  - 「產生請款單」按鈕會帶資料開啟 `Invoice-Generator.html`（透過 URL 參數預填客戶／案件／金額／日期／發票號碼）。
  - 「匯入請款單 JSON」按鈕可讀取 `Invoice-Generator.html` 匯出的請款單 JSON，自動帶入案件、客戶、金額（項目加總）、發票號碼、開立日期、預計收款日，確認後按「儲存登記」即完成登記。
  - 資料透過 `tool-api-server.js` 的 `/api/income/*` 讀寫，存於 `data/income.json`。

- `breakdance-section-generator.html`
  - Breakdance Section 版型生成工作台（Wireframe 取向）。
  - 可設定專案資訊、Section 類型、版型數量，呼叫 `/api/sections/generate` 並顯示多版型預覽。

- `social-ui.html`
  - 社群文案工作台前端。
  - 輸入主題後呼叫 `/api/social/generate`，顯示並輸出社群貼文結果。

- `social-post-agent.js`
  - 社群貼文生成的 CLI Agent（可獨立從終端機執行）。
  - 結合 Anthropic + Tavily 搜尋，產生 Facebook 貼文（繁中）。
  - 預設輸出到 `../DMS/docs/BrandRize/socialPost/`。

- `research-agent.js`
  - 通用研究型 CLI Agent。
  - 對指定主題做搜尋與整理，輸出研究報告（繁中）。

- `quote.js`
  - Airtable / Interface 專案報價草案 CLI 工具。
  - 會先搜集資訊，再輸出結構化報價建議（含範圍、工時、金額、里程碑等）。

- `quote-pricing-guide.md`
  - 報價方法論與範本文件（非程式）。
  - 提供報價邏輯、範圍界定、可複用報價骨架。

- `.env`
  - 環境變數設定（API keys）。
  - 目前工具主要依賴：
    - `ANTHROPIC_API_KEY`
    - `TAVILY_API_KEY`

- `package.json`
  - 腳本與相依套件設定。
  - 常用 scripts：
    - `npm run social:server`（或 `npm run tools:server`）
    - `npm run social`
    - `npm run agent`
    - `npm run quote`

## 命名對照（目前）

- `tool-api-server.js`：統一 API 入口（前端頁面都呼叫它）
- `social-post-agent.js`：社群文案 CLI Agent
- `research-agent.js`：研究型 CLI Agent

## 備註

- `.tmp-social-output/`：暫存輸出檔位置（server 執行時產生）。
- `node_modules/`、`package-lock.json`：套件相關檔案，非工具功能邏輯本體。
