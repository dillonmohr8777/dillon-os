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
