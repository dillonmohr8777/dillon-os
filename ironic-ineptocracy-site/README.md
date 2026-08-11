# The Ironic Ineptocracy — site, in the IMMOHRTAL design language

A concept rebuild of `ironicineptocracy.com` using the design system from
`../immohrtal-site`. Same visual language, same structural devices, the book's
own copy and art.

```bash
python3 -m http.server 8905
node qa.mjs http://localhost:8905     # exits non-zero on a hard failure
```

## What was ported, device by device

| IMMOHRTAL device | Here |
|---|---|
| Loader: mark + mono readout counting in, then dissolves | `CASE 017 // OPENING FILE → VERIFYING CLEARANCE → REDACTIONS APPLIED → FILE OPEN`, with a 2.6s failsafe so a slow connection can never trap anyone |
| One fixed ambient particle canvas over the whole page | Same, Canvas2D, tinted from the live `--signal` / `--ember` tokens so the duality re-tints it for free |
| Light/dark **duality** switch | Same mechanic, different palette. White is the resting state; the alternate is a sealed oxblood, not IMMOHRTAL's navy. The button reads **Declassified / Redacted** |
| Centred single-column spine, generous whitespace | Same; no section is a grid of panels |
| Mono pill chips as section stamps | `CASE 017 · FILE OPEN`, `FREEDOM INVOICE · STATUS PAST DUE`, `CAST FILES · EARLY ACCESS ROSTER` |
| Big chrome-edged plates for the art | `.plate` — the metal ramp drawn as a masked gradient ring, mono figcaption below a hairline |
| Right-edge vertical HUD rail: dots + rotated readout | `CASE 017 · <SECTION> · CLEARANCE 43.7%`, dots are real jump buttons |
| Instrument Serif quote with per-word colour tinting | The opening statement, each word placed on a crimson→amber ramp with a deterministic opacity wobble |
| Continuous horizontal marquee for the hook | The regime's slogans: `OBEY · SECURE · COMPLY · MAKE AMERICA OBEDIENT AGAIN · FREEDOM IS NOT FREE · PROCESSING FEE APPLIES` |
| Gradient hairline rules | `.hair`, crimson→amber |
| TiltBox 3D on cards | `[data-tilt]` on plates, file cards and dossiers |
| Art cold until attended to | Character portraits are desaturated at rest, full colour on hover/focus or when centred |

## Why the type needed no negotiating

The book site already used **Anton** for display and **IBM Plex Mono** for
labels — which is IMMOHRTAL's own display and mono pairing. **Space Grotesk**
(body) and **Instrument Serif** (quotes) joined from IMMOHRTAL to complete the
stack. All four are self-hosted woff2, 93 KB total, no CDN and no font origin.

## The palette is red and white, and that is not a find-and-replace

IMMOHRTAL's token *structure* is lifted whole — the paper/ink/accent ramp, both
`--chrome` metal gradients, the glass fills, `--glow-signal` / `--glow-soft`,
`--ease-hover`. Its *hues* are not: it runs signal-blue + green, this book runs
crimson `#d21f28` + amber `#c25214` + oxblood `#7d1220`, on white.

Four things had to change beyond the hex values:

- **The neutrals are warm.** Greys, hairlines and both chrome ramps were
  blue-biased. Left alone they give a "white" page a cold cast from its own
  borders, which is the tell that a palette was swapped rather than designed.
- **The alert chip changed shape, not colour.** In a two-hue system the alert
  marker differs by hue. In an all-red one it cannot — oxblood beside crimson at
  6px is not a legible distinction — so it became a redaction bar. That is also
  the right mark for a sealed record.
- **`--on-signal` is new, and it fixes an inherited bug.** White text on the
  bright accent fill scored 2.84:1 in the blue palette and 2.95:1 in the red one.
  A bright accent on a dark ground needs *dark* text on it: the sealed side puts
  its own ground colour on the fill for 5.50:1.
- **The ambient field lost half its alpha.** Crimson is a much darker dot than
  signal-blue, and white is now the default ground rather than the exception, so
  0.34 → 0.15 or it reads as grain on the page.

One value is a deliberate compromise: a bright red on a dark ground drifts pink
as it gets light enough to pass contrast. `#ff3b45` is the most saturated red
that still clears 5.50:1 on the sealed paper.

## Verified

`node qa.mjs` — headless Chromium at 320 / 390 / 768 / 1440. **ALL CHECKS PASSED.**
832 KB transferred. Checks: no horizontal overflow, no canvas wider than its
container, one `h1`, skip link first, every image has alt text and intrinsic
dimensions, no console errors, the duality changes the ground *and* restores, the
HUD rail builds its dots with exactly one active, and the per-word tint produces
its spans.

Two font-size floors, deliberately split: reading copy is held to 16px, mono HUD
chrome to 11px — IMMOHRTAL sets its own rail readout at 11px, and holding chrome
to body-copy rules would have destroyed the idiom.

## Notes

- Everything is progressive enhancement. With JS off the page is fully readable
  and the form still submits; the quote renders as ordinary type, the rail and
  the particle field simply do not appear.
- `prefers-reduced-motion` removes the loader entirely, stops the marquee, kills
  the particle field, and disables tilt.
- The form posts to `/api/dossier-leads`, the endpoint the live site uses. The
  site-health registry flags that endpoint as a historical dead form — worth
  confirming it is live before this ships.
- `noindex` throughout. This is a concept build, not the live site.
