# Build notes — f-m-berkheimer-inc

Source: `../../copy/f-m-berkheimer-inc.json`. `fmberkinc.com` resolves to a parked
GoDaddy lander — no live brand color, logo, or copy to harvest, per
`palette_hint.notes`. Palette and type below are derived from the vertical
(residential HVAC) and town, not sampled from a live site, because none exists.

## Palette (residential, cool-to-warm story; distinct from any industrial
sibling built off the same `airstream-hvac.svg` art)

- `--brand: #2f6e94` — cool slate-sky blue, the "cold call" / AC side of the
  story. Contrast vs `--on-brand:#fff` ≈ 5.6:1 (AA pass).
- `--brand-2: #12242f` — deep navy tinted toward brand, footer/dark section.
- `--accent: #e17a2e` — warm ember orange, the furnace/heat side. Contrast vs
  `--on-accent:#17110a` ≈ 7:1 (AA pass); vs white ≈ 3:1, so on-accent stays dark.
- `--paper: #f7f4ee` warm off-white, `--ink: #1a2226` near-black tinted blue.
- No two sites in this batch share `--brand` (checked: batch had no other
  built sites at build time).

## Fonts

Space Grotesk (display) / IBM Plex Sans (text) — the "modern service, neutral"
pairing from DESIGN.md, chosen to read as the confident modern site this
business has never had, and to keep this build visually distinct from a more
industrial/mechanical sibling site built from the same source art.

## Art

- Hero: `airstream-hvac.svg` adapted with a `linearGradient` (`#fmb-flow`)
  running brand-blue into accent-ember along the airstream bands, so the
  lines visibly turn from cold to warm — the one loud motion moment on the
  page (`data-parallax`, transform/opacity only, reduced-motion safe).
  Bottom "puffs" alternate blue/ember fill to keep the temperature story going.
- Split section: hand-built thermostat dial SVG (ticks, gradient arc, needle
  resting toward the warm side) — new art, not from `art/`, matching the
  hero's palette and reinforcing the "bring it back to comfortable" idea.
- No other art-only sections; split section pairs the dial with copy so no
  two art-only sections sit adjacent, per DESIGN.md.

## Placeholders (never invented — from `copy.placeholders`)

- `cta_primary.label` / `cta_secondary.label` — real copy strings shipped as
  written; both CTAs are real in-page anchors to `#get-estimate` (no fabricated
  phone/tel: link or booking flow since none was harvested).
- `contact.phone`, `contact.address`, `contact.hours`, `contact.email` — all
  rendered as neutral "to be confirmed" phrasing in the footer contact block
  (`id="contact"`). No number, address, hours, or email was invented.

## Checklist pass (static)

- 390px / 1440px: no raw px margins added beyond kit's `--s-*` scale and
  `clamp()` type; grid falls back to single column under 900px per kit CSS.
- Every CTA (`href="#get-estimate"`, `#services`, `#about`, `#faq`, `#contact`)
  resolves to a real id in the file — verified via grep.
- `node -e` parsed the inline `<script>` block successfully (no syntax errors).
- File size: 29,823 bytes (~29 KB), well under the 250 KB budget (fonts load
  from Google Fonts CDN, not counted in local file weight).
- Surface order: hero (paper-implicit) → panel → paper → panel → deep → paper
  → panel(marquee) → accent → deep(footer) — no two adjacent sections share a
  surface.
- No two art-only sections adjacent (split pairs dial with copy).
- `noindex,nofollow` present in `<meta name="robots">`.
- Contrast spot-checked by hand for brand/accent vs their `--on-*` pairs (see
  palette section above); not machine-verified against every text/background
  combination on the page — **unverified**, flag for qa-critic to run a real
  contrast checker.
- Mobile-width rendering and keyboard/focus trap pass were reasoned from the
  unmodified kit CSS (nav collapses under 860px, `:focus-visible` ring intact)
  but **not visually verified in a browser** — unverified, hand to qa-critic.
