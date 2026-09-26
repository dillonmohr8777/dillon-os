---
note_type: review
status: active
date: 2026-09-26
updated: 2026-09-26
tags:
  - automation
  - cadence
  - reliability
  - review
source_refs:
  - _os/automation/cadence/run-ledger.jsonl (last row 2026-09-15T14:00:01.764Z, 29 rows total, read 2026-09-26)
  - _os/automation/bin/cadence-watchdog.js (cadenceJobs, lines 59-64)
  - 12_Brain/registry/automations.json (27 records, read 2026-09-26)
  - .github/workflows/cadence-watchdog.yml
  - _os/automation/bin/push-ledger.js
  - commit aaba6cc (2026-09-17) "Cadence watchdog: external staleness check, decoupled from the machine it watches"
  - git log 12_Brain/11_Craft/ (last commit 215c09c, 2026-09-15)
  - Daily-Briefs/week-review-2026-09-25.md
  - 12_Brain/07_Reviews/2026-09-15 - Cadence tasks cannot run unattended.md
---

# The external watchdog watches nothing

One line: the off-machine alarm built on 2026-09-17 to catch a dead cadence layer
cannot fire, because its job filter matches zero of the 27 registry records — and
the layer it watches had already been dead for two days when it was written.

## Verified

**The local cadence layer stopped on 2026-09-15.**
`_os/automation/cadence/run-ledger.jsonl` holds 29 rows; the last is
`2026-09-15T14:00:01.764Z` (`daily-sweep`, `status: ok`,
`sweep-gaps=0 stale=3 silent=0 missed-briefs=5/14 cadence-absent=0`). Nothing has
been appended in the 11 days since. The last commit to touch that file is `503b27b`
(2026-09-15 10:03). This is the predicted consequence of
[[12_Brain/07_Reviews/2026-09-15 - Cadence tasks cannot run unattended|Cadence tasks cannot run unattended]]:
all four Task Scheduler entries are registered `LogonType: Interactive`, the fix
needs elevation, and the elevation was refused with "Access is denied".

**`cadenceJobs()` matches nothing, for two independent reasons.**
`_os/automation/bin/cadence-watchdog.js:59-64` filters on
`a.enabled && /^(daily|weekly|monthly) via .*driver\.md/.test(a.cadence)`.

1. `enabled` is not a field in `12_Brain/registry/automations.json`. All 27
   records carry `status` instead (`implemented`, `active-scheduled`, `gated`,
   `deprecated`, `external-dependency`, `pending-gate`). `a.enabled` is
   `undefined` on every record, so the filter short-circuits before the regex
   is ever reached.
2. The regex matches zero of the 27 `cadence` strings even with the first
   problem removed. The registry's vocabulary is prose —
   `"daily at 7:00 AM America/New_York"`, `"daily via routine D26"`,
   `"daily, as the first job in _os/automation/cadence/daily.yaml"`,
   `"on-demand + pre-pulse"`. No record mentions `driver.md`.

Measured directly on 2026-09-26: `total automations: 27`, `enabled: 0`,
`matching watchdog regex: 0`.

**So every run is vacuously green.** With `jobs = []`, the per-job loop never
executes, `rows` is empty, `problems` is empty, and `ok` is `true`. Running the
script on 2026-09-26 prints `no cadence jobs due today` / `clean`, exit 0. The
workflow has been doing this every 6 hours (`cron: '15 */6 * * *'`) since
2026-09-17 — roughly 36 green runs over 9 days in which the thing it watches was
dead.

**The one surviving check cannot trip either.** `STALE_REPO_HOURS = 30` compares
against `git log -1 --format=%cI`, the newest commit on the checked-out branch
regardless of author. `radar-bot` (`.github/workflows/radar-daily.yml`) has pushed
a commit every single day for 17 consecutive days (2026-09-10 through 2026-09-25,
17/17). A cloud Action keeping the repo warm makes repo-staleness structurally
incapable of reporting that the Windows box is gone.

**Both halves of the watchdog were built after the patient died.**
`push-ledger.js` describes itself as "the missing half of the external watchdog"
and was added because "on 2026-09-17 local HEAD was a full day ahead of
origin/main." The driver had stopped emitting rows on 2026-09-15. Neither
`cadence-watchdog.js` nor `push-ledger.js` has ever observed a live cadence run.

**The id namespaces barely overlap.** The watchdog joins
`12_Brain/registry/automations.json` ids to `run-ledger.jsonl` `job` values. The
ledger has used six ids (`heartbeat`, `approval-queue-diff`, `unfiled-sweep`,
`daily-sweep`, `approval-queue-closing-pass`, `morning-chief`); exactly one,
`daily-sweep`, exists in the registry. So even with the filter corrected, the
watchdog can evaluate one job out of 27 — and that one would read `ABSENT`
(11 days against a 20h daily grace), which is the correct and overdue alarm.

**The recursive layer went dark with it.** `12_Brain/11_Craft/` holds 29 dated
operating briefs, `2026-08-18` through `2026-09-15`, one per day with no gaps —
then nothing. `agent-craft-brief.js` is registered at cadence
`"daily via routine D26"` and runs inside the loop that stopped. `12_Brain/09_Ops/`
and `12_Brain/01_Captures/` have likewise had no commit since `215c09c`
(2026-09-15).

**Nothing reported any of it.** Since 2026-09-16 there have been 32 commits to
`main`. Grepping `Daily-Briefs/*2026-09-2*.md` and
`12_Brain/07_Reviews/2026-09-25 - Weekly Brain Synthesis.md` for `run-ledger`,
`cadence layer`, `cadence-absent` and `Task Scheduler` returns no matches.
`Daily-Briefs/week-review-2026-09-25.md` asserts the opposite twice — "Daily
automation cadence held: morning-brief, vault-clean, and radar sweep ran on
schedule every day this period" and "The scaffolding is reliable." For the stated
period 2026-09-19 to 2026-09-25 the commit record shows `morning-brief` absent on
09-19 and 09-20, and `vault-clean` absent on 09-19, 09-20 and 09-23. Only the
radar sweep ran all seven days.

## Inferred, not verified

- **Why morning-brief and vault-clean still commit at all.** They commit as author
  `Claude` with `Co-Authored-By: Claude Fable 5.1`, on a different schedule and a
  different mechanism from the Windows cadence driver, and they were unaffected by
  the 09-15 stop. Which harness fires them is not determinable from this checkout.
- **Whether the Windows box is up.** Unreachable from the cloud. The ledger silence
  is consistent with the box being off, the tasks still being `Interactive`, or the
  driver failing before its first write. All three produce the same evidence here.
- **The 09-18 to 09-20 gap** in `morning-brief` and `vault-clean` has no recorded
  cause. Nothing in the repo explains those three days.

## What this changes

A generated artifact's presence is not evidence that its generator ran — the
briefs for 09-21 through 09-25 exist while the receipt log that is supposed to
justify them has been empty since 09-15. The standing lesson in
[[12_Brain/11_Craft/00_Index|the craft index]] already says the receipt log is the
only honest signal; the week-review read file existence instead and graded the
automation layer healthy.

See [[12_Brain/11_Craft/2026-09-26 - agentic layer review|the agentic layer review]]
for the specific changes this argues for.
