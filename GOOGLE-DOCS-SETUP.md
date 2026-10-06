# 報價單直接建立 Google 文件

在報價工具按「建立 Google 文件」，會從目前草稿直接建立 Google Docs 原生段落與表格，並提供可開啟的文件連結。文件屬於登入的 Google 帳號，每次點擊建立一份新文件；不會自動分享給客戶。

## 首次設定

1. 在現有 Google 登入使用的 Google Cloud 專案啟用 **Google Docs API**（`docs.googleapis.com`）。
2. 在 Google Auth Platform 的 Data Access 設定加入 `https://www.googleapis.com/auth/drive.file`。此權限只存取本工具建立或使用者交給本工具的檔案，不要求整個 Drive 的存取權限。
3. 沿用 Netlify 的 `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`、`SESSION_SECRET` 與現有 `/api/auth/callback/google` 回呼網址，不需要新建 OAuth client。
4. 部署後從網站開啟報價工具。首次匯出若顯示尚未授權，點「授權 Google 文件」，選擇帳號並同意文件權限。原有日曆授權會一併保留。
5. 授權後返回報價工具，再按「建立 Google 文件」。授權前目前草稿會存在本機，返回時沿用既有草稿恢復流程。

如果 OAuth 專案處於測試模式，使用的帳號須在 Google 設定的測試使用者名單內。Google 同意畫面的 scope 選擇若未勾選文件權限，需再授權一次。

## 文件版型

- 原生 A4 直式文件、固定表格欄寬、深藍表頭、橘色段落標題與 Noto Sans TC 字型。
- 報價說明／計價／方案表、總計稅額、付款條件與時程均為可編輯表格。
- 保留編輯器依頁碼排列的內容順序；頁碼不作為固定頁高限制，Google Docs 自然分頁。
- 不含項目與配合事項採單欄清單；表頭跨頁重複，長文字不會被 A4 固定高度裁切。
- 簽署區保留為表格。PDF 的背景 Banner、固定頁尾與雙欄條款不逐像素複製，避免在 Google Docs 編輯後跑版。
- 文件建立中若失敗，介面提供已建立的未完成文件連結，方便查看或自行刪除。

## 本機與驗證

`file://` 只能使用原有離線編輯與下載功能。Google 匯出需透過同網域的 Netlify Functions，可用 `npx netlify dev` 或部署後的網站。

程式驗證：`node --test tests/quote-docs.test.js`。這些測試使用模擬 Google API，不會產生遠端文件。實際 Google API 與視覺驗證需完成上述設定及帳號授權。

## 參考

- [Google Docs API 建立文件](https://developers.google.com/workspace/docs/api/reference/rest/v1/documents/create)
- [Google Docs API 原生表格](https://developers.google.com/workspace/docs/api/how-tos/tables)
- [Drive 每檔案授權範圍](https://developers.google.com/workspace/drive/api/guides/api-specific-auth)
