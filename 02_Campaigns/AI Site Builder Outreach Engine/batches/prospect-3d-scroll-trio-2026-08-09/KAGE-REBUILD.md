# Kage-framework rebuild — builds 166–168

Second pass over the prospect trio, rebuilding the scroll experience around the
motion grammar in the reference (MengTo's *Kage*) rather than around a CSS
parallax page with a decorative canvas behind it.

## What was actually wrong before

The previous build shipped a full Three.js scene per prospect, but the page never
showed it. `#scene-canvas` was rendered at `opacity: .5` with
`mix-blend-mode: soft-light`, sandwiched between a CSS `.scene-plate` background
image and a heavy `.scene-scrim`. The photography did all the work; the 3D was a
faint texture on top of it. Two consequences:

- Scroll drove a camera nobody could see, so none of the pacing read.
- The scenes themselves were built as isolated objects on empty ground — the
  jewelry world was a dodecahedron, an octahedron and a torus floating in black.

## The change

**One composited world.** The plates moved *inside* the scene:

| Layer | Was | Now |
|---|---|---|
| Far plate | CSS `background-image` | `MeshBasicMaterial` plane in-scene, taking scene fog and a scroll-driven grade |
| Depth haze | — | Large soft plane between plate and geometry |
| Built geometry | Isolated primitives | Business-specific set, grounded on a real surface |
| Editorial frames | CSS `background-image` insets | Textured planes in world space the camera travels past |
| Near cut-out | CSS layer with a clip path | Camera-locked plate with damped lag, occluding in-scene |

Because everything shares one camera, there is no seam between "the 3D" and "the
art direction" — which is the whole trick in the reference.

**Captions belong to their object.** Each editorial panel's world anchor is
projected to screen space every frame and an HTML `<figcaption>` is positioned
there. The type stays crisp DOM text; the panel is genuinely in the scene.

**Beats, not a spline sweep.** The camera route is a list of beats each carrying
its own `at` timing. Two beats close in space but far apart in time make the
camera dwell — that hold is most of what separates *directed* from *animated*.

**Lens shift, not a pan.** Desktop applies `camera.setViewOffset()` so the
subject sits right of centre and the copy column keeps its own air, without
lying about where the camera points. Portrait drops the shift and reframes, and
the rig adds its own pull-back and lift rather than shrinking the desktop shot.

**Procedural textures rewritten.** The old maps were single-frequency
`sin()` patterns raised to high powers, which read as contour lines on every
surface. They are now periodic-lattice fBm with domain warping — marble veins
are broad and soft, wood has rings plus fibre and pore, copper has blotchy
patina. The noise lattice wraps on an integer period and the vein/ring sines use
integer multipliers, so the maps close over the unit square — measured mean edge
delta is ~1/255, i.e. WebP compression noise rather than a seam. That matters
because these maps are repeated hard (the pool apron runs the stone map at
14 × 9).

**Procedural lighting environment.** A small equirect image (dark room, one warm
practical, one cool slab) is generated per scene and run through
`PMREMGenerator`. Metal and glass need something to reflect or they read as grey
plastic.

## The three worlds

- **MacLaren Kitchen & Bath** — a room assembling itself out of the dark.
  Carcasses fly in, the stone slab lowers, the backsplash grows, the island
  swings into place, pendants drop, and the practicals come up last. The back
  wall is built as four segments around a real opening, so the plate is seen
  *through* a window rather than pasted behind the room.
- **Golden Eagle Jewelry** — the bench, not a floating solid. A rough stone sits
  on a leather pad under one hard lamp, dissolves into a cut brilliant (crown,
  table, girdle, pavilion built as separate lathe forms so facets catch light
  separately), debris settles, and a gold band rises and takes the stone.
- **Morton Electric Pool & Spa** — the deck opens and the system underneath
  becomes the subject. Cover panels slide, the shell and liner go translucent,
  copper supply and return, pump and heater rise into view, the impeller spins
  up and steam lifts off the surface.

## Honest limitations

- **No new photography was generated.** This environment has no image-generation
  tool or credential, so the build reuses the existing plates
  (`public/assets/scenes/`) and the 18 editorial frames
  (`public/assets/editorial/`). Everything newly generated in this pass is
  procedural: the seven material maps and the per-scene lighting environments.
  The `*-foreground.png` cut-outs remain alpha-masked crops of their own hero
  plate rather than independently art-directed foreground elements.
- **The built geometry is still primitive-based.** It is grounded, graded and
  choreographed, but it is boxes, tubes and lathes — not modelled assets. It
  reads as authored CG, not as photography. Closing that gap needs either real
  3D assets or generated plates for the mid-ground.
- **Not deployed.** No Netlify credential is present in this environment, so the
  composed 30-route deployment to `momentum-prospect-radar-next10-2026-08-08`
  has not been run. `npm run compose` and `npm run qa:deploy` are unchanged and
  still expect the verified 30-route handoff as their base.
- All prospect content boundaries are unchanged: no fabricated awards,
  testimonials, inventory, pricing, hours or service claims; pages stay
  `noindex` with the mail hold in place.

## Verifying locally

```bash
npm install
npm run build
npm run qa
npx vite preview --host 127.0.0.1 --port 4177 --strictPort
# in another shell — CHROME_BIN is optional and only needed when the local
# Playwright browser download is unavailable
npm run qa:browser -- http://127.0.0.1:4177 round-1 all /
```
