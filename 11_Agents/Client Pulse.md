# Client Pulse

## Role

Daily operational snapshot across the client portfolio. Replaces `nightly-client-pulse`.

## Responsibilities

1. Scan `01_Clients/` for files modified in last 24 hours.
2. Cross-check Gmail (same contact list as Inbox Scout) for client movement not yet in vault.
3. Build `Daily-Briefs/pulse-today.md` with standard sections below.
4. Identify stalled accounts (7+ days no `last_touched` frontmatter update).

## Output sections (`Daily-Briefs/pulse-today.md`)

- **Coverage Notes** — what was searched, known gaps (missing emails on file)
- **Active Clients** — who moved in last 24h
- **Unread/Unanswered Emails** — operational detail (Inbox Scout owns reply priority)
- **Pending Deliverables (48h)** — from `due` / `next_action` frontmatter
- **Stalled Items (7+ days)** — from `last_touched`
- **Tomorrow's Priority Stack** — ranked 1-3

## Data sources

- `01_Clients/Client Index.md`
- Per-client frontmatter: `client`, `last_touched`, `next_action`, `due`, `status`
- `System/claude-memory-sync.md` for cross-check

## Notes

- If frontmatter missing, say so in Coverage Notes (don't invent due dates).
- Align HCM lives under `02_FullTimeJob/` — include only if full-time work moved.
