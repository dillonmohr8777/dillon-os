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

## Second pass — presence and length

The first pass got the architecture right but the pages read quietly and ran
short. This pass raised the volume and added the material a prospect actually
reads.

**Type.** Display sizes up roughly 15%, with layered cast shadows instead of a
single blur. Headlines are split into words at runtime and each word rises out
of its own clipping mask on a staggered delay — element children (`<br>`,
inline `<b>`) survive the split, so line breaks and emphasis are preserved.

Two things that had to be got right for that to work:

- The masks are `<span>`s, so any existing descendant `span` rule restyled
  headline words as if they were captions. Those rules are now scoped to direct
  children, and `.word` inherits typography explicitly.
- `overflow: hidden` on a mask clips descenders. The mask carries
  `padding-bottom: .24em` with a matching negative margin so `g`, `y` and `p`
  keep their tails.

**Motion and depth.** A single reveal system (`data-reveal` with `up`/`left`/
`right`/`wipe`/`scale`/`fade`) drives every entrance on one easing curve.
Editorial frames wipe open while the image inside settles back from a 1.16
overscan. Buttons carry a sheen sweep, cards lift and light a leading rule,
list rows inset on hover, and a pointer-tracked pool of light moves across the
fixed world.

**Reveals are frame-driven, not event-driven.** This is the part worth knowing
about. Scroll events and IntersectionObserver callbacks both queue behind the
render loop; on a slow device that left whole sections sitting at `opacity: 0`
for seconds after scrolling into view. Reveals now run inside the existing rAF
loop, with the observer kept as the cheap path and a scroll sweep as a
fallback for the no-WebGL case. The hidden state is also gated behind a
`has-js` class, so a bundle that never executes leaves a fully visible page
rather than a blank one.

**Scene progress is chapter-relative.** The added sections roughly doubled page
height, which would otherwise have stretched the camera route across another
few screens of copy. The route now completes at the end of the last chapter and
holds, so the closing material is read over a world that has already resolved.

**Length.** Three sections per prospect: a six-card sequence grid describing how
the work is actually staged, a measures band reporting how the page itself was
built, and a brief panel stating plainly what would need to be confirmed with
the business before anything went live. All of it is written to avoid asserting
anything about the specific business — the sequence cards describe the trade,
not the client.

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
- **Deployed August 10, 2026.** The verified 30-route handoff was composed with
  builds 166 through 168 and published to the existing Netlify site
  `momentum-prospect-radar-next10-2026-08-08`. Production deploy
  `6a79628feeb48f62cf22cc84` passed all eight release checks across the root,
  lab, 30 prospect routes, response headers, and referenced assets.
- **Copy and mobile refinement.** Customer-facing copy now leads with the
  decision each visitor is making while keeping every source boundary intact.
  Visible dash punctuation was removed. Mobile type, touch targets, stacked
  actions, short-screen spacing, and wordmark clearance were tightened and
  verified at 390 by 844 and 375 by 667.
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

## Consumer-visibility pass (2026-08-10)

Operator review: "the 3D is incredible, but I wanna really be able to see it
as a consumer." Exposure raised per world (0.92→1.08 / 0.98→1.12 / 1.08→1.18),
ambient lifted, plate grade now opens at 0.8+ instead of 0.6, and both desktop
and portrait scrims carry noticeably less ink. MacLaren's official logo keeps
its real artwork but sits on a frosted, rounded container instead of a solid
white slab. The next-ten package (`../prospect-3d-scroll-next10-2026-08-10/`)
inherits these values as its defaults.
