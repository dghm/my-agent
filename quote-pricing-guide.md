# Airtable + Interface 報價研擬指南

> 適用情境：已完成 Airtable 資料庫建置，接續做 Interface（單一操作角色、無 Dashboard、L2 層級）

## 核心原則

報價不是「做幾個頁面」，而是「解決哪些營運痛點 + 交付哪些可驗收成果」。

---

## Step 1：先定範圍（避免後續爆 scope）

先用三欄寫清楚：

- **In Scope**：這次一定做
- **Out of Scope**：這次不做
- **Assumptions**：估價前提條件

### 建議前提（可直接複用）

- 單一操作角色（暫不做多角色權限）
- Interface 層級到 L2
- CRM 含 4 個 Table（例如 Quotations / Partners / Contacts / ATTNs）
- 每個 Table 都有：`List + Detail (Editable) + Add New`
- 不含決策 Dashboard

---

## Step 2：模組化拆工（客戶看得懂、你也好控管）

建議固定拆為以下工項：

1. 需求釐清與流程盤點
2. Interface IA/導覽與入口頁規劃（Overview）
3. Table A~D：List 頁面建置
4. Table A~D：Detail（Editable）頁面建置
5. Table A~D：Add New 表單建置
6. 跨表關聯邏輯與欄位驗證規則
7. 測試與修正（UAT）
8. 上線與教育訓練

> 補充：通常 **Quotations** 會是最高複雜度，建議獨立列工項，避免被平均稀釋工時。

---

## Step 3：三段式估時（降低估價風險）

每個工項都給三段：

- **樂觀**：資料齊全、客戶決策快
- **一般**：正常協作情境
- **保守**：需求反覆、資料不齊、回饋延遲

### 建議報價方式

- 對外報價採「一般值 + 10%~20% 風險緩衝」
- 或直接給區間（最低～最高）

---

## Step 4：金額呈現採「套餐 + 區間」

不要只丟單一總價，建議至少三層：

- **Base**：可上線最小版本
- **Standard**：含較完整欄位驗證與優化
- **Advanced**：含額外調整輪次/訓練加場/優化

這樣客戶容易比較，也不會只盯最低價。

---

## Step 5：先寫清楚「變更如何計價」

以下項目建議在報價單列為變更單（追加）：

- 新增角色與權限邏輯
- 新增 Table / 新增 Interface 頁面
- 大量歷史資料清洗與重整
- 新增流程節點（審核、通知、例外處理）
- 超過約定修正輪次

---

## Step 6：報價文件至少要有這 5 區

1. 專案目標與痛點
2. 範圍與交付清單（In/Out）
3. 時程與里程碑
4. 金額與付款條件
5. 風險與不含項目

---

## 可直接貼給客戶的報價骨架（範本）

```md
# [專案名稱] Airtable Interface 報價草案

## 1. 專案目標
- 解決目前 [痛點A / 痛點B / 痛點C]
- 建立可維護的 Interface 作業流程（L2）

## 2. 本次範圍（In Scope）
- Table: Quotations / Partners / Contacts / ATTNs
- 每個 Table：List + Detail(Editable) + Add New
- 單一操作角色
- 不含 Dashboard

## 3. 不含項目（Out of Scope）
- 多角色權限管理
- 進階 BI / Dashboard
- 舊資料大量清洗與遷移（超過約定量）

## 4. 工項與工時估算（一般情境）
- 需求釐清：X hr
- IA 與導覽：X hr
- Quotations（List/Detail/Add New）：X hr
- Partners（List/Detail/Add New）：X hr
- Contacts（List/Detail/Add New）：X hr
- ATTNs（List/Detail/Add New）：X hr
- 測試與修正：X hr
- 上線與訓練：X hr
- 合計：X hr

## 5. 金額
- 方案 A（Base）：TWD XXX,XXX
- 方案 B（Standard）：TWD XXX,XXX
- 方案 C（Advanced）：TWD XXX,XXX

## 6. 里程碑與付款
- 40%：啟動與需求確認
- 40%：主要功能完成並進入 UAT
- 20%：正式上線與交付

## 7. 風險與備註
- 若新增角色權限、流程節點、欄位邏輯，將以變更單另行報價
- 客戶需於每階段驗收後 X 工作天內回饋
```

---

## 實務建議

- 先快出一版「可討論草案」，不要一開始追求精準到小數點
- 第二輪再根據客戶回覆修正範圍與工時
- 每次會議後立刻更新 `In/Out`，避免認知漂移

