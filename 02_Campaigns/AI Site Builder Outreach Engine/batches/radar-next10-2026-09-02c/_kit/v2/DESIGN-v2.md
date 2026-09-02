# DESIGN v2: house style for bespoke home pages

Summary: layout, type, rhythm, motion, and section grammar come from the Papa
Advertising reference (`design-references/papa-advertising/`). The prospect's
identity sits on top: their EXACT logo, their name, their facts, a palette
pulled from that logo. Papa's wordmark and client logos never appear.

## Non-negotiables
1. Home page only. One file, `sites/<slug>/index.html`, under 120 KB, no
   external images, Google Fonts allowed with system fallbacks.
2. The exact real logo in the header (36 to 44 px tall), in the footer (28 px),
   and as the favicon. `alt` and `aria-label` carry the business name as they
   write it. Never recolor, redraw, or retype a real logo. If the logo is dark
   and the header is dark, put it on a paper chip. The two slugs without a
   verifiable logo keep the designed mark and are flagged in the hub.
3. `grep -i "papa"` on any site file returns nothing.
4. Copy comes from `copy/<slug>.json` verbatim. Placeholders render as neutral
   phrasing and are listed in `build-notes.md`.

## Tokens
`kit-v2.css` defines the house tokens (`--pa-*`) and maps them onto the v1
token names so v1 section CSS still works. Per site, the builder sets only:
`--brand`, `--brand-2`, `--accent`, `--paper`, `--ink` from the real logo:
- `--brand`: the logo's dominant color.
- `--accent`: the logo's second color, or a warm accent if the logo is one color.
- `--brand-2`: `--brand` darkened to about 18 percent lightness.
- `--paper`: warm off-white; `--ink`: near-black tinted toward `--brand-2`.
Then check every pair at 4.5:1; darken `--accent` or lift `--on-accent` to white.

## Section grammar (order is fixed)
1. `header.site-head`: logo left; right side has the phone as a `tel:` link and
   one solid button. Menu links are section anchors.
2. `section.hero`: eyebrow (town plus trade), headline, subhead, primary and
   secondary buttons, the hero art from `elements/hero-<slug>.svg` in the art
   slot, the seal only when the year is a sourced fact.
3. divider (tear or slant, one only).
4. `section.services`: "What we do" eyebrow, 4 to 6 cards, each with an icon
   from `elements/icons.svg`, title, 2 to 3 sentence blurb.
5. `section.stats`: proof strip, only if `proof[]` is non-empty. Count-up on
   numbers already in the HTML.
6. `section.process`: 3 to 4 numbered steps in a horizontal rail; big numerals.
7. `section.split`: about copy on one side, a second art moment on the other
   (reuse a cropped region of the hero art or the seal on a panel; never the
   same composition twice).
8. `section.faq`: 4 `details/summary` items.
9. `section.marquee`: one line, services and towns, pauses on hover.
10. divider before the CTA.
11. `section.cta`: `cta_band.headline`, support line, button, secondary link.
12. `footer.site-foot`: logo mark, footer_line, contact block, section links.

## Rhythm and type
- Container 1200 px, section padding from `--pa-section-y` (clamp 72 to 128 px).
- Display type heavy and tight; eyebrows uppercase with wide tracking; body
  loose (1.6). Headline under 8 words, one line at 1440 where possible.
- Never two art-only blocks adjacent. Surfaces alternate paper, panel, deep.

## Motion
- Hero art is the one loud moment. Everything else: reveals on scroll (kit.js),
  count-ups, marquee. All off under `prefers-reduced-motion`. No layout shift.

## Checklist before handing to QA
390 and 1440 with no horizontal overflow; h1 visible at 0 ms; logo renders in
header and footer with accessible name; every `use href` resolves; every anchor
resolves; contrast 4.5 or better on every text pair; JS parses; no console
errors except font CDN in the sandbox; file under 120 KB.
