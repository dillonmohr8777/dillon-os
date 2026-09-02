---
tags: [campaign, prospect-site, build-notes]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: radar-next10-2026-09-02c
slug: sangillo-tire-center
date: 2026-09-02
source_refs:
  - "02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/copy/sangillo-tire-center.json"
  - "02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/_kit/DESIGN.md"
---

# Build notes — sangillo-tire-center

## Palette
- `--brand` `#583E7D` — sampled from the client's own stylesheet per `palette_hint.brand_color_seen`.
- `--brand-2` `#241a34` — deep neutral tinted toward brand purple (footer, dark section).
- `--paper` `#f8f4f7` — warm off-white tinted toward brand.
- `--ink` `#211a2b` — near-black tinted toward brand.
- `--accent` `#f2a93b` — warm amber, since brand is cool. Used for the single primary CTA and marquee dots only.
- `on-accent` set to dark ink (`#241a34`) because amber is a light-mid surface.

## Fonts
- Display: Archivo Black (blue-collar/mechanical) with Georgia/Times fallback.
- Text: Work Sans with system-ui fallback.
- One `display=swap` request, two families total.

## Art
- Hero: adapted `tread-road-auto.svg` — single hard-cropped, oversized tread ring rotated and pushed off-canvas top-right (not the kit's two-ring composition), thin single/double road-scroll lines at the bottom, one haze ellipse. Differentiates from the kit demo and from any sibling auto-vertical build sharing the same base pattern via scale, rotation, and crop.
- Split section: custom SVG "balance/rotation" gauge (concentric rings + crosshair spokes + one pointer dot) paired with the rotation/balancing copy — purely illustrative, no invented tread-depth numbers.
- All art is `currentColor`, `aria-hidden="true"`, transform/opacity animation only, respects `prefers-reduced-motion`.

## Placeholders
- `contact.email` was `PLACEHOLDER` in the source JSON. No email address or link was invented; the contact section and footer surface phone, address, and hours only, and the CTA band directs to the phone number instead.

## Checklist pass (static review)
- 390px/1440px: grid and split collapse to single column under 900px per kit CSS; no fixed px widths added; measure capped at 68ch — no horizontal overflow expected.
- Every CTA is a real anchor: `tel:+16105863340` (hero, header, CTA band, footer, contact), Google Maps link for directions/address, in-page `#services` / `#about` / `#faq` / `#contact` anchors all matched to existing ids.
- `node --check` on the extracted inline script passed (syntax valid).
- File size: 31,686 bytes (~31 KB), well under the 250 KB budget.
- Surface rhythm: paper(hero) → panel(intro) → paper(services) → deep(proof) → panel(split) → paper(about) → panel(faq) → deep(marquee) → accent(cta) → paper(contact) → deep(footer). No two adjacent sections share a surface.
- No art-only section: hero and split both pair art with copy; no bare decorative section exists.
- `noindex,nofollow` present in `<meta name="robots">`.
- All copy fields from `sangillo-tire-center.json` used verbatim (headline, subhead, both CTAs, intro, all 5 services, both proof items, about, all 3 FAQ, all 7 marquee items, phone/address/hours).

## Unverified / not independently confirmed
- All facts (60+ years, address, phone, hours, services, brand color) are as supplied in the copy brief, sourced from the client's own site (`source_urls`); not independently re-verified live during this build.


## Design layer (ported from `_kit/design/sangillo-tire-center/`)

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
  before 31,719 B / after 34,538 B, both well under the 60 KB ceiling; a
  text-only diff of `<main>`/`<footer>` copy (all tags and decorative SVG
  stripped) matched byte-for-byte before and after this pass — no copy was
  changed, only the header/footer/hero/icon/favicon assets.

## Real logo (harvest pass, 2026-09-02)

Replaced the designed icon+wordmark `logo.svg` with Sangillo's actual logo,
harvested from `http://www.sangillos.com/images/logo4.png` on their live
homepage. The source PNG had a flat near-white (253,253,253) background, not a
photographed white box, so it was safely color-keyed to transparent, trimmed,
then re-binarized to a hard alpha mask and quantized to a 16-color palette PNG,
resized to 400x41. Embedded as a base64 data URI in header (`height:40px`) and
a white-chip footer copy (`height:28px`, chip added because the footer is dark
and the cyan/black wordmark needs a light backing — the logo itself was never
recolored). Final asset 12.2 KB; page weight 33.7 KB → 65.0 KB (largest of the
batch — still well under the 120 KB ceiling). `alt`/`aria-label` set to
"Sangillo Tire Center". QA harness re-run: pass.
