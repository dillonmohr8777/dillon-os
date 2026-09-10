---
note_type: review
status: active
created: 2026-09-10
updated: 2026-09-10
source_refs:
  - "https://github.com/dillonmohr8777/dillon-os/commit/430d480"
  - "https://github.com/dillonmohr8777/dillon-os/commit/69c49d1"
  - "https://github.com/dillonmohr8777/dillon-os/commit/5cc676f"
  - "12_Brain/state/radar-last.json"
  - "_os/automation/lib/coverage-plan.js"
  - "_os/automation/bin/agent-craft-brief.js"
  - "System/approval-queue.md"
  - "[[11_Agents/Cloud Routine Prompts 2026-09-05]]"
tags: [craft, agent-infrastructure, daily-learning]
window: 2026-09-08T16:00Z..2026-09-10T04:00Z
---

# Daily learning review — 2026-09-10

**Summary:** The night the verified-logo supply line was repaired, a no-op re-run
of the same sweep 29 minutes later overwrote every published record of the repair
with zeros — because the daily brief, the dashboard, and the run state are all
rewritten from last-run state rather than accumulated per day. The last writer
wins the day, even when it did nothing.

Not a generated brief. `12_Brain/11_Craft/*operating brief*` is produced by
`_os/automation/bin/agent-craft-brief.js`; this note uses a separate filename so
the generator can never overwrite it.

VERIFIED means reproduced by running a command or read from a commit or file in
this checkout. INFERRED is labelled inline.

## What actually moved

VERIFIED — three human-merged pull requests reached `main`, all on the same lane,
the Prospect Radar Next 20 website factory:

- `5cc676f` (#392, 2026-09-10T01:44Z) — "Repair the Next 20 daily builder's
  verified-logo supply line". 2,093 insertions across 19 files. New
  `lib/logo-audit.js` (523 lines), `lib/palette.js` (306), `lib/business-identity.js`
  (142), `lib/site-liveness.js` (101), six new test files, and a
  `_templates/prospect-reference/DESIGN-CONTRACT.md`.
- `46794a8` (#393, 02:02Z) — made the lane runnable off-Windows and added a
  dependency-free `lib/jpeg-decode.js` (378 lines).
- `5f3150a` (#394, 02:08Z) — "Leave no phantom batch behind on a short run".

VERIFIED — four `radar-bot` sweeps committed in the same window: `7f322c4`
(09-09 11:21Z), then three inside 40 minutes on 09-10 — `8660520` (01:48Z, all
zeros), `430d480` (01:58Z, the real one), `69c49d1` (02:27Z, all zeros).

VERIFIED — `dillon-claude-config` and `client-operations-canonical` had zero
commits in the window; their latest are 2026-09-05 and 2026-09-03.

INFERRED — the three clustered sweeps are manual `workflow_dispatch` runs taken
around the #392–#394 merges, not the 06:10Z cron. The 02:27 run's plan string
reads `discovery ramped from 0 to 0`, which only happens when `--discover 0` is
passed explicitly. Session transcripts are gitignored and were not available.

## The lesson: last writer wins the day's record

VERIFIED — `430d480` at 01:58Z did the night's work: 58 new prospects, 56
re-graded, 50 Tier-1 renders, 250 logos audited, 55 logos newly verified.

VERIFIED — `69c49d1` at 02:27Z, a run that did nothing, overwrote all of it:

- `Daily-Briefs/radar-2026-09-10.md` went from "Found 58 new today, re-audited 56"
  to "Found 0 new today, re-audited 0". The per-prospect table below it survived;
  only the headline counts were zeroed, which is worse — the file still looks
  complete.
- `Daily-Briefs/prospect-radar.html`, the published dashboard, went from
  `+58 new / 56 re-graded / 49 enriched` to `+0 / 0 / 0`.
- `12_Brain/state/radar-last.json` did not zero the imagery counters, it **deleted
  the keys**: `rendered`, `imagery_checked`, `imagery_buildable`, `logo_verified`,
  `logo_pending`, `logo_rejected`, `not_live` are all absent from the current file.
  The evidence that #392 worked exists now only in the commit diff of `430d480`.

The cause is structural, not a bug in any one function: `radar-last.json` is
*last-run* state, and both the daily brief and the dashboard are re-rendered from
it on every run. There is nothing per-day to accumulate into. The workflow's
`if git diff --cached --quiet` guard cannot catch this, because `started_at`
changes on every run, so a no-op sweep always has a diff to commit.

This generalises past the radar. Any routine that writes a dated artefact from
last-run state has the same defect: re-running it is not idempotent, it is
destructive.

## The build lane's real throughput is 4, not 258

VERIFIED — `69c49d1`'s commit message advertises `rebuild 258`. The registry
agrees: `by_verdict.rebuild = 258`. But `build_queue_size = 4`, because
`logo_holds = 1379` of 1459 tracked rows.

VERIFIED — the largest single hold reason is `logo_provenance_missing: 837`, 57%
of the registry. Next are `previous_homepage_exists: 139` and
`logo_fetch_failed: 119`.

So the headline number in every radar commit message is ~65× the number of
prospects the factory can actually build today. #392 exists precisely to drain
this queue and its one real run verified 55 logos. INFERRED — at that rate the
837-row provenance backlog is roughly a two-week drain, assuming the imagery
budget stays at the 150–250 range that run used rather than the `DAILY.imagery`
default of 60 (`_os/automation/lib/coverage-plan.js:144`).

## Discovery is 41 rows from stopping, and nothing will say so

VERIFIED — `REGISTRY_SOFT_CAP = 1200`, `REGISTRY_HARD_CAP = 1500`
(`_os/automation/lib/coverage-plan.js:133-134`). Tracked is 1459.

At the hard cap `planDiscovery` sets `budget = 0` and the run still reports
`status: "ok"` with `rotation_slot: "PA: none (discovery paused)"`. Between the
caps the ramp is linear: at 1459 the factor is (1500−1459)/300 = 0.137, so a
nominal 60-row budget yields 8 rows.

VERIFIED from the sweep history: +25 on 09-04, +17 on 09-03, +58 on 09-10. One
ordinary sweep crosses the cap. The estate has one to three days of discovery
left and no warning exists anywhere in the pipeline — not in `radar-last.json.errors`
(empty), not in the job summary, not in the commit message.

## The brief that measures the automation layer is the automation that died first

VERIFIED — running `node _os/automation/bin/agent-craft-brief.js --days 14` today
returns `status: "ok"`, `generated_for: "2026-09-10"`, `window_days: 7`, over days
`2026-08-12` … `2026-08-18`. Those receipts are 23 days old.

VERIFIED — the receipt writer is `System/scripts/Invoke-ClaudeLoop.ps1` (line 142),
Windows-only. The newest receipt in `12_Brain/queue/` is
`claude-loop-2026-08-17.jsonl`; the newest of any kind is
`grok-intelligence-ingest-2026-08-05.jsonl` and `report-brain-ingest-2026-08-11.jsonl`.

VERIFIED — `12_Brain/state/agent-craft-brief.json` records the last write as
`generated_for: "2026-09-02"` with `"dry_run": true`, so no brief was produced.
`git log -- 12_Brain/11_Craft` shows the folder untouched on `main` since
`a5ba522` (2026-08-20). The last generated brief is dated 2026-08-19.

The generator returns `blocked` only when the window is *empty*
(`agent-craft-brief.js:136-138`). A window full of three-week-old receipts is
reported as healthy. This is the standing lesson from
[[12_Brain/11_Craft/00_Index|00_Index]] — "a fail-closed probe pointed at a source
nothing writes is not caution, it is a dead routine" — recurring in its
mirror form: a fail-*open* probe pointed at a source nothing writes reports `ok`
forever.

INFERRED — both PowerShell-written flows stopped in the same period (loop receipts
2026-08-18, gateway approval rows 2026-08-10), which is consistent with the
Windows box no longer running its scheduled tasks. Not verifiable from the cloud.

## The approval queue is 70% one alert

VERIFIED — `System/approval-queue.md` holds 189 rows, 182 of them open. **132 are
Hermes Gateway conflict-storm rows**, spanning 2026-07-15 to 2026-08-10, appended
roughly every 30 minutes by `System/scripts/refresh-gateway-health.ps1`. Every row
asks for the same decision in the same words, varying only the conflict rate and
the PID.

The 50 real rows — the Kimberly James Bridal publish, the Omega attribution gate,
the Bar Crawl disapproved ads, the Fagan/Shadow registry retirement patch — are
buried under them. A monitor that appends an approval row per poll instead of
updating one turns the operator's decision surface into a log file.

## Five days of this loop's output are not in the vault

VERIFIED — daily-learning pull requests #363, #368, #373, #380, #384 and #388 are
all open. Each carries exactly one craft note that exists nowhere on `main`:
`2026-09-06`, `2026-09-07`, `2026-09-08`, `2026-09-09` (checked by diffing each
branch against a freshly fetched `origin/main`).

VERIFIED — the fix was written on 2026-09-05. `11_Agents/Cloud Routine Prompts 2026-09-05.md`
carries a replacement PHASE 5 that makes this a single rolling pull request which
closes its own predecessors, and the note's own frontmatter still reads
`status: awaiting-paste`. The routine prompt executing tonight is still the old
one — its PHASE 5 has no carry-forward and no self-close clause — so the paste has
not happened, five days on. #384 already reported this on 2026-09-08 and the
report is itself stranded in #384.

That is the compounding failure worth naming: **the learning loop is learning, and
none of it is landing.** A routine whose output only ever reaches an unmerged
branch is not a second brain, it is a diary.

## Container note

VERIFIED — in this session's fresh checkout, `HEAD` was current (`69c49d1`,
2026-09-10) while both `main` and `origin/main` pointed at `d0a4b61`
(2026-09-04). A single `git fetch origin main` corrected it. Any routine that
reasons about "what changed" by comparing to `main` without fetching first will
silently analyse a six-day-old repository. Cheap fix: `git fetch origin main`
before anything else.

## Proposals

Full rationale and exact diffs are in the pull request body. In order of value:

1. Make dated radar artefacts accumulate per day instead of being replaced per run.
2. Warn when the registry is within 100 rows of `REGISTRY_HARD_CAP`.
3. Make `agent-craft-brief.js` report `stale`, not `ok`, on old receipts.
4. Collapse the 132 Hermes rows in `System/approval-queue.md` to one live row.
5. Paste the 2026-09-05 replacement PHASE 5 into the Routine.

Related: [[12_Brain/11_Craft/00_Index|Agent Craft]] ·
[[12_Brain/09_Ops/AGENT_PROTOCOL|Agent Protocol]] ·
[[11_Agents/Cloud Routine Prompts 2026-09-05|Cloud Routine Prompts 2026-09-05]]
