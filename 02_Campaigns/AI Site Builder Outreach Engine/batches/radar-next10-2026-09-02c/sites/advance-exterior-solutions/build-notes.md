---
tags: [campaign, batch, site-build]
campaign: "[[AI Site Builder Outreach Engine]]"
batch: radar-next10-2026-09-02c
slug: advance-exterior-solutions
date: 2026-09-02
source_refs:
  - "02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/copy/advance-exterior-solutions.json"
  - "02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02c/_kit/DESIGN.md"
---

# Build notes — Advance Exterior Solutions

Single self-contained file: `sites/advance-exterior-solutions/index.html` (29.6 KB, well under the 250 KB budget). No external images or scripts; Google Fonts is the only external request (Archivo Black, Work Sans).

## Why this palette (no live-site color available)

`copy_basis` and `palette_hint` in the brief record that every fetch attempt (WebFetch + curl, two user agents) hit the site's `/.well-known/sgcaptcha/` bot wall — `brand_color_seen: null`. No color was ever sampled, so the palette here is **derived from vertical + brief, not from the prospect's live site**, per the task's explicit direction (slate/charcoal, sunrise-copper accent):

- `--brand:#3d4b52` — slate (dominant surface, nav, buttons)
- `--brand-2:#1b2226` — charcoal (deep sections, footer)
- `--accent:#c2703a` — copper (single primary action color; contrast-checked at 5.55:1 against `--on-accent:#15100c`, so accent text/icons stay dark, not white)
- `--paper:#f6f3ee` — warm off-white tinted toward slate
- `--ink:#1a1d1d` — near-black tinted toward slate
- `--on-brand:#ffffff`, `--on-deep:#f3efe8`, `--on-accent:#15100c`

Tighter radii (`--r-sm:4px … --r-lg:14px`, no true pill buttons) and a 2px border weight push the kit toward the "blue-collar, mechanical" character DESIGN.md maps to this vertical.

## Fonts

Display: **Archivo Black** (fallback `"Arial Black","Helvetica Neue",sans-serif` — sans fallback, matching the sans display face, not the kit's serif default). Text: **Work Sans** (fallback `system-ui,-apple-system,"Segoe UI",Roboto,sans-serif`). One `display=swap` request, both faces loaded together.

## Art

- Hero: `art/roofline-rain-sun-exterior.svg` used verbatim (currentColor-driven, so it inherits `--brand` automatically) — rain clearing to sun over a roofline, the one loud motion moment on the page, `aria-hidden`, pointer-driven parallax capped at 10px.
- Split section: bespoke layered "roof system" cutaway (not from `art/`) — four parallel diagonal bands representing shingle/underlayment/decking/insulation layers, most in `currentColor` at varying opacity, with one band and node in `var(--accent)` copper as the "sunrise" flashing highlight. Static except for the shared reveal/parallax treatment, so it doesn't compete with the hero as a second loud moment.
- No two art-only sections are adjacent: both art sections (hero, split) carry equal-weight copy alongside the art.
- No stats/proof strip shipped — `proof: []` in the brief, so that section was omitted entirely rather than filled with placeholder numbers.

## Copy fidelity

Every field in `copy/advance-exterior-solutions.json` is used somewhere on the page: headline, subhead, both CTA labels, intro, all 5 services, about, all 3 FAQs, all 5 marquee items (duplicated twice per kit rule for the seamless loop), and the town/service-area. No fact, number, price, or review was invented. CTA band uses "Request a Quote" per instruction, since the brief never uses the phrase "free estimate" (only "Get an Exterior Estimate," which is preserved verbatim as the hero secondary CTA).

## Placeholder fields — neutral phrasing used instead

The brief lists these as `PLACEHOLDER` / unverified (`palette_hint.brand_color_seen` is also null, covered above):

| Field | Brief value | Shipped as |
|---|---|---|
| `contact.phone` | `PLACEHOLDER` | "Call to schedule an inspection" (no number invented) |
| `contact.address` | `PLACEHOLDER` | "Macungie, PA / Lehigh Valley" (town from brief, no street address invented) |
| `contact.hours` | `PLACEHOLDER` | "Appointments by request" |
| `contact.email` | `PLACEHOLDER` | "Available on request" |
| `cta_primary.label` note | flagged placeholder CTA (no verified phone) | Label text itself ("Request a Roof Inspection") shipped as-is since it's a call-to-action phrase, not a fact; it links to the in-page `#contact` section, not a tel: link |
| `cta_secondary.label` note | flagged placeholder CTA (no verified contact form) | Same treatment — links to `#contact`, no invented form endpoint |

All CTAs on the page anchor to real in-page targets (`#contact`, `#services`, `#about`, `#faq`) — none point to a dead `#` or an invented tel/mailto.

## DESIGN.md checklist — static pass

- [x] 390px / 1440px: no fixed widths used outside the kit's clamp/grid system; `.wrap`, `.services`, `.contact-grid`, `.foot-grid` all use `auto-fit`/`minmax` or the 12-col split with a 900px stack breakpoint — no horizontal-overflow risk found by inspection.
- [x] `h1` has no `data-reveal`, renders at first paint.
- [x] Contrast: accent (copper) paired with dark `--on-accent` (5.55:1); brand/brand-2 paired with white/off-white text (well over 4.5:1 given both are dark surfaces); body text is dark ink on light paper.
- [x] Skip link present, focus ring uses `--ring` (3px solid accent) on `:focus-visible`, no keyboard traps introduced.
- [x] Reduced-motion media query (kit's, unedited) forces all `[data-reveal]` visible, kills marquee/parallax animation.
- [x] JS off: `[data-reveal]` defaults to `opacity:1;transform:none` until `.js` class is added by the script, so content is visible with JS disabled; all nav/CTA links are plain anchors.
- [x] Surface order checked for no adjacent repeats: paper(hero) → panel(intro) → paper(services) → panel(split) → paper(about) → panel(faq) → paper(marquee) → accent(cta) → deep(contact) → deep(footer, expected/allowed as the terminal surface).
- [x] `node -e` parse of the inline `<script>` block succeeded with no syntax errors.
- [x] File size: 29,573 bytes (~29.6 KB), far under the 250 KB budget.
- [x] `<meta name="robots" content="noindex,nofollow">` present; no invented business facts anywhere in copy.
- [ ] Not yet handed to `qa-critic` for the live browser/AA-contrast/keyboard pass — this build has not self-certified. That check is the next step, not done here.

## Unverified / not done

- Live-browser render check (390px/1440px actual screenshots, real focus-order tab-through, computed contrast ratios) — only a static/code-level pass was run here. Flagging per instructions rather than claiming a visual QA that wasn't performed.
- No brand color was ever observed from the prospect's live site (confirmed bot-walled per the brief); the palette is a DESIGN.md-compliant derivation from vertical + explicit task direction, not a sampled color.


## Design layer (ported from `_kit/design/advance-exterior-solutions/`)

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
  before 29,606 B / after 31,906 B, both well under the 60 KB ceiling; a
  text-only diff of `<main>`/`<footer>` copy (all tags and decorative SVG
  stripped) matched byte-for-byte before and after this pass — no copy was
  changed, only the header/footer/hero/icon/favicon assets.

Also fixed the known font-variable bug: the dead `:root` block declared `--font-display:"Fraunces"...` and `--font-text:"Inter"...` while the page imports Archivo Black and Work Sans from Google Fonts and the `.brand-skin` override (which the `<body class="brand-skin">` already activates) correctly used Archivo Black / Work Sans. The rendered site was never visually affected since `.brand-skin` won the cascade, but the dead `:root` values were wrong and misleading. Updated the `:root` block to `--font-display:"Archivo Black","Arial Black","Helvetica Neue",sans-serif` and `--font-text:"Work Sans",system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif` to match the imported faces and the working override.

## Logo harvest pass (2026-09-02): logo placeholder

`advanceexteriorsolutions.com` returned HTTP 202 (bot-challenge, no body) on
three separate attempts with a browser user agent — consistent with this
prospect's existing "bot-walled" note. Checked their GAF residential-roofer
directory listing (403 to fetch) and searched for a Facebook page: three
different, unconfirmed Facebook page IDs surfaced for "Advance Exterior
Solutions" businesses in the Macungie area with no reliable way to verify which
one (if any) is this company's current, owned page. Not verifiable with
confidence, so no real logo was pulled. Kept the Opus-designed `logo.svg`
placeholder unchanged.
