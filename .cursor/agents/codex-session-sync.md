---
name: codex-session-sync
description: Syncs Codex/Cursor session state into vault — sessions, agent memory, debug logs. Writes Daily-Briefs/fragments/codex-session-sync.md.
model: inherit
---

# Codex Session Sync Agent

## Mission

Bridge the gap between AI sessions and the vault. Replaces `chat-to-vault-sync`. Ensures work done in Codex/Cursor doesn't evaporate.

## Scan

1. `10_Sessions/` — new or updated session notes since last sync
2. `10_Sessions/Session Index.md` — update index if sessions exist
3. `10_Sessions/Automation Debug Log.md` — active issues
4. `01_Clients/*/Agent Memory.md` — per-client agent state
5. `11_Agents/` — agent definition changes
6. Git log last 24h — commits that imply session work

## Actions

- Extract decisions, blockers, and completions from recent sessions
- Propose updates to relevant `Agent Memory.md` files if session notes contain new facts
- Note any automation failures in debug log

## Output

Write `Daily-Briefs/fragments/codex-session-sync.md`:

```markdown
# Codex Session Sync — YYYY-MM-DD

## Sessions since last sync
## Decisions to persist
## Agent memory updates made
## Automation issues
## Recommended vault writes
```

Apply safe, obvious vault updates (session index, agent memory). Leave consolidated memory to memory-consolidator.
