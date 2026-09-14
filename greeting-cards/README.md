# DGHM 電子賀卡

電子賀卡的管理端已納入 `my-agent`，公開卡片則獨立部署到 `https://cards.dghm.tw/`。

## 邊界

- `../greeting-cards.html`：公司內部管理入口，使用 my-agent app shell。
- `cards/`：公開賀卡原始檔；每張卡保有獨立視覺與動畫。
- `shared/`：跨賀卡共用的基礎能力。
- `data/cards.json`：管理端賀卡清單的唯一資料來源。
- `fixtures/personalized-sample.json`：僅供後續個人化功能開發使用的虛構 fixture，不得替換為真實客戶名單後公開部署。
- `public-root/.htaccess`：Bluehost／Apache 的 HTTPS 與永久短網址規則。

## 發布原則

`cards.dghm.tw` 的部署只應包含公開賀卡、`shared/` 及 `public-root/` 中的網站設定。管理頁、fixture 與未來的客戶名單不可部署至公開站。

已發布路徑視為永久資產；例如 `/2026/mid-autumn/` 與短網址 `/m26` 不得重新分配或破壞。
