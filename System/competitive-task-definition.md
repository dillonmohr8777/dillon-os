---
tags: [system, competitive-task, orchestrator]
last_updated: 2026-06-08
---

# Competitive Task Definition

## What "competitive task" means in Dillon OS

Your competitive task is **staying operationally ahead across every revenue and reputation surface** while running 25+ accounts, a full-time W2 role, and side projects — without dropping balls on billing, launches, or client trust.

It is not one client or one campaign. It is the **daily operating system** that keeps you competitive as an AI-native operator:

1. **Client velocity (Momentum 360)** — ads live, disapprovals cleared, launches unblocked, deliverables shipped, billing protected.
2. **Full-time execution (Align HCM)** — LinkedIn calendars, SmartCare content, SEO blogs, sales enablement on schedule.
3. **Direct / 1099 work (Buzz Bull, BOK Law, Florecita, CCA, etc.)** — content cadences and paid media without brand confusion.
4. **Growth assets (book, Mohr Media)** — SEO sweeps, email list growth, guest-post pipeline.
5. **Intelligence loop** — Gmail, Slack, vault, and Codex sessions folded into one prioritized stack.

## P0 tie-break order

When everything is urgent, rank in this order:

1. **Launch blocked** — external dependency you can unblock or escalate (e.g. NKCDC landing page).
2. **Billing risk** — card updates, invoice failures, engagement pause (e.g. Hardwood Artisan).
3. **Ad disapprovals** — policy flags stopping spend (e.g. Bar Crawl USA).
4. **Calendar** — hard meetings and client-facing commitments today.

## Operator rules (non-negotiable)

- **KJB emails** MUST CC: mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com
- **Align HCM** is full-time W2 — never counted as M360 client revenue
- **CCA / Buzz Bull** — be precise about which brand goes on client-facing sends

## Legacy crons replaced

| Legacy automation | Absorbed by agent |
| --- | --- |
| `nightly-client-pulse` | `vault-pulse` |
| `gmail-to-vault-digest` | `gmail-intel` |
| `vault-integrity-sync` | `memory-consolidator` |
| `chat-to-vault-sync` | `codex-session-sync` |
| `bok-law-social-content` | `content-routines` (Sunday branch) |
| `linkedin-growth-engine` | `content-routines` (Sunday branch) |
| `book-site-seo-sweep` | `domain-ads-seo` (Thursday branch) |

**One cron:** `competitive-task-orchestrator` — `0 13 * * *` (daily 1:00 PM UTC / 9:00 AM ET).
