---
tags: [concept, design-system, prospect-radar, three-js]
created: 2026-08-10
source: "[[02_Campaigns/AI Site Builder Outreach Engine/batches/prospect-3d-scroll-next10-2026-08-10/KAGE-REBUILD|next10 KAGE-REBUILD]]"
---

# Composited Scroll World System

**One lesson: a cinematic scroll page works when the photograph, the 3D geometry, and the editorial stills live inside one scene with one camera — never as stacked page layers.**

The system that built Prospect Radar 166–178 (trio + next ten). Reference: MengTo's *Kage*. Proven twice: bespoke worlds (trio) and spec-driven worlds (next ten).

## The grammar

1. **Plate inside the scene.** The hero image is a fogged, graded plane in 3D — not a CSS background. It parallaxes honestly and takes the scene's atmosphere.
2. **Geometry on real ground.** Business-specific props stand on a floor that receives shadows. Nothing floats unless flight is the story.
3. **Panels in world space.** Detail imagery hangs as planes the camera travels past; their captions are DOM text projected from world anchors every frame.
4. **Beat-timed camera.** Six beats with their own `at` timing so the rig dwells. Presets: orbitArc, pushReveal, craneDown, driftLateral (`src/scenes.js → ROUTES`).
5. **Choreography = the verb.** Each business gets one transformation verb (ALIGN, STACK, MOVE…) and its props enact it via a prop DSL: `phase`, `from`, `spin`, `glowRamp`, `arcLift`.
6. **The switch-on.** A warm practical ramps up in the last third (`warmRamp`) while the plate grade lifts — the world resolves as the story lands.

## Hard rules learned

- **Brightness is a feature.** Plate grade never opens below 1.0; scrims carry the minimum ink that keeps type AA. The consumer must see the world (v1 trio shipped too dark and was regraded).
- **Reveals are frame-driven.** IntersectionObserver and scroll events queue behind the render loop — on slow devices content stayed invisible for seconds. Run reveals inside the rAF loop; gate hidden states behind `.has-js`.
- **Scene progress is chapter-relative.** Long pages must not stretch the camera route across closing sections; the route completes at the last chapter and holds.
- **Word-split type:** masks are spans — scope any descendant `span` rules or headings restyle as captions; give masks `padding-bottom:.24em` or descenders clip.
- **Transmission excludes transparent objects** in three.js — anything that must be seen *through* water/glass needs the transmission→alpha handoff during reveals.
- **Logo boundary:** verified artwork or a labeled concept mark. Never redraw, never bake type into images.
- **Copy boundary:** describe the trade, never the client. Every page carries a source-boundary panel and synthetic-imagery disclosure.

## Where it lives

- Engine + spec DSL: `02_Campaigns/AI Site Builder Outreach Engine/batches/prospect-3d-scroll-next10-2026-08-10/src/scenes.js`
- Ten worked examples: same package, `src/config.mjs`
- Bespoke ancestor: `…/prospect-3d-scroll-trio-2026-08-09/`
- Build/run loop: [[12_Brain/protocols/Daily 3D Build Loop|Daily 3D Build Loop]]
