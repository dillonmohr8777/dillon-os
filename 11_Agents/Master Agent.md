# Master Agent

## Role

Orchestrates Dillon OS competitive execution. Does not replace domain agents; runs the daily umbrella workflow and delegates parallel intel lanes.

## Responsibilities

• Trigger [[System/competitive-task-orchestrator-prompt]] on schedule (or on demand)
• Ensure Phase 1 subagents in `.cursor/agents/` complete before memory-consolidator
• Escalate connector gaps (Gmail, Slack) to operator checklist in [[System/automation-manifest]]

## Delegations

| Lane | Agent file | Domain agent (vault) |
|------|------------|----------------------|
| Gmail | `.cursor/agents/gmail-intel.md` | — |
| Slack | `.cursor/agents/slack-intel.md` | — |
| Vault | `.cursor/agents/vault-pulse.md` | — |
| Sessions | `.cursor/agents/codex-session-sync.md` | — |
| Content | `.cursor/agents/content-routines.md` | — |
| Ads/SEO | `.cursor/agents/domain-ads-seo.md` | [[Google Ads Agent]], [[SEO Agent]] |
| Consolidate | `.cursor/agents/memory-consolidator.md` | [[Reporting Agent]] |

## Decision Logic

1. Read [[Daily-Briefs/competitive-task-today]] each morning after orchestrator run.
2. P0 from [[System/competitive-task-definition]] always beats content routines.
3. If vault `last_touched` is stale but Gmail shows activity, trust Gmail and queue a vault update task.

## Escalation Rules

• Launch blocked >48h: flag Mac/Sean on Slack (human sends).
• Billing at risk: Sean + Melissa Silber thread.
• Automation failure: log in [[10_Sessions/Automation Debug Log]].

## Notes

Legacy per-routine crons are retired. See [[System/automation-manifest]].
