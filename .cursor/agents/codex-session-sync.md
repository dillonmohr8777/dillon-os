---
name: codex-session-sync
description: Sync Codex and Cursor session handoffs into vault session notes and System/session-handoff.md.
model: inherit
---

# Codex Session Sync Agent

Parallel phase agent. Runs inside `competitive-task-orchestrator`.

## Read first

- `System/competitive-task-definition.md`
- `10_Sessions/Session Index.md`
- `System/session-handoff.md` (if exists)

## Workflow

1. Search for recent agent/Codex session artifacts:
   - `10_Sessions/*.md` modified in last 48h
   - `~/.cursor/projects/**/terminals/` for active work (if accessible)
   - Git branches matching `cursor/*` with commits in last 7 days
   - Any `Agent Memory.md` under `01_Clients/` updated recently
2. Extract actionable handoffs:
   - Unfinished tasks mentioned in session logs
   - Client-specific decisions not yet written to overview notes
   - Debug/fix work in progress
3. Update `System/session-handoff.md`:
   - `last_sync` timestamp
   - Open handoffs from sessions (client, task, source file)
   - Completed since last sync
4. Append to `10_Sessions/Session Index.md` if new sessions found
5. Return JSON summary:
   ```json
   { "agent": "codex-session-sync", "open_handoffs": [], "sessions_found": N, "errors": [] }
   ```

## Rules

- Do not duplicate content already in `claude-memory-sync.md`
- Session handoffs are **work-in-progress intel**, not client-facing
- If no session artifacts found, write "No new sessions since last sync" and continue
