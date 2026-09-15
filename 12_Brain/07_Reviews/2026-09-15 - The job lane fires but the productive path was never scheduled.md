---
note_type: review
status: active
date: 2026-09-15
updated: 2026-09-15
tags:
  - job-search
  - automation
  - reliability
  - review
source_refs:
  - Get-ScheduledTask/Get-ScheduledTaskInfo, read 2026-09-15T14:15Z
  - job-search-2026/automation/logs/shortlist-2026-09-15.log
  - job-search-2026/automation/logs/daily-outreach-2026-09-15.log
  - job-search-2026/automation/runs/2026-09-15/RUN_SUMMARY.json
  - job-search-2026/automation/runs/2026-09-15/SEND_MANIFEST.json
  - job-search-2026/automation/runs/2026-09-15/claude-batch-verified.md
  - job-search-2026/automation/runs/2026-09-15/claude-outreach-20260915-100232-665.json
  - job-search-2026/automation/Run-ClaudeJobOutreach.ps1
  - C:\Users\dillo\.codex\tools\hidden-scheduled-tasks.tsv
---

# The job lane fires, but the productive path was never scheduled

Dillon asked on 2026-09-15 to make the job tasks fire. They now do. The more
useful finding is what firing them exposed.

## State found

| Task | Found as | Now |
|---|---|---|
| `Job-Shortlist-Daily` | `Ready`, but LastRunTime 11/30/1999 — **never fired** | started by hand 10:17, exit 0 |
| `Daily-Job-Outreach-Runner` | **Disabled** | enabled, started 10:18, exit 0 |
| `Cursor-JobPrep-PrivateWorker` | Disabled since 2026-08-10, last result 267014 (terminated by user) | left alone — looks deliberate |
| 09:15 Claude outreach trigger | **did not exist** | registered as `Claude-Job-Outreach-Daily` |

## What firing them proved

`Job-Shortlist-Daily` works: 935 postings harvested across eight feeds, wrote
`SHORTLIST-2026-09-15.md`, 40 rows. One feed is broken — the WeWorkRemotely
marketing RSS returns `no element found: line 1, column 0`, though the main
WWR feed still returned 88.

`Daily-Job-Outreach-Runner` runs clean and **produces nothing**. Same 935
postings, scored Tier A 87 and Tier B 93, then `eligible_targets_count: 0`,
`processed_count: 0`, `SEND_MANIFEST.json` is `[]`. 180 qualified roles, zero
drafts. It is a green-exit no-op: every scheduled morning it would have
reported success and delivered nothing. Its email-eligibility step, not its
scoring, is the dead part.

## The path that actually works was never on a schedule

`claude-batch-verified.md`, written 01:37 today, states: "The daily 09:15
Eastern trigger now runs `Run-ClaudeJobOutreach.ps1 -MaxDrafts 30`. The first
scheduled run is pending."

**No such task existed.** Enumerated every scheduled task by action string for
`job-search-2026|ClaudeJobOutreach|JobOutreach` and the only match was
`Job-Shortlist-Daily`. The hidden-task manifest's only job-lane entry is
`Daily-Job-Outreach-Runner`. The note recorded a trigger that was never
registered — worse than "registered is not running," this was never registered
at all.

That path does work when invoked. A manual run at 10:02 today produced **12
real Gmail drafts, nothing sent**, 287 turns, 12.5 minutes, **$13.22**.

## What was changed, and the two things held back

Registered `Claude-Job-Outreach-Daily`, daily 09:15, `StartWhenAvailable`.

**Held back 1 — send capability.** `Run-ClaudeJobOutreach.ps1` currently lists
`mcp__claude_ai_Gmail__send_message` in `$allowed` by default, under a comment
dated 2026-09-15 reading "send_message re-enabled in $allowed above; Dillon
authorized sending for the job-outreach lane." Registering it as written would
have created a recurring unattended job able to send up to 30 emails a day to
hiring managers with no human in the loop. A code comment is not an
authorization record. The task is registered with **`-DraftOnly`**, which the
script itself honours by stripping `send_message` from `$allowed` and adding it
to `$denied`. Drafts only, nothing sent. Flipping it is one word from Dillon.

**Held back 2 — recurring cost.** At $13.22 a run, daily is roughly $400 a
month. Reported rather than absorbed. Disable with
`Disable-ScheduledTask -TaskName Claude-Job-Outreach-Daily`.

Today's run already happened at 10:02, so the new task was not fired a second
time.

## Still broken

All job tasks are `LogonType Interactive`, same defect as the cadence layer —
`Set-ScheduledTask` returns "Access is denied" unelevated, and so does
registering with S4U. `Enable-ScheduledTask`, `Start-ScheduledTask` and
`Register-ScheduledTask` (Interactive) all work unelevated, so this is a
machine-wide policy on the principal, not a per-task ACL.
`System/scripts/Repair-ScheduledTasks.ps1` covers all seven tasks in one
elevated run.

## Related

- [[12_Brain/07_Reviews/2026-09-15 - Cadence tasks cannot run unattended]]
