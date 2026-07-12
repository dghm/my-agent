# auth-core — 第三方登入認證核心（可複用模組）

用 **Netlify Functions + Netlify Blobs** 實作的 Google / LINE / Facebook 登入。
設計成「**認證核心不動、每個專案只改設定**」，讓你在不同專案間重複使用。

## 這個模組包含什麼

```
auth-core/
├── functions/
│   ├── auth.js        ← 認證核心（第①層，不用改）
│   ├── providers.js   ← 各家 OAuth 供應商定義（要加一家才改）
│   └── config.js      ← 每個專案的設定 + 授權插槽（第③層）★改這裡
├── web/
│   └── login.html     ← 登入頁（改品牌與 ENABLED 陣列）
├── .env.example       ← 環境變數範本
└── README.md
```

三層架構：
- **① 認證**（`auth.js`）：OAuth 流程、session cookie、會員 upsert。共用、穩定。
- **② 設定**（`config.js` / `.env` / `login.html`）：啟用哪些 provider、憑證、導向、品牌。每專案換一次。
- **③ 授權**（`config.authorize`）：能不能進、進哪個頁面。預設全放行，要做客戶對應/角色時改這裡。

---

## 在新專案接上（3 步）

### 1. 放檔案
- `functions/*`（auth.js、providers.js、config.js）→ 複製到新專案的 **`netlify/functions/`**
- `web/login.html` → 複製到新專案的**網站根目錄**
- 確認 `package.json` 有相依 `@netlify/blobs`（`npm i @netlify/blobs`）
- `netlify.toml` 指定 functions 目錄：
  ```toml
  [functions]
    directory = "netlify/functions"
  ```

### 2. 設環境變數
複製 `.env.example` 內容，填入你這個專案的憑證（見下方各平台申請）。
本機放 `.env`；正式設在 Netlify 環境變數。**設完要重新部署**才生效。

### 3. 到各平台登記 callback URL
redirect URI 一律是：`https://你的網域/api/auth/callback/<provider>`

| Provider | 申請處 | Callback URL | 環境變數 |
|---|---|---|---|
| Google | Google Cloud Console → OAuth 用戶端 | `…/api/auth/callback/google` | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` |
| LINE | LINE Developers → LINE Login channel | `…/api/auth/callback/line` | `LINE_CHANNEL_ID` / `LINE_CHANNEL_SECRET` |
| Facebook | Meta for Developers → Facebook Login | `…/api/auth/callback/facebook` | `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` |

> 本機測試：`SITE_URL=http://localhost:8888`，並把該 localhost callback 也加進各平台。

---

## 啟用 / 關閉 provider

兩個地方要一致：
- `config.js` 的 `enabledProviders: ['google', 'line']`
- `login.html` 的 `var ENABLED = ['google', 'line']`

沒填憑證的 provider 不會被啟用（也不該放進上面陣列）。

---

## API（前端怎麼用）

| 路由 | 用途 |
|---|---|
| `GET /api/auth/login/:provider` | 開始登入（登入按鈕連這裡） |
| `GET /api/auth/callback/:provider` | 平台回呼（自動） |
| `GET /api/auth/me` | 查目前登入者，回 `{ user }` 或 `{ user: null }` |
| `GET /api/auth/logout` | 登出 |

**顯示登入狀態**（任何頁面）：
```js
fetch('/api/auth/me').then(r => r.json()).then(d => {
  if (d.user) { /* d.user = { uid, name, email, avatar, provider, ... } */ }
});
```

**保護頁面**（要登入才能看）——頁面頂端加：
```js
fetch('/api/auth/me').then(r => r.json()).then(d => {
  if (!d.user) location.href = '/login.html';
});
```
（前端導向是體驗，不是安全邊界；真正機密資料要在 Function 端也驗 cookie。）

---

## 第③層：授權（客戶對應 / 角色）

預設 `config.authorize` 全部放行。要做「哪個人進哪個 Dashboard」，把它換成查你的授權表：

```js
async authorize(member) {
  // member: { id, provider, providerId, email, name, avatar }
  const assignment = await lookupAssignment(member); // 你的對應表
  if (!assignment) return { allow: false };           // → 導回 login?error=unauthorized
  return {
    allow: true,
    redirect: assignment.dashboard,                   // 導到他的專屬頁
    session: { tenantId: assignment.tenantId, role: assignment.role }, // 寫進登入 cookie
  };
}
```

對應表**用 `provider + providerId` 當鍵**（Google/LINE 都適用；LINE 沒 email）。
之後 `/api/auth/me` 回傳的 `user` 就會帶 `tenantId`、`role`，頁面可據此分流。

---

## 會員資料

存在 Netlify Blobs，store 名稱由 `config.memberStore`（預設 `members`）指定，key `users` 是一個陣列：
```json
{ "id","provider","providerId","email","name","avatar","createdAt","lastLoginAt" }
```
- 跟著站台走、不進 git、換部署不消失、每站獨立。
- 量大或要複雜查詢時，把 `findOrCreateUser` 換成真的資料庫（如 Supabase）即可，其餘不動。

---

## 安全備忘
- `SESSION_SECRET` 每個專案不同、勿進 git。
- 登入 cookie 為 HttpOnly + SameSite=Lax，正式環境（HTTPS）自動加 Secure。
- OAuth 用 `state` 參數防 CSRF。
