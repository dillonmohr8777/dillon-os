# Competitive Task — 2026-09-01

## Coverage

| Lane | Status | Notes |
| --- | --- | --- |
| Gmail | fallback | No live Gmail MCP in cloud run. Used `System/urgent-replies.md`, `01_Clients/Replenish/Google Ads Billing Block 2026-07-30.md`, approval queue. |
| Slack | fallback | No live Slack MCP. Scanned `00_Inbox/slack/` — 4 open items from 2026-07-30, all `status: new`. |
| Vault pulse | ok | 40/40 client notes pass frontmatter validation. Most active roster notes stale 31–52 days on `last_touched`. |
| Sessions | ok | `10_Sessions/Session Index.md` empty — no recent session exports promoted. |
| Ads/SEO | ok | Replenish billing block open; Bar Crawl disapprovals in approval queue; Tags 2 Go access mapping overdue. |
| Websites | ok | Fixture dry-run: 1 pass, 1 fail (fixture only). Live sites skipped in dry-run. |
| Outreach | ok | Radar 2026-09-01: 1298 tracked, 239 rebuild queue, +1 found today. |
| Content routines | skipped | Tuesday — Bok/Align LinkedIn (Sun) and book SEO (Thu) not due. |

Run artifacts: `automation-runs/competitive-task-orchestrator/2026-09-01/`

## P0 Stack

1. **Cindy May Christmas — launch due today** (`due: 2026-09-01`). Resolve video destination, newsletter, photo map, and Shopify prerequisites before build. Source: `01_Clients/Cindy May Christmas/overview.md`.
2. **Replenish — Google Ads billing block** (engagement at risk). Confirm Mia completed the payment screen; verify delivery after account clears. Separate from Fresh Blends. Source: `01_Clients/Replenish/Google Ads Billing Block 2026-07-30.md`.
3. **Tags 2 Go — overdue access mapping** (`due: 2026-08-08`, 24 days past). Map Google Ads access via Access Broker/Bitwarden before any audit or spend. Source: `01_Clients/Tags 2 Go/overview.md`.
4. **Momentum 360 — unanswered Slack automation ask** (Jason/Sean bot + case-status alerts, July 30). Draft bounded implementation plan with ETA — do not send until approved. Source: `00_Inbox/slack/2026-07-30-jason-sean-bot-case-status-alert.md`.
5. **Bar Crawl USA — ad disapprovals** (account health). Clear Halloween/Fall Cocktail disapprovals before next event push. Source: `System/approval-queue.md`.

## Urgent Replies

Draft only — external send remains approval-gated.

| Client / thread | Action | Source |
| --- | --- | --- |
| Replenish / Mia | Confirm billing screen reached and payment requirement cleared | Gmail thread ref in billing block note |
| Momentum / Jason & Sean | Status on bot stability + case-reinstated alerts | `00_Inbox/slack/2026-07-30-jason-sean-bot-case-status-alert.md` |
| Momentum / Melissa | Guidelines training prompt + Loom + meeting slot | `00_Inbox/slack/2026-07-30-melissa-guidelines-training-prompt.md` |
| Momentum / Jenny | Brand direction reply for needmomentum.com after Mac/Sean confirm | `00_Inbox/slack/2026-07-30-jenny-brand-direction.md` |
| Momentum / Sean | CallRail activity status with evidence | `00_Inbox/slack/2026-07-30-sean-callrail-status.md` |
| KJB | CC mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com on client emails | `System/writing-rules.md` |

## Stalled Clients (7+ days, active roster priority)

| Client | last_touched | Risk |
| --- | --- | --- |
| Bar Crawl USA | 2026-07-11 | Disapprovals + overdue deliverables |
| Hope Wellness Center | 2026-07-12 | Request analysis incomplete |
| Shadow HVAC | 2026-08-01 | Meta visibility + catch-up report to Mike |
| Fagan Painting | 2026-08-01 | Attribution repair before scale |
| KJB | 2026-07-12 | FAQ crop + appointment routing |
| BigOrange Marketing | 2026-07-30 | SEMrush pillar overdue (due 2026-08-10) |
| VA Claims | 2026-08-01 | Phase 2 portal demo overdue |

Full stall list spans 20+ notes — refresh `last_touched` when you touch an account.

## Outreach / Radar

- **1298** businesses tracked; **239** qualify for rebuild.
- Top decay scores are DNS-dead domains (score 94) — good site-factory candidates.
- Mac pipeline stage 7 (activate) still gated: Netlify token, mail vendor undecided.
- See `Daily-Briefs/radar-2026-09-01.md`.

## Content / SEO Due Today

None (content-routines skipped — not Sunday or Thursday).

## Tier 2 Queue Highlights

See `System/approval-queue.md` for full list. Highest-signal open approvals:

- Shadow HVAC site deploy + spend (after Meta verification)
- Bar Crawl 20 city pages auto-publish
- Ironic Ineptocracy `/api/dossier-leads` fix + tracking install
- Prospect Radar generated-stock boards (4 verticals)

## Tomorrow Prep

1. Wednesday client rotation — pick 3 stalled roster accounts and update `last_touched` + `next_action`.
2. If Replenish billing clears today, queue conversion verification pass.
3. Connect Gmail + Slack MCP on the automation for live intel (currently vault-fallback only).
4. Thursday: book SEO sweep lane activates automatically.
