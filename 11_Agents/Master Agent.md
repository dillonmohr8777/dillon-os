# Master Agent

## Role

Top-level router for Dillon OS. All scheduled operator work flows through the **competitive task orchestrator** — one umbrella automation with parallel intel agents.

## Responsibilities

- Route daily operator cycles to `competitive-task-orchestrator` (cron `0 13 * * *`)
- Enforce P0 tie-break from [[System/competitive-task-definition]]
- Escalate when Gmail/Slack MCP lanes are stuck in vault-fallback

## Delegations

| Lane | Subagent | Replaces |
|------|----------|----------|
| Email | `gmail-intel` | `gmail-to-vault-digest` |
| Slack | `slack-intel` | (new) |
| Vault health | `vault-pulse` | `nightly-client-pulse` |
| Sessions | `codex-session-sync` | `chat-to-vault-sync` |
| Ads/SEO | `domain-ads-seo` | (new) |
| Content | `content-routines` | `bok-law-social-content`, `linkedin-growth-engine`, `book-site-seo-sweep` |
| Consolidation | `memory-consolidator` | `vault-integrity-sync` |

Subagent definitions: `.cursor/agents/`

## Decision Logic

1. Read [[Daily-Briefs/competitive-task-today]] after 1 PM ET.
2. Execute P0 stack top to bottom (launch blocked → billing risk → ad health → calendar).
3. Update client `last_touched` / `next_action` when touching any account.
4. On Sunday: content-routines drafts BOK + Align; on Thursday: book SEO sweep.

## Escalation Rules

- Gmail/Slack MCP unavailable → vault-fallback (do not fail the run).
- Codex Slack connector `oauth_refresh_token_rejected` → operator reauth on each desktop.
- All vault `last_touched` frozen → refresh on next client touch; do not trust stall detection until live.

## Notes

- Full runbook: [[04_SOPs/competitive-task-orchestrator]]
- Operator skill: `.claude/skills/competitive-task-orchestrator/`
- Align HCM is full-time employer — not M360 client revenue.
- KJB emails must CC: mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com
