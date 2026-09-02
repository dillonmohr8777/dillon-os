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
