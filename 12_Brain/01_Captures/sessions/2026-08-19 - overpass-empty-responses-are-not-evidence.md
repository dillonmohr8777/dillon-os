---
note_type: capture
status: unprocessed
created: 2026-08-19
updated: 2026-08-19
source_refs:
  - 12_Brain/01_Captures/sessions/2026-08-19 - radar-saturation-and-the-polish-gate.md
  - _os/automation/lib/coverage-plan.js
  - _os/automation/lib/discovery.js
tags: [capture, prospect-radar, automation]
---

# 2026-08-19 — An empty Overpass response is not evidence (mined)

One line: the earlier capture left York and Dauphin open; the control county
settles it, and the answer invalidated part of the fix I had just shipped.

## What was open

The previous capture recorded that York and Dauphin returned zero raw candidates
and that it was unresolved whether their county boundaries fail to match in OSM
or whether Overpass had simply throttled the request.

## Resolved: it was throttling

Retested through the real query path with a **known-good control** in the same
run. Montgomery County — 389 rows in the registry, plainly well mapped — also
returned `0 raw, 0 candidates`, twice, 25 seconds apart. A county that demonstrably
holds hundreds of businesses cannot be empty, so the zeros are the service
refusing us, not the map being bare.

- Fact: `runOverpass` returns `{ ok: true, elements: [] }` in this case. Overpass
  answers **HTTP 200 with an empty elements array** when its area lookup fails,
  so a throttled query and an empty county are byte-identical to the caller.
- Fact: rate limiting was heavy enough that six sequential probes took over two
  minutes and mostly came back empty, including for Philadelphia.

## The defect this exposed in my own fix

The saturation logic shipped hours earlier counted any visit that added no rows
as a strike toward "mined out". Under throttling it would have marked
Philadelphia, Montgomery and Delaware exhausted within two days and rotated
discovery permanently onto the thinnest cells in the market — **a worse version of
the exact bug the mechanism exists to fix.**

Fixed: a strike now requires proof the query actually ran. Some raw elements came
back and none were new. A zero-element response is recorded as `inconclusive` and
earns nothing.

## Lessons

- **When probing a rate-limited API, put a known-good control in the same run.**
  Without Montgomery in that batch I would have concluded two real counties do
  not resolve, and "fixed" a share table that was never wrong.
- **A success status is not a successful query.** Any integration that can answer
  200-with-nothing needs the caller to distinguish "no results" from "no answer",
  or absence silently becomes a measurement.
- Verifying a fix against the live system is what caught this. The unit tests all
  passed, and would have kept passing, because they never saw a throttled reply.

## Still open

- Actual yield from the expanded counties is only confirmed for Northampton
  (17 raw, 10 not already in the registry). The others are unmeasured, not empty.
  Real numbers need a run when Overpass is not throttling this host.
- OSM under-maps suburban trades, so geography expansion raises the ceiling but
  is unlikely to solve volume on its own. A second discovery source remains the
  real unlock, and is still unbuilt.
