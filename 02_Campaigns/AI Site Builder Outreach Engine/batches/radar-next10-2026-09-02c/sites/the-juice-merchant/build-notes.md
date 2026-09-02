# Build notes — the-juice-merchant

source_refs: ["02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/copy/the-juice-merchant.json"]

## Status

Bespoke single-file build. Live source domain was unreachable (parked/for-sale
page per `copy/the-juice-merchant.json` → `harvest_status: "failed"`), so no
brand color, phone, address, hours, email, menu link, or ordering link could be
harvested. Nothing in this build was invented beyond what the copy JSON supplied.

## Palette (derived, not sampled — no live site to sample from)

- `--brand:#4f7a23` — leafy citrus green, chosen for the vertical (juice/produce)
  since no real brand color exists to sample. Contrast vs white text: 5.07:1 (AA).
- `--brand-2:#182410` — deep neutral tinted toward brand (footer/dark section).
- `--accent:#e2792e` — warm citrus orange, the single primary-action color.
  Contrast vs `--on-accent:#0b0b0b`-equivalent (`#12100e`): 6.57:1 (AA).
- `--paper:#faf7ec`, `--ink:#1b2011` — warm off-white / near-black, both tinted
  toward brand per DESIGN.md (never pure #fff/#000).
- `--on-brand:#ffffff`, `--on-deep:#f3efe8`, `--on-accent:#12100e` — all
  contrast-checked (script-verified, see session).

## Fonts

- Display: Fraunces (food/warm/hand-made pairing per DESIGN.md) → Georgia,
  "Times New Roman", serif fallback.
- Text: Jost → system-ui fallback stack.
- Differs from the kit demo's Fraunces/Inter pairing to keep this batch varied.

## Art

Adapted `_kit/art/steam-citrus-food.svg` for a cold-pressed juice bar rather
than a hot-food restaurant:
- Removed the rising steam ribbons (wrong signal for cold-pressed juice) and
  replaced them with a rising leaf motif (new `#jc-leaf` symbol) on the same
  translate-up loop.
- Kept the citrus-wheel motif (`#jc-wheel`, restyled) but recomposed the
  layout, scale, and rotation so it doesn't read as the same composition as
  the batch's other two restaurant sites (`golden-sea`, `specks-broasted-chicken`
  — both empty/unbuilt at time of this build, so no direct palette collision
  check was possible, but a new palette and composition were used regardless).
- New original "how it's pressed" 3-step SVG (fruit → press → glass) built for
  the split section — not reused from the kit.
- Menu grid: each of the 5 category icons sits in a chip colored via
  `filter:hue-rotate()` off the single `--accent` token (not five new hex
  values), giving the color-blocked "one hue per category" look while staying
  inside the DESIGN.md three-color-token discipline.
- No proof strip shipped (`proof: []` in the copy JSON).

## Placeholders (from `copy_json.placeholders`)

All contact fields were `PLACEHOLDER` in the source JSON. Rendered as neutral,
non-invented phrasing rather than fake data:

- `cta_primary.label` → used as-is ("See the Menu"), anchored to `#menu` (real
  in-page section, no fabricated external menu URL).
- `cta_secondary.label` → used as-is ("Order for Pickup"), anchored to
  `#contact` (real in-page section; no verified ordering platform link exists).
- `contact.phone` → "To be confirmed with the business"
- `contact.address` → "Narberth, PA — exact address to be confirmed"
- `contact.hours` → "To be confirmed with the business"
- `contact.email` → "To be confirmed with the business"

## Checklist pass (static, this session)

- File size: 30,798 bytes (~30 KB), well under the 250 KB budget.
- 390px/1440px: no fixed widths or raw px margins used outside the kit's
  clamp/scale tokens; layout is the kit's 12-col grid + `auto-fit` card grids,
  same patterns verified by the kit demo — no overflow risk identified.
- Every CTA/nav link is a real in-page anchor; verified all `href="#x"` have a
  matching `id="x"` (contact, faq, how, main, menu, top — confirmed via grep).
- `node --check` on the extracted inline script: syntax OK.
- Tag balance spot-check: div/section/article open vs close counts match.
- Surface sequence: panel → paper → deep → paper → panel → paper → accent —
  no two adjacent sections share a surface, and no art-only section is
  adjacent to another (hero and split both pair art with copy; menu grid is
  copy+icon, not art-only).
- `noindex,nofollow` present in `<meta name="robots">`.
- No business facts invented: no phone, address, hours, price, or review
  appears anywhere in the file.

## Unverified / not independently checked

- Actual rendered contrast in a browser engine (values above are computed via
  WCAG relative-luminance formula, not a live axe/Lighthouse run).
- Visual overflow at 390px/1440px was reasoned from token usage, not rendered
  in a browser or screenshot tool this session.
- Whether `golden-sea` / `specks-broasted-chicken` (the batch's other two
  restaurant slugs) end up sharing this `--brand` green once built — both were
  empty directories at build time.

## Design layer (Claude Design port)

Ported the shared `_kit/design/the-juice-merchant/` assets into `index.html`:

- **Header**: replaced the text-only `.brandmark` with an inline `logo.svg`
  (viewBox `0 0 270 88`, 34px height, width auto), `aria-label="The Juice
  Merchant"` on the link. Wordmark + "COLD-PRESSED · NARBERTH" subline stay
  readable at that height (Georgia serif display font, no embedded webfont).
- **Footer**: added the mark alone (rounded-square citrus-drop icon, cropped
  to `viewBox 0 0 84 88`) at 28px above the business name.
- **Hero**: swapped the inline citrus SVG for the kit's `hero-art.svg`
  (`viewBox 0 0 900 600`, matches the original 1200x800 3:2 ratio) — direct
  fit. Copy and reveal timing untouched; h1 paints at 0ms.
- **Services grid ("On the menu")**: inlined `icons.svg` as a hidden sprite
  after `<body>`, replaced each menu card's inline SVG (inside its
  `.menu-icon-wrap`) with `<use href="#icon-N"/>` per the manifest mapping
  (citrus-drop, blender, bowl-berries, calendar-leaf, tray). Fixed the page's
  own `.card-icon` rule (it was already 28px in this build) to `.ico`,
  `color:var(--accent)`.
- **Favicon**: rebuilt as an SVG data URI from the same cropped logo mark, no
  raster.
- Text-node diff before/after: only the old plain-text brandmark node was
  removed (now SVG `<text>`); all other copy identical. File size 30,831 →
  31,897 bytes. JS parses, all anchors resolve, no adjacent art-only sections.

## Logo harvest pass (2026-09-02): logo placeholder

`thejuicemerchant.com` (the batch's `source_urls` domain) confirmed parked — a
fingerprinting/redirect stub, not a real site. Searched for a business-controlled
alternative: Yelp indicates the Narberth location has closed; the only live
Facebook page found for "The Juice Merchant" (facebook.com/TheJuiceMerchant) is
tagged to a Phoenixville location, and two other conflicting Facebook page IDs
turned up in search with no way to confirm which (if any) is the same ownership
as the Narberth prospect. Not verifiable with confidence, so no real logo was
pulled. Kept the Opus-designed `logo.svg` placeholder unchanged.

## v2

Rebuilt `index.html` from scratch per `_kit/v2/sections-v2.html` grammar and
`_kit/v2/kit-v2.css`, replacing the prior build entirely. **Logo placeholder**:
this slug has no verifiable real logo (see harvest pass above — parked domain,
no confirmable business-owned social presence); kept the same designed inline
SVG mark from the v1 file byte-identical (rounded-square citrus-drop icon +
wordmark in the header, icon-only crop in the footer), per the brief's
instruction to keep the designed logo and flag it here. Identity tokens
lifted from v1 `:root`: `--brand:#4f7a23`, `--brand-2:#182410`,
`--ink:#1b2011`, `--paper:#faf7ec`, `--accent:#b15819` (the v1 file's actual
accent differs from `_kit/design/manifest.json`'s `#e2792e`; used the live
v1 `:root` value per instructions, not the manifest), `--on-brand/--on-deep/
--on-accent:#fff/#f3efe8/#fff`.

- **Head**: title from headline, meta description = subhead verbatim,
  favicon = a standalone SVG data URI of the logo's icon mark only (the v1
  logo is an inline SVG wordmark, not a single croppable raster, so the
  icon-only group was reused as the favicon shape rather than inventing a
  new mark), Google Fonts link for Archivo Black + Nunito Sans
  (400/700/800) + Caveat (700), `display=swap`.
- **Header**: dark `site-head`; the designed logo's wordmark text is baked
  in as fixed dark hex (`#1b2011`) rather than `currentColor`, so it was
  wrapped in a white `.chip` per the DESIGN-v2 rule ("if the logo is dark
  and the header is dark, put it on a paper chip").
- **Hero**: eyebrow "Narberth, PA · Juice & Smoothie Bar"; `.script` line
  "Made Fresh To Order" (lifted verbatim from `marquee[]`); hero art =
  `hero-the-juice-merchant.svg` inlined; one `dd-arrow` doodle pointing at
  the primary CTA. No seal — `proof: []` in the copy JSON, so no sourced
  year exists to put in one.
- **Services**: h2 "Fresh, Made To Order" with `dd-underline`; 5 cards,
  icons mapped by exact match to `icon_hint` — juice→`ic-citrus`,
  smoothie→`ic-blender`, bowl→`ic-bowl`, cleanse→`ic-leaf`,
  catering→`ic-catering`. All five hit direct or near-direct matches; none
  fell back to `ic-spark`.
- **Stats**: omitted entirely — `proof: []` in the copy JSON, and the
  DESIGN-v2 rule is explicit that the stats section only ships when proof
  is non-empty.
- **Process**: 3 steps (`--steps:3`), verbatim from `process[]`.
- **Split/about**: cropped-and-scaled reuse of `hero-the-juice-merchant.svg`
  (`transform:scale(2.3) translate(8%,-4%)` inside an `overflow:hidden`
  wrapper), a different crop/zoom than the hero's own framing so it reads
  as a second, distinct art moment rather than the same composition.
- **FAQ**: all 4 items verbatim.
- **Marquee**: all 6 lines joined with " · ", duplicated once for the loop.
- **CTA/footer**: verbatim from `cta_band` / `footer_line`. All contact
  fields were `PLACEHOLDER` in the source JSON (`placeholders: ["contact.phone",
  "contact.address", "contact.hours", "contact.email"]`); rendered as neutral
  phrasing ("Serving Narberth, PA" / "Phone and hours to be confirmed with
  the business") rather than fabricated data, and the header/CTA "tel"-style
  action was changed to an in-page anchor ("Visit Narberth, PA" → `#contact`)
  since no real phone number exists to make a `tel:` link truthful.
- **Contrast fix**: same issue as `golden-sea` — `.hero .eyebrow` on
  `--brand` computed 1.03:1 against `--accent` (leafy green vs burnt-orange,
  near-identical luminance). Added `.hero .eyebrow{color:var(--paper)}`
  (paper vs brand = 4.73:1, AA pass) rather than touching `--accent`
  globally, since every other pair already cleared 4.5:1 (accent/paper
  4.58:1, accent/white 4.91:1, on-brand/brand 5.07:1, on-deep/brand-2
  14.11:1).
- `grep -i papa` initially caught three lines of *comment text* inside the
  inlined `kit-v2.css` itself; reworded those three comments in the
  assembled file only (no functional change) so the non-negotiable grep
  check passes.
- File size: 63,817 bytes, under the 120 KB v2 budget. `node -e` extracted
  and parsed the inline `<script>` clean. Every `href="#..."` anchor and
  `<use href="#...">` resolves against an `id` in the same file. No
  duplicate ids. Surface sequence: deep(hero) → paper(services) →
  panel(process) → paper(split) → panel(faq) → deep(marquee) →
  accent(cta) → deep(footer) — no two adjacent sections repeat a surface,
  and hero/split (the only art-carrying sections) both pair art with real
  copy.
- Not verified this session: live-browser 390/1440px overflow render and
  actual rendered font contrast (computed via formula, not a Lighthouse/axe
  pass) — flagging for `qa-critic`.
