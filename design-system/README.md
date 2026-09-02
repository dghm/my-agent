# 客戶設計系統 Design Systems

各客戶的 Design System，每個客戶一個資料夾（例如 `10.meyi-global/`），內含 tokens、components、guidelines、UI kits 與 `_ds_manifest.json`。多由 Claude Code 產生。

## 在工作台中的位置

**`../design-system.html`** — 掛在工作台「文件與驗收」群組下，與其他工具一樣有側邊導覽。整份索引是**單一頁面**：

- 儀表板：每個客戶一張資訊卡（品牌深色底上的 Logo、品牌色標、元件／卡片數量與品牌字體）。
- 點卡片後，該客戶的 brand / colors / type / spacing / components 卡片縮圖、UI kit 入口、快速連結與搜尋框，會**就地換到右側工作區**，左側兩欄選單不會重載；網址以 `#<客戶資料夾>` 記錄位置，可直接分享或重新整理。

這是產生出來的檔案，**不要手動編輯**。

## 更新索引

新增或修改客戶資料夾後，在 repo 根目錄執行：

```bash
node design-system/scripts/build-index.mjs
```

腳本會掃描 `design-system/` 下所有含 `_ds_manifest.json` 的資料夾，讀取 manifest 的 tokens / cards / startingPoints 與 readme 標題，並自動從 `assets/`（或 `uploads/`）挑選 Logo。

Logo 挑選規則：完整 Logo 優先於單獨 Mark；深色底變體（檔名含 `white` / `light` / `inverse` / `dark`）優先，因為卡片面板是品牌深色；中文版（`zhtw`）優先於英文版。

## 新增客戶

1. 在 `design-system/` 建立資料夾（沿用 `NN.client-name` 編號慣例）。
2. 由 Claude Code 產生設計系統，確保資料夾內有 `_ds_manifest.json`；Logo 放 `assets/`。
3. 執行上面的指令，儀表板與詳細頁即自動產生。

## 離線／給客戶的單檔版本

```bash
node design-system/scripts/build-standalone.mjs design-system/dist/preview.html
```

把整份索引（含 CSS、元件 bundle、JSX、Logo）打包成單一 HTML，不需伺服器即可開啟，可直接寄給客戶。輸出在 `design-system/dist/`，未納入版控。

## 其他腳本

- `scripts/_gen-colors.mjs` — 一次性工具，將各客戶的 Colors 區重建為六張統一的色票卡。

---

原始出處：`dghm/claude-design-system`（已於整併後封存）。
