---
note_type: daily_brief
brief_type: client_pulse
date: 2026-09-25
generated_by: client-pulse skill (automated morning brief)
---

# Client Pulse — 2026-09-25

## Coverage notes

- Scanned all 40 client records under `01_Clients/` (excluding `Client Index.md`): frontmatter (`updated`, `next_action`, `review_on`, `due`, `status`, `priority`) plus open `- [ ]` checklist items, across every `.md` file in each client's folder (or the single file, for flat-file clients).
- **Recency proxy caveat:** filesystem mtimes are useless (fresh container checkout stamps everything at clone time), so "last touched" is the most recent git commit date touching that client's path. This is vault-record staleness, not proof that no real work happened — work logged only in the canonical `client-operations` queue or done outside the vault won't move this number.
- By that proxy, **every client record in the vault is 10+ days stale** as of today. Newest touches: seven clients (Tags 2 Go, Puttery NYC, Nexla, Momentum 360, Deborah-Mara, Bridge Software Development, Bar Crawl USA) at 2026-09-15 (10 days), Omega Landscaping at 2026-09-14 (11 days). The remaining 32 clients (17 folder clients + 15 flat files) last moved 2026-09-09 (16 days). Nothing qualifies as "moving" (<48h) or "watch" (2–7 days) — this is the headline finding, not a scan failure.
- `predict-work.js` first ran against its default root (`~/Documents/Codex/projects/client-operations`, Windows-style path that doesn't exist in this container) and came back with 0 deliverable events / 0 queue items scanned (`client_operations_root_available: false`). Re-ran with `--client-ops-root /home/user/client-operations-canonical` (the read-only checkout provided for this session, never written to) and got real signal: 37 deliverable events, 16 active queue items scanned, 2 queue candidates used, 14 stale queue items correctly excluded. **Provenance:** `client_operations_root_available: true`, `canonical_queue_available: true`, source `client-operations://queue/work-items.json`, fingerprint `693b9367c315b82f1d0a249edeaf1c03ef413089b0ec5c76010b94484e44c1c4`. **Status: `ok`, not degraded.**
- `latest-chronos.json` fingerprint (`d58cc5d65bff84e252f6bbc2a506b73aab0178411b4a2c6993f53e5edba113d5`, generated 2026-09-02) does **not** match today's prediction fingerprint — chronos shadow is stale and excluded from this report entirely, not just downweighted. Its `planner_consumption` gate is also false, so it was never eligible to rank clients regardless.
- Blind spot: 15 of the 40 client files are flat single-page records with no `next_action`/`priority` frontmatter at all (marked "TBD — needs human next action" below) — invisible to automated triage until someone fills them in.
- No `00_Inbox/slack/` notes from the last 24 hours (newest is 2026-09-02) — nothing to fold in as candidate tasks.
- Standing data gap, not fixed here per "keep changes to what the task asks": `Align HCM.md` still carries `status: active` despite CLAUDE.md stating that engagement ended, confirmed 2026-09-02.

## Moving

None. No client record changed in the last 48 hours by the recency proxy above.

## Watch (2–7 days)

None. No client record changed in the 2–7 day window.

## Stalled (7+ days untouched)

All 40 clients. Ranked by staleness, high-signal ones first:

| Client | Days stale | Suggested next touch |
|---|---|---|
| Tags 2 Go | 10 | Map Google Ads access via Access Broker/Bitwarden; confirm agency admin invite need |
| Puttery NYC | 10 | Rotate/verify Tock role credential, approve durable HTTPS host, register Reservation Webhook |
| Nexla | 10 | Confirm exact budget, landing pages, primary conversion action, Google Ads vs. GA4 tracking |
| Momentum 360 | 10 | Reconcile the agency-level operating scorecard while preserving separate client records |
| Deborah-Mara | 10 | No `next_action` set — needs one |
| Bridge Software Development | 10 | Approve Phase 1 roles, verification meaning, priority journeys, ownership, acceptance criteria |
| Bar Crawl USA | 10 | Complete QA/cleanup for confirmed Boos & Booze city/event pages; repair current-event hub listing |
| Omega Landscaping | 11 | Put lead fields into Momentum's own Zapier account — client-contact path is dead (confirmed 2026-09-14) |
| AMI Cleaning | 16 | Verify HubSpot form routing and a named production-lead owner |
| BOK Law Firm | 16 | Maintain approved weekly content workflow; resolve geographic/embargo guardrails |
| Bercos Popcorn | 16 | Obtain finished Shopify site/staging handoff, then run launch/SEO/conversion QA |
| BigOrange Marketing | 16 | Prepare Custom Home Builder pillar audit and Janice interview (overdue `due`: 2026-08-10) |
| Capsule & Tonic | 16 | Confirm canonical registry disposition before promoting any dated campaign evidence |
| Cindy May Christmas | 16 | Resolve video/newsletter/photo-map/Shopify dependencies (overdue `due`: 2026-09-01) |
| Everyday Life Insurance | 16 | Resolve missing decision context; confirm canonical registry disposition |
| Fresh Blends | 16 | Verify live Google Ads pause/restart state; restore separate store-level reporting |
| Hope Wellness Center | 16 | Complete deeper request analysis; decide on graphic-design support; close GBP/reporting follow-up |
| Kimberly James Bridal | 16 | Fix desktop FAQ image crop, QA breakpoints, reconcile appointment routing |
| NKCDC | 16 | Get leadership selection of 2–3 Phase Two priorities; define audience/offer/owner/path |
| Onsite Concrete | 16 | Complete allowlisted technical crawl; standardize entity/NAP signals |
| Pritzker Law Group | 16 | Confirm podcast landing-page conversion goal, host, form destination, analytics property |
| Pro Fence & Deck | 16 | Recheck Yelp/Apple Maps verification after wait period; escalate if still blocked |
| Replenish | 16 | Reconcile Google Ads billing owner; wait for verified San Diego expansion decision |
| Revive Systems | 16 | Inspect authorized Local Services Ads account; record verification stage/owner/blocker (priority: urgent) |
| VA Claims | 16 | Convert David's approved direction into a prioritized Phase 2 backlog |
| AWCI, Align HCM, Bend Plastic Surgery, Blissful Events, Bluegrass Janitorial, Bridge of Hope OTC, Buzz Bull, Coach B, Commercial Cleaners Alliance, Florecita, Hardwood Artisan, Link Eze, Next Gen Solutions, PNW Pro Clean, Vanessa | 16 | No `next_action`/`priority` frontmatter — flat files, "TBD — needs human next action" |

## Due in 48h

None due forward. Four records carry **overdue** `review_on`/`due` dates recent enough to be a live signal (the batch of clients pinned to the generic 2026-08-08 `review_on` default is excluded as noise):

| Client | Field | Date | Days overdue |
|---|---|---|---|
| Nexla | review_on | 2026-08-31 | 25 |
| Cindy May Christmas | due | 2026-09-01 | 24 |
| Puttery NYC | review_on | 2026-09-09 | 16 |
| Tags 2 Go | review_on | 2026-09-20 | 5 |

## Likely next work packages

From `_os/automation/bin/predict-work.js` (re-run against `/home/user/client-operations-canonical`, status `ok`, not degraded):

1. **BOK Law Firm — weekly three-topic designed content kit**
   - Evidence tier: `owner-verified-recurrence` · Confidence: 0.96 (`confirmed-pattern`)
   - Predicted window: 2026-09-29 to 2026-10-01 (weekly basis)
   - Deliverable: three designed topics + three ChatGPT-generated topic background images + branded PNG/JPG template graphics + source/final PDFs + a copy/geography/image-count/Facebook-duplicate-check receipt
   - First safe preparation step: locate and fingerprint the newest source packet before drafting or generating any images — do not touch topics/copy until that packet is confirmed
   - Human gate: missing/conflicting packet, legal/geographic ambiguity, wrong Facebook page, duplicate schedule, or content outside the approved source

2. **BigOrange Marketing — confirm paid-trial scope and compensation** (queue item `wi-20260718-0001`)
   - Confidence: 0.86 · Basis: `past-due-needs_approval` (no predicted window — this is a stuck queue item, not a forecast)
   - Gate: canonical work item still requires its recorded approval before any further preparation is appropriate

3. **Momentum 360 — restore CallRail/Track 360 data source integration** (queue item `wi-20260718-0003`)
   - Confidence: 0.68 · Basis: `past-due-blocked`
   - Gate: blocked on restoring CallRail membership access; no predicted preparation appropriate until the block clears

Only #1 has a genuine forward-looking window and clean evidence tier; #2 and #3 are past-due queue items surfacing as "likely" because they're stuck, not because new work is imminent — treat them as escalation candidates, not prep candidates.

## Capacity shadow

**Excluded this run.** `latest-chronos.json` fingerprint does not match today's prediction fingerprint (stale from 2026-09-02 vs. today's 2026-09-25 run against live canonical data). Per the skill's freshness rule, a mismatched chronos file is not read for the shadow band. Separately, even the stale file has no `planner_consumption` gate set true, so it was never eligible to rank clients. No capacity shadow to report today — this needs the chronos job re-run against current data before it's usable again.

## Tomorrow's priority stack

1. **BOK Law Firm weekly content kit prep** — confirmed-pattern, 0.96 confidence, window opens 2026-09-29. Highest-quality, least-ambiguous piece of forward work on the board; start the source-packet fingerprint step now so it isn't a scramble next week.
2. **Overdue review/due dates: Nexla (25d), Cindy May Christmas (24d), Puttery NYC (16d)** — each has blown past its own stated review checkpoint, and each has a concrete `next_action` already written down (budget/tracking confirmation, dependency resolution, credential rotation). The blocker reads as a decision/approval, not missing information.
3. **Momentum 360 agency-level scorecard** — last touched 10 days ago; the reconciliation `next_action` (agency scorecard + AI/CRM/call-attribution/product-rollout decisions) has been sitting the longest of any internal-facing record.

Kept out of the stack (approval-gated or blocked, not actionable prep): BigOrange Marketing trial scope confirmation (needs approval) and Momentum 360 CallRail restoration (blocked) — see Likely next work packages above.
