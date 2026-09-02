---
tags: [campaign, batch, prospect-site, build-notes]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: radar-next10-2026-09-02c
slug: weathers-motors-and-auto-sales
date: 2026-09-02
source_refs:
  - "02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/copy/weathers-motors-and-auto-sales.json"
  - "02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/_kit/DESIGN.md"
---

# Build notes — Weathers Motors prospect site

## Palette (derived, not sampled — see placeholder note below)
- `--brand` `#1c3a5e` navy — heritage dealership feel, distinct from other two auto-vertical builds in this batch
- `--brand-2` `#0d1f33` deep navy neutral (footer/dark section)
- `--paper` `#f7f3e9` warm cream
- `--accent` `#b3312c` brick red, single primary-action color
- `--on-brand`/`--on-accent` `#ffffff`, `--on-deep` `#f3ede0` — all checked against DESIGN.md's 4.5:1 rule (accent-on-white and white-on-navy both clear ~6:1 and ~11:1)

## Fonts
- Display: Playfair Display (Georgia/Times New Roman fallback) — upscale/established character
- Text: Public Sans (system-ui fallback)
- One `display=swap` Google Fonts request, two families, per DESIGN.md

## Art
- Hero: bespoke "road-horizon" SVG — converging lane lines + a rising horizon arc + a small heritage badge/star shape. Deliberately drops the tyre-tread circles from `art/tread-road-auto.svg` (two other agents in this batch use the auto pattern) so composition and palette read as clearly different. Transform/opacity only, `prefers-reduced-motion` guarded, `aria-hidden`.
- Split panel: original century-timeline SVG (1922 → Today), not reused from any kit art file. Draw-in line animation is a single, quiet, below-the-fold moment (IntersectionObserver-triggered, reduced-motion falls back to static fill).
- Card icons: simple line-art glyphs per department (key, wrench, gear, tire, wrench+bumper, handshake), matching `icon_hint` fields.

## Copy fidelity
- Every field from `copy/weathers-motors-and-auto-sales.json` is used verbatim or near-verbatim: headline, subhead, both CTAs, intro, all 6 services, both proof items, about, all 3 FAQs, all 8 marquee items, phone, address, hours.
- CTA "Browse Pre-Owned Inventory" links to `https://www.weathersmotors.com/` (their real homepage — no specific inventory URL was in the brief, so it points at the source site rather than inventing a path). "Call the Dealership" is a real `tel:6105665475` link.

## Placeholders (per brief's `placeholders` list — never invented)
- `contact.email` was `PLACEHOLDER` in the brief. **Omitted entirely** rather than shown or faked; footer contact only lists phone and address, both sourced.
- `palette_hint.brand_color_seen` was `null` (no rendered screenshot available). Palette above was derived per DESIGN.md's rules (dominant/deep/accent + AA-checked text colors) rather than sampled from a live screenshot — flagged here as **unverified against the real brand color** until a visual harvest pass confirms it.

## Checklist pass (static review, this session)
- [x] No horizontal-overflow risks spotted at 390px/1440px — grid/split collapse via kit's existing breakpoints, no raw px widths added
- [x] h1 renders at first paint (no `data-reveal` on hero heading), Playfair Display has system fallback
- [x] Text/background pairs computed against DESIGN.md's 4.5:1 rule (see palette section)
- [x] Skip link, `:focus-visible` ring, all interactive elements are real `<a>`/`<summary>` — keyboard reachable
- [x] `prefers-reduced-motion` guards on hero SVG, timeline draw, marquee, parallax, reveals
- [x] JS off: `[data-reveal]` defaults to visible (no `.js` class without script), all links/anchors work, timeline shows static (no `.is-visible` needed since `[data-reveal]` unaffected)
- [x] `node -e` parse of the inline `<script>` block succeeds
- [x] Surface sequence checked by grep: panel → paper → panel → deep → paper → panel → accent → deep(footer) — no adjacent repeats, no two art-only sections adjacent (hero and split both pair art with copy)
- [x] File size: 32,992 bytes (~32.2 KB) local HTML, well under the 250 KB budget (Google Fonts request is the only external dependency)
- [x] `noindex,nofollow` present in `<meta name="robots">`; no invented phone numbers, prices, dates, or reviews

## Unverified
- Real on-site brand color (no screenshot/harvest available this pass) — palette is DESIGN.md-derived, not sampled.
- Rendered visual QA (browser screenshot, live contrast tool, actual 390px/1440px viewport check) has not been run — the above is a static/code-level review only. Recommend `qa-critic` / `site-grade` pass before this leaves draft status.

## Design layer (Claude Design port)

Ported the shared `_kit/design/weathers-motors-and-auto-sales/` assets into
`index.html`:

- **Header**: replaced the text-only `.brandmark` with an inline `logo.svg`
  (viewBox `0 0 242 88`, 34px height, width auto), `aria-label="Weathers
  Motors"` on the link. Wordmark (Georgia serif) + "MEDIA'S FAMILY DEALERSHIP
  · EST. 1922" subline legible at that height.
- **Footer**: added the mark alone (rounded-square key-fob icon, cropped
  `viewBox 0 0 84 88`) at 28px above the address/phone block.
- **Hero**: swapped the inline horizon-art SVG for the kit's `hero-art.svg`
  (`viewBox 0 0 900 600`, same 3:2 ratio as the original 1200x800 art) —
  direct fit into the existing `.hero-art` slot. Copy/CTA markup and reveal
  timing untouched.
- **Services grid (six departments)**: inlined `icons.svg` as a hidden sprite
  after `<body>` (six symbols — this is the one slug with a 6-item grid),
  replaced each card's inline SVG with `<use href="#icon-N"/>` per manifest
  mapping (car-key, wrench2, gear-box, shield-check, spray-can,
  handshake-dollar). Renamed `.card-icon` to `.ico`, resized to 28px,
  `color:var(--accent)` kept.
- **Favicon**: rebuilt as an SVG data URI from the cropped logo mark, no
  raster.
- Text-node diff: only the old plain-text brandmark removed (now SVG
  `<text>`); rest of copy byte-identical. File size 33,025 → 35,104 bytes. JS
  parses, anchors resolve, no adjacent art-only sections.

## Real logo (harvest pass, 2026-09-02)

Replaced the designed `logo.svg` with the real Weathers Motors oval logo,
harvested from their live Dealer.com site
(`https://pictures.dealer.com/w/weathersshift/1610/7bb3fe9c4d2c3fe3aee876c8ba832f77x.jpg`),
found in the `.header-logo` image tag (the generic "preowned" franchise icon
next to it was a stock Dealer.com asset, not their real mark — skipped that
one). Trimmed the white margin, quantized to a 48-color palette PNG, resized to
184x88. This is a JPEG logo on a white oval/box so no fake transparency was
applied; embedded directly in the light header, and with a white background
chip in the dark footer. Final asset 7.4 KB; page weight 32.3 KB → 53.0 KB.
`alt`/`aria-label` set to "Weathers Motors". QA harness re-run: pass.

## v2 (2026-09-02) — house-style rebuild

Rebuilt `index.html` from scratch per `_kit/v2/sections-v2.html` and
`_kit/v2/DESIGN-v2.md`, assembly-only (no new design elements authored).
Structure: header → hero → tear divider → services → stats → process rail →
split (about) → faq → marquee → slant divider → cta → footer, in the fixed
order, exact class names from `sections-v2.html`.

- **Identity tokens**: `--brand #1c3a5e`, `--brand-2 #0d1f33`, `--accent
  #b3312c`, `--paper #f7f3e9`, `--ink #14212c`, `--on-brand #ffffff`,
  `--on-deep #f3ede0`, `--on-accent #ffffff` — lifted byte-for-byte from the
  prior build's `:root` block.
- **Logo**: the real Weathers Motors PNG data URI (header 40px on a paper
  chip, footer 28px on a paper chip, unmodified base64 payload) and the
  existing SVG favicon, all carried over byte-identical.
- **Fonts**: Archivo Black (display) + Nunito Sans 400/700/800 (text) +
  Caveat 700 (script line), one Google Fonts request, `display=swap`, system
  fallbacks in the stack.
- **Hero**: `elements/hero-weathers-motors-and-auto-sales.svg` inlined in
  `.hero-art`; script line "Media's family dealership"; `dd-arrow` doodle
  pointing at the primary CTA; seal used (sourced year 1922, ring text "EST.
  1922 · MEDIA PA") since `proof[]` names a sourced founding year.
- **Services**: 6 cards, icon_hint → sprite id: car-key→ic-car,
  wrench→ic-wrench, gear→ic-parts, tire→ic-tire, car-repair→ic-spark
  (fallback, no direct match), handshake→ic-handshake.
- **Stats**: `proof[]` non-empty (2 items) → stats strip rendered,
  `data-count` set from the digits found in each proof value (1922, 104).
- **Process**: 4 steps, `--steps:4` on the rail.
- **Split/about**: seal reused at 240×240 on the brand-2 panel (no second
  composition invented).
- **FAQ**: all 4 items from the brief, verbatim.
- **Marquee**: all 8 items joined with " · ", duplicated once for the loop.
- **Contrast**: checked every text/background pair with a local WCAG script.
  Lowest pair is `.hero .eyebrow` (accent `#b3312c` on brand `#1c3a5e`) at
  **1.87:1** — this selector is fixed in `kit-v2.css` (`.hero
  .eyebrow{color:var(--accent)}`) and cannot be raised into AA range without
  either breaking the accent's other roles (CTA background contrast, accent-
  on-paper contrast) or editing the shared kit file, which is out of scope
  for an assembly pass. The kit's own default sample palette
  (`#d4762a`/`#1d4e6d`) fails the same pair at 2.72:1, so this looks like a
  known kit limitation rather than a per-site error — flagged, not patched.
  Every other pair checked (nav on header, body on paper, CTA button text,
  footer text, process numerals, FAQ questions) clears 4.5:1, several above
  10:1.
- **File size**: 80,811 bytes, under the 120 KB budget.
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
