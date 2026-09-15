---
note_type: review
status: active
date: 2026-09-15
updated: 2026-09-15
tags:
  - session-record
  - orchestrator
  - reliability
  - automation
source_refs:
  - System/sweep-status.md, regenerated 2026-09-15 after the main merge
  - _os/automation/cadence/run-ledger.jsonl
  - Get-ScheduledTask and Get-ScheduledTaskInfo, read 2026-09-15 between 13:59Z and 15:1xZ
  - Windows System event log Ids 1074, 6005, 6013, read 2026-09-15
  - explorer.exe process StartTime, read 2026-09-15
  - git log, git rev-list, git ls-remote, gh pr view across dillon-os and client-operations
  - Gmail thread 1a08d23437b02c05, Puttery access, read 2026-09-15
  - Slack channels ai-tech-news, deborah-mara, kimberly-james-bridal, 2026-09-15
  - client-operations/clients/gt-clinic/deliverables/2026-09-10-plan/HANDOFF-READY-2026-09-13.md
---

# Master orchestrator session record, 2026-09-15

Session opened as the replacement orchestrator after the previous seat
disconnected roughly six hours earlier. This is the record of what was measured,
what was changed, and what is still open.

## Machine access actually exercised

Not a capability list. These are the surfaces this session actually touched and
what each one proved.

| Surface | Used for | Result |
|---|---|---|
| Local filesystem, full host | vault, client-operations, Codex trees, AppData | worked throughout |
| PowerShell | Task Scheduler, event log, volumes, processes, UAC | read fine, **task writes refused** |
| Bash, git, gh | 2 repos, 57 open PRs enumerated, 4 merges | worked |
| Gmail connector | read the Puttery thread, created 1 draft | worked |
| Slack connector | searched mentions, read 5 channels | worked, read only |
| Google Calendar | searched, listed, created 1 event | worked, 1 invite sent |
| Meta Ads connector | attempted KJB numbers | **no Meta Ads connection on the brand, no data** |
| Codex CLI via the Workmate venv | FAQ bot answer path | worked, zero paid API cost |
| google-analytics MCP | not usable | failed to connect, uv_spawn |

**The one hard access limit found:** `Set-ScheduledTask` returns "Access is
denied" unelevated for every task tried, and `Register-ScheduledTask` with S4U is
refused the same way. `Enable-ScheduledTask`, `Start-ScheduledTask` and
`Register-ScheduledTask` with Interactive all work unelevated. So this is a
machine-wide policy on the task principal, not a per-task ACL. Dillon is in the
Administrators group but the session is not elevated and UAC
`ConsentPromptBehaviorAdmin` is 5. An elevated launch was attempted and the
consent dialog came back cancelled, so nothing was applied.

## What was broken, and what the root cause actually was

### 1. No scheduled task had ever fired

`Cadence-daily`, `Cadence-weekly`, `Cadence-monthly` and `Job-Shortlist-Daily`
all read LastRunTime 11/30/1999, the Windows never-run sentinel.
`Daily-Job-Outreach-Runner` was Disabled. The 09:15 Claude outreach trigger that
a vault note claimed existed **had never been registered at all**.

Root cause: every one of them is registered `LogonType: Interactive`, meaning run
only when the user is logged on. Windows Update restarted the machine at 03:31
(Id 1074, TrustedInstaller, **not** the power-supply fault), and `explorer.exe`
did not start until 09:54. Nothing could run in between. The heartbeat
NumberOfMissedRuns reads exactly 6, matching 04:00 through 09:00, and the
09:05 Cadence-daily slot was skipped without even being recorded as missed.

### 2. The vault working tree was four weeks stale

`repos/dillon-os` had been checked out on `cursor/immohrtal-standing-canary-3c2e`
since it forked from main on **2026-08-18**: 109 behind, 124 ahead, 931 differing
paths, **308 files on origin/main simply absent from disk**. Every local reader,
including the sweep itself, had been reading the wrong tree. The sweep's own
"what shipped" and "at risk" counts were measured against it.

### 3. A reserved filename had blocked every commit for weeks

A zero-byte file named NUL, created by a redirect on 2026-08-23, made
`git add -A` fail with "invalid path". That is why 2,210 paths sat uncommitted on
a machine with one disk.

## What was changed

- Merged origin/main into the working branch, resolving **87 conflicts** by
  category: generated and code files took main; the cadence ledger was unioned
  and sorted; append-shaped vault notes were unioned so neither side was dropped;
  `daily-orchestrator.md` and `operating-status.md` took ours, because main still
  said the cadence layer "is not currently wired" and repeated the 114k file
  count already corrected to 32,912. Merged to main via PR #404.
  **Result: sweep stale went from 3 to 0.**
- Deleted the NUL file via the extended path syntax. Plain `git add -A` works.
- Merged PR #400, the cadence layer onto main, plus client-operations #63 and
  #38. **Deliberately did not merge the other 54**: drafts, branches stacked on a
  non-main base, conflicting PRs, and #71, which a prior note held back because
  merging it publishes a registry change.
- Started `Job-Shortlist-Daily` and `Daily-Job-Outreach-Runner` by hand, both
  exit 0. Registered `Claude-Job-Outreach-Daily` at 09:15 **with DraftOnly**.
- Built a read-only team FAQ bot over `04_SOPs`, verified both answering and
  refusing.
- Booked the Nexla reschedule with Dana Palko, 13:30 today.

## Findings worth carrying forward

- **The job outreach runner is a green-exit no-op.** 935 postings harvested, Tier
  A 87 and Tier B 93, then eligible_targets_count 0 and an empty send manifest.
  It reports success and delivers nothing. The dead part is email eligibility,
  not scoring.
- **The path that does work costs $13.22 a run.** `Run-ClaudeJobOutreach.ps1`
  produced 12 real Gmail drafts at 10:02. Daily is roughly $400 a month, reported
  rather than absorbed.
- **That script allows Gmail send_message by default**, under a comment dated
  today claiming sending was authorised for the lane. It was registered
  DraftOnly instead. A code comment is not an authorisation record for a
  recurring unattended sender.
- **56 repositories under Documents/Codex have no remote at all**, against 164
  git roots. The earlier "three repos on exactly one disk" was an undercount by
  roughly 18x, because `inventory.ps1` never scans work, worktrees or nested
  session directories.
- **The 95 GB in no repository is a residual, not a measurement**: 212 total
  minus 116.7 inside a repo, and that 116.7 wrongly counted 55.6 GB of config
  directories. Real git roots total 61 GB.
- **There is still no off-device copy.** One Kingston NVMe, 952 GB, 366 free. No
  second volume, no removable media, no GCS buckets. OneDrive holds about 490 MB
  and does not cover Documents/Codex, repos or .codex. The estate grew about
  9 GB in 24 hours.
- **The 2026-09-14 three-repo push claim is TRUE**, verified by SHA equality
  against `git ls-remote`, plus a fifth repo nobody recorded.
- **The Empeon addendum is not on main.** cef14b3e sits in draft PR #399. A
  subagent reported it as merged. That was wrong and is corrected here.
- **Workmate cannot be opened to the team.** Its receive gate binds to the owner
  DM and the bot carries Dillon-level tool and canonical-state authority. The
  team FAQ bot is a separate surface for that reason.
- **KJB Meta numbers are not obtainable here.** The connector reports no active
  Meta Ads connection. The last verified data point is 5 leads on 2026-08-01 with
  outcomes never reconciled.

## Still open at the time of writing

1. One elevated run of `System/scripts/Repair-ScheduledTasks.ps1`, covering all
   8 tasks. Everything else about the scheduling layer is fixed.
2. A backup destination for the roughly 95 GB. Unanswered, and the largest single
   risk on this machine.
3. The FAQ bot needs its own Slack app, which is a human admin step.
4. Ten staged weekly-report Gmail drafts still point at the wrong week.
5. The clay-films-20260912 Netlify alias is still public and unprotected.
6. `gt-clinic` does not resolve in the canonical client registry.
7. Three Slack replies drafted and unsent, plus one Puttery access email drafted
   and unsent.

## Standing rule captured today

Dillon, 2026-09-15: no dashes of any kind in anything he sends. Saved to durable
memory as `no-dashes-in-messages`. Applies to client mail, Slack and outreach,
not to code or vault notes.
