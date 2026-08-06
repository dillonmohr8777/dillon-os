---
tags: [decision, outreach, grader, gate]
decided: 2026-08-06
valid_from: 2026-08-06
supersedes: "Stage 2 of [[02_Campaigns/AI Site Builder Outreach Engine/Pipeline Spec|Pipeline Spec]] as 'partly automated, ranking still manual'"
source: "[[12_Brain/raw/sessions/2026-08-06-pa-website-grader]]"
status: active
---

# Grade before build, and never pitch a business whose site is already good

**Decision:** every prospect is graded before any harvest, brief, or build, and a
business whose current website scores 80 or above never receives a website pitch.
Only the `build`, `rebuild`, and `refresh` lanes reach outreach.

## Why

Mac, Slack DM 2026-08-05, after the 100-site Philly deliverable:

> a lot of these businesses already have good websites / I think were moving too
> fast already / we need the List > Grader ... so we dont contact businesses that
> dont need a website or social content / Example = Suraya = surayaphilly.com

He was right, and the number was worse than a spot check suggested. Grading the
100 sites already built found **38 that should never have received a website
pitch**: 19 with excellent sites, 19 with sites good enough that a rebuild pitch
reads as insulting.

## What was chosen

1. **A 0–100 SIGNAL score of the prospect's *existing* site**, six weighted
   dimensions, 32 checks, every check carrying evidence.
   See [[12_Brain/concepts/Website SIGNAL Score|Website SIGNAL Score]].
2. **Two axes, not one.** SIGNAL (is their site bad enough to replace) multiplied
   against viability (can they pay). Headroom without money is not a prospect.
3. **Nine lanes, three of which reach outreach.** A good site routes to a non-web
   offer or to nothing at all, which is the specific thing Mac asked for.
4. **No website at all is the top of the funnel**, not a penalty. This is Jesse's
   "GMB without websites is a big move" point. The old scorer subtracted for a
   missing website because it was hard to harvest, inverting the best signal in the
   system. Batch B3 turned out to be 25 for 25 no-site prospects, already in hand.
5. **The grader refuses to guess.** Bot walls, client-rendered pages, and anything
   under 70% confidence route to a human. An unread page is not a bad page.
6. **Calibration against human judgment, versioned.** Mac's Suraya verdict is
   anchor `live-suraya`; if the grader ever routes Suraya into a web pitch,
   calibration fails and the run is blocked.

## What was rejected

- **Scoring only design elements and outdated transitions**, which is what the
  first version did (Dillon, same thread). It is a real signal and it survives as
  the obsolescence ceiling, but on its own it cannot tell a good site from an
  unreadable one, and it has no way to say "leave them alone."
- **Scraping GBP listings without websites as the whole solution.** It is the right
  instinct and it is now lane 1, but it only finds one kind of good target. It says
  nothing about the businesses that do have sites, which is where 75 of the 100
  were.
- **Requiring a browser render for every site.** Correct but too expensive to point
  at a large list. Hence escalating passes: the render only runs when the static
  pass could not decide, which was 9 rows out of 100.
- **Letting a low viability park a prospect we simply have not enriched.** Missing
  review data is a gap in the sheet, not a judgment about the business. Those rows
  go to `enrich`.

## Consequences

- `/site-batch` step 1 now over-pulls 60 to 100 candidates instead of 25 to 30,
  because the gate holds back a third or more.
- Stage 1 of the pipeline needs three more columns on the shared prospect sheet —
  `review_count`, `rating`, `ad_presence`. Without them 53 of 100 rows can only
  reach `enrich`, so the gate filters but cannot rank. **Owner: Jesse + Dillon.**
- The 19 `adjacent` prospects are not dead leads. They are the opening for GBP
  content, social, 360 tours, and ads — services Momentum already sells. The grader
  names which one fits from the gaps it measured.
- Weights are versioned. Changing them without passing calibration is a blocked
  run, not a judgment call.

Rules: [[12_Brain/protocols/prospect-grading-gate|prospect-grading-gate]].
Runbook: `_os/automation/docs/GRADER.md`.
