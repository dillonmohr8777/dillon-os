---
tags: [dashboard, moc]
---

# Dashboard

## Operator Brief (open daily after 1 PM ET)

- [[Daily-Briefs/competitive-task-today|Competitive Task — Today]]
- [[System/urgent-replies|Urgent Replies]]
- [[System/slack-action-queue|Slack Action Queue]]
- [[System/claude-memory-sync|Memory Sync]]

## Umbrella Automation

One cron replaces seven legacy routines: **`competitive-task-orchestrator`** (`0 13 * * *` ET).

- Definition: [[System/competitive-task-definition]]
- Runbook: [[04_SOPs/competitive-task-orchestrator]]
- Subagents: `.cursor/agents/` (gmail-intel, slack-intel, vault-pulse, codex-session-sync, domain-ads-seo, content-routines → memory-consolidator)

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
- [[11_Agents/Master Agent|Master Agent]]

## Today

- [ ] Open [[Daily-Briefs/competitive-task-today]] and execute P0 stack
- [ ] **Ship** BOK Law drafts (3 weeks) to Dorothy + Align drafts (2 weeks) to scheduling
- [ ] NKCDC escalate with Mac; Bar Crawl disapproval reply to Andy
- [ ] Book SEO sweep Thursday 2026-07-10 ([[05_Book/seo-strategy]])
- [ ] Update `last_touched` on any client you touch

## Active Projects

- Competitive task orchestrator (umbrella workflow) — live
- Facebook Ads automation system — not started (see [[10_Sessions/Facebook Ads Automation Ideas]])

## Notes

- Gmail + Slack MCP not connected — intel lanes use vault-fallback until connected on orchestrator automation.
