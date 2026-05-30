---
tags: [system, automation, competitive-task]
last_updated: 2026-05-30
---

# Competitive Task Definition

**Competitive task** is Dillon's daily operating loop: stay ahead of client revenue, launches, replies, and deliverables across every channel that can block Momentum 360 work or Align HCM obligations.

It is **not** market competitive analysis (that lives under SEO and offer research). It is **execution competitiveness**: nothing urgent slips, nothing stalls without a named owner, and the vault stays aligned with Gmail, Slack, and Codex session output.

## In scope

| Lane | Source | Output |
|------|--------|--------|
| Inbox intel | Gmail MCP | Unanswered threads, calendar risks, CC-only monitors |
| Team intel | Slack MCP | Mentions, DMs, channel threads needing reply |
| Vault pulse | `01_Clients/`, `Daily-Briefs/` | Stalled clients, missing `due` / `next_action` |
| Codex / Cursor sessions | `10_Sessions/`, chat exports, session index | Open build threads, automation debug items |
| Content cadence | BOK Law, Align LinkedIn, book SEO | What is due this week by routine calendar |
| Ads & SEO domain | Client overviews, disapprovals, launches | P0 delivery and platform blockers |

## Priority stack (tie-break)

1. Launch blocked (landing page, access, policy)
2. Billing / card / engagement at risk
3. Ad disapprovals or account policy
4. Hard calendar commitments (meetings, creative delivery dates)
5. Unanswered client email >48h
6. Internal Slack / M360 leadership asks
7. Content routines (weekly social, LinkedIn, book SEO)
8. Vault hygiene (`last_touched`, memory sync)

## Non-goals

• Sending client email without explicit approval in the automation run (draft-only unless instructed)
• Align HCM work billed as M360
• Improvising Bar Crawl USA ad copy (pre-approved library only)

## Single automation

All former per-routine crons are **deprecated** in favor of one umbrella run:

• **Name:** `competitive-task-orchestrator`
• **Schedule:** `0 13 * * *` (daily 1:00 PM UTC)
• **Prompt file:** [[System/competitive-task-orchestrator-prompt]]
• **Daily read:** [[Daily-Briefs/competitive-task-today]]

## Required connectors

Enable on the automation (or parent agent):

• Gmail MCP (`gmail_search_messages`, thread reply metadata)
• Slack MCP (channels Dillon uses for M360 + Align)
• Vault repo access (this Obsidian git vault)
• Optional: Obsidian Local REST API when running against a live vault on desktop
