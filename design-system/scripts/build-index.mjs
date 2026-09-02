#!/usr/bin/env node
/**
 * Regenerates the design-system index pages by scanning every directory here
 * that contains a _ds_manifest.json (one directory per client):
 *
 *   - ../design-system.html  the dashboard, written to the site root so it
 *                            mounts the工作台 app shell like every other tool;
 *                            one info card per client, linking into
 *   - <client>/index.html    per-client detail page — thumbnail previews of
 *                            every guideline/component card and UI kit
 *
 * Usage:  node design-system/scripts/build-index.mjs   (from the repo root)
 */
import { readdirSync, readFileSync, existsSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Client folders live here; the dashboard is published one level up, at the
// site root, so its app-shell links resolve like every other tool page.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_ROOT = join(ROOT, "..");
const BASE_DIR = "design-system";
const DASHBOARD = "design-system.html";

// A card's own viewport (e.g. "700x150") is scaled down to this thumbnail width.
const THUMB_WIDTH = 340;
// Max color chips shown on a dashboard card.
const MAX_CHIPS = 8;

// Uniform thumbnail height (px) per section, so every card in a group — and the
// same group across clients — lines up on the same row height. The iframe is
// still scaled to THUMB_WIDTH; this only clips/pads its visible height (content
// is top-aligned, so any overflow is trimmed from the bottom). Groups not listed
// fall back to each card's own scaled height.
const GROUP_THUMB_H = {
  Brand: 87,
  Colors: 78,
  Components: 180,
  Spacing: 80,
  Type: 112,
  Website: 210,
};

// Manifest strings may already contain HTML entities (e.g. "Borders &amp; Shadows"),
// so decode the common ones first to avoid double-escaping.
const unescapeEntities = (s) =>
  String(s ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const esc = (s) =>
  unescapeEntities(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const BASE_CSS = `
  :root {
    --ink: #111; --muted: #6b7280; --border: #e5e7eb; --bg: #fafafa;
    --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--ink);
    font: 15px/1.6 -apple-system, "Segoe UI", "Noto Sans TC", "PingFang TC", sans-serif;
  }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 40px 24px 96px; }
  h1 { font-size: 26px; margin: 0 0 4px; letter-spacing: -0.02em; }
  .subtitle { color: var(--muted); margin: 0 0 12px; }
  footer { margin-top: 64px; color: var(--muted); font-size: 12.5px; }
  footer code { font-family: var(--mono); }
`;

/* ---------------------------------------------------------------- scan */

function readTitle(dir) {
  for (const name of ["readme.md", "README.md"]) {
    const p = join(ROOT, dir, name);
    if (existsSync(p)) {
      const firstHeading = readFileSync(p, "utf8").match(/^#\s+(.+)$/m);
      if (firstHeading) return firstHeading[1].trim();
    }
  }
  return dir;
}

// Dashboard cards show the logo on a dark panel, so prefer the variant made
// for dark backgrounds ("white"/"light"/"inverse", or "dark" as in
// dghm-logo-zhtw-dark.svg = for dark backgrounds). Logos beat standalone
// marks; zh-TW variants beat other locales.
function findLogo(dir) {
  const forDarkBg = /white|light|inverse|dark/i;
  const rank = (f) =>
    (/logo/i.test(f) ? 0 : /mark/i.test(f) ? 40 : 80) +
    (forDarkBg.test(f) ? 0 : 20) +
    (/zhtw|zh-tw|zh_tw|\btc\b/i.test(f) ? 0 : 10);
  for (const sub of ["assets", "uploads"]) {
    const full = join(ROOT, dir, sub);
    if (!existsSync(full)) continue;
    const files = readdirSync(full)
      .filter((f) => /\.(svg|png)$/i.test(f) && /logo|mark/i.test(f))
      .sort((a, b) => rank(a) - rank(b));
    if (files.length) return `${sub}/${files[0]}`;
  }
  return null;
}

// First few unique color values from the manifest's token list — these come
// from the client's tokens/colors.css in source order, so the base palette
// (the brand-defining colors) leads.
function brandChips(manifest) {
  const seen = new Set();
  const chips = [];
  for (const t of manifest.tokens || []) {
    if (t.kind !== "color") continue;
    const v = String(t.value).toLowerCase();
    if (seen.has(v)) continue;
    seen.add(v);
    chips.push({ name: t.name, value: t.value });
    if (chips.length >= MAX_CHIPS) break;
  }
  return chips;
}

// Logo panel background: the client's first dark brand color. Token order
// follows the client's tokens/colors.css, so the base palette leads — for
// Meyi that's --black (its logo guideline shows the lockup on black), for
// DGHM it's --dghm-navy (its logo-dark guideline uses navy).
function panelColor(manifest) {
  for (const t of manifest.tokens || []) {
    if (t.kind !== "color") continue;
    const m = String(t.value).trim().match(/^#([0-9a-f]{6})$/i);
    if (!m) continue;
    const [r, g, b] = [0, 2, 4].map((i) => {
      const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (luminance < 0.2) return t.value;
  }
  return "#16181c";
}

function findClients() {
  return readdirSync(ROOT)
    .filter((name) => {
      const full = join(ROOT, name);
      return (
        !name.startsWith(".") &&
        statSync(full).isDirectory() &&
        existsSync(join(full, "_ds_manifest.json"))
      );
    })
    .sort()
    .map((dir) => {
      const manifest = JSON.parse(readFileSync(join(ROOT, dir, "_ds_manifest.json"), "utf8"));
      return { dir, manifest, title: readTitle(dir), logo: findLogo(dir), chips: brandChips(manifest) };
    });
}
/* ------------------------------------------------------------ page views */

// Every asset path is relative to the site root, since the whole index lives
// in one page there.
const assetPath = (dir, p) => `${BASE_DIR}/${dir}/${p}`;

function cardThumb(dir, card, group) {
  const [w, h] = (card.viewport || "700x400").split("x").map(Number);
  const scale = THUMB_WIDTH / w;
  const thumbH = GROUP_THUMB_H[group] ?? Math.round(h * scale);
  const href = assetPath(dir, card.path);
  return `
        <a class="card" href="${esc(href)}" target="_blank" rel="noopener"
           data-name="${esc(card.name)} ${esc(group)} ${esc(card.subtitle || "")}">
          <span class="thumb" style="height:${thumbH}px">
            <iframe src="${esc(href)}" loading="lazy" tabindex="-1" scrolling="no"
                    style="width:${w}px;height:${h}px;transform:scale(${scale.toFixed(4)})"></iframe>
          </span>
          <span class="card-meta">
            <span class="card-name">${esc(card.name)}</span>
            <span class="card-sub">${esc(card.subtitle || "")}</span>
          </span>
        </a>`;
}

function screenLink(dir, sp) {
  return `
        <a class="screen" href="${esc(assetPath(dir, sp.path))}" target="_blank" rel="noopener"
           data-name="${esc(sp.name)} ${esc(sp.subtitle || "")}">
          <span class="screen-name">${esc(sp.name)}</span>
          <span class="card-sub">${esc(sp.subtitle || "")}</span>
        </a>`;
}

// One client's cards, as a view swapped in beside the app shell rather than a
// separate page — so the rail and tool menu stay put.
function clientView({ dir, title, manifest }) {
  const groups = new Map();
  for (const card of manifest.cards || []) {
    const g = card.group || "Other";
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(card);
  }
  const screens = (manifest.startingPoints || []).filter((sp) => sp.kind === "screen");

  const quickLinks = [
    ["README", "readme.md"],
    ["SKILL.md", "SKILL.md"],
    ["styles.css", "styles.css"],
    ["tokens/", "tokens/"],
    ["components/", "components/"],
  ]
    .filter(([, p]) => existsSync(join(ROOT, dir, p.replace(/\/$/, ""))))
    .map(([label, p]) => `<a href="${esc(assetPath(dir, p))}" target="_blank" rel="noopener">${esc(label)}</a>`)
    .join("\n          ");

  const groupHtml = [...groups.entries()]
    .map(([group, cards]) => `
      <h3>${esc(group)}</h3>
      <div class="grid">${cards.map((c) => cardThumb(dir, c, group)).join("")}
      </div>`)
    .join("\n");

  const screensHtml = screens.length
    ? `
      <h3>UI Kits</h3>
      <div class="screens">${screens.map((sp) => screenLink(dir, sp)).join("")}
      </div>`
    : "";

  return `
    <section class="view" id="view-${esc(dir)}" hidden>
      <a class="back" href="#">← 所有設計系統</a>
      <header class="head">
        <div>
          <h1>${esc(title)}</h1>
          <p class="dir">${esc(BASE_DIR)}/${esc(dir)}/</p>
        </div>
        <nav class="quick">
          ${quickLinks}
        </nav>
      </header>
      <input class="search" type="search" placeholder="搜尋卡片（例如 button、color、type…）">
${screensHtml}
${groupHtml}
    </section>`;
}

function dashboardCard({ dir, title, manifest, logo, chips }) {
  const kitCount = (manifest.startingPoints || []).filter((sp) => sp.kind === "screen").length;
  const stats = [
    `${(manifest.components || []).length} components`,
    `${(manifest.cards || []).length} cards`,
    kitCount ? `${kitCount} UI kit${kitCount > 1 ? "s" : ""}` : null,
  ].filter(Boolean).join(" ・ ");
  const fonts = (manifest.brandFonts || []).map((f) => f.family).join(" · ");

  const logoHtml = logo
    ? `<img src="${esc(assetPath(dir, logo))}" alt="${esc(title)} logo">`
    : `<span class="logo-fallback">${esc(title)}</span>`;

  return `
      <a class="client-card" href="#${esc(dir)}">
        <span class="logo-panel" style="background:${esc(panelColor(manifest))}">${logoHtml}</span>
        <span class="chips">${chips.map((c) =>
          `<span class="chip" style="background:${esc(c.value)}" title="${esc(`${c.name} ${c.value}`)}"></span>`).join("")}</span>
        <span class="client-info">
          <span class="client-name">${esc(title)}</span>
          <span class="client-dir">${esc(dir)}/</span>
          <span class="client-stats">${esc(stats)}</span>
          ${fonts ? `<span class="client-fonts">${esc(fonts)}</span>` : ""}
        </span>
      </a>`;
}

/* ----------------------------------------------------------------- build */

const clients = findClients();

const page = `<!doctype html>
<!-- GENERATED FILE — do not edit by hand. Regenerate with: node ${BASE_DIR}/scripts/build-index.mjs -->
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>客戶設計系統 — DGHM</title>
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="stylesheet" href="dghm-ui.css">
<link rel="stylesheet" href="app-shell.css">
<style>
${BASE_CSS}
  .dash { margin-top: 32px; display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
  .client-card {
    display: flex; flex-direction: column; background: #fff; border: 1px solid var(--border);
    border-radius: 6px; overflow: hidden; text-decoration: none; color: inherit;
    transition: border-color .12s ease, transform .12s ease;
  }
  .client-card:hover { border-color: var(--ink); transform: translateY(-2px); }
  .logo-panel { display: flex; align-items: center; justify-content: center; height: 130px; padding: 24px 32px; }
  .logo-panel img { max-width: 100%; max-height: 100%; }
  .logo-fallback { color: #fff; font-weight: 700; font-size: 20px; letter-spacing: 0.04em; }
  .chips { display: flex; height: 14px; }
  .chip { flex: 1; }
  .client-info { padding: 14px 16px 16px; }
  .client-name { display: block; font-weight: 650; font-size: 16px; letter-spacing: -0.01em; }
  .client-dir { display: block; font-family: var(--mono); font-size: 12px; color: var(--muted); margin-top: 1px; }
  .client-stats { display: block; font-size: 12.5px; color: var(--muted); margin-top: 8px; }
  .client-fonts { display: block; font-size: 12.5px; color: var(--muted); }

  .back { display: inline-block; margin-bottom: 18px; color: var(--muted); text-decoration: none; font-size: 13px; }
  .back:hover { color: var(--ink); }
  .head { display: flex; flex-wrap: wrap; gap: 12px 24px; justify-content: space-between; align-items: baseline; border-top: 2px solid var(--ink); padding-top: 20px; }
  .dir { margin: 2px 0 0; color: var(--muted); font-size: 13px; font-family: var(--mono); }
  .quick { display: flex; flex-wrap: wrap; gap: 6px; }
  .quick a {
    font-size: 12.5px; font-family: var(--mono); color: var(--ink); text-decoration: none;
    border: 1px solid var(--border); background: #fff; border-radius: 4px; padding: 3px 9px;
  }
  .quick a:hover { border-color: var(--ink); }
  .search {
    width: 100%; max-width: 420px; margin: 20px 0 8px; padding: 9px 12px;
    border: 1px solid var(--border); border-radius: 4px; font: inherit; background: #fff;
  }
  h3 { margin: 30px 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted); }
  .grid, .screens { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
  .card {
    display: block; background: #fff; border: 1px solid var(--border); border-radius: 4px;
    overflow: hidden; text-decoration: none; color: inherit;
  }
  .card:hover { border-color: var(--ink); }
  .card.hide, .screen.hide { display: none; }
  .thumb { display: block; overflow: hidden; border-bottom: 1px solid var(--border); background: #fff; }
  .thumb iframe { border: 0; transform-origin: top left; pointer-events: none; display: block; }
  .card-meta { display: block; padding: 9px 12px; }
  .card-name { display: block; font-weight: 600; font-size: 14px; }
  .card-sub { display: block; color: var(--muted); font-size: 12.5px; }
  .screen {
    display: block; background: var(--ink); color: #fff; border-radius: 4px;
    padding: 14px 16px; text-decoration: none;
  }
  .screen .card-sub { color: rgba(255,255,255,.65); }
  .screen-name { display: block; font-weight: 600; font-size: 14px; }
</style>
</head>
<body data-tool="design-system">
  <div id="tool-workspace" class="wrap">
    <section class="view" id="view-dashboard">
      <h1>客戶設計系統</h1>
      <p class="subtitle">共 ${clients.length} 個系統，點卡片查看該客戶的品牌規範與元件</p>
      <div class="dash">
${clients.map(dashboardCard).join("\n")}
      </div>
    </section>
${clients.map(clientView).join("\n")}
    <footer>
      本頁由 <code>node ${BASE_DIR}/scripts/build-index.mjs</code> 產生。
      新增客戶資料夾（含 <code>_ds_manifest.json</code>）到 <code>${BASE_DIR}/</code> 後重跑即可更新。
    </footer>
  </div>
<script src="tool-registry.js"></script>
<script src="project-context.js"></script>
<script src="app-shell.js"></script>
<script>mountAppShell({ activeTool: 'design-system' });</script>
<script src="dghm-ui.js"></script>
<script>
  // Views swap in place so the app shell around them never reloads.
  var views = document.querySelectorAll('.view');
  function route() {
    var id = decodeURIComponent(location.hash.slice(1));
    var target = document.getElementById('view-' + id) || document.getElementById('view-dashboard');
    for (var i = 0; i < views.length; i += 1) views[i].hidden = views[i] !== target;
    var workspace = document.getElementById('tool-workspace');
    if (workspace) workspace.scrollTop = 0;
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();

  Array.prototype.forEach.call(document.querySelectorAll('.search'), function (box) {
    box.addEventListener('input', function () {
      var term = box.value.trim().toLowerCase();
      Array.prototype.forEach.call(box.closest('.view').querySelectorAll('.card'), function (el) {
        el.classList.toggle('hide', !!term && el.dataset.name.toLowerCase().indexOf(term) === -1);
      });
    });
  });
</script>
</body>
</html>
`;

writeFileSync(join(SITE_ROOT, DASHBOARD), page);
console.log(`${DASHBOARD} — ${clients.length} client view(s): ${clients.map((c) => c.dir).join(", ")}`);
