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
