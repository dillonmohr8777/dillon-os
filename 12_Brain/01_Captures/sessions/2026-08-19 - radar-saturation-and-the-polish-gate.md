---
note_type: capture
status: unprocessed
created: 2026-08-19
updated: 2026-08-19
source_refs:
  - 12_Brain/state/radar/polish-fix-2026-08-19.json
  - 12_Brain/state/radar/registry.json
  - _os/automation/lib/coverage-plan.js
  - _os/automation/bin/polish-audit.js
tags: [capture, prospect-radar, automation]
---

# 2026-08-19 — Why the radar stopped, and what "polished" has to mean (mined)

One line: a deficit that discovery cannot close reads as the top priority forever,
and a QA label is not evidence.

## Decisions

- Decision: **The market is 16 Pennsylvania counties, not one metro.** Philadelphia
  metro keeps 57% of the target share because own photography and a drivable
  meeting exist there; the rest goes to Allentown/Bethlehem, Reading, Lancaster,
  York, Harrisburg, Wilkes-Barre/Scranton and Pittsburgh.
- Decision: **Discovery remembers yield per cell.** Two consecutive barren visits
  mark a cell mined out; one productive day clears it; saturation expires after
  30 days. A permanent ban would be as wrong as no ban at all.
- Decision: **A bot wall is not a bad website.** HTTP 401/403/429 are withheld,
  never scored as a defect and never listed as a provable fault.
- Decision: **"Cleared to show" is stored separately from "built"**, and defaults
  to false. A page existing is not permission to put it in front of the business.
- Decision: **Generated imagery ships with a disclosure or it does not ship.**
  The wording is the one the passing pages already carried: "Illustrative concept
  imagery plus any photographs harvested from the official site. These visuals do
  not claim to depict current staff, customers, or completed work."
- Decision: the dashboard's drawer-only detail is a **fixed budget** (top 400 by
  priority), not something that grows with the registry.

## The mechanism worth remembering

Philadelphia held 273 of 1,088 rows, 25% against a 34% target. It therefore
carried the largest deficit, therefore received the whole daily discovery budget,
every morning. But OpenStreetMap has no more Philadelphia businesses in these
verticals to give. On 2026-08-18 the sweep pulled 144 candidates, added **zero**,
reported `status: ok`, and would have repeated that indefinitely. The planner was
working exactly as designed, which is what made it invisible: nothing errored.

**Pattern: an optimiser aimed at an unreachable target will spend everything on it
forever. Any deficit-driven loop needs a way to learn that a gap cannot be closed.**

## Facts established

- 238 site pages built for 236 distinct businesses over roughly three weeks; two
  businesses were built twice by two lanes because nothing recorded the first pass.
- Of 238 live pages audited: 140 passed, 98 blocked. After the fixer: 146 already
  clean, 89 fixed, **0 still blocked on a fixable defect**, 3 do not load.
- Only two defects accounted for 85 of the 98 failures: a missing imagery
  disclosure (68) and em dashes in copy (17).
- 17 pages carrying em dashes and 13 dead links were already labelled "design
  verified" and cleared to call on. The label was not evidence.
- The dashboard payload is dominated by genuinely unique per-row text. Tiering the
  drawer-only fields moved the render ceiling from ~1,900 rows to only ~2,100,
  because the table itself needs the headline and the first fault.
- Overpass rate-limits hard enough that a throttled query returns zero elements
  rather than an error, so "county returned nothing" and "we were throttled" look
  identical in a single pass.

## Mistakes not to repeat

- **Measuring the wrong artifact.** I measured *registry* bytes, concluded 45% of
  the dashboard payload was drawer-only detail, and planned a large win. Measuring
  the *payload* showed ~7%. Measure the thing you are about to change.
- **Reporting a check as a conclusion.** I told Dillon no page carried an imagery
  disclosure. I had only grepped for the HTML attribute; half the batch carried it
  in prose. Half a check is worse than none because it sounds finished.
- **Building a branch on a stale registry.** The branch sat on a sweep from before
  three later ones landed, so it carried 847 rows while main had 1,088. Merging it
  would have deleted 241 businesses. The daily sweep commits the registry, so any
  branch touching it goes stale within a day.
- **Trusting one probe against a rate-limited API.** A control cell that is known
  to work belongs in the same run, or a throttle reads as a misconfiguration.

## Open

- York and Dauphin returned zero raw candidates. Unresolved whether the county
  boundary fails to match in OSM or Overpass simply throttled the request; a
  retest with a known-good control is running. If they genuinely do not resolve,
  8% of the target share is allocated to cells that can never yield and the
  saturation logic would mask it as "mined out" rather than "misconfigured".
- The 89 fixed pages are verified but unpublished: deployment is approval-gated,
  queued in `System/approval-queue.md`.
- 3 pages do not load and need a redeploy, not a fix: Di Bruno Bros, Big Head
  Transport, Rittenhouse Square Chiro.
- ~643 rows are still graded from markup alone; `craft` stays half-weight until a
  Tier 1 pass runs.
