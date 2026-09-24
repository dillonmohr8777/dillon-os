---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-08-05T16:13:31
session_last: 2026-08-05T16:13:31
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-08-05\let-s-set-up-a-scheduled-3"
open_flags: [quarantined]
tags: [codex-recovery, session, 202608]
---

# Documents\Codex\2026-08-05\let-s-set-up-a-scheduled-3

**1 session(s)** · 2026-08-05 16:13 → 2026-08-05 16:13 · 20m agent-time (summed; sessions may overlap) · 1 MB transcript · 1/1 turns completed

> **Open flags:** `quarantined`

## 1. 2026-08-05 16:13 · 20m · 1.4 MB

`019fd2b3-9034-7030-b61a-e34c06627d30` · turns 1/1 · flags: quarantined

**Asked:**

> for Codex:
> why do u keep doping this fix this

**Outcome reported:**

> Fixed. The Hermes gateway had Harness OAuth enabled and was auto-opening Microsoft Edge every 30 minutes; the local callback then timed out.
> 
> I:
> 
> - Disabled Harness, Lovable, and Slack OAuth MCP entries.
> - Disabled the Cursor Harness MCP definitions.
> - Quarantined stale OAuth attempt records.
> - Restarted Hermes and closed only its Edge process tree.
> 
> Verified: no Edge browser processes remain, Hermes is running, and no new OAuth popup attempts appeared.
> 

**Files written (3):**

- `C:/Users/dillo/.cursor/plugins/cache/cursor-public/harness/494bf8c826e9fc21a82262b133cd9906afec68b3/.mcp.local.json`
- `C:/Users/dillo/.cursor/plugins/cache/cursor-public/harness/494bf8c826e9fc21a82262b133cd9906afec68b3/mcp.json`
- `C:/Users/dillo/AppData/Local/hermes/config.yaml`

<sub>rollout: `C:\Users\dillo\.codex\archived_sessions\rollout-2026-08-05T12-13-31-019fd2b3-9034-7030-b61a-e34c06627d30.jsonl`</sub>
