---
last_checked: 2026-08-02
source_mode: vault-fallback
tags: [system, slack, competitive-task]
---

# Slack Action Queue

Ingested from vault handoffs (Slack MCP unavailable). Sources: `handoffs/marketing-chief-intake-2026-07-22.md`, `Daily-Briefs/source-intake-2026-07-30.md`.

## Blocker

| Severity | Channel / source | Summary | Owner | Due |
|----------|------------------|---------|-------|-----|
| **P0** | Codex Slack connector | `oauth_refresh_token_rejected` / `reauthentication_required` — Codex Slack plugin session expired. Blocks all Slack MCP reads and Slack AI reintegration until interactive reconnect on each desktop. **11 days open** since 2026-07-22. | Dillon (operator) | ASAP |

## Actions

| Severity | Channel / source | Summary | Owner | Due |
|----------|------------------|---------|-------|-----|
| **P0** | #ai-tech-news (Mac) | **Slack AI reintegration** — restore safe Slack-to-AI command path for shared channels and DMs. Blocked on connector reauth above. | Dillon / Marketing Chief | After reauth |
| **P1** | Jason Fallon DM | **EOM agenda — Chatbot** — classify as built, tested, blocked, or approval-required with evidence. | Dillon / Sean | **OVERDUE (due 2026-07-31)** |
| **P1** | Jason Fallon DM | **EOM agenda — CallRail after-hours & SMS** — classify status with evidence. No SMS activation without explicit approval. | Dillon / Sean | **OVERDUE (due 2026-07-31)** |
| **P1** | Jason Fallon DM | **EOM agenda — Internal Agent workflows** — classify setups with evidence. | Dillon / Sean | **OVERDUE (due 2026-07-31)** |
| **P1** | Slack digest (Melissa) | **Guidelines prompt + Loom + meeting** — verify status and book slot. | Dillon | This week |
| **P1** | Slack digest (Sean) | **CallRail activity status** — respond with current setup evidence. | Dillon / Sean | This week |
| **P1** | #ai-tech-news (Mac) | Prove one allowed command → one canonical work item; deliver operator guide and unsent reply to Mac. | Dillon | After reauth |

## Repair steps (connector)

1. Open Codex → Plugins → Slack.
2. Disconnect expired connection; reconnect and authorize Momentum workspace.
3. Run read-only test: latest messages in `#ai-tech-news`.
4. Confirm messages return (not `reauthentication_required`).

## Notes

- No new Slack-derived actions since Run 39; connector reauth remains the highest-leverage unblock.
- Jul 30 source intake confirmed Slack connected but Composio Enhanced Controls block direct execution in some clients.
