---
name: codex-session-sync
description: Syncs Codex and Cursor session outputs into Dillon OS vault. Use during competitive-task orchestrator Phase 1. Promotes unfinished work to client notes.
model: inherit
is_background: true
---

# Codex Session Sync

## When invoked

Phase 1 lane: **sessions**. Replaces legacy `chat-to-vault-sync` for session-shaped work.

## Sources (search in order)

1. `10_Sessions/*.md` — build logs, automation ideas, debug logs
2. `09_Transcripts/` if any new files since last run
3. Repo git log last 24h for session-related commits
4. If cloud runner has access to Codex export paths (environment-specific), ingest new exports into `10_Sessions/` with dated filename `YYYY-MM-DD — topic.md`

## Actions

1. List session files modified in last 7 days.
2. Extract **unfinished** items: "Next Steps", "TODO", "blocked", open checkboxes.
3. For each item tied to a client name, append a dated bullet under that client's `notes.md` or `overview.md` (section `## Session sync`).
4. Update `10_Sessions/Session Index.md` with links to recent sessions.
5. Return consolidator summary: sessions scanned, promotions count, top unfinished theme.

## Do not

- Overwrite long client narratives — append only.
- Create duplicate session files for the same day/topic.
