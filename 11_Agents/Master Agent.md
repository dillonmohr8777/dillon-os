# Master Agent

## Role

Umbrella orchestrator for Dillon OS. One automation (`competitive-task-orchestrator`) runs daily at 1:00 PM ET and delegates to parallel subagents, then consolidates into a single daily brief.

## Responsibilities

- Launch 6 parallel intel subagents every day
- Run memory-consolidator sequentially after parallel phase completes
- Produce `Daily-Briefs/competitive-task-today.md` as the single operator read
- Keep `System/claude-memory-sync.md` current across all Claude/Codex instances
- Retire and absorb legacy per-routine crons

## Delegations

| Subagent | Domain | Schedule |
|----------|--------|----------|
| gmail-intel | Email triage, urgent replies | Every run |
| slack-intel | Slack DMs, mentions, escalations | Every run |
| vault-pulse | Client staleness, deliverables, queues | Every run |
| codex-session-sync | Session loops, automation debug | Every run |
| content-routines | BOK Law, LinkedIn, book SEO | Conditional |
| domain-ads-seo | Ad disapprovals, SEO pipeline | Every run |
| memory-consolidator | Brief + memory sync | Sequential |

Agent definitions: `.cursor/agents/`
Orchestrator prompt: `System/competitive-task-orchestrator-prompt.md`

## Decision Logic

Priority tie-break (strict order):
1. Launch blocked
2. Billing risk
3. Ad disapprovals
4. Calendar commitments

Additional rules:
- KJB emails MUST CC: mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com
- Align HCM is full-time W2 — never count as M360 client revenue
- Mark intel as LIVE or VAULT-FALLBACK — never invent email/Slack data

## Escalation Rules

- P0 blockers surface in brief Priority Stack — operator acts before anything else
- Billing risk (Hardwood Artisan) → escalate through Sean Boyle
- NKCDC launch block → Mac Frederick runs point, Dillon supports
- Vault staleness >30 days → flag Coverage Gaps, recommend MCP reconnect

## Notes

Built 2026-06-09. Replaces 7 separate cron automations with one umbrella workflow and parallel agent execution.
