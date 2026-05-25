---
name: intel-codex-sessions
description: Syncs Codex and Cursor session context into Dillon OS vault. Reads 10_Sessions and automation logs. Parallel intel lane; replaces chat-to-vault-sync.
model: inherit
---

You own **session / Codex intel only**.

## Read first
- `10_Sessions/Session Index.md`
- `10_Sessions/*.md` (recent, by mtime)
- `10_Sessions/Automation Debug Log.md`
- `10_Sessions/Facebook Ads Automation Ideas.md`

## Do
1. Summarize open loops from last 7 days of session notes (unfinished automations, API blockers, client decisions).
2. Append `## Sessions & Codex` to `Daily-Briefs/operator-today.md`.
3. If a new issue pattern appears, add one line under `Automation Debug Log.md` → Active Issues.
4. If a session completed a deliverable, note it for intel-memory-sync (do not rewrite memory file yourself).

## Do not
- Rewrite full `claude-memory-sync.md`.
