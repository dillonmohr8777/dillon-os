---
tags: [system, competitive-task, orchestrator]
last_updated: 2026-06-10
---

# Competitive Task Definition

Dillon's **competitive task** is not one client or one project. It is staying ahead across three domains that compete for the same hours every day:

## Three domains

| Domain | What it is | Success looks like |
|--------|-----------|---------------------|
| **M360 delivery** | Momentum 360 client accounts (Google/Meta ads, SEO, landing pages, reporting) | Launches ship, ads stay approved, billing current, clients hear from you before they chase |
| **Align HCM** | Full-time W2 employer — NOT a client, NOT M360 revenue | LinkedIn calendars ship, SEO blogs publish, SmartCare assets advance, leadership sees momentum |
| **Mohr Media + personal** | Side business ($40K / 5 months), book, DBA coursework, offers | Product pipeline moves, book SEO grows, revenue tasks don't get starved by client fire drills |

## What "competitive" means here

These domains **compete for attention**. A blocked NKCDC launch, a Hardwood Artisan billing risk, and a Sunday BOK Law content deadline can all be "urgent" at once. The orchestrator's job is to:

1. Pull signal from Gmail, Slack, vault, and Codex sessions in parallel
2. Rank by business impact, not inbox order
3. Produce one daily brief with a single priority stack
4. Update vault memory so every Claude/Cursor instance shares the same truth

## P0 tie-break order

When two items feel equally urgent, break ties in this order:

1. **Launch blocked** — client waiting on you or you waiting on client with revenue at stake (NKCDC, Fresh Blends)
2. **Billing risk** — card failures, pause threats (Hardwood Artisan)
3. **Ad disapprovals** — live revenue stopped (Bar Crawl USA)
4. **Calendar commitments** — hard meeting times (Onsite weekly, CCA Teams)
5. **Content cadence** — BOK Law (Sun→Tue), Align LinkedIn (Sun), book SEO (Thu)
6. **Everything else** — reports, optimizations, Mohr Media pipeline

## Operator rules (non-negotiable)

- **KJB emails** MUST CC: mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com
- **Align HCM** is full-time employment — exclude from M360 client counts and revenue totals
- **Source of truth**: Obsidian vault (`dillon-os`) + `System/claude-memory-sync.md`

## Legacy crons replaced

The umbrella `competitive-task-orchestrator` (daily 1:00 PM ET) replaces:

| Legacy cron | Absorbed by agent |
|-------------|-------------------|
| `nightly-client-pulse` | `vault-pulse` |
| `gmail-to-vault-digest` | `gmail-intel` |
| `vault-integrity-sync` | `memory-consolidator` |
| `chat-to-vault-sync` | `codex-session-sync` |
| `bok-law-social-content` | `content-routines` (Sunday branch) |
| `linkedin-growth-engine` | `content-routines` (Sunday branch) |
| `book-site-seo-sweep` | `domain-ads-seo` (Thursday branch) |

## Daily output

Read **`Daily-Briefs/competitive-task-today.md`** each morning (or after the 1 PM run).
