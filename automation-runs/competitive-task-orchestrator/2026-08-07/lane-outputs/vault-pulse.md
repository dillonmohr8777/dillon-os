# Vault Pulse — 2026-08-07 (Run 2)

**Tier 0 read-only.** Scan time: 2026-08-07T13:07Z. Source: `01_Clients/*/overview.md`, root stubs, open `- [ ]` tasks, `frontmatter-validate`.

## Frontmatter health

| Metric | Value |
|---|---|
| Files validated | 38 |
| Complete | 38 |
| Incomplete | 0 |
| Validator status | `ok` |
| Report | `Daily-Briefs/frontmatter-report.md` |

Schema is healthy. **Content is not** — most actionable intel lives in frozen April overviews while root stubs were batch-reset 2026-07-29 to `TBD — needs human next action`.

## Coverage notes

- **14 clients with `overview.md`** — primary pulse source per vault-pulse contract.
- **3 folder clients without overview:** Buzz Bull, Florecita, Replenish (Replenish has `Google Ads Billing Block 2026-07-30.md` only).
- **22+ root `01_Clients/*.md` stubs** — `last_touched: 2026-07-29`, generic `next_action`. Conflict with richer `overview.md` bodies; **trust overview for competitive ranking**.
- **Filesystem mtime:** bulk touch `2026-08-07 13:02 UTC` across `01_Clients/` (environment sync). **Not client movement** — do not classify as moving.
- **Open checkbox tasks:** 8 total (Replenish billing block ×3, BigOrange pillar project ×5). No `- [ ]` tasks inside overview files (open items are narrative bullets only).
- **`Daily-Briefs/pulse-today.md`** last written 2026-04-15 — stale; not used for this run.

## At risk

| Client | Evidence | Competitive impact |
|---|---|---|
| **NKCDC** | `overview.md`: launch blocked on client's Free Tax Prep page; `due: 2026-04-16`; Mac nudged Anthony 2026-04-15, no response; first-month invoice out | **Launch blocked** — paid media cannot start; grant/invoicing exposure |
| **Hardwood Artisan** | `status: at_risk`; Sean card-update push 2026-04-07; `due: 2026-04-18`; Dalton "give me a few days" 2026-04-01, no follow-through | **Billing** — engagement pauses without card update; $150/mo retainer at risk |
| **Shadow HVAC** | `last_touched: 2026-03-02` (oldest); LSA background check reset confirmed 2026-03-02 then Gmail quiet; GBP cadence unverified | **Launch/ops** — LSA may not be live; GBP 4×/week cadence unconfirmed |
| **Link Eze** | `due: 2026-04-06` (**123+ days overdue**); enhanced conversions diagnostics + MFA cutoff; Presence/Interest targeting failure mode documented | **Technical debt** — conversion tracking + account security; wasted spend risk |
| **Commercial Cleaners Alliance** | `status: onboarding`; creatives + NexGen commitment from 2026-04-08 unaudited; `due: 2026-04-16` | **Deliverable** — Buzz Bull / M360 crossover; referral relationship with Mike Ross |
| **Fresh Blends / Replenish** | `overview.md`: launch 2026-04-13; `Replenish/Google Ads Billing Block 2026-07-30.md` — `status: blocked`, billing screen pending Mia | **Billing + launch** — campaigns cannot run until billing clears; GBP manager access for 5 kiosks open |
| **Bar Crawl USA** | 2 disapproved ads (Halloween/Fall language) 2026-04-15; Soulard budget pacing patched but capped ~$15–20/day; Taco & Tequila wave Apr 25 | **Revenue** — $950/mo account; event ticket velocity tied to ad health |

## Due in 48h

**Hard list (calendar, run date 2026-08-07):** none.

- **BigOrange Marketing** `due: 2026-08-10` — 72h out (watch, not 48h). Pillar audit + Janice interview for team review.
- **Vault `due` fields** are frozen April 2026 — all overdue by months. Do not treat as live deadlines without Gmail/Slack confirmation.

## Moving (<48h)

**None.** No `last_touched` within 48h on overview files. Filesystem mtimes reflect sync, not operator work.

## Watch (2–7d)

**None on overview `last_touched`.** Nearest fresh dates:

| Client | last_touched | Notes |
|---|---|---|
| BigOrange Marketing | 2026-07-30 | 8 days — just outside watch window; `due: 2026-08-10` creates deadline pressure |
| Bridge Software Development | 2026-07-29 | 9 days — discovery project; `next_action: TBD` |

## Stalled (7+d)

All overview clients except none qualify as **7+ days** since last_touched. Full roster:

| Client | last_touched | next_action (overview) | vault-stale |
|---|---|---|---|
| Shadow HVAC | 2026-03-02 | Confirm LSA cleared + live; resume GBP cadence | yes |
| Link Eze | 2026-04-05 | Enhanced conversions + MFA on 809-600-6448 | yes |
| Hardwood Artisan | 2026-04-07 | URGENT — card on file for 90 days | yes |
| Onsite Concrete | 2026-04-09 | Weekly Onsite × M360 call Thu 1pm ET | yes |
| Fresh Blends / Replenish | 2026-04-13 | Confirm 2026-04-13 launch pacing; first-week snapshot | yes |
| Omega Landscaping | 2026-04-14 | Chase David for drone footage; John meeting | yes |
| CCA | 2026-04-14 | Deliver CCA + NexGen creatives (2026-04-08 commit) | yes |
| Bok Law | 2026-04-14 | Weekly social cadence (Wed/Thu/Fri series) | yes |
| Jeff Hozias | 2026-04-14 | Launch Meta Ads with approved seller copy | yes |
| NKCDC | 2026-04-15 | URGENT — nudge Anthony on Free Tax Prep page | yes |
| Kimberly James Bridal | 2026-04-15 | Publish wedding dress timeline page; GA4/GSC check | yes |
| Bar Crawl USA | 2026-04-15 | Fix 2 disapproved ads; Soulard pacing | yes |
| Bridge Software Development | 2026-07-29 | TBD — needs human next action | no |
| BigOrange Marketing | 2026-07-30 | Pillar audit + Janice interview for Aug 10 review | no |

**Root stubs (22 clients):** uniform `last_touched: 2026-07-29` (9d stalled) with `TBD` next_action — placeholder layer, not operational signal.

## Vault staleness warning

| Signal | Count |
|---|---|
| Overviews with `last_touched` before 2026-05-01 | **12 / 14** (86%) |
| Overviews with actionable April Gmail intel | 12 |
| Overviews refreshed since July 2026 | 2 (Bridge, BigOrange) |
| Root stubs reset without narrative update | 22 |

**`last_touched` frozen at April 2026 for the active M360 roster.** Live Gmail/Slack is almost certainly ahead. Competitive orchestrator must not rank vault age as real stall without lane mirrors (gmail-intel, slack-intel).

### Dual-frontmatter conflict

| Layer | last_touched | next_action quality |
|---|---|---|
| `*/overview.md` | 2026-03-02 → 2026-07-30 | Rich, dated Gmail intel |
| `01_Clients/<Client>.md` stubs | 2026-07-29 (batch) | `TBD — needs human next action` |

Orchestrator should prefer **overview bodies** until stubs are reconciled or `/vault-compile` merges them.

## Open tasks (checkbox)

| Location | Open items |
|---|---|
| `Replenish/Google Ads Billing Block 2026-07-30.md` | 3 — billing screen, account clear, delivery verify |
| `BigOrange Marketing/Custom Home Builder Pillar Project.md` | 5 — audit, SEMrush/Moz, Janice interview, cluster map, staging package |

## P0 candidates from vault

1. **NKCDC** — launch blocked on client Free Tax Prep page (competitive: ads cannot bill/spend).
2. **Hardwood Artisan** — billing at risk; explicit `status: at_risk`.
3. **Shadow HVAC** — LSA/GBP cadence unverified since Mar 2026.
4. **Link Eze** — overdue enhanced-conversions + MFA diagnostics.
5. **CCA** — creatives + NexGen deliverable from 2026-04-08 commitment.
6. **Replenish billing block** (Jul 2026 note) — campaigns blocked pending Mia payment screen.
7. **BigOrange** — Aug 10 review checkpoint; only client with a near-term real `due` date.

## Clients without overview (blind spots)

| Client | What exists | Gap |
|---|---|---|
| Buzz Bull | Root stub + strategy notes | No overview; CCA overlap not linked in stub |
| Florecita | Root stub only | No scope/due in vault |
| Replenish | Billing block note | No overview; tied to Fresh Blends engagement |

---

*Generated by vault-pulse scout — competitive-task-orchestrator Run 2.*
