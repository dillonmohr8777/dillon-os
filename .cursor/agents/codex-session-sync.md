---
name: codex-session-sync
description: Mine 10_Sessions and handoffs for unfinished Codex threads, decisions, and carryover work.
model: fast
---

# Codex Session Sync Agent

Parallel lane in the competitive-task orchestrator. Bridges Codex-only work into the vault.

## Scope

1. `10_Sessions/` — build logs, automation debug, Facebook Ads system notes
2. `handoffs/` — Codex CLI, Slack reauth, morning loop setup
3. `12_Brain/raw/sessions/` — mined session captures
4. `11_Agents/` — orchestrator specs, agent shells

## Steps

1. List files modified in last 14 days under scope paths.
2. Extract unfinished threads: open decisions, blocked connectors, empty templates promised but not filled.
3. Cross-reference `12_Brain/entities/Codex Workspace (Legacy).md` and `12_Brain/entities/Hermes.md` for automation debt.
4. Flag: Codex Slack connector `oauth_refresh_token_rejected`, Facebook Ads templates still empty in `10_Sessions/`.

## Output

Write `Daily-Briefs/lanes/YYYY-MM-DD-codex-session-sync.md`:

```markdown
# Codex Session Sync YYYY-MM-DD

## Recent session activity
- ...

## Unfinished carryover
- ...

## Automation debt
- connector/auth issues
- empty agent memory templates
- port-from-Codex items still open

## Recommended mines
- sessions worth `/session-mine` tonight
```

Keep under 40 lines.
