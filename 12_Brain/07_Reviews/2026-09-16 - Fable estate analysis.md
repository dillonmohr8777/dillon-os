---
note_type: review
status: active
date: 2026-09-16
updated: 2026-09-16
tags:
  - session-record
  - reliability
  - registry
  - credentials
source_refs:
  - System/approval-queue.md, live read 2026-09-16
  - dillon-os and client-operations, git log/status, read 2026-09-16
  - registry/clients.json (three copies) and System/operating-status.md, read 2026-09-16
  - Get-ScheduledTask, read 2026-09-16
  - Documents/Codex dated session folders, read 2026-09-16
---

# Fable estate analysis, 2026-09-16

Run by Fable 5.1 (model: fable) via subagent, at Dillon's request, mid-session
during the Orca/Codex/usage discussion. Read-only, 22 tool uses, 151k tokens.

## Needs Dillon now

- `System/approval-queue.md` L132: unrotated `sk-ant-api03` key sitting in a
  synced transcript. Location only, value not reproduced here. Rotate it.
- L128: WordPress password in Slack. Same handling, rotate/remove.
- L175/L176: Revive Systems and Bar Crawl USA were told wrong facts. Unknown
  from this pass whether already sent or still drafted. Check before doing
  anything else client facing for either.
- L120: 575 films, no backup.
- Repair-ScheduledTasks.ps1 needs an elevated run; refused unelevated so far.

## Nothing closes

131 approval-queue items open, 0 checked, oldest 2026-07-12. dillon-os: 129
open PRs, oldest 2026-07-13, 12 opened this week (8 `daily-learning/*`, 5
duplicate `competitive-task-consolidation`). `cursor/immohrtal-standing-canary-3c2e`
merged via PR #404 on 09-15 but is still 13 ahead of main, 5 unpushed, 82 dirty.
PR #339 targets dead base `vault-live-2026-08-07`, 3,005 files.
`client-operations`: 55 open PRs, 77 ahead / 36 behind main, 12 unpushed,
3,470 dirty (3,128 untracked under `clients/`).

## Registries disagree, four ways now

- `client-operations/registry/clients.json`: 28 (matches this session's own
  gt-clinic fix). `align-hcm` and `nkcdc` still `active`.
- `repos/client-operations-canonical/registry/clients.json`: 24, stale mirror
  from 09-01.
- `dillon-os/_os/reporting/client-registry.json`: 5, includes
  `capsule-and-tonic`, which is in neither of the above.
- `System/operating-status.md`: claims 27. Also wrong.

## Scheduler, live

`Cadence-daily` fired today 09:05, rc=0. Weekly/monthly never fired
(sentinel). Heartbeat ran 13:00, rc=2 (known: exit 2 is a successful run
reporting bad news). All four tasks still `Interactive` logon type.
`System/approval-queue.md` L197 ("never fired," dated today) is already stale.

## Active vs dormant

Active today: dillon-os, client-operations. bridge-software-frontend: healthy,
production = development at fc086c6, PR #20 open, 4 clean worktrees.
43 of 48 repos: no commit since 09-04. 6 align-hcm repos idle since 08-20
(engagement ended 09-02). 5 repos are just upstream forks.

## Unfiled Codex work

`2026-09-16-momo-at-work`, `-momo-agent`, `-render-sentinel`,
`-momentum-at-work-philly`: zero vault references each. `mac-mini-handoff`:
76 files, 3 vault refs.
