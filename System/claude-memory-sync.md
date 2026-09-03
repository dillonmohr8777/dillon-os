---
last_sync: 2026-09-03
evidence_window_start: 2026-08-14
tags: [system, memory, sync]
source_refs:
  - Daily-Briefs/competitive-task-today.md
  - Daily-Briefs/plan-2026-09-03.md
  - Daily-Briefs/pulse-today.md
  - System/operating-status.md
---

# Claude Memory Sync

Use `01_Clients/Client Index.md` as the canonical current roster. Do not use April
notes or file modified timestamps to infer active status.

## Active clients

Kimberly James Bridal; Omega Landscaping & Concrete; On-Site Concrete & Landscape;
Shadow Heating & Cooling; Replenish; Fagan Painting; Capsule & Tonic; Bar Crawl USA;
Revive Systems; Hope Wellness Center; Pro Fence & Deck; Everyday Life Insurance;
VA Claims; Bridge Software Development; Cindy May Christmas; BOK Law Firm; and other
routes in Client Index (`canonical_active_route_count: 23`).

## Separate lanes

- **Align HCM** — full-time employer, not M360 client revenue.
- **Mohr Media / book** — business build, not client delivery roster.

## Pending deliverables (operator-facing)

| Priority | Client / lane | Item | Window |
|----------|---------------|------|--------|
| P0 | Cindy May Christmas | Site launch — 4 deps | overdue since 2026-09-01 |
| P0 | Momentum 360 | 4 unanswered Slack asks | ~5 weeks stale |
| P1 | BOK Law Firm | Weekly three-topic content kit | 2026-09-08 – 2026-09-10 |
| P1 | Bar Crawl USA | Paid-media optimization | needs-approval |
| P1 | BigOrange Marketing | Website build publish | needs-approval |
| watch | Revive, M360 CallRail, Align HCM, Tags 2 Go | Canonical queue blocked on access gates | when-gate-clears |

## Unanswered / urgent

- M360 Slack quartet (see `System/slack-action-queue.md`)
- Cindy May launch dependencies
- Approval cards: Bar Crawl billing path, BigOrange sign-off + invoice

## Upcoming deadlines (7 days)

- **2026-09-08 – 09-10** — BOK weekly content kit (prep starts now)
- No hard `due:` fields inside 48h except overdue Cindy May

## Routing rules

- Require current evidence inside the rolling 21-day window before adding a client.
- Never restore a removed name from old Gmail or historical notes alone.
- Keep Replenish isolated from Fresh Blends.
- No send, publish, deploy, spend, or account mutation without approval.
- **Umbrella automation:** `competitive-task-orchestrator` at 1 PM ET replaces 8 legacy crons; Windows feeders supply morning briefs.
