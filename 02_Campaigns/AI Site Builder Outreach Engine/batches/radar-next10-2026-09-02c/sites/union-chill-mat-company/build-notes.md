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

## v2 rebuild (2026-09-02, sections-v2.html grammar)

Rebuilt `index.html` from scratch per `_kit/v2/DESIGN-v2.md` and
`_kit/v2/sections-v2.html`, assembling only (no new copy, art, or icons
authored here).

- **Fonts**: Archivo Black (display) + Nunito Sans 400/700/800 (text) +
  Caveat 700 (script), Google Fonts `display=swap`, per the house v2 kit.
- **Tokens lifted from v1** `index.html` `:root`, unchanged: `--brand:#39474f`,
  `--brand-2:#161d20`, `--ink:#181d1f`, `--paper:#f2f0e9`, `--accent:#a83c0f`,
  `--on-brand:#fff`, `--on-deep:#f1ece1`, `--on-accent:#fff`,
  `--on-paper:var(--ink)`. `--accent` already passed every real on-page pair
  at v1's value; no further darkening needed here (see contrast note).
- **Logo**: header (40px) and footer (28px) `<img>` tags copied
  byte-identical from the v1 file (same base64 PNG, Union Chill Mat Co.'s
  real harvested decal logo). Header sits on a `.chip` (paper background)
  per the design rule for a dark header. Favicon `<link>` copied
  byte-identical too.
- **Icons mapped** (`icon_hint` → sprite id, from `_kit/v2/elements/icons.svg`):
  flame→`ic-furnace`, heater→`ic-spark` (no radiant/sun-ray icon exists in
  the sprite; spark's bolt shape was the closest visual match),
  snowflake→`ic-snowflake`, fan→`ic-fan`, bolt→`ic-factory` (no
  lightning-bolt icon in the sprite; factory reads as industrial power for
  the generator card), droplet→`ic-oil` (no droplet icon literally named;
  `ic-oil`'s path is a droplet silhouette, closest shape match for
  dehumidifiers). No `icon_hint` fell back to `ic-spark` by default (all six
  got an intentional pick).
- **Doodles**: `dd-underline` under the services `h2`; one `dd-arrow` in the
  hero art pointing at the primary CTA.
- **Seal**: yes — proof includes a sourced year ("In business since 1946",
  `source_urls`: unionchill.com/about/). Seal used in the hero
  (`seal-float`, small) and again large (240px) as the split-section art on a
  `--brand-2` panel, with ring text "UNION CHILL MAT CO" and year 1946.
- **Script line**: "Purchase, Rent, Lease, or Refurbish", lifted verbatim
  from the `marquee[]` array (not invented).
- **Process rail**: `--steps:4` (4 items from `copy.process`).
- **Stats**: rendered (proof array non-empty), 4 items; two are numeric
  ranges ("1 to 50 tons", "300,000 to 2,000,000 BTUH") so `data-count` only
  fires the count-up on the first number found in each string — the full
  string still renders as the static label text either way, so no data is
  lost or misrepresented.
- **Placeholders**: `contact.hours` and `contact.email` (both `PLACEHOLDER`
  in source JSON) rendered as "Call for hours" and "Email on request" in the
  footer contact block. Nothing invented.
- **Structural checks (this pass)**: `node -e` parsed the inline `<script>`
  cleanly; every `href="#..."` anchor and every `<use href="#...">` resolves
  (checked programmatically, zero missing); file size 72,901 bytes (well
  under the 120 KB ceiling); `grep -i papa` returns nothing (CSS/SVG
  attribution comments stripped during assembly — the `pa-*` class/id prefix
  itself is untouched, only the literal word "Papa" in comments was
  removed); surface sequence hero(brand)→services(paper)→stats(brand)→
  process(panel)→split(paper)→faq(panel)→marquee(deep)→cta(accent)→
  footer(deep), no two adjacent sections share a surface; no two art-only
  sections are adjacent (hero and split both pair art with copy, and are
  separated by four sections).
- **Contrast** (WCAG relative-luminance, computed programmatically for every
  real text/background pair that appears in the markup): ink on paper
  14.92:1, accent on paper 5.55:1, accent on panel 4.60:1 (passes but with a
  thin margin — CSS `color-mix` may compute the panel tint slightly
  differently than the sRGB linear-blend used here; flagging for a live
  browser re-check), on_brand on brand 9.60:1, on_deep on brand2 14.48:1,
  paper on brand2 14.96:1, on_accent on accent 6.33:1.
  - **Fixed**: hero eyebrow ("{town} · HVAC") was accent-on-brand at 1.52:1
    (fail). Same fix as the sibling site: scoped inline
    `style="color:var(--on-brand)"` on that one `<p class="eyebrow">` (white
    on brand, 9.60:1) rather than editing `kit-v2.css`'s
    `.hero .eyebrow{color:var(--accent)}` rule.
  - **Known, not fixed (kit-level, out of scope for an assembler)**:
    `.btn-ghost:hover` sets `background:currentColor;color:var(--paper)` —
    on the hero and CTA band this renders near-white text on a near-white
    hover background (contrast ≈1:1). Authored in the shared kit, not a
    per-site token; flagging for qa-critic.
- **Not verified this pass**: live browser rendering at 390/1440, real
  screen-reader pass, visual QA of the seal/doodle placement. Hand to
  `qa-critic`.
