# paper-craft-video

Renders short paper-craft brand films to MP4 from a run receipt. Receipt in, dated
deliverable out, nothing invented — the same contract as
`_os/automation/google-ads-daily/work/google-ads-report-builder`.

## One command

```bash
node C:/Users/dillo/repos/dillon-os/_os/automation/paper-craft-video/build.mjs \
  --receipt C:/Users/dillo/repos/dillon-os/_os/automation/paper-craft-video/receipts/2026-09-09-momentum-360-built-not-templated.json \
  --quality high \
  --deliver C:/Users/dillo/Documents/Codex/projects/client-operations/clients/momentum-360/deliverables/2026-09-09-paper-craft-brand-film
```

That authors the composition, verifies every input hash, runs `hyperframes check`, renders,
probes the output with `ffprobe`, writes `verification.json`, and copies the MP4 into the
client's deliverables folder. Drop `--deliver` to keep it local. Add `--no-render` to author
and check only (about four seconds — use this while iterating).

## What it does not do

Never uploads, posts, publishes, schedules, emails or spends. It writes local files. Approval
and delivery are somebody else's step.

## Reading order for a new session

1. `STYLE-CONTRACT.md` — the look, derived once from measured pixels. **Read this instead of
   re-deriving it from the reference images.** Palette, the one-accent rule, texture, light,
   motion vocabulary, the anti-slop list.
2. `receipts/<date>-<client>-<slug>.json` — everything specific to one film: which plates,
   how each is cropped, where its accent sits, the copy, the timings. This is the only file
   you edit to make a change.
3. `build.mjs` — the renderer. You rarely need to touch it.

## Layout

```
plates/           frozen source photography, 1672x941 (see the contract on provenance)
assets/brand/     the client mark, copied from client-operations with its provenance
assets/fonts/     Archivo Black + Nunito Sans woff2, frozen. No network at render time.
assets/vendor/    gsap.min.js, frozen
receipts/         one JSON per film
build/            generated project + MP4 + verification.json (gitignored, regenerable)
```

## How a receipt works

Each beat names a plate, a **crop** in plate pixels (`{x, y, w}` — height follows from the
16:9 frame), and an **accent** point in plate pixels. The accent is where that plate's one
indigo element is; it becomes the plate's `transform-origin`, so the slow drift settles
*around* the accent and the accent itself never moves. Keeping every beat's accent in the
same screen quadrant is the through-line, and the brand mark lands on it at the end.

`mirror: true` flips a plate horizontally — useful when the composition you want is on the
wrong side, as with the journal endcard.

The caption card is a torn sheet of real handmade paper: its fill is assembled from named
clean crops of a plate laid side by side (`card.fill.tiles`), and its torn edge is a seeded
noise-displaced polygon, so a re-render tears identically.

### Anatomy beats — `chips` and `links` (added 2026-09-10)

A beat may also carry `chips` and `links`, which is how the "Anatomy of…" films take a thing
apart on a held frame instead of cutting between plates.

- **`chips[]`** — small torn paper labels. Same construction as the caption card (seeded
  deckle clip, real plate crop for fill, shadow on the parent so it follows the torn
  silhouette), at any `{x, y, w, h}`, landing at its own `at` with its own rest angle `rot`.
  `fill` is one positioned crop `{plate, scale, x, y}` — no tiling, because chips are small
  enough for one crop. `family` picks `"text"` (Nunito Sans, uppercase, tracked) or
  `"display"` (Archivo Black). `color` overrides the ink, for type on an indigo chip.
- **`links[]`** — the thread. A thin band filled with a crop of *real indigo material*
  (`fibre-tangle.png`'s indigo strand for horizontal runs, `paper-brain.png`'s indigo swatch
  for vertical ones), revealed with the same stepped `scaleX`/`scaleY` draw the pencil rule
  uses. `axis: "x" | "y"`.
  **A break in the path is a link that is not in the receipt.** There is no `broken` flag —
  the absence is the point.
- **`copyAt`** on a beat delays that beat's caption line past the build, instead of the house
  `motion.cardDelay`.
- Any plate used only as a chip/link/card fill must be declared in **`fillPlates[]`** with its
  SHA-256. The build hard-stops on an undeclared or mismatched fill plate, same as a beat plate.

**Chip rotation budget: keep `|rot| <= 1.5` on chips shorter than ~110 px.** Measured
2026-09-10: `hyperframes check` samples a rotated text run by its axis-aligned bounding rect,
so a taller tilt on a short chip reports `text_occluded` against the chip's own paper fill and
blocks the render. It is a false positive; do not suppress the rule with
`data-layout-allow-occlusion`, just land the paper slightly less crooked. `build.mjs` prints a
`NOTE` when a chip is outside the budget. The endcard mark does **not** constrain chip
placement — cross-clip overlap with the mark is handled correctly by the checker.

### Reveal beats — `peels`, `focus`, `pan`, per-beat `card` (added 2026-09-10)

The first anatomy films were rejected for being slideshows: the plates drifted and cut and
nothing was ever *revealed*. These four fields are what a reveal is made of. All are
optional and every earlier receipt builds byte-identically without them.

- **`peels[]`** — the reveal. A peel is a real sheet of photographed paper lying **on** the
  plate, same construction as a chip (seeded deckle clip, plate-crop fill, shadow on the
  parent). Three modes:
  - `"lift"` — the sheet comes off and what was underneath was always there in the
    photograph. This is how a flat plate is dissected: you do not uncover new pixels, you
    stop hiding the ones you had.
  - `"drop"` — a sheet lands. A torn scrap falling across a path **cuts** it; a cover
    landing on an open cavity **closes** it.
  - `"hold"` — already at rest at the cut, so a later beat can return to the same state.

  `{x, y, w, h, seed, fill, at, mode, dur, steps, rot, dx, dy, offRot, z, tone, amp, step}`.
  `z` runs outermost-first so an outside-in dissection nests. `tone` is a brightness
  multiplier (default `0.975`): a cover cropped from clean cream reads brighter than the
  worked model beneath it and has to be seated. **Peels default to a tear amplitude that
  scales with the sheet** (`min(w,h) * 0.028`, capped at 26 px) — the house 3.4 px nick is
  invisible on a 1400 px cover and it renders as a clean rectangle, which was the single
  ugliest defect in the first pass. `card` and `chips` can now take `amp`/`step` too;
  their defaults are unchanged.

  **Peels are pinned to the screen; the plate scales under them.** A cover sized to the
  end of a `drift` will not cover at the start of it. Size every cover to the subject's
  extent *at maximum drift*, or keep the drift small. Measured 2026-09-10: at `drift.from
  1.14` the indigo ran out from under the last cover and the final reveal revealed nothing.

  **`print[]` on a peel** (added 2026-09-22) — type printed on the sheet, so it lifts,
  drops and tears with its paper and never moves on its own. `{text, x, y, fontSize,
  family, rule, underline, color}` in sheet-local pixels. `family` is `"text"` (Nunito
  Sans, uppercase, tracked — a form field label), `"display"` (Archivo Black) or `"plain"`
  (Nunito Sans 700, sentence case). `rule` is the width of a pencil field line drawn under
  the text; `underline` sets it as a link. A dissection of blank sheets shows that
  something was removed but never *what*; printing the field name on each layer is what
  makes an anatomy film an anatomy. Optional; receipts without it build unchanged.

- **`focus: {from, to, dur, steps, at}`** — rack focus, as a stepped `blur()` on the plate.
  Discrete stops, so it reads as a lens turned by hand rather than a dissolve. A blur
  transition *between* plates is still banned; this is a camera move inside one shot.
- **`pan: {fromX, fromY, dur}`** — the slide. The plate starts offset and rails to zero,
  linear, and `dur` can stop it before the beat ends so the frame comes to rest. Check the
  plate still overscans the canvas at the offset. Lock `drift` to 1.0 → 1.0 on a panning
  beat so the move is pure translation.
- **`beat.card`** — overrides any field of `receipt.card` (`x y width height fontSize padX
  align rot seed amp step fill`). This is how type gets **set** rather than captioned. One
  torn strip in the same place at the same size every beat is a lower-third, and it is what
  Dillon rejected. `fill.tiles` may now be omitted — two half-width crops are generated
  from `fill.x/y` and `fill.rowGap`.

Type carries a letterpress ink spread (a sub-pixel `text-shadow`) so it reads as printed
into the fibre rather than composited over it. No receipt field; it is house style.

## Guardrails that stop the build

- The receipt's `clientId` must exist in `registry/clients.json`, be `active`, and its
  `displayName` must match the receipt's `client`. The registry wins.
- Every plate, the mark, GSAP and `STYLE-CONTRACT.md` are SHA-256 pinned. A mismatch is a
  hard stop, not a warning — a plate whose bytes changed is a different film.
- `hyperframes check` errors block the render.
- After rendering, `ffprobe` measurements are compared against the receipt; any dimension,
  duration or frame-count drift lands in `verification.json` as a `problem` and prints.

## Plates, and why STYLE-CONTRACT.md does not list them all

`plates/` now holds seven, not the five the contract's table names:

| Plate | Reference | Added |
|---|---|---|
| `bench-model.png` `exploded-motor.png` `fibre-tangle.png` `journal-bird.png` `paper-brain.png` | ref-02, 05, 01, 03, 04 | 2026-09-09 |
| `thread-circuit.png` | ref-06 — thread as line, brass brads, pencil schematic | 2026-09-10 |
| `engraved-engine.png` | ref-08 — Victorian line engraving, torn indigo corner | 2026-09-10 |

**Do not "fix" STYLE-CONTRACT.md to add them.** That file is SHA-256 pinned in every
receipt; editing a byte hard-stops all four earlier films. The palette and rules in it are
still correct — its plate table is just the set that existed when it was written. If the
contract genuinely needs to change, cut a v2 file and repoint new receipts at it.

## Reproducibility, precisely

The **composition** is deterministic: the same receipt authors a byte-identical
`index.html`, including the seeded tears. Verified 2026-09-10 by diffing two runs.

The **encode** is not. Two `--quality high` runs of the same composition produced MP4s of
54.31 MB and 54.29 MB with different SHA-256s. The pixels match — both measured 1152
frames and identical per-frame luma statistics (YAVG min 110.6, max 188.4, mean 161.3) —
but the H.264 bitstream is not byte-reproducible. Compare renders on measured frame data,
never on file hash.

## Requirements

Node 22+, FFmpeg, and a Chrome that `hyperframes doctor` can find. Verified 2026-09-09 on
hyperframes 0.8.33, Node 24.18.0, FFmpeg 8.1.2. Docker, whisper and the TTS/BGM extras are
reported missing by `doctor` and are not used by this pipeline — there is no narration or
audio track.
