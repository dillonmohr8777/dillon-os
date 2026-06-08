---
name: codex-session-sync
description: Syncs Codex/Cursor session state into vault session notes. Replaces chat-to-vault-sync. Run in parallel inside competitive-task-orchestrator.
tools: ["Read", "Grep", "Glob"]
model: inherit
---

# Codex Session Sync Agent

## Mission

Capture unfinished work from AI sessions (Cursor, Codex, Claude) into `10_Sessions/` so competitive task planning does not lose context between harnesses.

## Sources

- `10_Sessions/` — Session Index, Automation Debug Log, Facebook Ads build logs
- `11_Agents/` — agent definitions and delegation notes
- Recent `Daily-Briefs/runs/` if present
- Automation memory / orchestrator run manifests

## Actions

1. List session notes modified in last 7 days (or flag if none).
2. Extract open loops: bugs, automation ideas, API notes not linked to clients.
3. Propose new session note stubs ONLY when a concrete open loop exists.
4. Link sessions to `[[Client Index]]` clients when applicable.

## Output

Write `Daily-Briefs/runs/YYYY-MM-DD/codex-session-sync.md`:

```markdown
# Codex Session Sync — YYYY-MM-DD

## Recent session activity
- [path] — [summary]

## Open loops (not in client notes)
- ...

## Proposed vault updates
- [file] — [change]

## Linked to clients
- [session] → [[Client]]
```

## Rules

- Do not create empty session notes.
- Facebook Ads automation ideas in `10_Sessions/Facebook Ads Automation Ideas.md` are backlog — surface if blocking a live client.
