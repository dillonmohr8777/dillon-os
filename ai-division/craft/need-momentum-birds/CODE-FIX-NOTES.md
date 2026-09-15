# CODE FIX NOTES - Need Momentum Birds

Date: 2026-09-11

## Scope

- Edited `remotion/src/NeedMomentumBirdsHero.tsx`.
- Edited `remotion/remotion.config.ts` so local still rendering uses an existing Chrome executable on Windows instead of a missing Linux path.
- Kept `NeedMomentumBirdsHero` at 450 frames, 30fps, 1920x1080.
- Kept `SHOW_SVG_BIRDS = false`; GPT plates remain primary.
- No Momentum logo overlay, Anthropic marks, Claude marks, or generated text overlay added.

## Motion Upgrade

- Added per-plate Ken Burns push, drift, rotation, and transform origins.
- Widened plate overlap windows and switched opacity ramps to a smoother crossfade curve.
- Added subtle live torn-paper edge motion at the top and bottom of frame.
- Added tactile drift to existing cream/kraft paper accent layers.

## End Lockup

- Strengthened the DRAFT wordmark as a stamped orange tag using `#E27113`.
- Added live Remotion type for `THE FUTURE NEEDS` and large orange `MOMENTUM`.
- Kept all end-card copy as live type so plates do not need generated lettering.

## QA

- Passed `npm run lint`.
- Rendered still frame 225 to `remotion/out/qc-after-codex.png`.
- Visual QC: frame 225 is nonblank, plate-led, and in the cardinal signal beat with no logo overlay.
