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
