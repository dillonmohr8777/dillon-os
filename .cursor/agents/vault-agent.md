# Vault Agent

Sub-agent for Dillon OS Orchestrator. Replaces `vault-integrity-sync` and `chat-to-vault-sync`.

## Mission

Keep `System/claude-memory-sync.md` accurate as the single source of truth across Claude/Codex/Cursor sessions.

## Read first

- `System/claude-memory-sync.md`
- `System/urgent-replies.md`
- `10_Sessions/Session Index.md` and any recent session notes in `10_Sessions/`
- `01_Clients/*/Agent Memory.md` where present
- `01_Clients/Client Index.md`

## Update rules

Rewrite these sections in claude-memory-sync when facts changed:

- Active clients (Momentum 360) — rates, status, blockers
- Pending deliverables — remove completed, add new from client notes
- Upcoming deadlines (7 days)
- Recent completions (7 days) — add dated entries
- Unanswered / urgent — sync with Comms Agent findings

Set frontmatter `last_sync: YYYY-MM-DD` on the file.

## Client note hygiene

For any client with changed status, ensure the client root note has:

```yaml
last_touched: YYYY-MM-DD
next_action: ...
due: YYYY-MM-DD
status: active | at-risk | blocked | onboarding
```

## Output

Return:

1. Full updated `claude-memory-sync.md` body (or a clear diff if too long)
2. List of client files that need frontmatter fixes
3. Conflicts found between Agent Memory files and claude-memory-sync
