// ============================================================
// config.js — 每個專案「只改這裡」的設定
// ------------------------------------------------------------
// auth.js 與 providers.js 保持不動；換專案時調整下面這些即可。
// ============================================================

export const CONFIG = {
  // 這個專案要啟用哪些 provider（對應 providers.js 的 key）
  // 例：只用 Google + LINE → ['google', 'line']
  enabledProviders: ['google', 'line'],

  // 登入成功後預設導向的頁面
  defaultRedirect: '/',

  // 登入頁（授權失敗、未授權、取消都會導回這裡，並帶 ?error=）
  loginPage: '/login.html',

  // 會員資料存放的 Netlify Blobs 儲存區名稱
  memberStore: 'members',

  // ── 第 ③ 層：授權插槽 ────────────────────────────────────
  // 每次「認證成功」後呼叫一次，決定「能不能進、進哪裡」。
  //   參數 member：{ id, provider, providerId, email, name, avatar, ... }
  //   回傳：{ allow, redirect, session? }
  //     allow    — false 則不發登入 cookie，導回 loginPage?error=unauthorized
  //     redirect — 放行後導向的網址（省略則用 defaultRedirect）
  //     session  — 選用，額外寫進登入 cookie 的欄位（如 { tenantId, role }）
  //
  // 預設：全部放行。要做「客戶對應 / 角色」把這裡換成查授權表即可（見 README）。
  async authorize(member) {
    return { allow: true, redirect: CONFIG.defaultRedirect };
  },
};
