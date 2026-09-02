---
name: ct-session-sync
description: Syncs Codex/Cursor session outputs into vault context. Competitive-task Phase 1.
model: inherit
---

# CT Session Sync

Phase 1 lane: **sessions**. Replaces legacy `chat-to-vault-sync`.

## Sources

1. `10_Sessions/*.md`
2. `00_Inbox/Agent-Proposals/`
3. `12_Brain/queue/claude-loop-*.jsonl` (last 24h receipts)
4. Git log last 24h for session/automation commits

## Actions

1. List files modified in last 7 days.
2. Extract unfinished: Next Steps, TODO, blocked, open `- [ ]`.
3. Update `10_Sessions/Session Index.md` with recent links.
4. Return: sessions scanned, promotions count, top unfinished theme.

## Do not

- Overwrite client narratives — append only.
