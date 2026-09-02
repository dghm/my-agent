# 鴻築室內裝修 (FP Decoration) Design System

Design system for **鴻築室內裝修公司** — a Taiwanese interior renovation / decoration company. The brand mark is "FP Decoration": a layered, receding high-rise silhouette rendered in a navy→sky-blue gradient, paired with a bold Latin "FP" wordmark. The identity is architectural, precise, and quietly premium — deep navy foundations with pale periwinkle and sky accents.

## Sources

- Uploaded logo files: `uploads/logo-normal.svg`, `uploads/logo-monotone.svg`, `uploads/logo_with-colorbg.svg` (repaired copies live in `assets/` — the originals were exported without their `<style>` blocks; fills were reconstructed from the gradient definitions and baked in as attributes).
- Brand color values supplied directly by the brand owner (screen hex + print CMYK).
- GitHub: https://github.com/dghm/claude-design-system (subtree `05.fp-deco/`) — currently contains only a placeholder markdown file; explore it in case content is added later.

Because no product codebase, Figma, or component inventory was provided, the component set below is a standard authored set sized to the brand's needs, and the UI kit is a **sample** marketing-site concept, not a recreation.

## Brand palette

- Primary 主色: `#272a4f` (print C91.5 M87.32 Y39.93 K26.88)
- Secondary 輔助色: `#39559a` (print C88.53 M74.36 Y8.93 K0.84)
- Brand dark: `#1d1f38` · Brand lite: `#797fa8` · Accent: `#c3c6dd` · Sky (logo gradient end): `#bde1f7`
- Text: `#333` · Gray: `#aaa` · Background: `#fcfcfc`

## CONTENT FUNDAMENTALS

No copy corpus was provided; the following are authored conventions for consistency — adjust with real brand copy when available.

- **Language**: Traditional Chinese (zh-TW) first; English used for the wordmark and small labels (e.g. "FP Decoration", "SINCE 2008"-style eyebrows).
- **Tone**: 專業、沉穩、信賴 — professional, calm, trustworthy. Speak as the firm ("我們"), address clients as 「您」. No exclamation marks, no hype.
- **Casing**: English eyebrows/labels in ALL CAPS with wide tracking; sentence case elsewhere.
- **Copy shape**: short declarative headlines (4–8 characters, e.g. 「築造理想空間」), supporting sentences ≤ 2 lines. Numbers stated plainly (「20 年施工經驗」).
- **Emoji**: never.

## VISUAL FOUNDATIONS

- **Color**: near-white paper (`#fcfcfc`) pages, ink-gray body text, deep-navy headings. Navy (`#272a4f`) is the anchor: used for headers, footers, primary buttons, and full-bleed dark sections. Secondary blue (`#39559a`) is the action/link color. Accent periwinkle (`#c3c6dd`) is for borders, tints, and quiet emphasis — never large fills. One dark section per page maximum.
- **The gradient**: the navy→sky gradient belongs to the logo only. Do NOT reuse it as a background or button treatment.
- **Type**: Noto Sans TC for UI/body; Noto Serif TC for display headings (dignified, editorial). Display headings track wide (`--tracking-display: 0.12em`) echoing CJK signage. Latin serif ("Decoration") appears only in the lockup.
- **Spacing**: 4px base scale; generous section padding (64–96px). Layouts are airy and grid-aligned.
- **Corners**: restrained — 2/4/8px. No pill buttons except tags. Architecture, not bubbles.
- **Borders**: 1px `--border-subtle` hairlines; cards prefer hairline + soft shadow over heavy elevation.
- **Shadows**: cool navy-tinted, low opacity (`--shadow-sm/md/lg`). No inner shadows.
- **Backgrounds**: flat color fields only. No textures, patterns, or gradients. Dark sections use `--surface-dark` with `--text-on-dark`.
- **Imagery**: interior/architectural photography, cool-neutral grading, generous negative space. None was provided — use labeled placeholder blocks, never generated imagery.
- **Motion**: subtle and brief — 120–350ms, `--ease-out` fades and small translates. No bounces, no infinite loops.
- **Hover**: buttons darken one step (primary→dark); links shift secondary→primary; cards lift shadow one step.
- **Press**: darken further; no shrink transforms.
- **Transparency/blur**: only `--divider-on-dark` (25% accent) on dark sections; no glassmorphism.

## ICONOGRAPHY

- No icon assets were provided. **Substitution**: [Lucide](https://lucide.dev) via CDN — 1.5px-stroke line icons match the brand's precise, architectural line quality. Use `stroke-width="1.5"`, sized 16–24px, colored `currentColor`.
- Flagged: replace with the brand's own icon set if one exists.
- No emoji, no unicode glyphs as icons.
- Logos in `assets/`:
  - `logo-normal.svg` — full-color on light backgrounds
  - `logo-monotone.svg` — grayscale, for single-color print
  - `logo-colorbg.svg` — reversed (white text) on navy tile, for dark surfaces / avatars

## Index

- `styles.css` — global entry (imports everything below)
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `fonts.css`, `base.css`
- `assets/` — brand logos (see above)
- `guidelines/` — foundation specimen cards (Design System tab)
- `components/core/` — Button, IconButton, Badge, Tag, Card
- `components/forms/` — Input, Select, Checkbox, Radio, Switch
- `components/feedback/` — Tabs, Dialog, Toast, Tooltip
- `ui_kits/website/` — sample marketing-site screens (concept, not a recreation)

## Intentional additions

- Standard component set (no source inventory existed) — authored per brand foundations.
- Lucide icon substitution (no brand icons provided).
- Noto Sans/Serif TC font substitution (no font binaries provided) — **please supply brand fonts if they exist**.

## Caveats

- The `05.fp-deco` GitHub subtree was empty apart from a placeholder; nothing could be recreated from it.
- Logo SVGs were repaired (missing styles reconstructed); verify the reversed `logo-colorbg.svg` text color against the original artwork.
- 鴻築's Chinese logotype was not provided — only the Latin "FP Decoration" lockup exists in the files.
