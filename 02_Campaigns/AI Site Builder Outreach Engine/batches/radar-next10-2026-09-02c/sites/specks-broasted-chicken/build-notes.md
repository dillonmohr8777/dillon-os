---
tags: [campaign, batch, build-notes]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: radar-next10-2026-09-02c
slug: specks-broasted-chicken
date: 2026-09-02
source_refs: ["02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/copy/specks-broasted-chicken.json"]
---

# Build notes — Speck's Broasted Chicken

One-line summary: single-file prospect demo built on the shared kit, retro roadside-diner direction, all facts sourced from the copy brief.

## Palette
- `--brand:#c1272d` — tomato-red, derived from the signage/script-logo red on the live site (bg reported as `#fffcd7`).
- `--brand-2:#2b1210` — deep maroon-brown neutral tinted toward brand, used for footer/deep sections.
- `--accent:#d99a2b` — mustard/gold roadside accent, pushed cooler than the red brand per DESIGN.md.
- `--paper:#fdf6df` — warm cream tinted from their pale-yellow background, not identical to `#fffcd7` or `#fff`.
- `--ink:#241512` — near-black tinted warm/brown, not `#000`.
- `--on-accent:#1a0f06` — flipped to dark text because gold accent fails 4.5:1 with white.

## Fonts
- Display: **Bungee** (Google Fonts), fallback `Impact, "Arial Narrow Bold", sans-serif`. Chosen for googie/roadside-diner signage energy, distinct from the Fraunces/serif direction likely used on the Chinese-restaurant build sharing this same art file. Weight forced to 400 in the per-site skin since Bungee only ships one weight.
- Text: **Jost** (Google Fonts), fallback `system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.

## Art
- Hero: `art/steam-citrus-food.svg` adapted — citrus wheels replaced with an abstracted chicken-bucket silhouette (lid, handle, tapered body) under the rising-steam ribbons, plus a rotating "SINCE 1953 · COLLEGEVILLE, PA" enamel-badge (SVG `textPath` on a circular path, `sb-spin` 42s) and a smaller reversed "PIPIN' HOT" badge. This differentiates the composition, palette, and type from a same-kit Chinese-restaurant build.
- Split section: a second, smaller art moment — a standalone rotating "EST. 1953 · RANDY'S KITCHEN" badge over a simplified bucket glyph, cropped and rescaled from the hero composition per DESIGN.md's instruction not to repeat the same composition twice.
- Both art blocks are `aria-hidden="true"`, `currentColor`-only, transform/opacity animation only, and respect `prefers-reduced-motion` (animations disabled via the kit's guard + a local `.art-bucket` media query).

## Copy fidelity
- Every field from `copy/specks-broasted-chicken.json` is used verbatim or lightly reflowed into paragraphs/cards (services, proof, about, faq, marquee, contact, hours).
- CTAs link to the business's own listed order/maps assets per the brief notes: `https://specks.dine.online` (existing online ordering) and a Google Maps search query built from their listed address (no new ordering system implied, no invented listing).
- `phone`, `address`, and `hours` are the literal brief values.

## Placeholders (never invented)
- `contact.email` was `"PLACEHOLDER"` in the brief. Shipped as neutral phrasing: "Email available on request by phone." No email address was invented.

## Checklist pass (static review)
- 390px/1440px: no fixed-px layout; grid collapses to `col-12` under 900px per kit CSS; long stat label ("Same Family, Every Generation") wraps within its 200px+ grid track, no overflow.
- `h1` renders at first paint (no `data-reveal` on hero heading), Bungee falls back to Impact/system sans before the font-swap.
- Contrast: on-brand white on `#c1272d` red ≈ 5.5:1; on-accent dark `#1a0f06` on `#d99a2b` gold ≈ 9:1 — both pass AA. Body ink `#241512` on paper `#fdf6df` is very high contrast.
- Keyboard: skip link first in DOM, `:focus-visible` ring from kit CSS untouched, no custom tab traps, FAQ uses native `<details>/<summary>`.
- Reduced motion: kit's global media query plus a local one for the bucket/badge animations force `animation:none` and static reveals.
- JS off: all `[data-reveal]` content is visible by default (kit CSS guard), all links are real anchors/hrefs, marquee list is static text without JS.
- JS parse: extracted inline `<script>` block validated with `node -e "new Function(...)"` — parses without error.
- Surfaces alternate with no repeats: hero(paper) → intro(panel) → menu(paper) → proof(deep) → split(panel) → about(paper) → faq(panel)… note faq and split both land on `surface-panel` but are not adjacent (about/paper sits between them) → marquee(paper) → cta(accent) → contact(paper) → footer(deep). No two art-only sections are adjacent (hero and split both pair art with copy).
- `noindex,nofollow` present in `<meta name="robots">`.
- Total file size: **33,787 bytes** (~33 KB), well under the 250 KB budget — all CSS/JS/SVG inline, no external images, two Google Fonts requests (Bungee, Jost) are the only external network calls.

## Unverified / follow-ups for qa-critic
- Live brand-red hex (`#c1272d`) was estimated from the palette-hint description ("black/red text, hand-drawn script logo") — not sampled from a live screenshot pixel value. Flag as `unverified` until checked against the actual site.
- `specks.dine.online` and the Google Maps query link were not click-tested live in this session (no browser navigation run) — confirm they resolve before handoff to the client.
- No stats/testimonial counts existed in the brief beyond the 1953 founding year and the "same family" fact; the proof strip intentionally ships only those two, per "never invent a phone number, address, hours, price, or review."

## Design layer (Claude Design port)

Ported the shared `_kit/design/specks-broasted-chicken/` assets into
`index.html`:

- **Header**: replaced the text-only `.brandmark` with an inline `logo.svg`
  (viewBox `0 0 218 88`, 34px height, width auto), `aria-label="Speck's"` on
  the link. Wordmark ("Speck's" in Impact/Arial Narrow Bold) + "BROASTED
  CHICKEN · SINCE 1953" subline stay readable at that height.
- **Footer**: added the mark alone (rounded-square drumstick icon, cropped
  `viewBox 0 0 84 88`) at 28px above the address block.
- **Hero**: swapped the inline bucket-art SVG for the kit's `hero-art.svg`
  (`viewBox 0 0 900 600`, same 3:2 ratio as the original 1200x800 art) — fits
  the existing `.hero-art` slot with no rescale. Left the unrelated
  `.art.art-bucket` illustration in the split/story section untouched (it has
  its own `viewBox 0 0 400 300` and is not part of the hero slot).
- **Services grid ("Broasted Chicken" menu)**: inlined `icons.svg` as a hidden
  sprite after `<body>`, replaced each card's inline SVG with
  `<use href="#icon-N"/>` per manifest mapping (drumstick, sandwich, steak,
  bowl-soup, milkshake-star). This build's `.card-icon` was 40px; renamed to
  `.ico` at 28px, `color:var(--accent)` kept.
- **Favicon**: rebuilt as an SVG data URI from the cropped logo mark, no
  raster.
- Text-node diff: only the old plain-text brandmark removed (now SVG
  `<text>`); rest of copy byte-identical. File size 33,776 → 36,074 bytes. JS
  parses, anchors resolve, no adjacent art-only sections.

## Real logo (harvest pass, 2026-09-02)

Replaced the designed `logo.svg` with Speck's actual logo, harvested from
`http://speckschicken.com/images/v3_01.gif` (the site's top banner). Cropped to
the wordmark + Broasted Foods badge, dropped the "Chicken at its finest!"
tagline row, quantized to a 48-color palette PNG, resized to 350x88. Embedded
as a base64 data URI in header (`height:40px`) and a white-chip footer copy
(`height:28px`) since the footer is dark and the asset carries its own cream
background. Final asset 8.2 KB; page weight 35.2 KB → 55.9 KB. `alt`/`aria-label`
set to "Speck's Broasted Chicken". QA harness re-run: pass.
