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
| One fixed ambient particle canvas over the whole page | Same, Canvas2D, tinted from the live `--signal` / `--green` tokens so the duality re-tints it for free |
| Light/dark **duality** switch | Same mechanic, opposite resting state — this is a case file, so dark is default. The button reads **Redacted / Declassified** |
| Centred single-column spine, generous whitespace | Same; no section is a grid of panels |
| Mono pill chips as section stamps | `CASE 017 · FILE OPEN`, `FREEDOM INVOICE · STATUS PAST DUE`, `CAST FILES · EARLY ACCESS ROSTER` |
| Big chrome-edged plates for the art | `.plate` — the metal ramp drawn as a masked gradient ring, mono figcaption below a hairline |
| Right-edge vertical HUD rail: dots + rotated readout | `CASE 017 · <SECTION> · CLEARANCE 43.7%`, dots are real jump buttons |
| Instrument Serif quote with per-word colour tinting | The opening statement, each word placed on a blue→green ramp with a deterministic opacity wobble |
| Continuous horizontal marquee for the hook | The regime's slogans: `OBEY · SECURE · COMPLY · MAKE AMERICA OBEDIENT AGAIN · FREEDOM IS NOT FREE · PROCESSING FEE APPLIES` |
| Gradient hairline rules | `.hair`, blue→green |
| TiltBox 3D on cards | `[data-tilt]` on plates, file cards and dossiers |
| Art cold until attended to | Character portraits are desaturated at rest, full colour on hover/focus or when centred |

## Why the type needed no negotiating

The book site already used **Anton** for display and **IBM Plex Mono** for
labels — which is IMMOHRTAL's own display and mono pairing. **Space Grotesk**
(body) and **Instrument Serif** (quotes) joined from IMMOHRTAL to complete the
stack. All four are self-hosted woff2, 93 KB total, no CDN and no font origin.

Every colour token is lifted from IMMOHRTAL's compiled system rather than
eyeballed: the paper/ink/signal/green ramp, both `--chrome` metal gradients, the
glass fills, `--glow-signal` / `--glow-soft`, and `--ease-hover`. The one
addition is `--alert: #ff3f1f` for the dossier states — past due, sealed,
redacted — taken from an accent already present in IMMOHRTAL's own palette.

## Verified

`node qa.mjs` — headless Chromium at 320 / 390 / 768 / 1440. **ALL CHECKS PASSED.**
828 KB transferred. Checks: no horizontal overflow, no canvas wider than its
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
