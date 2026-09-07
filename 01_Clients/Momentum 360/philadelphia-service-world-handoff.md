---
client: Momentum 360
client_id: momentum-360
status: active
last_touched: 2026-09-07
next_action: Rotate the Google Maps browser key, then run the five proposed changes against the Windows source and report the acceptance evidence.
due: none
division: Momentum 360
tags: [client, momentum-360, philadelphia-service-world, handoff, web, security]
---

# Philadelphia Service World: implementation handoff to local Codex

One line: the walkable Philadelphia the team wanted is already built and shipped
in this app, nobody can reach it, and the build leaks a Google API key. Fix those
before building anything new.

Prepared from the deployed artifact on 2026-09-06 and 2026-09-07. Every claim
below is either read out of the shipped bundle or fetched live from the site.
Where something is unverified, it says so.

## 0. Read this before you plan

The milestone brief asked for one small polished navigable Philadelphia area
using existing assets, with reliable movement, appropriate collision, one
complete service interaction, and graceful loading and error behaviour.

**That slice already exists in this app.** Appending `?mode=walk` to the site URL
loads a complete third-person walkable Center City: a real character controller,
swept-circle collision against building footprints, streamed 400 m tiles,
procedural facades, instanced props, traffic, a canvas minimap, a full-screen map
with fast travel, a nine-stop objective route, and Mac Frederick and Sean Boyle
as rigged guides you can walk as.

Nothing links to it. Grepping the entire deployed build for the literal
`mode=walk` returns zero hits in `index.html`, in the app shell, in the street
scene, and in the game scene itself. A visitor cannot find it. Both co-founders
are modelled, animated and shipped inside a route with no door.

So the work is not to build the slice. The work is to open the door, fix the four
defects behind it, and stop shipping the key. That is a much smaller change than
a new build, and it is the whole milestone.

## 1. Who runs this and why it isn't me

The source lives at:

```
C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\work\philadelphia-service-world
```

That path is inside `client-operations`, whose `.gitignore` excludes `work/` at
line 8. Confirmed with `git check-ignore -v`. The directory therefore never
reaches GitHub, so it never reaches my container. I have read the deployed
artifact instead, which is why every proposal below is anchored to a string,
path, or constant that survives minification rather than to a symbol name.

You have the source, a Windows filesystem, FFmpeg, Blender, and a real browser.
I have none of those against this project. Every acceptance check that needs a
browser or the source is yours.

## 2. My branch and commit, and what is not moving

- `dillon-os` @ `claude/philadelphia-3d-rendering-8xa6td`, HEAD
  `05348deec16810f5a1460c888cd22d9e19b14eb8`, working tree clean, PR #377 open as
  a draft, CI green, no merge conflict.
- That branch carries `philly-3d/`: a separate from-scratch Philadelphia dataset
  and WebGL2 viewer, plus four Godot district exports.

**Nothing in this handoff moves, merges, or migrates `philly-3d` or the Godot
work.** They stay where they are, on that branch, as their own thing. The
Momentum milestone belongs to the existing web app and the existing web app keeps
its own data pipeline. Section 9 records what I deliberately did not propose and
why.

## 3. What the deployed build actually is

Verified from the live site and from the Netlify account on 2026-09-06 and
2026-09-07.

### Hosting

| Fact | Value |
|---|---|
| Netlify project | `momentum-philadelphia-world` |
| Site ID | `5949b7f5-af8f-4bfc-ac18-c527edd5c5c0` |
| Team | `6998945d3cc9912eb1897c08` |
| Current deploy | `6a9deb2adc8c3d712346444a`, published 2026-09-06T22:37:50Z |
| Deploy source | `cli`, `build_id: null`, `commit_ref: null`, `branch: null` |
| Framework | vite |
| Functions, edge functions, redirects | none |
| Header rules | 2, deployed clean |

I resolved that site ID by searching the account for the project name, not by
reusing the value from the brief. The two agree.

**The build runs on your machine, not on Netlify.** No git link, no build ID, no
commit. The CLI uploads `dist/`. That is why the Google key is a local `.env`
value and not a Netlify environment variable, and it is why section 5.1 is a
local change rather than a dashboard change.

`noindex` is enforced twice: an `x-robots-tag: noindex, nofollow` response header
and a `<meta name="robots" content="noindex,nofollow">` tag. Preserve both.

Rollback path: Netlify retains prior deploys, so the previous deploy can be
re-published from the deploys list. Note the deploy ID you are replacing before
you publish anything.

### Application shape

React 19.2.8 plus Vite. Cesium is not bundled; `index.html` loads
`/cesium/Cesium.js` as a classic global. Three scenes, chosen once at mount from
the query string and never re-read:

- no parameter, or anything unrecognised: **StreetScene**, a Three.js block of
  Center City. Default landing view.
- `?mode=walk`: **GameScene**, the walkable city. Unlinked.
- `?view=map` or `?mode=map`: the **Cesium** geographic city.

Thirteen query parameters are read by the shell: `mode`, `view`, `tier`,
`shadow`, `guideshadow`, `soft`, `radius`, `dpr`, `shadows`, `hdr`, `msaa`,
`uncapped`, `stats`. GameScene reads three more of its own: `fp`, `guides`,
`stats`. **None of them disables the Google tiles path.** There are zero
`localStorage` reads in the bundle.

### Live data endpoints, all verified 200

| Path | Bytes | What |
|---|---:|---|
| `/data/locations.json` | 2,802 | 4 real places, census-geocoded |
| `/data/guides.json` | ~900 | 3 guides, one of them `pending` |
| `/data/characters.json` | 263 | 2 street-scene founders |
| `/data/realism-characters.json` | 143 | 2 street-scene models |
| `/data/philadelphia-buildings.geojson` | 1,746,450 | raw `LI_BUILDING_FOOTPRINTS` |
| `/data/city/index.json` | see below | baked city manifest |
| `/data/city/<id>.json` | 2,777,172 total | 87 tiles |
| `/assets/realism/mac.glb` | 5,992,028 | 200 |
| `/assets/realism/sean.glb` | 5,074,776 | 200 |
| `/assets/realism/mac.mobile.glb` | 4,146,480 | 200 |
| `/assets/realism/sean.mobile.glb` | 3,611,456 | 200 |
| `/assets/realism/dillon.glb` | 3,449 | **404**, HTML |
| `/assets/realism/dillon.mobile.glb` | 3,449 | **404**, HTML |

The four places are Reading Terminal Market, Hard Rock Cafe Philadelphia, Elixr
Coffee Roasters Center City, and La Colombe Dilworth Plaza. Every one carries
`"role": "illustrative-service-location"`, a `coordinateSource` of
`U.S. Census Geocoder Public_AR_Current`, a `matchedAddress` and a `tigerLineId`.
They are real businesses, and the file already says they are illustrative rather
than clients. Section 10 asks whether that wording is enough.

City coordinate frame, shared by the Cesium map and GameScene: origin lon
`-75.166681893`, lat `39.949521831`; metres per degree `85300` and `111320`; tile
size 400 m; quantum 0.05 m; 18,762 buildings, 3,033 roads, 16,592 trees, 9,087
lamps across 87 tiles.

## 4. Findings, worst first

### 4.1 The Google Maps API key is readable by anyone. P0.

`/assets/index-BdHrptOh.js` is served publicly and contains a Google Maps API key
as a plain string literal. I have not printed it, stored it, or transmitted it,
and neither should you.

The shape in the shipped bundle, with the literal replaced:

```js
async function dv(scene, compact, onFallback) {
  const key = "<<REDACTED_GOOGLE_KEY>>".trim();
  if (key) {
    Cesium.GoogleMaps.defaultApiKey = key;
    // ... createGooglePhotorealistic3DTileset(...)
    scene.globe.show = false;
```

The `.trim()` on a literal is Vite's signature for an inlined `import.meta.env`
value, so in source this is an env var. The gate is `if (key)` and the literal is
non-empty, **so the branch is compiled live in the deployed build**.

Two things follow, and they are separate.

**The key is exposed.** That is settled. It is in a public file right now. Treat
it as compromised. Rotating it is not part of this code change and should not
wait for it.

**Whether the branch actually reaches Google is not settled.** Reading the bundle
proves the call site is reached. It does not prove tiles load. The key might be
referrer-restricted, quota-exhausted, or disabled, in which case the app is
already silently falling back to the baked city and nobody has noticed. I tried
to settle it with a request to the tiles endpoint; the sandbox blocked it because
the request carried a credential, and I did not route around that. Section 7.1
gives you the exact procedure.

The failure handling has a real flaw independent of all this. The fallback fires
only when three tiles fail **before the first successful tile load**:

```js
tileset.tileFailed.addEventListener(() => { !loadedAny && ++fails >= 3 && fallback(); });
```

Once one tile succeeds the latch is permanent. A key that works for the root tile
and then hits quota mid-session leaves the visitor on a broken photoreal scene
with no recovery for the rest of the session.

### 4.2 The walkable city is unreachable. P1.

Covered in section 0. `?mode=walk` is a complete experience with zero entry
points. Both founders are in it. This is the single highest-value change in the
handoff and it is roughly a button.

### 4.3 The guide chooser advertises a guide that 404s. P1.

`/data/guides.json` declares three guides. The third is Dillon Mohr, role
`Head of AI marketing division`, home `ai-hub`, `"status": "pending"`, and both
`/assets/realism/dillon.glb` and `dillon.mobile.glb` return 404 with
`content-type: text/html`, which is Netlify's SPA fallback rather than a model.

The loader correctly skips `pending` entries, so nothing crashes. The user
interface does not know that. Its accessible label reads `Choose your guide
(keys 1-3)` and the keyboard handler accepts `1`, `2` and `3`, indexing
`guides[key - 1]`. Index 2 is always undefined, so pressing `3` silently does
nothing. Either ship the model or stop advertising the third slot.

Each guide also carries a `quests` array that GameScene never reads. The guide
you walk with has no effect on the route, the stops, or the copy. That is
authored intent with nothing behind it.

### 4.4 The AI campaign demonstration highlights the wrong bars. P2.

The AI stage swaps between a blue and a gold material to show workflow steps. For
the `campaign` program the highlight predicate ignores the bar index, so on step 1
every bar lights and on every other step none do. `campaign` also renders four
bars against three steps of data. `lead` (5 and 5) and `visibility` (3 and 3) are
consistent, so this is one program, not the system.

### 4.5 There is no error boundary. P2.

No `componentDidCatch` or `getDerivedStateFromError` outside React's own
reconciler. Two consequences:

- If a lazy chunk fails to download, Vite dispatches a cancelable
  `vite:preloadError` on `window` and rethrows when nothing calls
  `preventDefault`. Nothing listens. The Suspense fallback `Opening the street…`
  is replaced by an uncaught render error, not by the in-app alert.
- A module-level integrity assertion runs during import, before `createRoot`, and
  throws `A service explanation or evidence locator is missing.` if any service
  row lacks a description or a source. A data-entry mistake produces a completely
  blank page with no in-app error at all.

The in-app error path itself is fine and already funnels three internal causes
into one message with a Retry button. The gap is everything that happens before
or outside React.

### 4.6 Smaller things, recorded but not proposed

Do not fix these in the same change. They are here so they are not rediscovered.

- The baked city fetches all 87 tiles in one unbounded `Promise.all`. An
  88-request burst with no concurrency cap, no retry, and no per-request timeout.
- `index.json` gives every tile a `sha256` and a `bytes` count. Both are accurate,
  I re-hashed two tiles and they matched. Neither is read at runtime. The strings
  `sha256` and `bytes` appear zero times in the bundle.
- `index.json` ships a fully populated `places` array with computed street-side
  stand positions. The app never reads it and uses `/data/locations.json` instead.
- `roofEnvelope(lon, lat)` linear-scans all 18,762 building centroids per call
  with no spatial index.
- The Google height sampler uses 85,400 and 111,000 metres per degree while the
  rest of the module uses 85,300 and 111,320.
- A coordinate self-test asserting `t_0_-1`, `x 271.4`, `z -342.7` is defined and
  never called. It belongs in a test.
- City Hall is a hard-coded three-box tower welded on at heights 118, 148 and 167
  metres, keyed off a `/^city hall$/i` name match.
- In StreetScene, the inner-ring (roof hole) projection applies the longitude
  scale but does not negate latitude, unlike the outer ring. Probable sign error.
- StreetScene street lamps have emissive materials and emit no actual light. No
  `PointLight` or `SpotLight` exists in that module.
- GameScene collides with building walls only. Props, traffic, guides and exhibit
  markers are all walk-through, and cars drive through the player.
- Route progress is `sessionStorage`, so it is lost when the tab closes.

## 5. Proposed changes

Five changes, ordered. Each is small, each stands alone, and each has an
acceptance check in section 7. Do not widen them.

### 5.1 Turn Google Photorealistic Tiles off at the build, and stop shipping the key

**Where.** Grep the source for `Cesium.GoogleMaps.defaultApiKey`. The line above
it reads the env var and calls `.trim()`. Also grep for `createGooglePhotorealistic3DTileset`.

**What.** Two edits.

First, make the env var absent so Vite inlines an empty string and the `if (key)`
gate is false. Remove or blank the `VITE_*` key entry in the local `.env` (and
`.env.production` if one exists). Do not delete the code path. Do not hardcode
`false`. The gate already works; starve it.

Second, add an explicit escape hatch so the two paths are testable without
editing code again. Read a `city` query parameter alongside the key:

```js
const forceBaked = new URLSearchParams(location.search).get('city') === 'baked'
const key = forceBaked ? '' : (import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '').trim()
```

Today there is no way to exercise the baked path in a production build without
interfering with the network, which makes the fallback untestable.

**Why not just delete the branch.** The brief says keep the tiles disabled, not
remove the capability. An env-gated branch that compiles to nothing is disabled.
A deleted branch is a decision nobody asked for.

**Separately, and not blocked by this:** rotate the key in Google Cloud, and when
issuing the replacement restrict it by HTTP referrer to the site's own origin.
Do not raise quotas, change billing, or loosen restrictions. If the key turns out
to be used by nothing else, the cleanest outcome is to delete rather than rotate.

### 5.2 Give the walkable city a door

**Where.** The masthead navigation, which already carries a `Street view` control
and a `City view` control. Grep for the string `Street view`. The scene flags are
`get("mode")==="walk"` and `get("view")!=="map"`, both `useState` initializers.

**What.** Add one control that navigates to `?mode=walk`. Because `walkMode` has
no setter and is read once at mount, the honest implementation is a real
navigation rather than a state toggle. A plain link is correct here and it keeps
the route shareable and bookmarkable.

Label it for what it is. `Walk the city` is accurate. The GameScene HUD already
has a brand menu with nine items; add the return path there so a visitor is never
stranded.

**Do not** expand the walkable area, add tiles, or touch the streaming radius.
The existing 87 tiles are the slice.

### 5.3 Stop advertising the guide that does not exist

**Where.** Grep for `Choose your guide`. The keyboard handler nearby accepts
digits 1 to 3.

**What.** Derive the count from the loaded guides rather than hardcoding three.
The accessible label, the rendered buttons, and the accepted digit range should
all come from the same array that the loader filled after skipping `pending`
entries. With two guides loaded the label reads `keys 1-2` and `3` is not
accepted.

This is deliberately the small fix. Producing `dillon.glb` is a separate piece of
work with its own approval, and section 10 asks whether it should happen at all.

### 5.4 Fix the campaign highlight

**Where.** The AI stage bar highlight predicate. Grep for the program id
`campaign` near the bar construction.

**What.** Make the predicate compare the bar index to the active step, the way
`lead` and `visibility` already do, and build the bar count from the program's own
step count instead of a literal 4.

### 5.5 Make the failure modes graceful

**Where.** The `App` component and the entry module.

**What.** Three small pieces.

- Wrap the routed scene in an error boundary that renders the existing error
  block. Reuse the copy that is already there: `The 3D city could not start on
  this device. Try again, or explore every service below.` Do not invent new copy.
- Add a `window.addEventListener('vite:preloadError', ...)` handler that calls
  `preventDefault()` and routes into the same boundary, so a stale hashed chunk
  after a deploy degrades instead of blanking.
- Move the module-level service integrity assertion out of import time. Either
  run it inside the component and route a failure into the boundary, or make it a
  build-time test. A content mistake should never produce a white page.

Optionally, and only if it costs nothing: change the photoreal failure latch from
`!loadedAny && ++fails >= 3` to a rolling window so a mid-session quota failure
can still fall back. If it adds risk, leave it and record it.

## 6. Artifacts to hand back

For each change: the diff, and the evidence named in section 7. Plus these,
which I cannot produce from here.

1. **Key disposition.** Written confirmation that the old key is rotated or
   deleted, that the replacement (if any) is referrer-restricted to the site
   origin, and that no quota or billing setting was changed. Do not paste any key
   value into the vault, into a commit, or into this file.
2. **A grep receipt** that the built `dist/assets/*.js` contains no `AIza`-prefixed
   literal after the rebuild. Report the match count, never the match.
3. **Physical phone evidence.** One real phone, not a viewport emulation. Model,
   OS version, browser and version named. Screenshots of the landing view, the
   walkable city, and the Cesium map. Viewport emulation does not count and the
   brief says so explicitly.
4. **Desktop evidence.** Same three views, with the hardware named (CPU, GPU, RAM).
5. **Console transcript** for each of the three views, including warnings.
6. **Measured performance**, not impressions: the `data-fps` and `data-perf`
   attributes on the `.world` container, plus first-contentful-paint and
   time-to-interactive from the browser's own performance panel. Name the hardware
   and the network condition.
7. **The deploy ID you replaced**, recorded before you publish, so rollback is one
   step.

## 7. Acceptance checks

Run these against the real source and a real browser. A static read does not
satisfy any of them.

### 7.1 Does the Google path actually reach Google (do this before 5.1)

This is the check I could not run. Settle it before you disable the path, because
the answer changes what disabling means.

Open the current production site in a browser with DevTools Network open, filtered
to `tile.googleapis.com`, and load `/?mode=map`.

- Requests present and returning 200: the path is live and the app is serving
  Google tiles today. Disabling it is a visible change and Dillon should see a
  before-and-after screenshot.
- Requests present and returning 403 or 4xx: the key is restricted or disabled and
  the app has been falling back all along. Disabling it changes nothing visible.
- No requests at all: the branch is not reached for some reason the bundle read did
  not show. Say so rather than assuming.

Cross-check with `document.querySelector('.world').dataset.city`, which reads
`photoreal` or `baked`. Record the value alongside the network result. Also check
the console for `Google Photorealistic 3D Tiles unavailable; drawing the baked
city instead.`

### 7.2 After 5.1

- `npm run build`, then grep `dist/` for `AIza`. Expected: zero matches. Report the
  count.
- Load the built site. `dataset.city` must read `baked`. No request to
  `tile.googleapis.com` in the Network panel.
- `/?city=baked` and the default URL must behave identically.
- The baked city must draw. Confirm `dataset.buildings` reads `18762`.

### 7.3 After 5.2

- From the landing view, the new control reaches the walkable city with no manual
  URL editing.
- Walk in each of the four directions. Movement is continuous, no falling through
  the ground, no passing through a building wall.
- Reach at least two of the nine stops on foot and confirm the objective line
  updates.
- From the walkable city, the return control gets back to the landing view.
- Keyboard only, no mouse: reach the walkable city, move, and return.

### 7.4 After 5.3

- With two guides loaded, the accessible label reads `keys 1-2`.
- Pressing `1` and `2` switches guide. Pressing `3` does nothing and logs nothing.
- Confirm no request is made for `dillon.glb`.

### 7.5 After 5.4

- For `campaign`, step through every step and confirm exactly one bar is
  highlighted at each, and that the bar count equals the step count.
- Re-check `lead` and `visibility` are unchanged.

### 7.6 After 5.5

- Rename a built chunk in `dist/assets/` and load the site. Expected: the in-app
  error block with a working Retry, not a blank page.
- Temporarily blank one service description in the source, build, load. Expected:
  the in-app error block, not a white page. Revert.
- Block `/data/locations.json` in DevTools. Expected: the existing error copy.

### 7.7 Regression, all changes

- `npm run typecheck`, `npm run lint`, `npm run build`. All three clean.
- All three routes load: default, `?mode=walk`, `?mode=map`.
- `prefers-reduced-motion: reduce` honoured on all three.
- `x-robots-tag` and the robots meta tag both still present after deploy.

### 7.8 Publishing

Standing approval covers verified changes to this exact site. Before publishing:
confirm the Netlify account, confirm site ID `5949b7f5-af8f-4bfc-ac18-c527edd5c5c0`,
record the deploy ID being replaced, verify the deploy contents, publish, then
verify the live result and re-check the noindex headers. Do not publish on an
inherited mapping. Re-resolve it yourself.

## 8. Licence uncertainties

This is the part that is not a code problem, and it is live rather than
hypothetical.

### 8.1 The app already publishes derived City data

`/data/philadelphia-buildings.geojson` is served publicly right now, 1.75 MB, and
its own metadata block names its source:

```
"source": ".../LI_BUILDING_FOOTPRINTS/FeatureServer/0"
"sourceCatalog": "https://opendataphilly.org/datasets/building-footprints/"
```

The baked `/data/city/*.json` is a transformation of the same layer.

The OpenDataPhilly record for that dataset reads, verbatim, read 2026-09-06:

> The City of Philadelphia reserves all rights in the database and any data
> contained therein, and the end user's use of the data does not constitute a
> transfer of, nor does the end user receive, any title or interest in the
> database or any other City data. The City of Philadelphia makes no
> representation about the accuracy of any specific information in this data and
> is provided "as is" and without Warranty of any kind.

**Not established, and load-bearing for a client-facing marketing site:**

- Whether those terms permit redistribution of derived geometry. Serving a
  re-tiled, re-quantised transformation of the layer is redistribution of a
  derivative, not a link to the City's copy.
- Whether they permit commercial use. This is an agency deliverable.
- What attribution string the City requires. The app displays no City credit
  anywhere that I could find.

What would settle it: the full terms page at
`https://metadata.phila.gov/#help/help-faqs/what-are-the-terms-of-use/`, which is
a JavaScript application and returned only its shell HTML to my container. Read it
in a real browser and archive it dated. If it does not answer the derived-geometry
question, ask the City's open data team in writing.

Until then the honest position is that this is reserved-rights data being
republished in derived form on a live site, and nobody has confirmed that is
allowed. The `noindex` reduces exposure. It is not a licence.

### 8.2 Measured versus generated, which must not blur

The footprint outlines and the heights are measured, taken from the published
survey. The publisher describes the heights as LiDAR-derived; that is the
publisher's claim, and neither this app nor I have independently verified the
capture.

Everything a visitor actually looks at on a building surface is generated:
procedural facades, window grids, storefronts, cornices, the height-bucketed
materials, the hard-coded City Hall tower, the road and sidewalk ribbons. None of
that is survey capture and none of it should ever be described as such in copy, a
deck, or a pitch.

LiDAR is not automatically unrestricted. Measured status carries no licence
benefit here.

### 8.3 Google terms, for the record

Even if the tiles were re-enabled, the Maps Platform terms prohibit creating
content from Google Maps content by name, listing tracing building outlines and
creating 3D building models from imagery as examples. The Map Tiles policies
restate it: your own 3D objects may sit on the tiles only if they are not derived
from them. Attribution for Photorealistic 3D Tiles arrives per tile and must be
aggregated, sorted, and displayed in a line.

One gap I could not close: the captured Service Specific Terms enumerate 21 core
services and the substring `tile` does not appear anywhere in the document, so the
Map Tiles carve-out that the No Caching rule expressly defers to was never read.
No claim about caching tiles, retaining rendered stills, or using a screenshot in
a client deliverable can be settled in either direction from what I have. If a
still of Google tiles is ever wanted for a mailer or a deck, get that section
first and, for paid client use, written confirmation from Google.

Keeping the tiles disabled sidesteps all of this.

### 8.4 The four pinned businesses

Reading Terminal Market, Hard Rock Cafe Philadelphia, Elixr Coffee Roasters and
La Colombe are real businesses, geocoded from their published addresses, marked
`illustrative-service-location` in the data, and none of them has been asked. Two
are national or regional brands with trademarks. Section 10 asks whether the data
field is enough or whether the wording needs to reach the visible page.

### 8.5 Founder likenesses

`mac.glb` and `sean.glb` are rigged 3D likenesses of two real people, published
on a live site. Whatever the arrangement is, it should be written down once
somewhere rather than assumed, and it matters more if a third likeness is added.

## 9. What I deliberately did not propose

- **Moving `philly-3d` data into this app.** The two datasets use different
  origins 362.06 m apart. The reuse transform is a pure translation,
  `x_target = x_philly + 124.752`, `y_target = y_philly + 339.893`, but only if
  the projections agree, and they do not: this app hardcodes 85,300 and 111,320
  metres per degree while `philly-3d` derives 85,452.89 and 111,033.72 from the
  WGS-84 radii of curvature. That is a 0.26% latitude disagreement, roughly 38 m
  of north-south drift over 15 km. The tilings also do not nest, 1024 m against
  400 m, so the container would need a full re-bake. None of that is justified by
  the milestone, and the brief says do not migrate without a runnable comparison.
- **Rewriting the street scene or the Cesium map.** Neither is what the milestone
  asked for.
- **Expanding the walkable area.** The brief says do not expand coverage until the
  slice works. The slice exists and has four defects. Fix those.
- **Building `dillon.glb`.** Section 10.
- **Anything in the Godot project.** Preserved separately, untouched.

## 10. Open questions for Dillon

1. **Should the third guide exist?** The manifest already names Dillon Mohr as
   Head of AI marketing division with three AI stops and a home at the AI hub. The
   model is the only missing piece. Producing it is a real piece of work and it
   puts a third likeness on a public site. Ship it, or cut the slot?
2. **Is `illustrative-service-location` in a data file enough** for four real named
   businesses that have not been asked, or should the visible page say it too? The
   `philly-3d` prospect pages carry the disclosure on their face; this app does
   not.
3. **Who reads the City terms**, and by when? Everything in section 8.1 is blocked
   on one page that needs a real browser.
4. **Do Mac and Sean see this before it is polished?** The walkable city already
   contains them. That is a thing to show two people, and showing it early is
   cheaper than guessing what they want.

## Status of this document

- **Implemented:** nothing. This is a plan.
- **Executed:** the recon. Six parallel deep reads of the deployed bundle and the
  local dataset, plus live fetches of every endpoint in section 3.
- **Visually reviewed:** nothing in this app. I have never seen it render. No
  browser in this container can reach the live host.
- **Deployed:** nothing.

Verified by me, from primary sources: the Netlify project, site ID, team, deploy
ID and deploy source; every HTTP status and byte count in section 3; the guides
manifest and the two 404s; the absence of `mode=walk` anywhere in the build; the
presence and shape of the Google key gate; and the OpenDataPhilly terms text.

Not verified, and stated as unverified: whether the Google tiles path reaches
Google at runtime, anything about how this app looks or performs on real
hardware, and every licence question in section 8.
