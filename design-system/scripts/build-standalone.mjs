#!/usr/bin/env node
/**
 * Bundles the whole index — dashboard plus every client detail page — into one
 * self-contained HTML file that runs with no web server: card previews become
 * srcdoc iframes with their CSS, component bundle, JSX and logos inlined, and
 * navigation happens client-side via the URL hash.
 *
 * Use it to publish an online preview (e.g. as a Claude Artifact) of a repo
 * that is otherwise only viewable through `npx serve .`.
 *
 * Usage:  node scripts/build-standalone.mjs [outfile] [--artifact]
 *         (default outfile: dist/preview.html)
 *
 * --artifact emits the page without the <!doctype>/<html>/<head>/<body> shell,
 * for hosts that supply their own (e.g. publishing as a Claude Artifact).
 */
import { readdirSync, readFileSync, existsSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const ARTIFACT = args.includes("--artifact");
const outArg = args.find((a) => !a.startsWith("--"));
const OUT = outArg ? resolve(outArg) : join(ROOT, "dist", "preview.html");

const THUMB_WIDTH = 340;
const MAX_CHIPS = 8;
const GROUP_THUMB_H = { Brand: 87, Colors: 78, Components: 180, Spacing: 80, Type: 112, Website: 210 };

// unpkg is not on the artifact host's script allowlist; jsdelivr mirrors the
// same npm paths and is, so rewrite CDN script sources onto it.
const CDN_HOST = "https://cdn.jsdelivr.net/npm/";

/* ------------------------------------------------------------- utilities */

const unescapeEntities = (s) =>
  String(s ?? "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const esc = (s) =>
  unescapeEntities(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Content going into a srcdoc="" attribute: keep the markup, escape only what
// would terminate the attribute or start an entity.
const attr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

// A closing tag inside an inlined script body would end the <script> early.
const safeJs = (s) => s.replace(/<\/script/gi, "<\\/script");

const dataUri = (file) => {
  const ext = file.toLowerCase().split(".").pop();
  const mime = ext === "svg" ? "image/svg+xml" : ext === "png" ? "image/png" : "application/octet-stream";
  return `data:${mime};base64,${readFileSync(file).toString("base64")}`;
};

/* --------------------------------------------------------- html inlining */

// Resolve @import chains so a stylesheet becomes one self-contained block.
function inlineCss(cssPath, seen = new Set()) {
  if (!existsSync(cssPath) || seen.has(cssPath)) return "";
  seen.add(cssPath);
  return readFileSync(cssPath, "utf8").replace(
    /@import\s+(?:url\()?["']?([^"')]+)["']?\)?\s*;/g,
    (_, href) => inlineCss(resolve(dirname(cssPath), href), seen)
  );
}

// Turn one card/screen HTML file into a fully self-contained document.
function inlineHtml(htmlPath) {
  const base = dirname(htmlPath);
  const local = (href) => resolve(base, href);
  let html = readFileSync(htmlPath, "utf8");

  html = html.replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi,
    (m, href) => (/^https?:/i.test(href) ? m : `<style>\n${inlineCss(local(href))}\n</style>`));

  // CDN scripts: move to the allowlisted host and drop the unpkg-specific SRI.
  html = html.replace(/<script\b[^>]*src=["']https:\/\/unpkg\.com\/([^"']+)["'][^>]*><\/script>/gi,
    (_, path) => `<script src="${CDN_HOST}${path}" crossorigin="anonymous"></script>`);

  // Local scripts, including `type="text/babel"` JSX files loaded by src.
  html = html.replace(/<script\b([^>]*)\bsrc=["'](?!https?:)([^"']+)["']([^>]*)><\/script>/gi,
    (m, pre, src, post) => {
      const file = local(src);
      if (!existsSync(file)) return m;
      const type = /type=["']([^"']+)["']/i.exec(pre + post);
      const typeAttr = type ? ` type="${type[1]}"` : "";
      return `<script${typeAttr}>\n${safeJs(readFileSync(file, "utf8"))}\n</script>`;
    });

  html = html.replace(/\bsrc=["'](?!https?:|data:)([^"']+\.(?:svg|png))["']/gi,
    (m, src) => (existsSync(local(src)) ? `src="${dataUri(local(src))}"` : m));

  return html;
}

/* ------------------------------------------------------------------ scan */

function readTitle(dir) {
  for (const name of ["readme.md", "README.md"]) {
    const p = join(ROOT, dir, name);
    if (existsSync(p)) {
      const h = readFileSync(p, "utf8").match(/^#\s+(.+)$/m);
      if (h) return h[1].trim();
    }
  }
  return dir;
}

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
    if (files.length) return join(full, files[0]);
  }
  return null;
}

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

function panelColor(manifest) {
  for (const t of manifest.tokens || []) {
    if (t.kind !== "color") continue;
    const m = String(t.value).trim().match(/^#([0-9a-f]{6})$/i);
    if (!m) continue;
    const [r, g, b] = [0, 2, 4].map((i) => {
      const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    if (0.2126 * r + 0.7152 * g + 0.0722 * b < 0.2) return t.value;
  }
  return "#16181c";
}

const clients = readdirSync(ROOT)
  .filter((n) => !n.startsWith(".") && n !== "dist" &&
    statSync(join(ROOT, n)).isDirectory() && existsSync(join(ROOT, n, "_ds_manifest.json")))
  .sort()
  .map((dir) => {
    const manifest = JSON.parse(readFileSync(join(ROOT, dir, "_ds_manifest.json"), "utf8"));
    return { dir, manifest, title: readTitle(dir), logo: findLogo(dir), chips: brandChips(manifest) };
  });

/* ----------------------------------------------------------------- views */

function cardHtml(dir, card, group) {
  const [w, h] = (card.viewport || "700x400").split("x").map(Number);
  const scale = THUMB_WIDTH / w;
  const thumbH = GROUP_THUMB_H[group] ?? Math.round(h * scale);
  const file = join(ROOT, dir, card.path);
  if (!existsSync(file)) return "";
  const doc = attr(inlineHtml(file));
  return `
      <div class="card" data-name="${esc(card.name)} ${esc(group)} ${esc(card.subtitle || "")}">
        <div class="thumb" style="height:${thumbH}px">
          <iframe srcdoc="${doc}" loading="lazy" tabindex="-1" scrolling="no"
                  style="width:${w}px;height:${h}px;transform:scale(${scale.toFixed(4)})"></iframe>
        </div>
        <div class="card-meta">
          <span class="card-name">${esc(card.name)}</span>
          <span class="card-sub">${esc(card.subtitle || "")}</span>
        </div>
      </div>`;
}

function screenHtml(dir, sp) {
  const file = join(ROOT, dir, sp.path);
  if (!existsSync(file)) return "";
  const [w, h] = (sp.viewport || "1280x800").split("x").map(Number);
  return `
      <details class="screen">
        <summary>
          <span class="screen-name">${esc(sp.name)}</span>
          <span class="card-sub">${esc(sp.subtitle || "")}</span>
        </summary>
        <div class="screen-frame">
          <iframe srcdoc="${attr(inlineHtml(file))}" style="width:${w}px;height:${h}px"></iframe>
        </div>
      </details>`;
}

function clientView({ dir, title, manifest }) {
  const groups = new Map();
  for (const card of manifest.cards || []) {
    const g = card.group || "Other";
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(card);
  }
  const screens = (manifest.startingPoints || []).filter((sp) => sp.kind === "screen");

  const sections = [...groups.entries()]
    .map(([group, cards]) => `
      <h3>${esc(group)}</h3>
      <div class="grid">${cards.map((c) => cardHtml(dir, c, group)).join("")}
      </div>`)
    .join("\n");

  return `
  <section class="view client-view" id="view-${esc(dir)}" hidden>
    <a class="back" href="#">← 所有設計系統</a>
    <header class="head">
      <div>
        <h1>${esc(title)}</h1>
        <p class="dir">${esc(dir)}/</p>
      </div>
    </header>
    <input class="search" type="search" placeholder="搜尋卡片（例如 button、color、type…）">
${screens.length ? `      <h3>UI Kits</h3>\n      <div class="screens">${screens.map((sp) => screenHtml(dir, sp)).join("")}\n      </div>` : ""}
${sections}
  </section>`;
}

function dashCard({ dir, title, manifest, logo, chips }) {
  const kits = (manifest.startingPoints || []).filter((sp) => sp.kind === "screen").length;
  const stats = [
    `${(manifest.components || []).length} components`,
    `${(manifest.cards || []).length} cards`,
    kits ? `${kits} UI kit${kits > 1 ? "s" : ""}` : null,
  ].filter(Boolean).join(" ・ ");
  const fonts = (manifest.brandFonts || []).map((f) => f.family).join(" · ");

  return `
      <a class="client-card" href="#${esc(dir)}">
        <span class="logo-panel" style="background:${esc(panelColor(manifest))}">${
          logo ? `<img src="${dataUri(logo)}" alt="${esc(title)}">`
               : `<span class="logo-fallback">${esc(title)}</span>`}</span>
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

const page = `<!doctype html>
<!-- GENERATED — rebuild with: node scripts/build-standalone.mjs -->
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Design Systems Preview</title>
<style>
  :root {
    --ink: #111; --muted: #6b7280; --border: #e5e7eb; --bg: #fafafa; --card: #fff;
    --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --ink: #e8e8ea; --muted: #9096a1; --border: #2c2f36; --bg: #17191d; --card: #1f2126;
    }
  }
  :root[data-theme="dark"] {
    --ink: #e8e8ea; --muted: #9096a1; --border: #2c2f36; --bg: #17191d; --card: #1f2126;
  }
  :root[data-theme="light"] {
    --ink: #111; --muted: #6b7280; --border: #e5e7eb; --bg: #fafafa; --card: #fff;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--ink);
    font: 15px/1.6 -apple-system, "Segoe UI", "Noto Sans TC", "PingFang TC", sans-serif;
  }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 40px 24px 96px; }
  h1 { font-size: 26px; margin: 0 0 4px; letter-spacing: -0.02em; }
  .subtitle { color: var(--muted); margin: 0 0 12px; }
  .note {
    margin: 18px 0 0; padding: 10px 14px; font-size: 13px; color: var(--muted);
    background: var(--card); border: 1px solid var(--border); border-radius: 4px; max-width: 760px;
  }
  .note code { font-family: var(--mono); }
  a { color: inherit; }
  .dash { margin-top: 28px; display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
  .client-card {
    display: flex; flex-direction: column; background: var(--card); border: 1px solid var(--border);
    border-radius: 6px; overflow: hidden; text-decoration: none;
    transition: border-color .12s ease, transform .12s ease;
  }
  .client-card:hover, .client-card:focus-visible { border-color: var(--ink); transform: translateY(-2px); }
  .logo-panel { display: flex; align-items: center; justify-content: center; height: 130px; padding: 24px 32px; }
  .logo-panel img { max-width: 100%; max-height: 100%; }
  .logo-fallback { color: #fff; font-weight: 700; font-size: 20px; letter-spacing: .04em; }
  .chips { display: flex; height: 14px; }
  .chip { flex: 1; }
  .client-info { padding: 14px 16px 16px; }
  .client-name { display: block; font-weight: 650; font-size: 16px; letter-spacing: -0.01em; }
  .client-dir { display: block; font-family: var(--mono); font-size: 12px; color: var(--muted); margin-top: 1px; }
  .client-stats, .client-fonts { display: block; font-size: 12.5px; color: var(--muted); }
  .client-stats { margin-top: 8px; }

  .back { display: inline-block; margin-bottom: 18px; color: var(--muted); text-decoration: none; font-size: 13px; }
  .back:hover { color: var(--ink); }
  .head { border-top: 2px solid var(--ink); padding-top: 20px; }
  .dir { margin: 2px 0 0; color: var(--muted); font-size: 13px; font-family: var(--mono); }
  .search {
    width: 100%; max-width: 420px; margin: 20px 0 8px; padding: 9px 12px; color: inherit;
    border: 1px solid var(--border); border-radius: 4px; font: inherit; background: var(--card);
  }
  h3 { margin: 30px 0 10px; font-size: 12px; text-transform: uppercase; letter-spacing: .12em; color: var(--muted); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 4px; overflow: hidden; }
  .card.hide { display: none; }
  .thumb { display: block; overflow: hidden; border-bottom: 1px solid var(--border); background: #fff; }
  .thumb iframe { border: 0; transform-origin: top left; pointer-events: none; display: block; }
  .card-meta { display: block; padding: 9px 12px; }
  .card-name { display: block; font-weight: 600; font-size: 14px; }
  .card-sub { display: block; color: var(--muted); font-size: 12.5px; }
  .screens { display: grid; gap: 14px; }
  .screen { background: var(--card); border: 1px solid var(--border); border-radius: 4px; }
  .screen summary { padding: 14px 16px; cursor: pointer; }
  .screen summary::marker { color: var(--muted); }
  .screen-name { font-weight: 600; font-size: 14px; }
  .screen-frame { overflow: auto; border-top: 1px solid var(--border); background: #fff; }
  .screen-frame iframe { border: 0; display: block; }
  footer { margin-top: 64px; color: var(--muted); font-size: 12.5px; }
  footer code { font-family: var(--mono); }
  :focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
</style>
</head>
<body>
<div class="wrap">
  <section class="view" id="view-dashboard">
    <h1>Design Systems Dashboard</h1>
    <p class="subtitle">客戶設計系統總覽 — ${clients.length} 個系統，點卡片進入</p>
    <p class="note">
      這是 <code>dghm/claude-design-system</code> 的線上預覽，所有樣式、元件與 Logo 皆已內嵌，不需伺服器即可瀏覽。
      內容為產生當下的快照；repo 更新後重跑 <code>node scripts/build-standalone.mjs</code> 再發佈一次即可同步。
    </p>
    <div class="dash">
${clients.map(dashCard).join("\n")}
    </div>
  </section>
${clients.map(clientView).join("\n")}
  <footer>
    由 <code>node scripts/build-standalone.mjs</code> 產生。完整可編輯版本請在 repo 目錄執行 <code>npx serve .</code>。
  </footer>
</div>
<script>
  const views = document.querySelectorAll(".view");
  function route() {
    const id = location.hash.slice(1);
    const target = document.getElementById("view-" + id) || document.getElementById("view-dashboard");
    views.forEach((v) => { v.hidden = v !== target; });
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();

  document.querySelectorAll(".search").forEach((box) => {
    box.addEventListener("input", () => {
      const term = box.value.trim().toLowerCase();
      box.closest(".view").querySelectorAll(".card").forEach((el) => {
        el.classList.toggle("hide", term && !el.dataset.name.toLowerCase().includes(term));
      });
    });
  });
</script>
</body>
</html>
`;

const output = ARTIFACT
  ? page.replace(/^[\s\S]*?<head>/, "").replace(/<\/head>\s*<body>/, "").replace(/<\/body>\s*<\/html>\s*$/, "")
  : page;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, output);
console.log(`${OUT} — ${clients.length} client(s), ${(output.length / 1024 / 1024).toFixed(2)} MB${ARTIFACT ? " (artifact mode)" : ""}`);
