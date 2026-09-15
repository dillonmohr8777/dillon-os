# Paper-craft style contract — v1.0

Derived 2026-09-09 from five reference frames supplied by Dillon. Every hex below was
**sampled from those pixels**, not chosen. Method is at the bottom. This file is the
authority for later runs: read it instead of re-deriving the look from the images.

Source frames, frozen at `plates/`:

| Plate | What it is |
|---|---|
| `fibre-tangle.png` | macro paper-fibre tangle, one indigo strand woven through cream and kraft fibres |
| `bench-model.png` | paper-tube-and-node molecular model on a craft desk; scalpel, bone folder, torn scraps, one indigo node |
| `journal-bird.png` | open handmade-paper journal, engraved bird collaged with washi tape, brass brad, indigo triangle |
| `paper-brain.png` | sagittal brain in layered torn paper and cardboard, indigo cavity, brass brads, paper cabling |
| `exploded-motor.png` | exploded-view paper motor: gears, coil spring, discs, one indigo cylinder, pencil axis lines, tape marks |

---

## 1. Palette, measured

Sampled with PIL from the five frames at 600px, HSV-gated, then averaged by luminance band.
The measured hue of the accent across all five frames is **204–207°** in every band, which is
the same hue family as the canonical Momentum brand blue `#155E86` (202°). The reference
accent is Momentum brand blue in its paper-dye range. That is why this style works for this
client and it is not a coincidence to design around.

### Accent — the one indigo

| Band | Hex | HSV | Where it appears |
|---|---|---|---|
| lit face | `#436781` | 205° / 0.48 / 0.51 | the side of the indigo cylinder facing the window |
| **core** | **`#1F3E55`** | **205° / 0.64 / 0.33** | the accent's true body colour — use this when you need one number |
| shadow | `#0A1B27` | 204° / 0.74 / 0.15 | under the deckle edge, in the cavity |

Per-frame accent core, for reference: motor `#335B75`, brain `#14394F`, journal `#173045`,
bench `#27465F`, fibre `#254055`. The accent occupies **1.2 % – 4.5 % of frame area**. That
is the budget. More than ~5 % and it stops being an accent.

### Paper and ink

| Token | Hex | Role |
|---|---|---|
| paper-lit | `#E8E2DB` | the sheet where raking light hits it |
| paper-base | `#D8CFC5` | the sheet in even light — the default surface |
| kraft | `#B4A494` | torn kraft scrap, chipboard |
| kraft-deep | `#867462` | kraft in shadow, the underside of a curl |
| shadow-ink | `#594837` | contact shadow where paper meets paper |
| ink | `#14181B` | type. Momentum `--m-ink`, unchanged |
| muted | `#636465` | secondary type. Momentum `--m-muted`, unchanged |
| pencil | `#8E8578` | construction lines. Momentum `--m-line-strong`, unchanged |

Momentum tokens are canonical and referenced by path from
`C:\Users\dillo\Documents\Codex\momentum-design-system\tokens.json`. Nothing is vendored.
The sampled paper tones sit warmer than Momentum `--m-paper #FBF8F4`; that is correct —
`--m-paper` is a screen surface, these are photographed sheets. Type colours are the tokens
verbatim: `ink` on `paper-lit` measures **14.9 : 1**, `muted` on `paper-lit` **4.9 : 1**.

---

## 2. The one-accent rule

**Exactly one saturated indigo element per frame, and it is the subject.** Everything else
is cream, kraft, brass, graphite or shadow. In every reference frame the eye is delivered to
that one blue thing and held there.

Consequences that are not optional:

- Two blue elements in a frame is a defect, not a variation. If a plate already carries its
  own indigo, either that is the frame's accent or the plate is cropped to exclude it.
- The Momentum mark **is** the accent on any frame it appears in. The mark is used exactly as
  supplied — never recoloured, never tinted, never knocked out to fit the palette. Brand
  integrity outranks the accent rule; the frame is built around the mark instead.
- Brass (`#B8973F`-ish, brads and hardware) is a *material*, not an accent. It is allowed
  alongside indigo because it reads as metal, not as colour.

**Through-line.** Across a cut sequence, hold the accent in roughly the same screen quadrant
frame to frame, so the eye never has to re-find it. Pin each plate's `transform-origin` on
its accent: the plate then settles *around* the accent and the accent itself does not move at
all. The final mark lands on the point the eye has been resting on for the whole piece.

---

## 3. Texture

- **Real photographed material only.** Every paper surface, torn edge and fibre in a frame
  comes from a plate. Vector paper, CSS gradients standing in for paper, procedural noise
  and "paper texture" stock overlays are all banned. If a surface is needed that no plate
  provides, crop one from a plate — do not draw one.
- Cut-outs are made by **clipping real material**, never by drawing a shape and filling it.
  A caption card is a positioned crop of genuine handmade paper with a torn alpha edge.
- **Torn edges are noise-displaced straight lines**, amplitude ≈ 3–4 px at 1080p, sampled
  every ~26 px, with an occasional deeper nick (~8 % of vertices). Seeded, so a re-render
  tears identically. Never a smooth curve, never a clean rectangle.
- Deckle edges, punched holes, tape ends and torn corners are the frame's detail budget.
  Do not add drop-shadowed rounded rectangles to hold information; tear a piece of paper.

## 4. Light

Soft raking daylight from one window, high and to one side. Honest, directional, and it
falls off — no fill light, no rim light, no second source.

- Shadows are **contact shadows**: short, soft-edged, warm, and darkest where the paper
  actually touches. Measured tone `#594837` at low alpha, not neutral grey and never black.
- Anything lifted off the sheet gets a two-stop shadow: a tight one for contact
  (`0 3px 4px`) and a soft one for height (`0 10–14 px 14–20 px`). The shadow follows the
  **torn silhouette**, not the element's box — put the shadow on the parent of the clipped
  element so it does.
- No glow, ever. No bloom, no light leaks, no specular sweeps across a logo.

## 5. Motion vocabulary

Paper-craft stop motion. Things have weight, they arrive, they settle, and then they are
still. Nothing eases like rubber.

| Move | Rule |
|---|---|
| Plate drift | Scale ~1.06 → 1.00 over the whole beat at `ease: "none"`. A copy-stand rail, not a Ken Burns swoop. Origin pinned to the accent. |
| Paper landing | Never fades in. It **appears**, then falls in 3 discrete steps (`ease: "steps(3)"`, ~0.20 s) past its rest position, then settles in 2 more steps (~0.10 s). Total ~0.30 s. |
| Rotation | Enters at −2° to −3°, overshoots to about −1°, rests at −0.5°. Paper never lands perfectly square. |
| Type | Steps in with the sheet it is printed on. Type never animates independently of its paper. |
| Pencil rule | Draws with `scaleX` in ~6 steps, like a line pulled along a straightedge. |
| Cuts | Hard cuts on the beat. **No crossfades between plates.** A transition is not an idea. |
| Banned | Rubber/elastic/bounce easing, continuous ease-in-out on paper, blur transitions, parallax layers, anything that implies the material is not physical. |

Beats run ~2.7–3.2 s. Shorter and the settle has nowhere to land.

## 6. Type

Momentum tokens verbatim. `display` = **Archivo Black**, tracking `-0.02em`, for the
statement lines. `text` = **Nunito Sans**, 700, tracking `0.14em`, uppercase, for the
supporting line. Both frozen locally as woff2 — no Google Fonts request at render time.

One statement per frame, one line, no wrap. If it does not fit on one line at 60 px inside a
1180 px card, the line is too long — cut words, do not shrink the type or widen the card.

## 7. Anti-slop, binding

The Momentum anti-slop list applies and the reference frames already point away from all of
it: no AI purple, no neon glow, no glassmorphism, no floating gradient orbs, no three-equal-
card feature row. Add to it, from this style: no vector "paper" illustration, no drop-shadowed
rounded-rectangle cards, no crossfade transitions, no second accent colour, no centred
sans-serif over a full-bleed gradient.

## 8. Reproducibility

- Plates are 1672 × 941. A 1920 × 1080 render therefore upscales them **1.15 ×** at minimum,
  and more where a beat crops in (this piece runs 1.15 × – 1.55 ×). That is a real ceiling:
  it is invisible on the low-frequency paper fields and slightly soft on fine engraving. To
  remove it, re-source or regenerate the plates at ≥ 2400 px wide.
- Provenance of the plates is **not established**. They were supplied as visual direction on
  2026-09-09. Before anything built on them goes outside Momentum, confirm the licence or
  re-shoot / regenerate the plates.
- Fonts, GSAP, plates and the brand mark are all frozen local files, SHA-256 pinned in the
  run receipt and re-verified on every build. A hash mismatch stops the build.

### Method

Hues and bands: PIL, images resized to 600 px long edge, pixels gated to hue 190–250°,
saturation ≥ 0.30, value 0.10–0.80, then sorted by WCAG relative luminance and averaged in
the top 20 % (lit), middle 40 % (core) and bottom 20 % (shadow). Paper tones: warm-gated
(hue < 60°, sat < 0.45) pixels from `bench-model.png`, banded by the same luminance sort.
Accent area percentages are gated-pixel counts over total frame pixels. Contrast ratios use
WCAG 2.1 relative luminance.
