# Build notes — golden-sea

- **Palette**: `--brand:#2f6b52` (deep jade, chosen over the sampled `#EAA41E`
  page background per the brief's steer away from cliché red/dragon and
  because the logo itself was an unsampled image); `--brand-2:#132018`;
  `--paper:#faf3e6`; `--accent:#8a5215` (deep warm gold, contrast-checked
  against paper/white so it works as both eyebrow text and button fill).
  `on-brand`/`on-deep`/`on-accent` all set to white/cream after measuring
  contrast (brand vs white 6.28:1, accent vs paper 5.77:1, accent vs white
  6.37:1).
- **Fonts**: Bricolage Grotesque (display) + Jost (text) — the DESIGN.md
  "food, warm, hand-made" pairing, both with system fallbacks.
- **Art**: adapted `art/steam-citrus-food.svg`. Kept the rising wok-steam
  ribbons as-is (literal fit for a Chinese kitchen); replaced the citrus-wheel
  motif with two hand-drawn paper lanterns (swaying, not spinning) in the
  hero. The split section carries a second, distinct art moment: a bowl with
  crossed chopsticks and rising steam wisps. No dragons, no photography.
- **Content**: every field from `copy/golden-sea.json` is used verbatim —
  headline, subhead, both CTAs (with their phone-number notes folded into
  real `tel:`/`mailto:` links), intro, all 5 menu categories, all 3 proof
  points, full about copy, all 3 FAQs, all 8 marquee lines, and full contact
  block (phone, address, hours, email). `placeholders` was empty in the
  source, so no neutral-phrasing substitutions were needed.
- **Unverified**: none carried into the page as fact — the palette hint note
  that the live site's brand color was sampled from body background, not
  logo/signage, is flagged above as the reason for the jade departure. All
  business facts (hours, address, phone, chef, ownership, awards) are sourced
  directly from the JSON's own source_urls.
- **Checklist pass**: JS block extracted and parsed with `node -e` (no
  syntax errors). File is 30,961 bytes (~30 KB), well under the 250 KB
  budget, with no external images and only the Google Fonts request as a
  third-party call. Every `href="#..."` anchor has a matching `id`. No two
  adjacent sections share a surface class (paper → panel → paper → deep →
  paper → panel → paper → panel(marquee) → accent → deep(footer)); hero and
  split are the only sections carrying art and both pair it with real copy,
  so no two art-only sections are adjacent. `noindex,nofollow` is present.
  Not verified in a live browser: actual 390px/1440px pixel-level overflow
  and rendered-font contrast — recommend qa-critic do a browser pass before
  approval.

## Design layer (Claude Design port)

Ported the shared `_kit/design/golden-sea/` assets into `index.html`:

- **Header**: replaced the text-only `.brandmark` with an inline `logo.svg`
  (viewBox `0 0 218 88`, 34px height, width auto), `aria-label="Golden Sea"` on
  the link. Wordmark + "CHINESE RESTAURANT · BLUE BELL" subline legible at
  34px (Bricolage Grotesque display stack).
- **Footer**: added the mark alone (rounded-square dumpling-steam icon,
  cropped `viewBox 0 0 84 88`) at 28px above the address block.
- **Hero**: swapped the inline steam-art SVG for the kit's `hero-art.svg`
  (`viewBox 0 0 900 600`, same 3:2 ratio as the prior 1200x800 art) — clean
  drop-in fit, no rescale. Copy/CTA markup and reveal behavior untouched.
- **Services grid ("Five ways to order" / menu)**: inlined `icons.svg` as a
  hidden sprite after `<body>`, replaced each card's inline SVG with
  `<use href="#icon-N"/>` per manifest mapping (dumpling, noodles-bowl,
  chopsticks-bowl, fish, chef-hat). This build's `.card-icon` was 40px;
  renamed to `.ico` and resized to 28px, `color:var(--accent)` kept.
- **Favicon**: rebuilt as an SVG data URI from the cropped logo mark, no
  raster.
- Text-node diff: only the old plain-text brandmark removed (now SVG
  `<text>`); rest of copy byte-identical. File size 30,994 → 32,846 bytes. JS
  parses, anchors resolve, no adjacent art-only sections.

## Real logo (harvest pass, 2026-09-02)

Replaced the Opus-designed `logo.svg` with the actual Golden Sea logo, harvested
from `http://goldenseabluebell.com/images/header.gif` (their live homepage
header). Cropped to the logo band (dropped the baked-in nav row), converted GIF
to PNG, quantized to a 48-color palette, resized to 285x88 (2x of a 40-44px
header display height). Embedded as a `data:image/png;base64` URI in the header
(`height:40px`) and a matching chip-backed copy in the footer (`height:28px`,
white background chip since the site footer is dark and this raster asset has
its own light card background). Final asset 5.2 KB; page weight 30.3 KB → 44.7
KB. `alt`/`aria-label` set to "Golden Sea Chinese Restaurant". QA harness
(`qa2c.js`) re-run clean: pass, logo accessible-name check green.

## v2

Rebuilt `index.html` from scratch per `_kit/v2/sections-v2.html` grammar and
`_kit/v2/kit-v2.css`, replacing the prior build entirely. Same real logo
(byte-identical base64 PNG lifted from the v1 file's header `<img>` and
footer chip) and the same identity tokens lifted from v1 `:root`
(`--brand:#2f6b52`, `--brand-2:#132018`, `--ink:#17201b`, `--paper:#faf3e6`,
`--accent:#8a5215`, `--on-brand/--on-deep/--on-accent:#fff/#f6efe2/#fff`).

- **Head**: title from headline, meta description = subhead verbatim, favicon
  = the same base64 PNG logo, Google Fonts link for Archivo Black + Nunito
  Sans (400/700/800) + Caveat (700), `display=swap`.
- **Header**: dark `site-head`, logo on a white `.chip` (v1 logo is a raster
  with baked-in light background elements, dark surface behind it otherwise).
- **Hero**: eyebrow "Blue Bell, PA · Chinese Restaurant"; `.script` line
  "The Smile Is The International Language" (lifted verbatim from
  `marquee[]`); hero art = `hero-golden-sea.svg` inlined; one `dd-arrow`
  doodle pointing at the primary CTA; seal used (sourced year: proof[0] =
  "Family owned since 1992") with `SEAL_YEAR=1992`,
  `SEAL_RING_TEXT="GOLDEN SEA · BLUE BELL PA"`.
- **Services**: h2 "On The Menu" with `dd-underline`; 6 cards, icons mapped
  by best match — Special Appetizers→`ic-bag`, Chow Mein→`ic-bowl`, Lo
  Mein→`ic-wok`, Sweet & Sour→`ic-chicken`, Seafood→`ic-seafood`, Chef's
  Suggestions→`ic-sparkle` (no exact matches in the shared `icons.svg` sprite
  for Chinese-menu categories; all six are food/kitchen-adjacent, none
  fell back to `ic-spark`).
- **Stats**: shown (proof non-empty, 4 items). Only "Family owned since
  1992" carries `data-count="1992"` for the count-up; the other three proof
  values are text strings (award name, chef name, "126 + 16" dish count) and
  render statically — a `data-count` on those would have let `kit.js`
  `parseFloat()` truncate them to a bare leading number and overwrite the
  real text, so they were left uninstrumented on purpose.
- **Process**: 3 steps (`--steps:3`), verbatim from `process[]`.
- **Split/about**: cropped-and-scaled reuse of `hero-golden-sea.svg`
  (`transform:scale(2.1) translate(-6%,10%)` inside an `overflow:hidden`
  wrapper) rather than the seal again, so the seal (already used small in
  the hero) and the split art are two distinct compositions.
- **FAQ**: all 4 items verbatim.
- **Marquee**: all 8 lines joined with " · ", duplicated once for the loop.
- **CTA/footer**: verbatim from `cta_band` / `footer_line` / `contact`.
- **Contrast fix**: script-checked every text/background pair (WCAG relative
  luminance). One pair failed badly — `.hero .eyebrow{color:var(--accent)}`
  on the hero's `--brand` background computed to 1.01:1 (jade `--brand` and
  gold `--accent` are near-identical luminance). Added one override rule,
  `.hero .eyebrow{color:var(--paper)}` (paper vs brand = 5.69:1, AA pass),
  rather than touching the shared `--accent` token globally since every
  other accent-on-surface pair already cleared 4.5:1 (accent/paper 5.77:1,
  accent/white 6.37:1, on-brand/brand 6.28:1, on-deep/brand-2 14.72:1).
- `grep -i papa` initially caught three lines of *comment text* inside the
  inlined `kit-v2.css` itself (its own header comments reference "Papa" by
  name); reworded those three comments in the assembled file only (no
  functional CSS/markup change) so the non-negotiable grep check passes.
- File size: 87,207 bytes, under the 120 KB v2 budget. `node -e` extracted
  and parsed the inline `<script>` clean. Every `href="#..."` anchor and
  `<use href="#...">` resolves against an `id` in the same file (checked
  programmatically). No duplicate ids. Surface sequence: deep(hero) →
  paper(services) → brand(stats) → panel(process) → paper(split) →
  panel(faq) → deep(marquee) → accent(cta) → deep(footer) — no two adjacent
  sections repeat a surface, and hero/split (the only art-carrying sections)
  both pair art with real copy, so no two art-only sections are adjacent.
- Not verified this session: live-browser 390/1440px overflow render and
  actual rendered font contrast (computed via formula, not a Lighthouse/axe
  pass) — flagging for `qa-critic`.
