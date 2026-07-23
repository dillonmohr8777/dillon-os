---
tags: [dashboard, moc]
---

# Dashboard

## Operator Brief (open daily after 1 PM ET)

- **[[Daily-Briefs/competitive-task-today|Competitive Task Today]]** — P0 stack, urgent replies, content due
- [[System/urgent-replies|Urgent Replies]]
- [[System/slack-action-queue|Slack Action Queue]]
- [[System/routine-health|Routine Health]]

## Quick Links
- [[00_Inbox/Start Here|Start Here]]
- [[01_Clients/Client Index|Clients]]
- [[02_Campaigns/Campaign Index|Campaigns]]
- [[03_Content/Content Index|Content]]
- [[04_SOPs/SOP Index|SOPs]]
- [[05_Offers/Offer Index|Offers]]
- [[06_Personal/Personal Index|Personal]]
- [[09_Transcripts/Transcript Index|Transcripts]]
- [[10_Sessions/Session Index|Sessions]]

## Umbrella Automation

One cron replaces seven legacy automations:

| What | Where |
|------|-------|
| Definition | [[System/competitive-task-definition]] |
| Prompt | [[System/competitive-task-orchestrator-prompt]] |
| Runbook | [[04_SOPs/competitive-task-orchestrator]] |
| Subagents | `.cursor/agents/` (7 parallel + 1 consolidator) |
| Schedule | `0 13 * * *` (1:00 PM ET) |

## Today
- [ ] Execute P0 stack from competitive-task-today
- [ ] Ship BOK Jun/Jul backlog + publish Jul 23 Wisdom
- [ ] Align — overdue Maher + Joann + Jul 21 payroll post
- [ ] Bridge — capture Tori meeting outcome (10 days overdue)

## Active Projects
- Bridge Software Development — Tori decision capture
- BOK Law — content backlog ship
- Align HCM — LinkedIn post backlog
- Book site — email capture fix

## Notes
- Gmail + Slack MCP not connected — intel lanes on vault fallback
- Disable 7 legacy crons in Cursor UI if still active
