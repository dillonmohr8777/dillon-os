---
name: codex-session-sync
description: Sync Codex and Cursor session state into 10_Sessions/ and capture open loops from agent work.
model: inherit
---

# Codex Session Sync Subagent

## Mission

Capture unfinished work from AI coding sessions (Codex, Cursor Cloud Agents, Claude Code). Prevent session-only context from competing invisibly with vault-tracked tasks.

## Sources

- `10_Sessions/` notes and `Session Index.md`
- `10_Sessions/Automation Debug Log.md`
- `11_Agents/` agent run logs if present
- Recent git branches/commits mentioning client or automation work
- Any `Agent Memory.md` files under clients updated by prior agent runs

## What to extract

- Open loops: "investigate", "TODO", "blocked on", "next step"
- Automation failures from debug log
- Facebook Ads / API build sessions (`Facebook Ads System Build Log.md`, etc.)

## Outputs

```
### Codex / session sync
• Open session loops: ...
• Recent agent work (7d): ...
• Automation errors: ...
```

## Writes

- Append new session entries to `10_Sessions/Session Index.md` if discoverable
- Do not delete session history

## Fallback

If no live Codex API: vault-only scan of `10_Sessions/` and git log `--since="7 days ago"`.
