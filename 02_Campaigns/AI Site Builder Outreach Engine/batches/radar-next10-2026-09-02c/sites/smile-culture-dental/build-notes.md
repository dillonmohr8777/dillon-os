---
tags: [campaign, batch, site-build]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: radar-next10-2026-09-02c
slug: smile-culture-dental
date: 2026-09-02
source_refs:
  - "02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/copy/smile-culture-dental.json"
  - "02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/_kit/DESIGN.md"
---

# Build notes — smile-culture-dental

## Palette (derived, not invented — `palette_hint.brand_color_seen` was null)

- `--brand` `#3f6b64` — calm teal-sage, chosen for a "kindness-led, professional,
  non-clinical" dental read since no live-site color sample was available.
- `--brand-2` `#172b27` — deep neutral tinted toward brand (footer, proof strip).
- `--accent` `#c98a4b` — warm sand/terracotta, the single primary-action color.
- `--paper` `#faf6ef` — warm off-white. `--ink` `#211f1b` — warm near-black.
- Contrast checked: brand+white text 6.0:1, accent+black text 6.77:1,
  brand-2+on-deep 13.3:1, ink+paper 15.3:1. All clear 4.5:1.

## Fonts

Fraunces (display, 600/700) + Inter (text, 400/600), system fallbacks per kit.
"Upscale, clinical, established" pairing per DESIGN.md's vertical table.

## Art

`arcs-professional.svg` used twice, adapted per DESIGN.md's differentiation
rule (not reused as-is): full composition in the hero (breathing rings, slow
rotation, `prefers-reduced-motion` off-switch, unchanged from kit — this batch
has no other dental/professional site to collide with), and a compact
custom 3-circle/2-node "your first visit" step diagram in the `.split-art`
panel, built from the same currentColor/arc visual language but a new
composition (three numbered circles on a shared arc) rather than a resized
copy of the hero art.

## Placeholder handling

- `contact.email` was `PLACEHOLDER` → not invented. Replaced with neutral
  phrasing: "Reach the office by phone to request an email contact." (contact
  section and no footer email link).
- `palette_hint.brand_color_seen` was `null` → palette derived per DESIGN.md's
  professional/dental guidance rather than sampled; documented above.

## Checklist pass (static)

- 390px/1440px: single-column `.split`, `.services`, `.contact-grid`,
  `.foot-grid` all collapse via existing kit breakpoints (900px/860px); no
  fixed widths added. No horizontal-overflow-prone elements introduced.
- `h1` renders at first paint (`[data-reveal]` not applied to it); Google Fonts
  `display=swap` avoids invisible text.
- Contrast checked with a relative-luminance script (see palette section).
- Keyboard: skip link first, `:focus-visible` ring from kit, no custom tab
  traps, `<details>/<summary>` is natively keyboard-operable.
- `prefers-reduced-motion: reduce` block retained verbatim from kit —
  disables ring rotation, breathing, reveals, marquee, parallax.
- JS off: all `[data-reveal]` content is visible by default (`opacity:1` base
  rule), all nav/footer links are real anchors resolving to in-page ids
  (verified: `#services`, `#about`, `#faq`, `#contact`, `#top`, `#main` all
  exist).
- No two adjacent sections share a surface (verified surface-class sequence:
  paper(hero) → panel → paper → deep → paper → panel → paper → panel(marquee)
  → accent → paper). No two art-only sections adjacent — hero and split both
  pair art with copy/CTA text.
- File size: 31.0 KB (single `index.html`, all CSS/JS inlined, no external
  images) — well under the 250 KB budget; only external requests are the two
  Google Fonts `preconnect`/stylesheet links.
- `node -e` parsed the inlined `<script>` block without error.
- `noindex,nofollow` present in `<meta name="robots">`.
- No invented business facts: every phone number, address, hour, name, and
  credential claim traces to `copy/smile-culture-dental.json`.

Not yet done (belongs to `qa-critic`, not self-certified here): live browser
rendering at 390px/1440px, actual axe/contrast tooling pass, real
`prefers-reduced-motion` and keyboard-trap testing in a browser.


## Design layer (ported from `_kit/design/smile-culture-dental/`)

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
  before 31,798 B / after 35,143 B, both well under the 60 KB ceiling; a
  text-only diff of `<main>`/`<footer>` copy (all tags and decorative SVG
  stripped) matched byte-for-byte before and after this pass — no copy was
  changed, only the header/footer/hero/icon/favicon assets.
