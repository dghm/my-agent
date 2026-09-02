# DGHM 萬能數維 Digi-HandyMan — Design System

## 公司脈絡 Company Context

**萬能數維 Digi-HandyMan (DGHM)** 是一家物流業流程顧問與系統導入公司(Workflow Consulting & System Implementation for Logistics)。服務模式:「先診斷、再設計」— 深入客戶營運現場找出流程斷點,再以 Airtable / Make 等工具建置 CRM / OMS / FIN 系統、SOP 與自動化,最後交付訓練與操作手冊。

- 官網:https://dghm.tw/ (品牌調性與 UI 模式的主要來源)
- 聯絡:help@dghm.tw
- 服務:Process Audit & Consulting、Database System Implementation (Airtable)、SOP Design、Interface Design & Training、Business Automation (Make)
- 案例:TailorMed International Courier(CRM/OMS/FIN 三模組整合)、Compass Real Estate Team(StreetEasy lead 自動回覆)

素材來源:使用者提供之品牌色票、配色組合規範(圖)、印刷用色規範(圖)、Logo/Mark SVG 六式;官網 dghm.tw 文案。**未提供** Figma 或官網程式碼。

## CONTENT FUNDAMENTALS 內容原則

- **語言**:中英雙語品牌。官網以英文為主,行銷素材常中英混排。中文用繁體。
- **人稱**:「We / 我們」對「you / 你的團隊」— 顧問口吻,站在客戶身邊。
- **語氣**:直接、務實、反 buzzword。先講痛點再講解法。範例:
  - "Growing fast, but starting to break down?"
  - "We don't sell you tools. We sit with you, untangle the process, then build a system that actually runs."
  - 「先診斷・再設計,讓效率說話」「客製數位系統,從理解業務開始」
- **CTA 文案**:低壓力、免費起手 — "Book a Free Diagnosis"、"Book a free 30-minute process call. No prep needed."、「立即諮詢 →」箭頭常伴隨 CTA。
- **數據呈現**:具體量化重點放大,如「+38% 流程效率提升」。
- **Eyebrow 小標**:全大寫寬字距英文,如 "Service Process"、"What We Do"、"COMBO 01"。
- **不用 emoji**。

## VISUAL FOUNDATIONS 視覺基礎

- **色彩**:深海軍藍 #0D2F6E 為主色調基礎;暖橘 #E5622A 僅用於 CTA、數據標籤、重點強調(≤ 版面 15%);淡藍灰 #F4F7FB 做區塊底。四種配色組合見 `guidelines/color-combos.html`;Do/Don't 見 `guidelines/do-dont.html`。印刷一律用 CMYK/Pantone 對應(`guidelines/print-colors.html`)。
- **各媒材建議**:名片正面=深藍底白字、背面=白底深藍/橘字;提案封面=深藍+橘色線條、內頁=白/淡藍灰底;報告封面=深藍全版;Email banner=淡藍灰底+深藍標題。
- **字體**:K2D(品牌字,中英混排主體,300–800)+ Noto Sans TC(繁中備援)。皆取自 Google Fonts。標題深藍、800/700 重;內文 16px / 1.6;繁中長段落 1.8。
- **背景**:平色為主 — 白、淡藍灰、深藍區塊交替,無漸層、無紋理、無手繪插畫背景。
- **圓角**:按鈕/標籤 6px、卡片 10px、大區塊 16px、pill 999px。
- **陰影**:淺、冷色調(navy-tinted rgba),卡片 `--shadow-card`;避免厚重陰影。
- **邊框**:1px #E8ECF5;強調框用石板灰。
- **動效**:低調 — 150–250ms、standard easing、fade/color transition;無彈跳。
- **Hover**:橘 CTA → 深橘 #C04E1E;深藍 → 海軍藍 Light #1A4494;淺色元件 → 淡藍灰底。
- **透明/模糊**:不使用 glassmorphism;深藍底上的次要文字用白色 75–90% 不透明度。
- **影像**:官網以 SVG 插圖為主(未納入本系統,見下);冷色調。

## ICONOGRAPHY 圖標

- 官網使用自製 SVG 插圖(pain-1~3.svg、Services-01~06.svg、Case-01~03.svg 於 dghm.tw),**未取得原始檔,未複製**——需要時請向品牌方索取,勿以手繪 SVG 仿製。
- 無 icon font、無 emoji。介面圖標建議用 [Lucide](https://lucide.dev)(CDN),線性 stroke 風格與品牌的簡潔工程感相符 — **此為替代方案,請品牌方確認**。
- Logo/Mark 六式已入 `assets/`:中/英 × 標準三色/深色底,加 Mark 兩式。深色底一律用 `-dark` 版本。

## Intentional additions

- 元件組為標準組(無來源元件庫可依循):Button、Input、Select、Checkbox、Card、Tag、Stat、SectionHeader、PhaseStep — 皆對應官網實際出現的 UI 模式。

## Index

- `styles.css` — 全域入口(@import tokens)
- `tokens/` — fonts.css(Google Fonts)、colors.css(含 CMYK/Pantone 註記)、typography.css、spacing.css
- `assets/` — dghm-logo-{en,zhtw}[-dark].svg、dghm-mark[-dark].svg
- `guidelines/` — 12 張 specimen cards:核心色/輔色/配色組合/印刷用色/Do-Don't、字體三張、Logo/Mark 三張、間距圓角
- `components/actions/` — Button
- `components/forms/` — Input、Select(+Checkbox)
- `components/display/` — Card(+Tag、Stat)、SectionHeader(+PhaseStep)
- `SKILL.md` — Claude Code 相容技能檔

## 未完成 / 待補

- **UI kit(官網重建)未建置** — 官網程式碼未提供,僅有文字內容可參考。若提供 repo 或 Figma 可補上 `ui_kits/website/`。
- 官網 SVG 插圖未納入(見 ICONOGRAPHY)。
