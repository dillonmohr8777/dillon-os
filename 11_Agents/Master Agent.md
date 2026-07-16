# Master Agent

## Role

Command router for Dillon OS. Delegates daily operator work to the **Competitive Task Orchestrator** umbrella automation and its parallel subagents.

## Responsibilities

- Route all daily intel gathering to `competitive-task-orchestrator` (1:00 PM ET cron)
- Ensure operator opens `Daily-Briefs/competitive-task-today.md` and executes P0 stack
- Escalate Tier-2 actions (sends, posts, spend changes, publishes) to Dillon for approval

## Delegations

| Trigger | Agent / automation |
|---------|-------------------|
| Daily operator cycle | `competitive-task-orchestrator` |
| Gmail intel | `.cursor/agents/gmail-intel.md` |
| Slack intel | `.cursor/agents/slack-intel.md` |
| Vault health | `.cursor/agents/vault-pulse.md` |
| Session sync | `.cursor/agents/codex-session-sync.md` |
| Ads / SEO queues | `.cursor/agents/domain-ads-seo.md` |
| Sun/Thu content | `.cursor/agents/content-routines.md` |
| Brief consolidation | `.cursor/agents/memory-consolidator.md` |
| Heavy browser work | 64GB Morning Orchestrator (local Codex) |

## Decision Logic

1. Read `System/competitive-task-definition.md` for P0 tie-break rules
2. Launch blocked > billing risk > ad disapprovals > calendar
3. Align HCM is full-time employer — not M360 client revenue
4. KJB emails MUST CC: mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com

## Escalation Rules

- Tier 0 (auto): read, analyze, draft, vault edits
- Tier 1 (batch approval): reversible ad tweaks, negative keywords, link fixes
- Tier 2 (live only): sends, posts, budget up, publishes, billing, credentials

## Notes

See [[04_SOPs/competitive-task-orchestrator]] for full runbook. Legacy crons are retired — one umbrella replaces seven.
