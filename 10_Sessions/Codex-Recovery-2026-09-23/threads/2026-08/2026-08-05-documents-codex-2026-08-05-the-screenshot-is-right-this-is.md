---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-08-05T17:13:13
session_last: 2026-08-05T17:13:13
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-08-05\the-screenshot-is-right-this-is"
tags: [codex-recovery, session, 202608]
---

# Documents\Codex\2026-08-05\the-screenshot-is-right-this-is

**1 session(s)** · 2026-08-05 17:13 → 2026-08-05 17:13 · 27m agent-time (summed; sessions may overlap) · 1 MB transcript · 1/1 turns completed

## 1. 2026-08-05 17:13 · 27m · 1.2 MB

`019fd2ea-3b41-7433-b817-18ed8fbbab65` · turns 1/1

**Asked:**

> for Codex:
> 
> The screenshot is right: this is primarily a Codex worker leak, not insufficient RAM.
> 
> Current evidence:
> 
> - 118 Node and 86 Python processes.
> - Main Codex process has 118 direct connector children plus 14 genuinely orphaned Node workers.
> - New workflows repeatedly spawn ~6-process connector bundles that remain afterward. Retrying currently makes the buildup worse.
> - Node uses ~10.3 GB, ChatGPT ~7.8 GB, Python ~2.9 GB.
> - CPU averaged 36%, peaking at 54%.
> - You still have 37 GB RAM free; disk space and latency are healthy.
> - Codex state is bloated: 13.33 GB of sessions and a 1.24 GB logs database.
> - The configured 4–5 agent limit is separate and isn’t the primary failure.
> 
> Plan:
> 
> 1. Stop retrying workflows temporarily.
> 2. Finish anything active, then fully recycle the Codex process tree and remove only the verified orphan workers. A Windows reboot shouldn’t be necessary.
> 3. Mak

> Sorry Luna max

**Outcome reported:**

> Fixed the primary leak without a reboot.
> 
> - Heavy connectors are now opt-in; normal/Luna Max workflows remain lean.
> - Node dropped from 117 to 44 and Python from 82 to 10 before the final recycle.
> - Archived 775 inactive sessions (9.55 GB) with a checksum manifest. Active state is now 3.81 GB.
> - Backed up and validated both SQLite databases.
> - Prepared a compact logs database: 1.297 GB → 804.9 MB, `quick_check=ok`.
> - Removed five verified orphans and eleven idle code-mode roots. Active Buzz daemons and the canonical OmniRoute listener were preserved.
> - A hidden hot recycle is now running. Expect a brief Codex reconnect; the computer will not reboot.
> - Build `26.730.8199.0` still reproduced renderer/code-mode retention after the connector fix, so that underlying lifecycle bug is documented.
> 
> Artifacts:
> 
> - [Recovery report](C:/Users/dillo/Documents/Codex/2026-08-05/the-screenshot-is-right-this-is/CODEX-WORKER-LEAK-RECOVERY.md)
> - [Connector profiles](C:/Users/dillo/.codex/tools/Set-CodexConnectorProfile.ps1)
> - [Maintenance evidence](C:/Users/dillo/.codex/maintenance-backups/worker-leak-20260805T172657Z/backup-archive-summary.json)
> 
> Use profiles such as `Blender`, `WebResearch`, `Automation`, or `Analytics` only for matching tasks, then return to `Lean`.
> 

<sub>rollout: `C:\Users\dillo\.codex\archived_sessions\rollout-2026-08-05T13-13-13-019fd2ea-3b41-7433-b817-18ed8fbbab65.jsonl`</sub>
