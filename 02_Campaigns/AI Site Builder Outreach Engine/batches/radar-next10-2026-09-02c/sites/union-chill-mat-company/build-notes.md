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
