# Prospect build design contract

The single visual standard for every prospect site the Next 20 lane produces.

**Source of truth:** <https://primary-website-build-reference.netlify.app> — the
ten-site reference build, published 2026-09-05, stylesheet version
`20260903-logo-clarity`. Dillon named it the design for every site going forward
in `#ai-tech-news` on 2026-09-08.

The generator that produced that build is not in this repository. This contract
is extracted from the published output, which is the only copy reachable from a
remote session. Where a rule here cites a measurement, it was read off the live
CSS or HTML, not inferred.

## Colour: 22 tokens, derived from the logo

Each site sets one `[data-site="<slug>"]` block overriding all 22 custom
properties. The reference states the rule as brand colour "read off each
business's own logo", accents "deepened until they can carry text", and "11 of
11 palettes pass every text pair".

`_os/automation/lib/palette.js` does that by measurement so an unattended batch
of 20 carries the same guarantee. It samples the *audited* logo bitmap — the one
`lib/logo-audit.js` decoded and cleared — because a logo that still had its
background plate attached would return the plate colour as the brand colour.

| group | tokens |
|---|---|
| brand | `--brand` `--brand-lt` `--brand-dp` `--brand-ink` |
| accent | `--accent` `--accent-ui` `--accent-ink` |
| surface | `--paper` `--ink` `--hero` `--header` `--stripe` `--field` `--wash` `--wash-2` `--script` |
| foreground | `--on-brand` `--on-accent` `--on-header` `--on-hero` `--on-footer` `--on-field` |

`--paper`, `--ink` and `--stripe` are neutral ground and stay near-constant
across the batch, so ten sites read as one system. That is the point of a shared
reference; per-site neutrals would dissolve it.

Every pair in `palette.TEXT_PAIRS` is measured against WCAG 2.1 and the
background is deepened until it clears AA (4.5:1, or 3:1 for the large-type
hero). A palette with a pair that cannot be made to pass is rejected — it does
not ship at a lower ratio. A greyscale logo yields no brand colour and is
refused rather than given an invented one.

## Logo treatment

- **Transparent, always.** Verified by `lib/logo-audit.js`, which counts
  transparent pixels rather than trusting a filename or a `logo` label.
- **Never upscaled.** `--cap` and `--header-w` bound the painted width to the
  asset's own resolution; `.markbox img` carries `max-width: var(--cap)`. The
  stylesheet version is literally named `logo-clarity`. This is the same
  constraint the audit enforces from the other side by recording `display_width`
  and requiring the source to be at least 2× it.
- `.markbox` is `aspect-ratio: 1254 / 666`, `object-fit: contain`.
- Header mark caps at `max-height: 70px` inside a `min(400px, 100%)` box.
- A business with no usable logo file uses its typographic identity instead —
  2 of the reference's 10 do exactly this. It is a documented fallback, not a
  failure, and never a redrawn or synthesised mark.

## Motion

Two hand-timed keyframe sets, quoted verbatim from the reference because the
frame numbers are the craft:

- `mark_hop` — 6s `cubic-bezier(.34,.06,.28,1)`, infinite. Squash-and-stretch
  on the header mark, timed at frames over 180: rest to f37, squash f46,
  stretch f55, settle f72, crouch f75, jump f86, land, rebound, rest.
  `transform-origin: 50% 100%`.
- `hero_hop` — the same 6s clock offset `-1.6s` so the two marks do not fire in
  lockstep, and **translate-only**. The reference's own comment gives the
  reason: the squash scales to 1.07, and a hero mark already at 1.4× native
  width would spend part of every cycle past the clarity cap the whole build is
  gated on.

Header swap fires at `scrollY` 486px on a 1440×900 viewport: the script tagline
exits left over 0.8s `cubic-bezier(.85,0,.15,1)` as the mark enters.

Illustrations loop between 4 and 14 seconds, inline SVG, fills bound to the
custom properties so one drawing takes any palette. Zero image requests.

**`prefers-reduced-motion: reduce` stops all of it** — `.markbox > img` and
`.markbox > .wordmark` get `animation: none !important`, transitions drop to
`.01ms`, and illustration animations stop with opacity held at `.55` so nothing
disappears. This is a hard requirement, not a nicety.

## Structure

Fixed 100px header, 1310px container, 73px content inset. Section order:

1. fixed header (script tagline ⇄ mark swap)
2. full-height identity hero — mark centred on a solid field
3. statement
4. work grid — two large drawings plus numbered tiles
5. deep field — three illustrations
6. typographic band over stripe
7. accordion
8. gradient footer

Service illustrations sit below the fold. No nested cards or added plates behind
a mark. One unified host serves all sites in a batch under `/sites/<slug>/`.

## What must never happen

- No redrawn, traced, or generated prospect logo. Exact first-party asset or
  typographic identity, nothing between.
- No generated image presented as the business, its people, its customers, or
  its completed work.
- No palette shipped below AA on any declared pair.
- No site published or mailed from this lane. `mail_ready` stays `hold`.
