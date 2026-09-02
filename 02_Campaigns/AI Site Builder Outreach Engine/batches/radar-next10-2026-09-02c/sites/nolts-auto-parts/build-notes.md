---
tags: [campaign, prospect-site, build-notes]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: radar-next10-2026-09-02c
slug: nolts-auto-parts
date: 2026-09-02
source_refs:
  - "02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/copy/nolts-auto-parts.json"
  - "02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/_kit/DESIGN.md"
---

# Build notes — nolts-auto-parts

## Palette
`palette_hint.brand_color_seen` was `null` (their live site is a 2002-era frames/shtml
build; WebFetch returned 503 twice, no screenshot taken). No confirmed brand color to
sample, so the palette was derived from the vertical brief instead and is **unverified**
against their live site:

- `--brand:#52565c` (steel graphite — placeholder, not sampled)
- `--brand-2:#1c1d1f` (near-black graphite)
- `--accent:#a8420f` (deep safety orange/rust — chosen over a brighter orange so
  eyebrow/link text clears 4.5:1 on `--paper`; brighter safety-orange hexes tested
  failed AA at that size)
- `--paper:#f5f1e9`, `--ink:#1c1b18`
- Contrast checked with a local script: brand/white 7.4:1, brand-2/white 16.9:1,
  accent/paper 5.4:1, accent/white 6.1:1, ink/paper 15.3:1 — all pass.

## Fonts
`Archivo Black` (display, blue-collar/mechanical pairing from DESIGN.md) + `Work Sans`
(text), both with system fallbacks. No two other sites in this batch should share this
exact pair with this exact accent.

## Art
Custom art replacing `tread-road-auto.svg`'s tire/road composition with a **parts-grid +
conveyor** motif built for this business specifically (B2B wholesale parts distributor,
not a dealership or tire shop): a faint static warehouse-bin grid pattern, three
horizontal conveyor-belt lines with rectangular dash "slats" scrolling at different
speeds, and two rotating hex-bolt symbols (double hexagon outline + threaded ring + bolt
head) standing in for tire treads. Same animation techniques as the kit (transform/
opacity only, reduced-motion off), entirely different composition, scale, and rotation
so it reads distinctly from the dealership/tire sites sharing the same base art file.
The split-section diagram ("how ordering works") is new inline SVG: call/catalog icon →
warehouse-grid icon → checkmark icon, connected by dashed lines, built only from facts
already stated in the brief (call or request catalog → network stock → hard-to-find
parts service).

## Placeholder fields (never invented, listed per the brief's `placeholders` array plus
one CTA routing decision)
- `contact.hours` — brief value was `"PLACEHOLDER"`. Rendered in the footer as
  "Hours not yet confirmed — call ahead" rather than a fabricated schedule.
- `contact.email` — brief value was `"PLACEHOLDER"`. No email address exists to link,
  so the CTA-band primary button ("Request the Parts Catalog") routes to
  `tel:717-445-6714` instead of a `mailto:` — the phone number is the only verified
  contact channel in the brief.
- `palette_hint.brand_color_seen` — null in the brief; palette above is a derived,
  unconfirmed choice (see Palette section).

## Checklist pass (static review — no browser render available in this session)
- [x] 390px/1440px: layout uses the kit's fluid grid, `clamp()` type scale, and
  `auto-fit` grids (services `minmax(260px,1fr)`, proof `minmax(280px,1fr)`,
  foot-grid `minmax(190px,1fr)`); split/nav collapse at 900px/860px per kit CSS. No
  fixed pixel widths beyond icon boxes and border widths — no overflow risk found by
  static scan.
- [x] H1 renders at first paint (no `data-reveal` on hero h1/lead), font stack ends in
  system serif fallback.
- [x] Contrast pairs checked via script (see Palette).
- [x] Skip link, `:focus-visible` ring, keyboard-only marquee pause on focus/touch
  (kit.js unchanged in this regard).
- [x] Reduced motion: kit's `@media (prefers-reduced-motion: reduce)` block kept
  verbatim, disables hero art animation, reveals, parallax, marquee.
- [x] JS off: `[data-reveal]` defaults to visible (`opacity:1;transform:none`) until
  `.js` class is added; all content and links work without JS.
- [x] Inline `<script>` parsed successfully with `node -e "new Function(script)"`.
- [x] File size: 30,853 bytes (~30.1 KB), well under the 250 KB budget.
- [x] Surface sequence: panel → paper → panel → paper → deep → paper → panel → accent
  — no two adjacent sections share a surface; no art-only section exists (hero and
  split both pair art with copy).
- [x] `noindex,nofollow` present.
- [x] No invented phone number, address, hours, price, or review — all copy pulled
  verbatim or lightly reformatted from `copy/nolts-auto-parts.json`.

## Unverified / not done
- No live browser render (390px/1440px, keyboard trap, contrast on rendered fonts)
  was performed — this is a static-code review only, per the checklist available in
  this session.
- Brand color, business hours, and email are unverified per the source brief itself
  (`harvest_status: "partial"`).
- Hand-off to `qa-critic` still required before this ships anywhere.


## Design layer (ported from `_kit/design/nolts-auto-parts/`)

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
  before 30,886 B / after 35,564 B, both well under the 60 KB ceiling; a
  text-only diff of `<main>`/`<footer>` copy (all tags and decorative SVG
  stripped) matched byte-for-byte before and after this pass — no copy was
  changed, only the header/footer/hero/icon/favicon assets.

## Real logo (harvest pass, 2026-09-02)

Replaced the designed icon+wordmark `logo.svg` with Nolt's actual banner logo,
harvested from `http://noltsautoparts.com/banner.gif` on their live homepage
(black bar under the header table). Trimmed the white margin, quantized to a
48-color palette PNG, resized to 400x29 (width-capped per the 400px max).
Embedded as a base64 data URI in header (`height:40px` container, image natively
short and wide) and a white-chip footer copy (`height:28px`). Final asset 3.2
KB; page weight 30.2 KB → 42.4 KB. `alt`/`aria-label` set to "Nolt's Auto
Parts". QA harness re-run: pass.

## v2 (2026-09-02) — house-style rebuild

Rebuilt `index.html` from scratch per `_kit/v2/sections-v2.html` and
`_kit/v2/DESIGN-v2.md`, assembly-only (no new design elements authored).
Structure: header → hero → tear divider → services → stats → process rail →
split (about) → faq → marquee → slant divider → cta → footer, in the fixed
order, exact class names from `sections-v2.html`.

- **Identity tokens**: `--brand #52565c`, `--brand-2 #1c1d1f`, `--accent
  #a8420f`, `--paper #f5f1e9`, `--ink #1c1b18`, `--on-brand #ffffff`,
  `--on-deep #f6f2ec`, `--on-accent #ffffff` — lifted byte-for-byte from the
  prior build's `:root` block.
- **Logo**: the real Nolt's Auto Parts banner PNG data URI (header 40px on a
  paper chip, footer 28px on a paper chip, unmodified base64 payload) and the
  existing SVG favicon, all carried over byte-identical.
- **Fonts**: Archivo Black (display) + Nunito Sans 400/700/800 (text) +
  Caveat 700 (script line), one Google Fonts request, `display=swap`, system
  fallbacks in the stack.
- **Hero**: `elements/hero-nolts-auto-parts.svg` inlined in `.hero-art`;
  script line "Serving the auto dealer trade"; `dd-arrow` doodle pointing at
  the primary CTA; seal used (sourced year 1959, ring text "EST. 1959 ·
  DENVER PA") since `proof[]` names a sourced founding year.
- **Services**: 6 cards, icon_hint → sprite id: spark-plug→ic-spark
  (fallback), brake-disc→ic-brake, oil-filter→ic-oil, battery→ic-card (no
  direct battery icon, closest rectangular shape), radiator→ic-refresh
  (circulation metaphor, no direct radiator icon), suspension→ic-alignment
  (closest chassis/geometry shape, no direct suspension icon).
- **Stats**: `proof[]` non-empty (2 items) → stats strip rendered,
  `data-count` set from the digits found in each proof value (1959, 9).
- **Process**: 4 steps, `--steps:4` on the rail.
- **Split/about**: seal reused at 240×240 on the brand-2 panel (no second
  composition invented).
- **FAQ**: all 4 items from the brief, verbatim.
- **Marquee**: all 7 items joined with " · ", duplicated once for the loop.
- **Contact placeholder**: `contact.hours` was `"PLACEHOLDER"` in the brief;
  rendered as the neutral phrase "Call ahead for current store hours"
  instead. `contact.email` was also `"PLACEHOLDER"` — the footer template
  has no email slot, so it's simply omitted, not fabricated.
- **Contrast**: checked every text/background pair with a local WCAG script.
  Lowest pair is `.hero .eyebrow` (accent `#a8420f` on brand `#52565c`) at
  **1.21:1** — this selector is fixed in `kit-v2.css` (`.hero
  .eyebrow{color:var(--accent)}`) and cannot be raised into AA range without
  either breaking the accent's other roles (CTA background contrast, accent-
  on-paper contrast) or editing the shared kit file, which is out of scope
  for an assembly pass. The kit's own default sample palette
  (`#d4762a`/`#1d4e6d`) fails the same pair at 2.72:1, so this looks like a
  known kit limitation rather than a per-site error — flagged, not patched.
  Every other pair checked (nav on header, body on paper, CTA button text,
  footer text, process numerals, FAQ questions) clears 4.5:1, several above
  10:1.
- **File size**: 70,285 bytes, under the 120 KB budget.
- **Verified**: `grep -i papa` returns 0 matches (stripped all HTML/CSS
  comments from kit assets before inlining); inline `<script>` parses via
  `node -e "new Function(...)"`; every `#anchor` href resolves to a real id;
  every `<use href="#...">` resolves to a `<symbol>` in the inlined sprites;
  surface sequence has no adjacent repeats (deep → paper → brand → panel →
  paper → panel → deep → accent); no two art-only sections are adjacent
  (hero and split both pair art with copy).
- **Not done / could not verify**: no live browser render this pass (390/1440
  viewport, rendered-font contrast, keyboard trap) — static/code-level review
  only. Hand off to `qa-critic` before this leaves draft status.
