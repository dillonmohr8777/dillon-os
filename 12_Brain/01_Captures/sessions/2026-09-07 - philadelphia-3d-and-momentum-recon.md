---
note_type: capture
status: unprocessed
created: 2026-09-07
updated: 2026-09-07
observed_at: "2026-09-07T14:30:00.000Z"
source_type: session
verification_status: verified
source_refs:
  - "https://claude.ai/code/session_014E3qxtqQ4LEt918Ty2ErsR"
  - "[[01_Clients/Momentum 360/philadelphia-service-world-handoff]]"
  - "https://github.com/dillonmohr8777/dillon-os/pull/377"
tags:
  - brain
  - capture
  - session
  - momentum-360
  - philadelphia
  - 3d
  - security
  - licence
---

# Session: 2026-09-07 Philadelphia 3D build and Momentum app recon

Two halves. First, a from-scratch 3D Philadelphia built from the City's own
survey. Second, a redirect: verify the Momentum Philadelphia web app's identity,
and produce an implementation handoff for local Codex instead of building more.
The redirect found that the thing the milestone asked for already exists and is
unreachable, and that the deployed build leaks a Google API key.

## What shipped

Branch `claude/philadelphia-3d-rendering-8xa6td`, PR #377, 25 commits, head
`9e14f8f2`, green and mergeable, still a draft.

- `philly-3d/` : 545,451 real building footprints at their surveyed heights,
  14.6 MB tiled binary, terrain from 546,415 measured base elevations, parks,
  street centrelines, hydrography, five sourced crowns, a hand-rolled WebGL2
  viewer with a walk mode, and 134 tests.
- `philly-3d/godot/` : four 840 m districts, each with its own measured grid
  bearing, run for real in Godot 4.2.2 headless (22 checks) and rendered under
  Xvfb.
- `01_Clients/Momentum 360/philadelphia-service-world-handoff.md` : the
  implementation handoff for local Codex.
- Three approval-queue rows: rotate the exposed key, read the City terms, decide
  the third guide likeness.

## Facts learned about the deployed Momentum app

Read from the deployed artifact and live endpoints, not from source. The source
is at `C:\Users\dillo\Documents\Codex\projects\client-operations\clients\momentum-360\work\philadelphia-service-world`,
which is gitignored by its ancestor repo (`.gitignore:8:work/`) and therefore
invisible to any remote session. That is a permanent access boundary, not a
one-off.

- **A complete walkable Philadelphia already exists behind `?mode=walk`.**
  Character controller, swept-circle collision against footprints, streamed
  400 m tiles, procedural facades, instanced props, traffic, minimap, fast
  travel, a nine-stop route, and Mac and Sean as rigged guides. The literal
  `mode=walk` appears zero times in the shipped build, so nothing links to it.
- **The Google Maps API key is a plain literal in the public bundle**, behind a
  non-empty `if (key)` gate, so the branch is compiled live. Exposure is settled.
  Whether it still answers is not, and needs a browser network check.
- Three scenes: StreetScene (default), GameScene (`?mode=walk`), Cesium map
  (`?mode=map`). Cesium loads as a global from `/cesium/Cesium.js`, not bundled.
- Netlify site `5949b7f5-af8f-4bfc-ac18-c527edd5c5c0`, deploy source `cli`,
  `build_id: null`. The build runs on the Windows machine and the CLI uploads
  `dist/`, so build-time env vars live in a local `.env`, never in Netlify.
- `/data/guides.json` declares three guides. The third is Dillon Mohr, status
  `pending`, and both `dillon.glb` and `dillon.mobile.glb` return 404 while the
  chooser still advertises keys 1 to 3.
- The four pinned places are real, census-geocoded, and already tagged
  `illustrative-service-location`: Reading Terminal Market, Hard Rock Cafe,
  Elixr Coffee Roasters, La Colombe Dilworth Plaza.
- No error boundary anywhere. A stale chunk after a deploy, or one missing
  service description, blanks the page instead of degrading.

## The licence position, which is live rather than hypothetical

The app already serves 1.75 MB of raw `LI_BUILDING_FOOTPRINTS` plus 87 tiles
baked from it, publicly, from the same ArcGIS layer `philly-3d` uses. The City's
terms reserve all rights in the database. Redistribution of derived geometry,
commercial use, and the required attribution string are all unestablished, and
the app shows no City credit. `noindex` reduces exposure and is not a licence.

The full terms page is a JavaScript application that will not render in a
container. Reading it needs a real browser.

## Decisions

- Do not migrate `philly-3d` into the Momentum app. The two disagree on
  metres-per-degree by 0.26%, roughly 38 m of drift over 15 km, and 1024 m tiles
  do not nest inside 400 m ones. Recorded in the handoff, section 9.
- Keep Google Photorealistic Tiles disabled, by starving the env var rather than
  deleting the code path.
- The milestone is to open the door on the existing walk mode and fix four
  defects, not to build a new slice.

## Mistakes worth keeping

- I showed a broken walk-mode render and called it working. Corrected only after
  building the terrain. Look at the picture before claiming the feature.
- The Godot export test was tautological with the exporter, so both agreed that
  City Hall sat at the projection origin and both were wrong. A test that shares
  an assumption with the code it tests proves nothing.
- Two independent codebases floated the city off its own ground for the same
  reason. The second one was found only by running it.
- `tintFor` used `^=`, which yields a signed int32, so roughly 270,000 buildings
  hashed negative. Static reading never caught it; the render did.
- A credential-bearing request to verify the Google path was blocked by the
  sandbox. Recorded as a local check rather than routed around.

## Operating notes

- The capitalised GitHub MCP server returns 404 on every `dillon-os` call while
  authenticating correctly, because the repo is private and that instance lacks
  the grant. The lowercase one works. A 404 there is a tooling problem. Confirm
  with `git ls-remote` before believing a PR is gone.
- `main` drifts several commits a day from scheduled vault automation, all of it
  in `Daily-Briefs/`, `12_Brain/state/` and `Dashboard.md`. Base movement on a
  feature branch is expected; only a file-overlap or `git merge-tree` conflict
  is worth acting on.

## Open, needing Dillon

1. Rotate the Google key. Independent of any code change.
2. Read the City terms in a browser and archive them dated.
3. Third guide: ship the Dillon Mohr likeness or cut the slot.
4. Does `illustrative-service-location` in a data file cover four real named
   businesses, or does the visible page need to say it too?
5. Do Mac and Sean see the walkable city before it is polished?
