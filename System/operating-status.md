---
tags: [system, operating-status]
last_updated: 2026-07-12
callsign: D.I.L.L.O.N.
operator: Dillon Mohr
goal_label: ACTIVE CLIENTS
goal_current: 12
goal_target: 100
source_of_truth: C:\Users\dillo\repos\dillon-os
---

# Operating Status

Single source of truth: this vault (C:\Users\dillo\repos\dillon-os). All daily ops, briefs, approvals, and automation artifacts are rooted here.

## Snapshot (verified 2026-07-12)

- Vault root: `C:\Users\dillo\repos\dillon-os`
- Cursor loop: `System/cursor-takeover-report.md`, `cursor-optimization-backlog.md`, `cursor-work-log.md`
- Gateway PID: 20848 (0 conflicts/hr post 15:16 restart; heartbeat stale WARN — run `System/scripts/refresh-gateway-health.ps1`)
- OS Config: `System/OS Config.md` — primary_directive: ROAD TO 100 CLIENTS, goal_current 12 / 100
- Client Index: `01_Clients/Client Index.md` — lists M360, Software Dev, 1099, Direct, Past, Prospects
- Active M360 clients from Client Index (verified rates):
  - Bar Crawl USA — $950/mo — Google Ads, 20-city landing pages
  - Shadow HVAC — $250/mo — GBP 4x/week, Google Ads Search, LSA
  - Link Eze — $300/mo — Google Ads ecommerce
  - Omega Landscaping — $200/mo — GBP 4x/week, blogs, local SEO
  - Jeff Hozias — $200/mo — GBP 3x/week, Google Ads pending
  - Kimberly James Bridal — $300/mo — Google Ads, Squarespace SEO
  - Fresh Blends / Replenish — $500/mo — Paid media strategy
  - Hardwood Artisan — rate unknown — GBP + reports
  - Others: NKCDC, Onsite Concrete, Blissful Events ($500 project), Bridge of Hope OTC, Bok Law, Bluegrass Janitorial — rates unknown or project-based
- Full-time: Align HCM (not counted in client totals)
- Top 15 Opportunities: `00_Inbox/Top 15 Opportunities 2026-07-02.md`
- Urgent replies and memory sync seeded from Gmail routines (last updated 2026-04-15 entries, may be stale — needs fresh run)

## Current Focus

- ROAD TO 100 CLIENTS
- Cursor autonomous loop active 2026-07-12: guardrail agents populated, gateway health script added
- Preserve existing files; new System docs establish Company OS bones
- Daily briefing, gateway health, and approval queue now run as local-only Hermes cron jobs (workdir = dillon-os)

## System Files (Company OS)

- `System/operating-status.md` — this file, overall health and source-of-truth pointer
- `System/revenue-scorecard.md` — revenue skeleton, verified values only
- `System/automation-status.md` — automation / gateway / cron state
- `System/approval-queue.md` — draft actions requiring human approval (never auto-executed)
- `System/OS Config.md` — callsign, directive, goal tracking for HUD
- `System/routine-health.md` — legacy routine expectations (from 2026-04-15)
- `System/cursor-takeover-report.md` — verified repo/gateway inventory for Cursor loop
- `System/cursor-optimization-backlog.md` — ranked autonomous task queue
- `System/cursor-work-log.md` — evidence log for Cursor-implemented changes
- `System/scripts/refresh-gateway-health.ps1` — local gateway probe (appends gateway-health.md)
- `Daily-Briefs/pulse-today.md` — legacy daily pulse (last 2026-04-15)
- `Daily-Briefs/YYYY-MM-DD.md` — new daily briefs from Hermes job `dillon-daily-brief`

## Health Checks

- [ ] Verify Client Index rates against invoicing (Melissa) — some rates marked unknown
- [ ] Reconcile active client count (OS Config says 12, Client Index lists 14 M360 + others) — confirm canonical count
- [ ] Confirm source of truth for pending deliverables: `urgent-replies.md` vs `claude-memory-sync.md` vs new approval queue
- [ ] Ensure Daily-Briefs folder has dated briefs (check cron `dillon-daily-brief` output)

## Next Actions (manual, require approval if external)

- Review `revenue-scorecard.md` and fill verified MRR with invoicing evidence
- Review `automation-status.md` after gateway repair window
- Triage `approval-queue.md` weekly

## Cursor Takeover (2026-07-12 19:45 UTC)

- Report: `System/cursor-takeover-report.md` — stack inventory, MCP matrix, top 5 leverage items
- Gateway: PID 20848, 0 conflicts/hr since 15:16 restart; heartbeat stale ~29m — monitor
- Book site: `/api/dossier-leads` exists; MailerLite env **not configured** on Vercel (leads not captured)
- MCP gaps in Cursor: Composio, WordPress.com, Slack need OAuth (items added to approval-queue)
- Local git: Company OS init files still untracked — commit when Dillon approves

## Verification

- File created 2026-07-12 as part of Company OS init
- Cursor takeover audit completed 2026-07-12 19:45 UTC
- Preserves all existing files; does not invent business numbers
- Workdir for all automations: C:\Users\dillo\repos\dillon-os
