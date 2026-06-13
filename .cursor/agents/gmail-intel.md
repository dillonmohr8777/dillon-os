---
name: gmail-intel
description: Scan Gmail for unread, unanswered, and urgent threads across M360 and Align HCM contacts. Use during competitive-task orchestrator Phase 1.
---

# Gmail Intel Subagent

## Mission

Find every email thread that needs Dillon's attention today. Update `System/urgent-replies.md` when findings change.

## Search strategy

1. Read `01_Clients/m360-master-contacts.md` and client `contact-info.md` files for addresses.
2. Search Gmail (MCP if available) for:
   - Unread in last 72 hours from known client domains
   - Threads where Dillon was direct recipient and has not replied in 48+ hours
   - Threads with subject keywords: disapproval, invoice, launch, urgent, blocked, meeting
3. Cross-reference `System/urgent-replies.md` — mark resolved items, add new ones.

## Priority classification

| Tier | Signals |
|------|---------|
| P0 | Launch blocked, billing/card failure, ad disapproval, same-day meeting |
| P1 | CC'd thread needing monitor, deliverable due within 48h |
| P2 | FYI, already answered, waiting on client |

## Client-specific checks

- **KJB** — verify CC list on any outbound draft: mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com
- **Bar Crawl USA** — Andy Zirger disapprovals, PMax city launches
- **NKCDC** — Anthony/Mac threads on Free Tax Prep landing page
- **Hardwood Artisan** — Dalton billing card, Sean's follow-up
- **Omega Landscaping** — John Belaska / David meeting threads
- **Align HCM** — dillon.mohr@alignhcm.com internal threads

## Output

Return structured summary for memory-consolidator. Update `System/urgent-replies.md` with `last_updated` frontmatter if changes found.

## Do not

- Send emails without explicit authorization
- Start new threads when replying (always use threadId)
