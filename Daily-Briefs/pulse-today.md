---
note_type: daily_brief
brief_type: client_pulse
date: 2026-09-23
generated_by: client-pulse skill (automated morning brief)
---

# Client Pulse — 2026-09-23

## Coverage notes

- Scanned all 40 client records under `01_Clients/` (excluding `Client Index.md`): frontmatter (`updated`, `next_action`, `review_on`, `due`, `status`, `priority`) plus open `- [ ]` checklist items, across every `.md` file in each client's folder (or the single file, for flat-file clients).
- **Recency proxy caveat:** filesystem mtimes are useless here (fresh container checkout stamps everything at clone time), so "last touched" is the most recent of (a) the latest git commit date touching that client's path and (b) any `updated`/`last_touched` frontmatter value. This is a proxy for *when the vault record last changed*, not necessarily for when real client work happened — work logged only in the canonical `client-operations` queue or done outside the vault won't move this number. Treat the classification below as vault-record staleness, not a claim that nothing happened for these clients.
- By that proxy, **every client record in the vault is 8+ days stale** as of today (newest touch: 2026-09-15, three clients touched 2026-09-14/15; the bulk of the roster last moved 2026-09-07). Nothing qualifies as "moving" (<48h) or "watch" (2–7 days) under the skill's thresholds — this is itself the headline finding, not a scan failure.
- `predict-work.js` initially ran against the wrong default root (`~/Documents/Codex/projects/client-operations`, which doesn't exist in this container) and came back with 0 events scanned. Re-ran with `--client-ops-root /home/user/client-operations-canonical` (the read-only checkout provided for this session) and got real signal: 31 deliverable events, 16 active queue items scanned, 2 queue candidates used, 14 stale queue items correctly excluded. Provenance: `client_operations_root_available: true`, `canonical_queue_available: true`, source `client-operations://queue/work-items.json`, fingerprint `de4391c8...945`.
- `latest-chronos.json` fingerprint (`d58cc5d6...5`, generated 2026-09-02) does **not** match today's prediction fingerprint (`de4391c8...945`) — chronos shadow is stale and excluded from this report entirely, not just downweighted. `planner_consumption` gate was also `false` in that stale file, so it was never eligible to rank clients regardless.
- Blind spot: 15 of the 40 client files are flat single-page records with no `next_action`/`priority` frontmatter at all (marked "TBD — needs human next action" below) — these are invisible to any automated triage until someone fills them in.

## Moving

None. No client record changed in the last 48 hours by the recency proxy above.

## Watch (2–7 days)

None. No client record changed in the 2–7 day window.

## Stalled (7+ days untouched)

All 40 clients. Ranked by staleness, high-signal ones first:

| Client | Days stale | Priority | Next action on file |
|---|---|---|---|
| Bar Crawl USA | 8 | high | Repair confirmed-event schema and hub inventory, then connect city/theme demand to verified tickets |
| Bridge Software Development | 8 | high | Approve Phase 1 roles, verification meaning, priority journeys, ownership, acceptance criteria |
| Deborah-Mara | 8 | — | No next_action set |
| Momentum 360 | 8 | high | Create agency-level operating scoreboard and decision ledger (14 open checklist items — most of any client) |
| Nexla | 8 | high | Confirm exact budget, landing pages, primary conversion action, Google Ads vs. GA4 tracking |
| Puttery NYC | 8 | high | Rotate/verify Tock role credential, approve durable HTTPS host, register Reservation Widget |
| Tags 2 Go | 8 | standard | Map Google Ads access via Access Broker/Bitwarden; confirm agency admin invite need |
| Omega Landscaping | 9 | high | Reconcile Google-counted event to a named call/form/inbox/CRM record before budget or Search changes |
| AMI Cleaning | 16 | high | Verify secure HubSpot form routing and a named production-lead owner before expanding acquisition |
| BOK Law Firm | 16 | medium | Connect approved content calendar to legal-service demand, geography, consultation patterns |
| Bercos Popcorn | 16 | high | Obtain current Shopify build and confirmed engagement scope before creating the launch plan |
| BigOrange Marketing | 16 | high | Complete custom-home-builder pillar audit; define authorized WordPress/Semrush scope |
| Capsule & Tonic | 16 | — | Confirm canonical registry disposition before promoting any dated campaign |
| Cindy May Christmas | 16 | medium | Resolve video/newsletter/image/Shopify/destination dependencies (overdue `review_on`: 2026-09-01) |
| Everyday Life Insurance | 16 | — | Resolve missing decision context; confirm canonical registry status |
| Fresh Blends | 16 | medium | Keep all four Ice Box campaigns paused until restart authority, store scope, measurement resolved |
| Hope Wellness Center | 16 | high | Obtain leadership/clinical decisions; repair contact/eligibility/homepage issues |
| Kimberly James Bridal | 16 | high | Reconcile qualified Meta form through stylist contact and booked appointment |
| NKCDC | 16 | high | Secure leadership selection of 2–3 Phase Two priorities; define exact audience |
| Onsite Concrete | 16 | high | Reconcile six Google-counted events to named contacts/qualified estimates before reallocating |
| Pritzker Law Group | 16 | high | Confirm approved podcast facts, conversion goal, form destination, analytics property |
| Pro Fence & Deck | 16 | high | Verify production website, logo, service area, offer, CTA, contact route, real proof |
| Replenish | 16 | high | Preserve store-level separation; validate direction intent against approved business outcomes |
| Revive Systems | 16 | high | Map authorized HighLevel access; implement/verify entry-offer-to-VIP journey |
| VA Claims | 16 | high | Refresh Phase 2 backend/decision status; reconcile portal with approved plan |
| AWCI, Align HCM, Bend Plastic Surgery, Blissful Events, Bluegrass Janitorial, Bridge of Hope OTC, Buzz Bull, Coach B, Commercial Cleaners Alliance, Florecita, Hardwood Artisan, Link Eze, Next Gen Solutions, PNW Pro Clean, Vanessa | 16 | — | No `next_action`/`priority` frontmatter — flat files, "TBD — needs human next action" |

Note: `Align HCM.md` is carrying an active-looking record despite CLAUDE.md stating that engagement ended 2026-09-02 — flagging as a data-gap follow-up, not fixing it here per the "keep changes to what the task asks" rule.

## Due in 48h

None due forward. But four records carry **overdue** `review_on`/`due` dates that predate today — these are more urgent than "stalled" implies:

| Client | Field | Date | Days overdue |
|---|---|---|---|
| Nexla | review-type date | 2026-08-31 | 23 |
| Cindy May Christmas | review-type date | 2026-09-01 | 22 |
| Puttery NYC | review-type date | 2026-09-09 | 14 |
| Tags 2 Go | review-type date | 2026-09-20 | 3 |

## Likely next work packages

From `_os/automation/bin/predict-work.js` (re-run against `/home/user/client-operations-canonical`, status `ok`, not degraded):

1. **BOK Law Firm — weekly three-topic designed content kit**
   - Evidence tier: `owner-verified-recurrence` · Confidence: 0.96 (`confirmed-pattern`)
   - Predicted window: 2026-09-29 to 2026-10-01 (weekly basis)
   - Deliverable: three designed topics + three ChatGPT-generated topic background images + branded PNG/JPG template graphics + source/final PDFs + a copy/geography/image-count/Facebook-duplicate-check receipt
   - First safe preparation step: locate and fingerprint the newest source packet before drafting or generating any images — do not touch topics/copy until that packet is confirmed
   - Human gate: missing/conflicting packet, legal/geographic ambiguity, wrong Facebook page, duplicate schedule, or content outside the approved source

2. **BigOrange Marketing — website design/build** (queue item `wi-20260718-0001`)
   - Confidence: 0.86 · Basis: `past-due-needs_approval` (no predicted window — this is a stuck queue item, not a forecast)
   - Gate: needs approval before any further preparation is appropriate

3. **Momentum 360 — data-source integration** (queue item `wi-20260718-0003`)
   - Confidence: 0.68 · Basis: `past-due-blocked`
   - Gate: blocked — no predicted preparation appropriate until the block clears

Only #1 has a genuine forward-looking window and clean evidence tier; #2 and #3 are past-due queue items surfacing as "likely" because they're stuck, not because new work is imminent — treat them as escalation candidates, not prep candidates.

## Capacity shadow

**Excluded this run.** `latest-chronos.json` fingerprint does not match today's prediction fingerprint (stale from 2026-09-02 vs. today's 2026-09-23 run against live canonical data). Per the skill's freshness rule, a mismatched chronos file is not read for the shadow band. Separately, even the stale file's `planner_consumption` gate was `false`, so it was never eligible to rank clients. No capacity shadow to report today — this needs the chronos job re-run against current data before it's usable again.

## Tomorrow's priority stack

1. **BOK Law Firm weekly content kit prep** — confirmed-pattern, 0.96 confidence, window opens 2026-09-29. Highest-quality, least-ambiguous piece of forward work on the board; start the source-packet fingerprint step now so it isn't a scramble next week.
2. **Overdue review dates: Nexla (23d), Cindy May Christmas (22d), Puttery NYC (14d)** — these aren't just stale, they've blown past their own stated review checkpoints. Each has a concrete, high-priority `next_action` already written down (budget/tracking confirmation, dependency resolution, credential rotation) — the blocker looks like a decision/approval, not missing information.
3. **Momentum 360 — 14 open checklist items, highest of any client** — the agency-level scoreboard/decision-ledger next_action has been sitting since the last touch 8 days ago; it's the internal-facing record with the most accumulated unfinished work.

Kept out of the stack (approval-gated or blocked, not actionable prep): BigOrange Marketing website build (needs approval) and Momentum 360 data-source integration (blocked) — see Likely next work packages above.
