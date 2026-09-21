---
note_type: review
status: active
date: 2026-09-15
updated: 2026-09-15
tags:
  - automation
  - cadence
  - reliability
  - review
source_refs:
  - Get-ScheduledTask/Get-ScheduledTaskInfo on Cadence-daily, Cadence-weekly, Cadence-monthly, Cadence-sweep-heartbeat, read 2026-09-15T13:59Z
  - Windows System event log Id 1074/6005/6013, read 2026-09-15
  - explorer.exe process StartTime, read 2026-09-15
  - _os/automation/cadence/run-ledger.jsonl
  - System/sweep-status.md
  - System/operating-status.md
  - System/daily-orchestrator.md
---

# Cadence tasks cannot run unattended

`System/operating-status.md` left one prediction open: "treat the first real
daily fire as unproven until 2026-09-15 09:05 passes and the ledger shows it."

**It resolved negative. `Cadence-daily` did not fire at 09:05 on 2026-09-15.**

## Measured

| Task | LastRunTime | LastTaskResult | NextRunTime | Missed |
|---|---|---|---|---|
| `Cadence-daily` | 11/30/1999 (never) | 267011 (`SCHED_S_TASK_HAS_NOT_RUN`) | 2026-09-16 09:05 | 0 |
| `Cadence-weekly` | 11/30/1999 (never) | 267011 | 2026-09-21 09:20 | 0 |
| `Cadence-monthly` | 11/30/1999 (never) | 267011 | 2026-10-01 09:35 | 0 |
| `Cadence-sweep-heartbeat` | 2026-09-15 03:00:01 | 2 (the sweep's own "bad news" exit) | 2026-09-15 11:00 | **6** |

All four are `State: Ready`, `Enabled: True`, with live triggers. Both binaries
exist at the paths the tasks name (`C:\Program Files\nodejs\node.exe`,
`C:\Users\dillo\.local\bin\claude.exe`). The task definitions are not broken.

## Root cause

All four are registered `LogonType: Interactive` — "run only when the user is
logged on."

Timeline for 2026-09-15:

- 03:31:49 — `TrustedInstaller.exe` initiated a restart (Windows Update).
- 03:32:41 — machine back up, **no interactive logon**.
- 03:00:01 — the heartbeat's last successful run, before the reboot.
- 03:23:17 — `claude-daily-driver` last cycle (`DRV-20260915-032317594`), also
  before the reboot. It has not cycled since, same cause.
- 04:00–09:00 — six hourly heartbeat slots pass with nobody logged on.
  `NumberOfMissedRuns` reads exactly **6**.
- 09:05 — `Cadence-daily`'s slot passes with nobody logged on. Skipped to 09-16.
- 09:54:05 — `explorer.exe` starts. Dillon logs in. Tasks become runnable again.

This was not the power-supply fault. The reboot was a clean, service-initiated
Windows Update restart (Id 1074, TrustedInstaller), not an Id 6008.

## Why this matters more than the missed runs

The cadence layer's stated purpose is to stop silent failure. Registered with
"run only when the user is logged on," on a machine that reboots itself
unattended, it is guaranteed to produce exactly the silent gaps it was built to
catch — and `NumberOfMissedRuns` stayed 0 for the daily task, so the gap did not
even register as missed. A registered task that never fires is the same failure
wearing a different hat.

## Fix, not applied

The repair is a principal change on the four existing tasks: `LogonType S4U`
(runs whether or not the user is logged on, stores no password) plus
`StartWhenAvailable` so a slot missed during downtime catches up on next boot.

Attempted 2026-09-15T14:00Z from this session and **refused: "Access is denied"
on all four.** `Set-ScheduledTask` on these tasks requires elevation. Verified
afterwards that all four are unchanged and still `Interactive` — nothing was
half-applied. This needs an elevated PowerShell, which means it needs Dillon.

No workaround was built. A second set of tasks shadowing the first would give
this machine two schedulers and two sources of truth, which is the failure the
single-ledger rule in `_os/automation/cadence/README.md` exists to prevent.

## Related

- [[System/daily-orchestrator]] — the standing brief that flagged this to verify
- [[System/sweep-status]] — the sweep that showed the stale state files
