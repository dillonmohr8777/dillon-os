# scroll-engine

The shared composited scroll-world engine behind Prospect Radar builds 166–178. One generic Three.js renderer plus a declarative per-site spec; no business names in engine code.

## Provenance

Extracted **byte-identical** from `02_Campaigns/AI Site Builder Outreach Engine/batches/prospect-3d-scroll-next10-2026-08-10` at `refs/pull/270/head` (see `engine.version.json` for the source commit and per-file SHA-256). Verified on extraction day: a full batch build from these files reproduced all 76 `dist/` files hash-identically, and the static QA gate passed 144/144.

## What lives here

- `src/scenes.js` — the engine: four camera presets (`orbitArc`, `pushReveal`, `craneDown`, `driftLateral`), six-beat Catmull-Rom routes, prop DSL (9 primitives + tube, 17 PBR materials, motion verbs `phase/arcLift/fadeIn/spin/sway/glowRamp/pulse`), PMREM environment, ACES, in-scene hero-plate compositing, projected-anchor editorial panels.
- `src/site.js` — page controller: damped scroll → chapter-relative progress, per-word headline masks, reduced-motion (composed final frame), WebGL fallback poster, `.has-js` gating.
- `src/styles.css` — base presentation layer.
- `scripts/build-pages.mjs` — HTML generator (consumer supplies `src/config.mjs` with `SITES` + `ORDER`).
- `scripts/generate-textures.mjs` — procedural material maps.
- `scripts/qa.mjs`, `scripts/qa-browser.mjs` — static gate and Playwright harness (desktop/mobile/reduced-motion/forced-fallback, choreography asserted per-site).
- `fixtures/` — one site's plates + fonts + `_headers` for engine tests.

## Rules that are engine features, not style choices

From `12_Brain/concepts/Composited Scroll World System.md`: plate grade never opens below 1.0; reveals run inside the rAF loop (never bare IntersectionObserver); scene progress is chapter-relative; word-mask spans need `padding-bottom: .24em`; transmission materials need the alpha handoff for objects seen through them; verified logos or labeled concept marks only; copy describes the trade, never the client; every page ships `noindex`, the source-boundary panel, and the synthetic-imagery disclosure.

## Consuming

A batch copies this package (recording `engine_version` from `engine.version.json`) and adds its own `src/config.mjs`, plates under `public/assets/plates/<slug>/`, and fonts. `vite.config.js` auto-discovers `sites/` entries; no config edits per site.
