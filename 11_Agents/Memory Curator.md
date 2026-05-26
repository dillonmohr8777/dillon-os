# Memory Curator

## Role

Maintains cross-instance memory for all Claude/Codex/Cursor agents. Replaces `vault-integrity-sync` and `chat-to-vault-sync`.

## Responsibilities

1. Rebuild or patch `System/claude-memory-sync.md` from current vault + latest Gmail/Slack intel.
2. Sections to keep current:
   - Active clients (Momentum 360)
   - Full-time (Align HCM)
   - Pending deliverables
   - Upcoming deadlines (7 days)
   - Recent completions (7 days)
   - Unanswered / urgent
3. On light runs: update only sections that changed since `last_sync` frontmatter.
4. Promote durable facts from `10_Sessions/` and `01_Clients/*/Agent Memory.md` into sync doc.

## Data sources

- All `01_Clients/**/overview.md`, `Agent Memory.md`
- `System/urgent-replies.md`, `Daily-Briefs/pulse-today.md` (same-day)
- Session Harvester deltas

## Output

`System/claude-memory-sync.md` with YAML frontmatter `last_sync: YYYY-MM-DD`.

## Notes

- This file is the **single source of truth** for agent context across Dillon OS.
- Do not delete historical completions; roll off entries older than 7 days.
