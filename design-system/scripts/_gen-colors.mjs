#!/usr/bin/env node
// One-off generator: rebuilds each client's Colors section into 6 consistent,
// full-bleed (no-padding) swatch cards in a fixed order:
//   Brand Primary / Secondary / Neutrals & Accents / Print CMYK / Semantic Status / Color Scale
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const H = 160; // card viewport height
const VP = `700x${H}`;

/* ---- color helpers ---- */
const parse = (hex) => [0, 2, 4].map((i) => parseInt(hex.replace("#", "").slice(i, i + 2), 16));
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (hex) => { const [r, g, b] = parse(hex); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const isLight = (hex) => lum(hex) > 0.48;
const txt = (hex) => (isLight(hex) ? "#141414" : "#ffffff");
const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
const mix = (h1, h2, t) => { const a = parse(h1), b = parse(h2); return "#" + [0, 1, 2].map((i) => toHex(a[i] + (b[i] - a[i]) * t)).join(""); };

const MONO = "ui-monospace,SFMono-Regular,Menlo,monospace";

// A single full-bleed color column. lines[0] = bold label; rest = detail lines (mono).
function col(bg, flex, lines, i) {
  const t = txt(bg);
  const sep = i > 0 && isLight(bg) ? "border-left:1px solid rgba(0,0,0,0.08);" : "";
  const body = lines
    .filter(Boolean)
    .map((ln, k) =>
      k === 0
        ? `<div style="font-weight:700;letter-spacing:.01em">${ln}</div>`
        : `<div style="opacity:.72;font-family:${MONO};font-size:10.5px">${ln}</div>`
    )
    .join("");
  return `  <div style="flex:${flex};background:${bg};${sep}position:relative;display:flex;align-items:flex-end;">
    <div style="padding:9px 11px;color:${t};font-size:11px;line-height:1.42;">${body}</div>
  </div>`;
}

function card(dir, file, name, subtitle, columns) {
  const cols = columns.map((c, i) => col(c.bg, c.flex ?? 1, c.lines, i)).join("\n");
  const html = `<!-- @dsCard group="Colors" viewport="${VP}" name="${name}" subtitle="${subtitle}" -->
<meta charset="utf-8">
<link rel="stylesheet" href="../styles.css">
<style>body{margin:0;font-family:var(--font-body)}</style>
<div style="display:flex;height:${H}px;">
${cols}
</div>
`;
  writeFileSync(join(ROOT, dir, "guidelines", file), html);
}

// Color Scale: 7-step interpolation primary -> secondary.
function scaleCols(primary, secondary, pName, sName) {
  const steps = 7;
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    const bg = i === 0 ? primary : i === steps - 1 ? secondary : mix(primary, secondary, t);
    const label = i === 0 ? pName : i === steps - 1 ? sName : "";
    return { bg, lines: [label, bg.toUpperCase()] };
  });
}

/* ---- the 6 cards, per client ---- */
// Labels are generic ROLE names (Primary, Secondary, Ink, Paper…) — never brand
// color proper-nouns (Navy, Orange…) — so the section reads as one shared template.
const SUB = {
  primary: "Primary",
  secondary: "Secondary",
  neutrals: "Neutrals & accents",
  print: "Print CMYK",
  status: "Semantic status",
  scale: "Primary → Secondary",
};

const CARDS = {
  "05.fp-deco": {
    cards: [
      ["colors-primary.html", "Primary", SUB.primary, [
        { bg: "#272a4f", flex: 2, lines: ["Primary", "#272A4F"] },
        { bg: "#1d1f38", flex: 1, lines: ["Primary", "#1D1F38"] },
      ]],
      ["colors-secondary.html", "Secondary", SUB.secondary, [
        { bg: "#39559a", flex: 2, lines: ["Secondary", "#39559A"] },
        { bg: "#797fa8", flex: 1, lines: ["Secondary", "#797FA8"] },
      ]],
      ["colors-neutrals.html", "Neutrals & Accents", SUB.neutrals, [
        { bg: "#c3c6dd", lines: ["Accent", "#C3C6DD"] },
        { bg: "#bde1f7", lines: ["Accent Alt", "#BDE1F7"] },
        { bg: "#aaaaaa", lines: ["Neutral", "#AAAAAA"] },
        { bg: "#333333", lines: ["Ink", "#333333"] },
        { bg: "#fcfcfc", lines: ["Paper", "#FCFCFC"] },
      ]],
      ["colors-print.html", "Print CMYK", SUB.print, [
        { bg: "#272a4f", lines: ["Primary", "#272A4F", "C91 M87 Y40 K27"] },
        { bg: "#39559a", lines: ["Secondary", "#39559A", "C89 M74 Y9 K1"] },
      ]],
      ["colors-status.html", "Semantic Status", SUB.status, [
        { bg: "#2e7d5b", lines: ["Success", "#2E7D5B"] },
        { bg: "#a8762a", lines: ["Warning", "#A8762A"] },
        { bg: "#a83a3a", lines: ["Danger", "#A83A3A"] },
        { bg: "#39559a", lines: ["Info", "#39559A"] },
      ]],
      ["colors-scale.html", "Color Scale", SUB.scale, scaleCols("#272a4f", "#39559a", "Primary", "Secondary")],
    ],
  },

  "10.meyi-global": {
    cards: [
      ["colors-primary.html", "Primary", SUB.primary, [
        { bg: "#000000", flex: 2, lines: ["Primary", "#000000"] },
        { bg: "#16181c", flex: 1, lines: ["Primary", "#16181C"] },
      ]],
      ["colors-secondary.html", "Secondary", SUB.secondary, [
        { bg: "#24272d", flex: 2, lines: ["Secondary", "#24272D"] },
        { bg: "#31353d", flex: 1, lines: ["Secondary", "#31353D"] },
      ]],
      ["colors-neutrals.html", "Neutrals & Accents", SUB.neutrals, [
        { bg: "#ffffff", lines: ["Paper", "#FFFFFF"] },
        { bg: "#eceef0", lines: ["Surface", "#ECEEF0"] },
        { bg: "#c2c6cc", lines: ["Border", "#C2C6CC"] },
        { bg: "#6f757e", lines: ["Neutral", "#6F757E"] },
        { bg: "#383c43", lines: ["Ink", "#383C43"] },
      ]],
      ["colors-print.html", "Print CMYK", SUB.print, [
        { bg: "#000000", lines: ["Primary", "#000000", "match to hex"] },
        { bg: "#24272d", lines: ["Secondary", "#24272D", "match to hex"] },
        { bg: "#ffffff", lines: ["Paper", "#FFFFFF", "match to hex"] },
      ]],
      ["colors-status.html", "Semantic Status", SUB.status, [
        { bg: "#1f7a4d", lines: ["Success", "#1F7A4D"] },
        { bg: "#a86a12", lines: ["Warning", "#A86A12"] },
        { bg: "#b3261e", lines: ["Danger", "#B3261E"] },
        { bg: "#6f757e", lines: ["Info", "#6F757E"] },
      ]],
      ["colors-scale.html", "Color Scale", SUB.scale, scaleCols("#000000", "#24272d", "Primary", "Secondary")],
    ],
  },

  "33.dghm": {
    cards: [
      ["colors-primary.html", "Primary", SUB.primary, [
        { bg: "#0D2F6E", flex: 2, lines: ["Primary", "#0D2F6E"] },
        { bg: "#1A4494", flex: 1, lines: ["Primary", "#1A4494"] },
      ]],
      ["colors-secondary.html", "Secondary", SUB.secondary, [
        { bg: "#E5622A", flex: 2, lines: ["Secondary", "#E5622A"] },
        { bg: "#C04E1E", flex: 1, lines: ["Secondary", "#C04E1E"] },
      ]],
      ["colors-neutrals.html", "Neutrals & Accents", SUB.neutrals, [
        { bg: "#1A1E2E", lines: ["Ink", "#1A1E2E"] },
        { bg: "#5A6580", lines: ["Neutral", "#5A6580"] },
        { bg: "#F4F7FB", lines: ["Surface", "#F4F7FB"] },
        { bg: "#E8ECF5", lines: ["Border", "#E8ECF5"] },
        { bg: "#FFFFFF", lines: ["Paper", "#FFFFFF"] },
      ]],
      ["colors-print.html", "Print CMYK", SUB.print, [
        { bg: "#0D2F6E", lines: ["Primary", "C88 M57 Y0 K57", "PMS 2757 C"] },
        { bg: "#E5622A", lines: ["Secondary", "C0 M57 Y82 K10", "PMS 7579 C"] },
        { bg: "#1A4494", lines: ["Primary", "C89 M54 Y0 K42", "PMS 286 C"] },
        { bg: "#1A1E2E", lines: ["Ink", "C40 M35 Y0 K82", "PMS Black 6 C"] },
        { bg: "#5A6580", lines: ["Neutral", "C30 M21 Y0 K50", "PMS Cool Gray 9"] },
        { bg: "#F4F7FB", lines: ["Surface", "C3 M2 Y0 K2", "PMS 9441 C"] },
      ]],
      ["colors-status.html", "Semantic Status", SUB.status, [
        { bg: "#2F7D57", lines: ["Success", "#2F7D57"] },
        { bg: "#C0781F", lines: ["Warning", "#C0781F"] },
        { bg: "#B23A2E", lines: ["Danger", "#B23A2E"] },
        { bg: "#1A4494", lines: ["Info", "#1A4494"] },
      ]],
      ["colors-scale.html", "Color Scale", SUB.scale, scaleCols("#0D2F6E", "#E5622A", "Primary", "Secondary")],
    ],
  },
};

const ORDER = [
  "colors-primary.html",
  "colors-secondary.html",
  "colors-neutrals.html",
  "colors-print.html",
  "colors-status.html",
  "colors-scale.html",
];

for (const [dir, def] of Object.entries(CARDS)) {
  // write the 6 HTML files
  for (const [file, name, subtitle, columns] of def.cards) {
    card(dir, file, name, subtitle, columns);
  }
  // rewrite the manifest Colors block (keep it in its original position)
  const mp = join(ROOT, dir, "_ds_manifest.json");
  const m = JSON.parse(readFileSync(mp, "utf8"));
  const meta = Object.fromEntries(def.cards.map(([file, name, subtitle]) => [file, { name, subtitle }]));
  const newColors = ORDER.map((file) => ({
    path: `guidelines/${file}`,
    group: "Colors",
    viewport: VP,
    subtitle: meta[file].subtitle,
    name: meta[file].name,
  }));
  const out = [];
  let inserted = false;
  for (const c of m.cards || []) {
    if ((c.group || "") === "Colors") {
      if (!inserted) { out.push(...newColors); inserted = true; }
      continue;
    }
    out.push(c);
  }
  m.cards = out;
  writeFileSync(mp, JSON.stringify(m));
  console.log(`${dir}: wrote 6 Colors cards, manifest Colors = ${newColors.length}`);
}
