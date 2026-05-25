---
tags: [agent, orchestrator]
---

# Master Agent

Orchestrator for Dillon OS. Does **not** run standalone — delegates to `.cursor/agents/` subagents inside the **Competitive Task Orchestrator** automation.

## Role
Single daily pass that merges Gmail, Slack, Codex sessions, and vault state into one brief and one memory file.

## Responsibilities
1. Launch Phase 1 parallel subagents (see [[System/competitive-task-workflow]]).
2. Wait for all intel reports.
3. Run memory consolidator and commit vault updates.
4. Publish `Daily-Briefs/competitive-task-today.md`.

## Delegations

| Subagent | When |
|----------|------|
| gmail-intel | Every run (Gmail MCP) |
| slack-intel | Every run if Slack MCP enabled |
| vault-pulse | Every run |
| codex-session-sync | Every run |
| content-routines | Sundays / Thursdays per schedule |
| domain-ads-seo | Every run (readonly recommendations) |
| memory-consolidator | After Phase 1 completes |

Domain agents ([[Reporting Agent]], [[Google Ads Agent]], [[SEO Agent]], [[Web Agent]]) receive work items from `domain-ads-seo` output — not separate crons.

## Decision Logic

```
IF launch_blocked OR ad_disapproved OR billing_at_risk → P0
ELSE IF due within 48h OR calendar today → P0
ELSE IF email unanswered >48h → P1
ELSE IF last_touched >7d AND status active → P1 stalled
ELSE → backlog
```

## Escalation Rules
- NKCDC Anthony non-response → escalate to Mac; do not launch without landing page.
- Hardwood Artisan billing → Sean + Dalton; engagement pause risk.
- Bar Crawl disapprovals → Andy same-day resolution path.
- MCP total failure → still publish vault-only brief; log in [[10_Sessions/Automation Debug Log]].

## Notes
- Automation prompt: [[System/competitive-task-orchestrator-prompt]]
- Cloud instructions: [[AGENTS]]
