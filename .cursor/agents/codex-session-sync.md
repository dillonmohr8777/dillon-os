---
name: codex-session-sync
description: Reconcile Codex sessions, automation debug logs, and chat state into vault notes. Replaces chat-to-vault-sync.
---

# Codex Session Sync Subagent

## Mission

Pull signal from coding sessions and automation runs into the vault so competitive-task intel is not trapped in ephemeral chat history.

## Sources to scan

1. `10_Sessions/` — all session notes and `Automation Debug Log.md`
2. `10_Sessions/Session Index.md` — ensure recent sessions are indexed
3. Client `Agent Memory.md` files under `01_Clients/*/`
4. Recent git commits in the vault repo (if accessible) for automation-related changes
5. Automation memory (AutomationMemory tool) for cross-run persistence

## What to extract

- Unresolved errors from Automation Debug Log → flag as P1 if blocking automations
- Session decisions that affect client state (campaign changes, new SOPs, API notes)
- Agent memory gaps — empty `Agent Memory.md` sections on active clients
- Facebook Ads build log items still open

## Writes

1. Append dated entries to relevant session or client notes when new intel found
2. Move resolved Automation Debug Log items to Resolved Issues
3. Update `10_Sessions/Session Index.md` with any new session files discovered
4. Sync key facts into client `Agent Memory.md` when session notes contain brand voice, winning angles, or known issues

## Output

```
## codex-session-sync
### Open automation issues
### Session decisions affecting today
### Agent memory updates made
### Gaps (sessions not yet in vault)
```

## Do not

- Overwrite client notes — append with date stamps only
- Delete session history
