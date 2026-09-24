---
note_type: review
status: active
created: 2026-09-22
updated: 2026-09-22
source_refs:
  - "commit 88baa54"
  - "commit 586a98c"
  - "commit 9db12f8"
  - "commit aaba6cc"
  - "commit 121bf05"
  - "_os/automation/bin/cadence-watchdog.js"
  - "_os/automation/cadence/run-ledger.jsonl"
  - "12_Brain/registry/automations.json"
  - "https://github.com/dillonmohr8777/dillon-os/actions/workflows/cadence-watchdog.yml"
tags: [craft, agent-infrastructure, daily-learning]
window: 2026-09-20T12:00 to 2026-09-22T00:00 ET
---

# Daily learning review — 2026-09-22

The commit window was quiet: three automated commits, no human work, nothing in
the other two checkouts. The finding is not in the commits. It is in what ran
sixteen times and reported green. The cadence watchdog built on 2026-09-17 to
detect exactly this kind of silence has never evaluated a single job, and the
cadence layer it watches has been dark since 2026-09-15.

## The window

Three commits, all `dillon-os`, all machine-authored. `dillon-claude-config` has
not moved since `c4816ae` (2026-09-05); `client-operations-canonical` has not
moved since `e9be4e0` (2026-09-15).

| Time (ET) | Commit | Author | What |
|---|---|---|---|
| 09-21 02:19 | `9db12f8` | Claude | vault-clean + wiki-lint reports for 09-21 |
| 09-21 07:21 | `586a98c` | Claude | morning-brief: plan, metrics, pulse, work prediction |
| 09-21 09:00 | `88baa54` | radar-bot | radar sweep: +0 found, 23 re-graded, 5 rendered |

All three are cloud-side routines. None came from the Windows box.

## VERIFIED — the watchdog checks zero jobs and calls it clean

`_os/automation/bin/cadence-watchdog.js` landed on `main` in `aaba6cc`
(2026-09-17) and runs every six hours on GitHub Actions. Sixteen runs, run
numbers 1 through 16, 2026-09-18T04:36Z through 2026-09-21T21:56Z, **conclusion
`success` on every one**.

Run it against the same `main` it reads and the output is:

```
cadence-watchdog  checked 2026-09-22T04:05:04.000Z
repo age          15.1h since last commit reached this checkout (stale past 30h)
no cadence jobs due today

clean
EXIT=0
```

`no cadence jobs due today` on a Tuesday. Four independent defects compose to
produce it, and each one alone is enough:

1. **`enabled` does not exist on `main`.** `cadenceJobs()` filters on
   `a.enabled && …`. Counted against the committed registry:
   `12_Brain/registry/automations.json` holds 27 records and **0** have an
   `enabled` field, so the first clause is `undefined` for every record. The
   field is added by PR #406, which is open, unmerged, and `mergeable_state:
   dirty`. The watchdog on `main` was written against a schema that only exists
   on a conflicted branch.
2. **No cadence string can match the regex.** The filter requires
   `/^(daily|weekly|monthly) via .*driver\.md/`. The 27 records carry values like
   `"daily via routine D26"`, `"daily, as the first job in
   _os/automation/cadence/daily.yaml"`, `"daily at 7:00 AM America/New_York"`.
   **0** match. Fixing defect 1 alone changes nothing.
3. **The join key is wrong.** The row filter is
   `ledger.filter(e => e.job === job.id)`. The ledger's job ids are
   `heartbeat`, `approval-queue-diff`, `unfiled-sweep`, `daily-sweep`,
   `approval-queue-closing-pass`, `morning-chief` — cadence job names from
   `daily.yaml`, not registry automation ids. The two sides were never on the
   same vocabulary. Fixing defects 1 and 2 still yields `ABSENT` for everything
   or matches nothing, depending on which vocabulary wins.
4. **The staleness clock watches the wrong repo.** `hoursSinceLastCommit()` runs
   `git log -1` over the whole checkout. `main` receives a commit nearly every
   day from radar-bot (a GitHub Action), morning-brief and vault-clean (Claude
   cloud sessions) — none of which run on the Windows box. So `repoAgeHours`
   stays small and `repoStale` never trips, even while the box pushes nothing.
   The script's own comment says it reads "only what has been PUSHED to origin,
   so an outage that stops pushes is itself the alarm." That is the intent; the
   implementation measures a different thing.

## VERIFIED — the cadence layer has been dark for six and a half days

What the watchdog was supposed to catch, measured directly:

- `_os/automation/cadence/run-ledger.jsonl` — 29 rows, last entry
  `2026-09-15T14:00:01.764Z`. Nothing since.
- That file last changed on origin in `121bf05`, **2026-09-15 11:01 ET**.
- `12_Brain/state/claude-loop.json` — frozen at `2026-09-15T05:08:23Z`,
  run `LOOP-20260915-010819062`.
- `12_Brain/queue/claude-loop-*.jsonl` receipts — last file
  `claude-loop-2026-09-15.jsonl`. Six days with no receipt.
- `12_Brain/11_Craft/` operating briefs — last one `2026-09-15`. Six generated
  briefs missing, and the generator's own state file
  (`12_Brain/state/agent-craft-brief.json`) still reads
  `generated_for: 2026-09-02`, so even the 09-15 brief ran without updating its
  last-run record.

A staleness check on the ledger file's own commit date would have fired on the
watchdog's **first** run.

## VERIFIED — the loop has written this lesson before, twice

This is a recurrence, not a discovery.

`12_Brain/11_Craft/00_Index.md` has carried the standing lesson since
2026-08-18: *"A driver that reports `noop` cannot distinguish 'nothing to do'
from 'everything is stuck.' The receipt log is the only honest signal."*
`earned-lessons.md` carries *"2026-08-18 — A zero exit code and a zero error
count can still be a failed routine"* and, at 2026-09-03, *"a learn stage that
returns `no_finding` repeatedly while observable state moves is a broken probe,
not a clean bill."*

The watchdog was built on 2026-09-17, a month after the first and two weeks
after the last, and reproduces the identical failure one rung up: a green that
cannot distinguish *checked everything, all fine* from *checked nothing*.

## VERIFIED — this loop is itself the unmerged-PR lesson

`earned-lessons.md` at 2026-09-03: *"A routine whose only output is an unmerged
PR has no output."*

Every daily-learning pull request ever opened is unmerged. #384 (09-08), #388
(09-09), #395 (09-10), #402 (09-15), #405 (09-16), #407 (09-17) are open drafts;
#364 (09-04) was closed without merging. Nothing this routine has written has
reached `main`. The notes it produced about the estate's reliability are sitting
in seven branches, which is the exact condition the note it wrote on 2026-09-03
warned about.

## INFERRED — not verified from here

- **Why the box went quiet on 2026-09-15.** The pattern is consistent with the
  recorded power-delivery fault (14 unclean power-offs in 30 days,
  `12_Brain/07_Reviews/2026-09-09 - Machine power fault diagnosis`) and with the
  logon-type defect (`2026-09-15 - Cadence tasks cannot run unattended`), but a
  cloud session cannot see Task Scheduler, the event log, or whether the machine
  is powered on. It could equally be that `Cadence-ledger-push` — registered in
  the same session as the watchdog — is not running, in which case the box is
  working and only its output is stranded. **These two have opposite fixes and
  the evidence here does not separate them.**
- **Whether the six missing operating briefs exist locally.** If the box ran and
  only the push failed, they are on disk unpushed.
- **Whether the daily-learning loop ran on 09-18 through 09-21.** No branch
  exists for those nights. Correct behaviour on a quiet night is to open no PR,
  so absence of a branch is consistent with both "ran and stayed silent" and
  "did not run." Not separable from here.

## Links

- [[12_Brain/11_Craft/earned-lessons|Earned lessons]] — the 2026-09-22 entry
- [[12_Brain/11_Craft/00_Index|Agent Craft index]]
- [[12_Brain/07_Reviews/2026-09-15 - Cadence tasks cannot run unattended|Cadence tasks cannot run unattended]]
- [[12_Brain/07_Reviews/2026-09-09 - Machine power fault diagnosis|Machine power fault diagnosis]]
- [[12_Brain/09_Ops/AGENT_PROTOCOL|Agent Protocol]]
