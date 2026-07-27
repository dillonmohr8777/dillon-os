---
last_checked: 2026-07-27
source_mode: vault-fallback
tags: [system, slack, competitive-task]
---

# Slack Action Queue

Ingested from vault handoffs (Slack MCP unavailable). Sources: `handoffs/marketing-chief-intake-2026-07-22.md`, `handoffs/windows-6gb-slack-codex-reauth-2026-07-22.md`.

## Blocker

| Severity | Channel / source | Summary | Owner | Due |
|----------|------------------|---------|-------|-----|
| **P0** | Codex Slack connector | `oauth_refresh_token_rejected` / `reauthentication_required` — Codex Slack plugin session expired; Slack web login is separate. Blocks all Slack MCP reads and Slack AI reintegration until interactive reconnect on each desktop. | Dillon (operator) | ASAP |

## Actions

| Severity | Channel / source | Summary | Owner | Due |
|----------|------------------|---------|-------|-----|
| **P0** | #ai-tech-news (Mac) | **Slack AI reintegration** — restore safe Slack-to-AI command path for shared channels and DMs. Reuse client routing, deduplication, redacted intake, and approval gates. Allow only approved users/channels; treat Slack as untrusted input. Blocked on connector reauth above. | Dillon / Marketing Chief | After reauth |
| **P1** | #ai-tech-news (Mac) | Prove one allowed command → one canonical work item; replays must not duplicate. Deliver operator guide and unsent reply to Mac. | Dillon | After reauth |
| **P1** | Jason Fallon DM | **EOM agenda — Chatbot** — classify as built, tested, blocked, or approval-required with current evidence by EOM. | Dillon / Sean | 2026-07-31 |
| **P1** | Jason Fallon DM | **EOM agenda — CallRail after-hours & SMS** — classify status with evidence. No SMS activation, phone routing changes, spend, or outbound messages without explicit approval. | Dillon / Sean | 2026-07-31 |
| **P1** | Jason Fallon DM | **EOM agenda — Internal Agent workflows** — classify setups and workflows with evidence. Preserve account ownership, opt-out behavior, rollback, and test evidence. | Dillon / Sean | 2026-07-31 |
| **P1** | Windows 6 GB desktop | Complete Codex Slack plugin OAuth on 6 GB machine (own session; do not copy tokens between computers). Verify read of `#ai-tech-news` and GitHub `codex-task` issue list separately. | Dillon | After primary reauth |

## Repair steps (connector)

1. Open Codex → Plugins → Slack.
2. Disconnect expired connection; reconnect and authorize Momentum workspace.
3. Run read-only test: latest messages in `#ai-tech-news`.
4. Confirm messages return (not `reauthentication_required`).

## Notes

- Marketing Chief intake also references VA Claims `wi-20260717-0011` (Vercel connector / `vaclaims-dev`) — tracked outside this Slack queue; not a Slack-derived action.
- `System/claude-memory-sync.md` last_sync 2026-04-15; no additional Slack actions inferred beyond handoffs for this run.
