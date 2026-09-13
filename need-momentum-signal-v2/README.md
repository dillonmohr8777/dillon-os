# Need Momentum — Signal Field, v2

A design pass over the Need Momentum "signal field" concept homepage.

**This is a duplicate, not a replacement.** v1 stays live and untouched at
`https://need-momentum-signal-20260803.netlify.app/`. v2 deploys to its own
Netlify site so the two can be compared side by side.

Copy is **identical to v1, character for character** — every headline, bio,
service description, CTA, `alt` and `aria-label`. The only string added to the
page is the `Skip to content` accessibility link. Everything else that changed
is type, colour, depth, motion, structure or performance.

## Run it

```bash
npm install
npm run dev        # vite dev server
npm run build      # tsc --noEmit && vite build  → dist/
npm run preview    # serve dist/ on :4173
```

## Deploy the duplicate

Per `../immohrtal-site/DEPLOY.md`, the fastest path is Netlify Drop:

1. `npm run build`
2. Go to **app.netlify.com/drop** and drag the `dist/` folder in.
3. Rename the site to something like `need-momentum-signal-v2-20260803`.

Do **not** drop this onto the v1 site. It is meant to live at its own URL.

`noindex,nofollow` is set in `index.html` and must stay set — this is a concept
preview and must never compete with needmomentum.com in search.

## Where v1's source came from

v1's source was not in any repo; it was built in an earlier ephemeral session.
It was recovered from the deployed sourcemaps
(`/assets/index-B-TUKZQT.js.map`), which is why `src/shared/content.ts` is
byte-identical to v1's — it was copied straight across, not retyped.

`MapHomepage.tsx` existed in v1's `main.tsx` but was tree-shaken out of the
deployed bundle and is unrecoverable. v2 renders the signal concept only, which
is the design that was actually live.

## What changed, and why

### Depth
v1 faked depth with one or two flat `box-shadow`s and contradictory light
directions. v2 declares **one light source** (top-left, ~15°) and an
**elevation ramp** `--e1`…`--e5`, each a four-part stack: tight contact shadow,
mid diffuse, wide ambient, hue-keyed bloom. Every raised surface also gets an
inset top rim light and a separate blurred cast shadow element, so shadows
never animate their geometry.

### Colour
v1 was effectively two colours. `--violet` existed but appeared only inside a
`text-shadow` and a particle `lerp`, and yellow leaked into cards, ticker and
particles — so the audit CTA didn't read as *the* action.

v2 builds **OKLCH ramps** (brand hexes stay exact at the 500 step; the rest of
each ramp is generated in OKLCH so lightness steps are perceptually even) for
cobalt, cyan, violet, indigo and rose. Yellow is now `--action` and appears
only on audit CTAs and the play control. Each section gets its own gradient
recipe so no two adjacent surfaces are the same navy.

### Type
- v1 downloaded **Instrument Serif and never used it**, and loaded 80 kB of
  Archivo purely as a fallback behind Unbounded. Archivo is gone; Instrument
  Serif italic now carries the emphasis word inside existing headings
  (`…becomes *proof*.`, `More *momentum*.`) and the manifesto's `<strong>`
  lines. That's the type contrast v1 was missing.
- **Martian Mono** added for every numeral and caps label — card numbers, the
  `01/02/03` steps, the rail counter, the ticker — with `tabular-nums` so
  counters don't jitter.
- 9-step fluid scale, per-size optical tracking, and real axis control: the
  hero dropped from weight **840 → ~340** and grew instead. Large display type
  needs less weight, not more.
- The hero headline is rebuilt as genuinely extruded type: a gradient face over
  a stepped extrusion, with chromatic ghosts that converge on load.

### Motion
Per `.claude/skills/motion-design`, **the 4.2s autoplay carousel is gone** —
it moved content out from under the reader. The rail is now driven by pointer,
drag, and arrow/Home/End keys. Added: magnetic CTAs with a pointer-tracked
specular sweep, a pointer force field in the hero particles, a burst on CTA
hover, scroll-velocity lean on the ticker, and word-level heading reveals.
Everything is transform/opacity only and fully neutralised under
`prefers-reduced-motion`.

### Performance
| | v1 | v2 |
|---|---|---|
| Blocking JS | 1,175 kB (single bundle) | **293 kB** entry (three.js split to a lazy 894 kB chunk) |
| Fonts | ~440 kB (every subset of 5 families) | **121 kB** (latin only, 4 families) |
| Canvases | 4, always rendering | 4, each **paused off-screen** |
| Images | no `width`/`height`/`loading` | all sized, lazy, `decoding=async` |

Plus a `no-js` → `js` guard, a `<noscript>` hero, and particle counts that
scale down on low `deviceMemory`/core-count devices.

### Bugs fixed that v1 also had
- **Manifesto copy was silently sliced.** `white-space: nowrap` at `5vw`
  inside an `overflow: hidden` section meant "Systems move people." was cut off
  at 1440px — clipped, not scrolled, so no overflow check would catch it.
- **Founder photos were different heights.** `auto` grid rows absorb the free
  space the parent grid hands down, so whichever founder had the shorter bio
  got a taller photo.
- **The Google Partner badge was invisible** — a white lockup on a white
  surface. It now gets the dark plinth its guidelines assume.
- **Awards row reflowed on load** (no image dimensions).

## Verification

```bash
npm install --no-save playwright     # not a project dependency
npm run build && npm run preview

node scripts/qa.mjs                  # 3 viewports: overflow, clipping, console, a11y
REDUCED=1 node scripts/qa.mjs        # prefers-reduced-motion pass
node scripts/sections.mjs            # section-anchored screenshots
```

`scripts/qa.mjs` checks horizontal overflow, console errors, failed requests,
missing `alt`/dimensions, and **clipped copy** — boxes carrying text whose right
edge escapes the viewport. That last check is the one that catches the
`overflow: hidden` class of bug, which a plain `scrollWidth` comparison misses
entirely. Decorative bleeds (glows, the hero lens, the proof wipe) are excluded
by design.

Current state: 0 overflow, 0 clipped copy, 0 console errors, 0 failed requests
at 1440/834/390, in both normal and reduced-motion modes.

Two warnings are expected and harmless: `THREE.Clock is deprecated` comes from
inside `@react-three/fiber`, and the `GPU stall due to ReadPixels` messages are
software-rendering artifacts of headless Chromium's SwiftShader backend.

## Notes

- `public/assets/founders/mac-sean-award-2026.webp` is mirrored from v1 but
  unreferenced — it was only used by the unrecoverable `MapHomepage`. Kept in
  case the award photo is wanted later.
- No JSON-LD `telephone` or `address`: there is no verified NAP for Need
  Momentum in this repo, and inventing one on a page that carries real founder
  bios would be worse than omitting it. `Organization` schema covers name, url
  and founders only.
