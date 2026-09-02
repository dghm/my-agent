# Meyi Global Design System

Design system for **Meyi Global Co., Ltd** (美熠環球有限公司 / MEYI GLOBAL COMPANY LIMITED) — a monochrome, architectural corporate identity built on pure black and white with a single dark-charcoal support color.

## Sources

- Uploaded brand assets: `uploads/Meyi-Logo.svg` (full wordmark "MEYI GLOBAL COMPANY LIMITED" with M monogram), `uploads/Meyi-Mark.svg` (M monogram alone). Both provided as white fills.
- GitHub repo: https://github.com/dghm/claude-design-system — **empty at build time** (no commits); nothing could be sourced from it. If it gains content later, explore it to improve designs built on this system.
- Brand brief: 「以 #000, #FFF 為主的設計方向，輔色以 #24272D 為主」 — black & white primary, #24272D as the supporting color.

No product codebase, Figma, decks, or copy samples were provided. Components below are a standard set authored from the brand brief (see "Intentional additions").

## Brand summary

- **Company**: Meyi Global Co., Ltd — Taiwan-based (user domain .tw). No product surfaces were provided; the UI kit models a corporate marketing site.
- **Mark**: a geometric "M" monogram formed by two mitered strokes with a center keel; reads as converging paths / a global junction. Sharp corners, no curves except small corner rounds on stroke ends.
- **Logotype**: wide geometric grotesque, all caps, generous letterspacing on the "COMPANY LIMITED" line.

## CONTENT FUNDAMENTALS

No source copy was provided; these rules are derived from the brand's visual character and standard bilingual corporate practice. **Treat as provisional — replace with real product copy when available.**

- Tone: composed, precise, understated. No hype, no exclamation marks, no emoji.
- Bilingual-ready: Traditional Chinese + English. Chinese set in Noto Sans TC; keep line lengths short.
- Casing: sentence case for body and UI controls; UPPERCASE with wide tracking (`--tracking-wide`) reserved for eyebrows, section labels, and nav.
- Voice: third person / declarative ("Meyi Global connects…"), "we" acceptable in about/contact copy. Address the reader as "you" sparingly.
- Numbers and facts over adjectives. Short sentences. No filler.
- Examples: eyebrow `GLOBAL TRADE`, headline `Precision across borders.`, button `Contact us`.

## VISUAL FOUNDATIONS

- **Color**: strictly monochrome. White pages with near-black (#0A0A0A) text; inverse sections use `--ink` #24272D (not pure black) so pure #000 stays reserved for maximum-contrast moments (footer, hero overlays). Grays are cool-neutral (blue-leaning). Status colors exist but are muted and rare.
- **Type**: Archivo (display + body; substitute — see Fonts) with Noto Sans TC for CJK; IBM Plex Mono for figures/codes. Display headlines: 600–800 weight, tight tracking (−0.02em), 1.1 leading. Eyebrows: 12–13px uppercase, +0.14em tracking, `--text-muted`.
- **Spacing**: 4-based scale (`--space-1..9`, 4→96px). Page container 1200px. Sections breathe: 96px vertical rhythm on marketing surfaces.
- **Backgrounds**: flat solids only — white, `--gray-50`, `--ink`, `--black`. No gradients, no textures, no patterns. Imagery (when used) should be B&W or heavily desaturated, cool tone.
- **Borders**: 1px `--gray-200` on light, `rgba(255,255,255,.16)` on dark; 2px near-black for emphasis (e.g. active tab underline).
- **Corner radii**: near-square. 0–4px on cards/inputs/buttons; pill radius only for badges/tags. Never large rounds.
- **Shadows**: essentially none. Cards are flat, defined by borders. Only overlays (dialog, tooltip, toast) cast a shadow (`--shadow-overlay`).
- **Motion**: restrained. 120–200ms, standard easing, opacity/transform fades only. No bounces, no springs, no looping decoration.
- **Hover**: light surfaces darken one step (white→gray-50, black button→`--ink`); dark surfaces lighten via white alpha. Press: darken one more step; no shrink transforms.
- **Focus**: 2px offset ring in `--focus-ring` (charcoal alpha).
- **Transparency/blur**: white-alpha text on dark surfaces; no glassmorphism, no backdrop blur.
- **Cards**: white, 1px border, 0–4px radius, no shadow, 24–32px padding.

## ICONOGRAPHY

- No icon assets were provided in any source.
- **Substitution (flagged)**: [Lucide](https://lucide.dev) via CDN — 1.5px stroke, square-ish geometry matches the mark's precision. Load: `<script src="https://unpkg.com/lucide@latest"></script>` or copy individual SVGs. Use `stroke-width: 1.5`, sized 16/20/24px, colored `currentColor`.
- No icon font, no emoji, no unicode-as-icon. Icons are supporting, never decorative — pair with a text label wherever possible.
- Logos in `assets/`: `meyi-logo-white/black.svg` (full lockup), `meyi-mark-white/black.svg` (monogram). White variants are the provided originals; black variants are recolors (#0A0A0A) for light backgrounds. Minimum clear space: height of the monogram's stroke width on all sides; never place the white logo on light gray surfaces lighter than `--gray-600`.

## Fonts — SUBSTITUTION FLAG

No font binaries were provided. Nearest Google Fonts matches chosen:
- **Archivo** — geometric grotesque close to the wordmark's letterforms (display + body)
- **Noto Sans TC** — Traditional Chinese
- **IBM Plex Mono** — numeric/code accents

**Ask the user for official font files** and replace `tokens/fonts.css` with real `@font-face` rules when available.

## Intentional additions

No source defined a component inventory, so a standard set was authored: Button, IconButton, Input, Select, Checkbox, Radio, Switch, Card, Badge, Tag, Tabs, Dialog, Toast, Tooltip — plus SiteHeader/SiteFooter inside the website UI kit. All styling derives from the tokens.

## Index

- `styles.css` — global entry (imports everything under `tokens/`)
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `effects.css`, `fonts.css`
- `assets/` — logo + mark, white/black variants
- `guidelines/` — foundation specimen cards (Design System tab)
- `components/core/` — reusable primitives (see Intentional additions)
- `ui_kits/website/` — corporate marketing site recreation (modelled, not sourced)
- `templates/` — reusable starting templates (if any)
- `SKILL.md` — agent skill entry point
