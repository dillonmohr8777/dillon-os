# Build notes — union-chill-mat-company

## Palette
`palette_hint.brand_color_seen` was `null` (WebFetch only captured rendered
text, no CSS/hex). Derived per `DESIGN.md` fallback for an industrial
heating/cooling manufacturer, not sampled from a live screenshot:

- `--brand: #39474f` — gunmetal/steel blue-grey, the dominant industrial-
  equipment color family.
- `--brand-2: #161d20` — deep neutral tinted toward brand, footer/dark section.
- `--accent: #a83c0f` — rust/heater-glow orange-red, one primary action per
  screen. Initially drafted at `#c8461b`; darkened to `#a83c0f` after the
  contrast check below failed AA for eyebrow text on paper.
- `--paper: #f2f0e9` warm off-white tinted toward brand; `--ink: #181d1f`
  near-black tinted toward brand.
- `--on-brand`/`--on-deep`/`--on-accent`: all `#ffffff` (paper text on accent
  measured 6.33:1, on brand 9.6:1, on deep 14.48:1 — all clear AA).

## Fonts
Blue-collar/mechanical pairing from `DESIGN.md`: **Archivo Black** (display,
heavy, uppercase headings) + **Work Sans** (text), each with system fallbacks.
Radius tokens tightened (`--r-sm:2px`, `--r-md:4px`, `--r-lg:6px`,
`--r-pill:3px`) for a hard-edged industrial feel instead of the kit's rounder
default.

## Art
- Hero: `art/airstream-hvac.svg` adapted — kept the drifting air-band motion,
  recolored via `currentColor` to the steel palette, and added a second motif
  (a riveted-panel border with pulsing rivets) to read as equipment casing
  rather than generic HVAC ductwork.
- Split section: a bespoke SVG process diagram (not reused art) showing the
  four acquisition paths — Purchase / Rent / Lease / Refurbish — converging on
  an equipment box, direct from the `proof` array's acquisition-options fact.
- No two art-only sections are adjacent (the split section pairs the diagram
  with copy).

## Surfaces (checked for no adjacent repeats)
hero (paper, implicit) → intro (panel) → services (paper) → proof/stats
(deep) → split (paper) → about (panel) → FAQ (deep) → marquee (panel) → CTA
(accent) → contact (paper) → footer (deep).

## Placeholders — never invented, rendered as neutral phrasing
- `contact.hours` (`PLACEHOLDER` in source JSON) → rendered as "Call for
  hours." in the contact section and "Call for hours" in the footer hours
  column.
- `contact.email` (`PLACEHOLDER` in source JSON) → rendered as "Email on
  request — call to reach the right desk." No email address invented.

## Checklist self-review (static pass, this session)
- [x] No external images/scripts; only Google Fonts request plus two
  preconnects. `grep` confirms no `<img>` and no other external `src`/`href`.
- [x] Every CTA is a real anchor (`#contact` or `tel:+18004328441` /
  `tel:+17244526400`) — grepped all `.btn` elements.
- [x] `node -e` extracted and parsed the inline `<script>` block: parses OK.
- [x] Total file size: 36,100 bytes (~35.3 KB), well under the 250 KB budget
  (fonts load separately from Google and aren't counted in this file).
- [x] No two adjacent sections share a surface class (traced full sequence
  above).
- [x] No two art-only sections adjacent (both art sections carry copy).
- [x] `noindex,nofollow` present in `<meta name="robots">`.
- [x] Contrast: recomputed sRGB relative-luminance contrast ratios for all
  text/background pairs after darkening the accent; the accent-on-paper
  eyebrow pair (previously 4.24:1, failing AA) now measures 5.55:1.
- [ ] **Not verified in this pass**: live browser rendering at 390px/1440px,
  actual visual font-swap behavior, and a real screen-reader/keyboard pass.
  This was a static text/code review only (grep, a Node syntax check, and a
  Python WCAG contrast calculation) — no browser or automated a11y tool was
  run. Hand off to `qa-critic` for that verification before this goes further.

## Facts used (all sourced from `copy/union-chill-mat-company.json`)
Every non-placeholder contact detail, the 1946 founding date, the six product
lines, the three proof stats, the three FAQ pairs, and all eight marquee
items are copied verbatim or lightly reformatted from the brief. No facts
were invented.


## Design layer (ported from `_kit/design/union-chill-mat-company/`)

- Header brand mark: replaced the text-only `.brandmark` anchor with the kit's
  inline `logo.svg` (36px tall, `role="img"` + `aria-label` carried over from the
  asset, wordmark still legible at that height).
- Footer mark: extracted the icon-only portion of `logo.svg` (the rounded-square
  glyph, no wordmark text) into a standalone 28px `<svg>` placed above the
  business name in the first footer column.
- Hero: swapped the kit-demo inline art inside `.hero-art` for the site-specific
  `hero-art.svg`, keeping the same wrapping `<div class="hero-art" data-parallax>`
  and the existing `.hero-art>svg{width:100%;height:100%;object-fit:cover}` rule,
  so no CSS/viewBox change was needed for it to fill the slot. `h1`/subhead/CTAs
  and their positions were untouched; `h1` still carries no `data-reveal` and
  renders at 0ms.
- Services grid: inlined `icons.svg` once as a hidden `<svg style="display:none">`
  sprite immediately after `<body>`, then swapped each service card's bespoke
  inline icon for `<svg class="card-icon ico" style="width:28px;height:28px">
  <use href="#icon-N"/></svg>` in manifest order (`.card-icon` still supplies
  `color:var(--accent)` and the existing margin).
- Favicon: regenerated the `<link rel="icon">` as an SVG data URI built from the
  same footer mark markup (no raster asset).
- Verified: `node --check` on the extracted inline `<script>` passed; every
  in-page `#anchor` (including the new `#icon-N` sprite ids) resolves; file size
  before 36,133 B / after 37,905 B, both well under the 60 KB ceiling; a
  text-only diff of `<main>`/`<footer>` copy (all tags and decorative SVG
  stripped) matched byte-for-byte before and after this pass — no copy was
  changed, only the header/footer/hero/icon/favicon assets.

## Real logo (harvest pass, 2026-09-02)

Replaced the designed icon+wordmark `logo.svg` with Union Chill Mat Company's
actual decal logo, harvested from
`http://unionchill.com/wp-content/uploads/2013/06/union-chill-mat-company-logo.jpg`
on their live WordPress homepage. This is a JPEG on a white box with a thin
black border, so no fake transparency was applied — cropped out the outer
border and the baked-in "ZELIENOPLE, PA / 724-452-6400" address row (redundant
with the page's own contact block, and illegible at logo scale), keeping the
UCMC lettermark + flame icon. Quantized to a 48-color palette PNG, resized to
124x88. Embedded in the light header directly and with a white background chip
in the dark footer. Final asset 3.5 KB; page weight 35.3 KB → 45.2 KB.
`alt`/`aria-label` set to "Union Chill Mat Company". QA harness re-run: pass.
