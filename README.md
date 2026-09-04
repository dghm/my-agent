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
  - Dashboard 主頁（工作台總覽）。
  - 顯示客戶案件流程 01–06 與快速入口，各卡片連往對應工具。

- `app-shell.css` / `app-shell.js` / `tool-registry.js`
  - 所有工具頁共用的外框：單一側邊選單（6 個類別群組、18 個工具）＋ 頂列。
  - 側欄支援搜尋（含口語別名，例如「請款」找得到「應收帳款通知」）、
    群組折疊（狀態記憶於 localStorage）、收合成 64px 圖示列。
  - 頁面掛載方式：`<body data-tool="工具 id">` ＋ `mountAppShell({ activeTool: '工具 id' })`，
    工具 id 定義於 `tool-registry.js`。
  - 目前已套用的頁面：`index`、`skill-toolbox`、`client-brief`、`design-system`、
    `work-schedule`、`Quote-Generator`、`Contract-Generator`、`Invoice-Generator`。
    其餘頁面（`income-tracker`、`meeting-notes`、`clear-todo`、`qr-generator`、
    `wechat-h5-card`、`user-guide-generator`、`brand-guideline-generator`、
    `social-ui`、`breakdance-section-generator`）尚未掛殼，側欄以橘色小圓點標示。

- `ui-proposal.html`
  - UI 整理提案原型（不影響實際頁面），內建「設計說明」面板記錄改動理由。

- `tool-api-server.js`
  - 本專案的 API 後端（Node.js HTTP server）。
  - 提供：
    - `GET /health`
    - `POST /api/social/generate`
    - `POST /api/sections/generate`
  - 會讀 `.env` 的金鑰，並呼叫 AI / 子腳本處理任務。
  - 接案收入登記的 API 已搬到 Netlify Functions（見下方），不再由這支 server 提供。

- `netlify/functions/income.js`
  - 接案收入登記系統的後端 API，以 Netlify Functions（v2，path-based routing）實作。
  - 路由：`/api/income/list`、`/api/income/summary`、`/api/income/create`、`/api/income/update`、`/api/income/delete`。
  - 資料存放於 Netlify Blobs（key-value 儲存，跟著網站走、不需要額外資料庫），**不會進入 git 版控**。
  - 本機測試：執行 `npx netlify dev`，會在 `http://localhost:8888` 同時跑靜態頁面與這支 Function。
  - 正式環境：推到 GitHub 後 Netlify 會自動部署 Function，跟靜態網站同網域、同 origin。

- `client-brief.html`
  - 客戶網站需求訪談表單工具（可在 Dashboard 內使用）。
  - 功能包含：欄位填寫、草稿保存、Markdown 匯出、Markdown 匯入還原等。

- `income-tracker.html`
  - 接案收入登記系統前端。
  - 登記案件名稱、客戶、專案代碼、期數、金額（未稅／含稅）、通知單號、發票號碼、付款條件與期限、收款／發票狀態，依年／月篩選彙整，支援匯出 CSV（報稅用）。
  - 「產生請款單」按鈕會帶資料開啟 `Invoice-Generator.html`（透過 URL 參數預填）。
  - 「匯入請款單 JSON」按鈕可讀取 `Invoice-Generator.html` 匯出的請款單 JSON，自動帶入案件、客戶、專案代碼、期數說明、金額（項目加總）、通知單號、發票號碼、開立日期、付款期限、付款條件，確認金額與狀態後按「儲存登記」即完成登記。
  - 資料透過 `netlify/functions/income.js` 的 `/api/income/*` 讀寫，存於 Netlify Blobs。
  - 儲存登記後可在「附件」區上傳請款單／發票掃描檔（單檔上限 10MB），附件附加於該筆收入登記紀錄，可點擊檢視或刪除，存於獨立的 Netlify Blobs store（`income-attachments`）。

- 預覽即時更新，不重載、不跳動
  - `Quote-Generator.html`、`Invoice-Generator.html`、`Contract-Generator.html`
    的右側 A4 預覽原本每次 `oninput` 都重新指派 `iframe.srcdoc`，等同整份
    重新載入，捲動位置會跳回最上方。
  - 改為 `applyOutput()` 內的 `paintPreview()`：首次渲染仍用 `srcdoc` 建立
    文件，之後輸入變動改為直接以 `DOMParser` 解析新內容、原地替換
    `iframe.contentDocument.body`，不重載頁面，捲動位置與焦點不受影響。
  - 連續輸入以 `refreshOutput()` 做 250ms 去抖動，停止打字後才重畫一次；
    複製、下載、預覽、列印等需要立即取得最新內容的操作改呼叫
    `flushOutput()`，跳過去抖動直接刷新。
  - 內容與上次相同時 `applyOutput()` 直接跳過，不做任何 DOM 操作。
  - 預覽文件本身不含 `<script>`，僅以 `innerHTML` 替換 body 不會遺漏行為；
    同源存取失敗時（少見的瀏覽器政策限制）退回原本的 `srcdoc` 寫法。

- 草稿 JSON 的格式辨識
  - 各工具的草稿都帶 `kind` 標記：`dghm-quote-draft`、`dghm-invoice-draft`、
    `dghm-contract-draft`。載入前以 `dghm-ui.js` 的 `checkDraftKind()` 驗證，
    載錯檔案會明確說明（例如「這是報價單草稿，不是請款單草稿」），
    而不是安靜地把表單清空又填不進東西。
  - 涵蓋報價單、請款單、合約的「載入草稿 JSON」與收入登記的「匯入請款單 JSON」。
  - 加上標記之前存的舊草稿沒有 `kind`，改以欄位結構判斷，仍可正常載入。

- 圖示內嵌
  - `Quote-Generator.html`、`Invoice-Generator.html`、`Contract-Generator.html`
    的工具列圖示原本以 CSS mask 從 cdn.jsdelivr.net 載入，網路不通時整排按鈕
    會變成空白方塊。現已改為內嵌 SVG sprite（每檔開頭的 `.icon-sprite`），
    以 `<svg class="action-icon"><use href="#i-名稱"></use></svg>` 引用。
  - 來源：lucide-static 0.552.0（6 個）與 remixicon 4.9.1（4 個）。
  - remixicon 是實心字形，以 `.action-icon.is-filled` 改為填色不描邊。
  - 動態切換圖示請用 `setActionIcon(元素, '名稱')`，建立新圖示用
    `actionIcon('名稱', 是否實心)`。
  - 三支檔案仍以 `@import` 從 Google Fonts 載入 K2D 與 Noto Sans TC；
    離線時會退回系統字型，版面不會壞掉但字體不同。

- 報價單 → 請款單交接
  - `Quote-Generator.html` 的「開立請款單 →」會列出付款條件裡的各期別，
    選定一期後把客戶名稱、地址、統一編號、聯絡人、電話、Email、專案名稱、
    專案代碼與該期金額，透過 localStorage 的 `dghm-quote-to-invoice`
    交給 `Invoice-Generator.html`。
  - 交接資料單次取用（讀取後即清除），超過 1 小時視為過期不套用。
  - 請款單編號與開立日期刻意留空，由開單時自行填寫。
  - 期別金額若寫成百分比（如「40%」）無法換算，金額欄會留空待補。
  - 付款條件固定帶入公司標準用語「收到發票後 5 個工作天內現金或匯款」，
    不會直接搬報價單付款卡片的「時點說明」文字過去——那一欄有時候會被
    拿來兼放驗收定義之類的補充說明（尤其金額不到 $24,000、不會另外簽
    合約時），整段搬過去會把驗收定義文字誤放到請款單的付款條件欄。
    這類補充說明留在報價單原地，需要的話請自行複製到請款單的「條款與
    說明」；少數 Net 30 客戶請在請款單上自行改掉付款條件文字。
  - 一次付清（只有一期）時，請款單項目改為把報價的計價表／勾選方案表
    逐列帶入，是實際的服務明細，不再是「一個項目、用期別名稱當項目
    名」。分期的話報價單沒有「這個項目算第幾期」的歸屬資料，沒把握就
    不猜，仍沿用整期一個項目的做法。
  - 同時帶入請款單「條款與說明」建議草稿（5 條）：開場白（公司／專案／
    報價單編號，分期時加註「本期為 XX（第 N 期／共 M 期）」）、付款
    指示（金額／時點／現金或匯款收尾公式）、匯款後回報末五碼提醒（固定
    加上，方便作業）、範圍聲明、疑義聯繫窗口。這些文字仍需開單時親自
    檢視並依實際情況調整（例如沒有報價單編號的案子），工具只負責帶好
    常態內容。「多期合併一次開立」這種特例不在模板範圍內，需要時仍要
    自行改寫開場白那條。

- `qr-generator.html`
  - 靜態 QR Code 產生器（完全離線，QR 編碼引擎內建於檔案中，不依賴外部服務或 CDN，產生的 QR Code 永不過期）。
  - 支援網址／文字、Wi-Fi、名片 vCard 三種內容，可調容錯等級（L/M/Q/H）、尺寸、顏色、留白，可加中央 LOGO（自動切換 H 容錯），下載 PNG／SVG 或複製圖片。

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
