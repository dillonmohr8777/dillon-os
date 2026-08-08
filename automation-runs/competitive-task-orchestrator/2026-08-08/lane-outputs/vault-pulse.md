# Vault Pulse — Competitive Task Orchestrator Run 3

**Scout:** vault-pulse  
**Run date:** 2026-08-08  
**Reference:** `.cursor/agents/vault-pulse.md`  
**Clients scanned:** 14 (`01_Clients/*/overview.md`)

---

## Frontmatter health

| Metric | Value |
|--------|-------|
| Files validated | 38 |
| Complete | 38 |
| Incomplete | 0 |
| Validator status | ok |
| Last run | 2026-08-08T13:02:47Z |
| State file | `12_Brain/state/frontmatter-validate.json` |
| Report | `Daily-Briefs/frontmatter-report.md` |

All tracked client and brain frontmatter passes validation. No schema gaps blocking pulse classification.

---

## Classification summary

| Bucket | Count | Notes |
|--------|-------|-------|
| Moving (<48h) | 0 | No client `last_touched` within 48h of 2026-08-08 |
| Watch (2–7d) | 0 | Closest: BigOrange (9d), Bridge (10d) — both exceed 7d threshold |
| Stalled (7+d) | 14 | Entire roster |
| At risk | 1 | Hardwood Artisan (`status: at_risk`) |

---

## At risk

| Client | Evidence | Competitive impact |
|--------|----------|-------------------|
| **Hardwood Artisan** | `status: at_risk`; Sean pushing Dalton for card update (2026-04-07); engagement pauses if billing not updated; `due: 2026-04-18` long overdue | Revenue loss + M360 retention signal; GBP cadence may already be dark |
| **NKCDC** | Launch fully blocked on client shipping Free Tax Prep page; Mac checked in 2026-04-15, no Anthony response; invoice out | Grant-funded launch delay; competitor window on tax-prep season closing |
| **Shadow HVAC** | LSA background check reset 2026-03-02; Gmail quiet since; GBP cadence unverified | LSA impressions/revenue unrealized; local HVAC competitor ads running unopposed |
| **Link Eze** | Enhanced conversions diagnostics unresolved; MFA cutoff was 2026-04-06; `due: 2026-04-06` stale | Account enforcement risk; conversion tracking degraded → wasted ad spend |
| **Fresh Blends / Replenish** | Mia granted admin 2026-04-12 for CC billing; launch confirmed 2026-04-13 but vault never closed loop on spend verification | $500/mo engagement may be billing-blocked; 5-location PMax idle |
| **Commercial Cleaners Alliance** | Onboarding; creatives committed 2026-04-08 ("done with today") — delivery unconfirmed in vault | Buzz Bull cross-brand reputation; Mike Ross waiting on NexGen + CCA creatives |

---

## Due in 48h

| Client | Due | Next action |
|--------|-----|-------------|
| **BigOrange Marketing** | 2026-08-10 | Prepare Custom Home Builder pillar audit + Janice interview for team review |

> **Vault caveat:** 6 clients carry April `due` dates (NKCDC, CCA, Hardwood, Link Eze, Onsite, Bok Law). These are **overdue**, not upcoming — live Gmail/Slack may supersede vault dates. Treat as P0 backlog, not calendar due-soon.

---

## Stalled (7+d)

| Client | last_touched | Days stale | next_action |
|--------|--------------|------------|-------------|
| Shadow HVAC | 2026-03-02 | 159 | Confirm LSA cleared + live; resume GBP cadence check |
| Onsite Concrete | 2026-04-09 | 121 | Attend weekly Onsite x M360 call (date frozen at 2026-04-16) |
| Link Eze | 2026-04-05 | 125 | Resolve enhanced conversions diagnostics; confirm MFA on Ads account |
| Hardwood Artisan | 2026-04-07 | 123 | URGENT — card update or engagement pauses |
| Fresh Blends / Replenish | 2026-04-13 | 117 | Confirm 2026-04-13 launch pacing; first-week snapshot |
| Bok Law | 2026-04-14 | 116 | Continue weekly social content cadence |
| CCA | 2026-04-14 | 116 | Deliver CCA + NexGen creatives from 2026-04-08 commitment |
| Omega Landscaping | 2026-04-14 | 116 | Chase David for drone footage; confirm John Belaska meeting |
| Jeff Hozias | 2026-04-14 | 116 | Launch Meta Ads with approved seller/buyer copy |
| NKCDC | 2026-04-15 | 115 | URGENT — nudge Anthony on Free Tax Prep page (launch block) |
| Bar Crawl USA | 2026-04-15 | 115 | Resolve 2 disapproved ads; confirm Soulard budget pacing |
| Kimberly James Bridal | 2026-04-15 | 115 | Publish wedding dress timeline page; verify GA4/GSC indexing |
| BigOrange Marketing | 2026-07-30 | 9 | Prepare pillar audit + Janice interview for Aug 10 review |
| Bridge Software Development | 2026-07-29 | 10 | TBD — needs human next action (discovery/NDA project) |

---

## Vault staleness warning

**12 of 14 clients** have `last_touched` predating **2026-05-01** → flagged `vault-stale`.

Live Gmail, Slack, and operator memory are likely ahead of vault state for Momentum 360 accounts. Do not treat April `last_touched` / `due` fields as ground truth without a live-channel cross-check.

| vault-stale | last_touched |
|-------------|--------------|
| Shadow HVAC | 2026-03-02 |
| Onsite Concrete | 2026-04-09 |
| Link Eze | 2026-04-05 |
| Hardwood Artisan | 2026-04-07 |
| Fresh Blends / Replenish | 2026-04-13 |
| Bok Law | 2026-04-14 |
| CCA | 2026-04-14 |
| Omega Landscaping | 2026-04-14 |
| Jeff Hozias | 2026-04-14 |
| NKCDC | 2026-04-15 |
| Bar Crawl USA | 2026-04-15 |
| Kimberly James Bridal | 2026-04-15 |

**Not vault-stale:** BigOrange Marketing (2026-07-30), Bridge Software Development (2026-07-29).

---

## P0 candidates from vault

Explicit competitive-task flags for orchestrator ranking:

| Priority | Client | Issue | Vault signal |
|----------|--------|-------|--------------|
| **P0** | NKCDC | Launch block | Waiting on client Free Tax Prep page; Mac nudge unanswered; invoice out |
| **P0** | Hardwood Artisan | Billing | `status: at_risk`; card update overdue; pause imminent |
| **P0** | Shadow HVAC | LSA | Background check reset 2026-03-02; live status unconfirmed 159d |
| **P0** | Link Eze | Diagnostics | Enhanced conversions warning + MFA cutoff 2026-04-06 never closed |
| **P0** | Fresh Blends / Replenish | Billing / launch | CC entry delegated to Mia; launch spend never verified in vault |
| **P0** | BigOrange Marketing | Aug 10 review | `due: 2026-08-10` — pillar audit + Janice interview prep (2 days) |
| **P0** | CCA | Creatives due | 2026-04-08 delivery commitment unconfirmed; `due: 2026-04-16` overdue |

---

## Coverage notes

- Scanned all 14 `01_Clients/*/overview.md` files.
- Frontmatter validator run fresh on 2026-08-08 (0 incomplete).
- No `01_Clients` blind spots — full roster represented.
- Bridge Software Development is NDA/discovery (non-M360); stalled but not revenue-at-risk in the same sense as retainer accounts.
- Bok Law, Bar Crawl USA, KJB, Omega, Jeff Hozias are stalled with no explicit P0 flag but may have live work not reflected in vault.

---

*Generated by vault-pulse scout — Run 3, 2026-08-08*
