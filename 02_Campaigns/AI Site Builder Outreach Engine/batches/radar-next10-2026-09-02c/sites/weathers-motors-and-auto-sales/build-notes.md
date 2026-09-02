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
