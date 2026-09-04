# Daily Pulse — 2026-09-03

## Coverage Notes

- Scanned all 41 entries under `01_Clients/` (40 clients + `Client Index.md`) — 24 folder-based clients (`overview.md` + supporting notes) and 16 single-file clients — for `due` / `next_action` / `last_touched` frontmatter and open `- [ ]` tasks.
- Filesystem mtimes are still not usable as a signal (git-checkout artifact). Classification runs on `last_touched` frontmatter, cross-checked against `git log` on each client path — both agree: **nothing under `01_Clients/` has been touched since the 2026-08-17 vault-snapshot merge.**
- Zero open `- [ ]` tasks anywhere in `01_Clients/` — same as yesterday. No task-level signal to report.
- Re-ran `predict-work.js` with `--client-ops-root /home/user/client-operations-canonical` (the read-only checkout this session was given). Without that flag the script defaults to a Windows-only path and silently falls back to `client_operations_root_available: false` — that's why yesterday's run showed no queue candidates. With the correct root: `client_operations_root_available: true`, `canonical_queue_available: true`, source `client-operations://queue/work-items.json`, `deliverable_events_scanned: 28`, `active_queue_items_scanned: 16`, `queue_candidates_used: 6` (10 excluded as stale). Provenance/fingerprint: `b0d9571b093db41aff4d5238d64f60ca71f2424e3cbe1d8aa114fe4f4e4a0969`. Status is **not degraded** — full prediction below.
- `latest-chronos.json` fingerprint (`d58cc5d6…`) still does not match today's prediction fingerprint (`b0d9571b…`) — per instructions its holdout/forecast numbers stay excluded from ranking, shown only as a stale receipt.
- No Gmail/Slack access performed. Checked `00_Inbox/slack/` — the 4 notes there are all dated 2026-07-30 and were committed 2026-08-13; nothing new in the last 24h.

## Moving (touched < 48h)
None.

## Watch (2–7 days)
None.

## Stalled (7+ days untouched)
**All 40 clients.** No client's `last_touched` frontmatter falls inside 7 days — the freshest is 27 days stale. This is the same headline as yesterday's brief, now confirmed by `git log` directly on `01_Clients/`: the last commit touching any client file was the 2026-08-17 snapshot merge, 17 days ago. Sorted least-to-most stale.

| Days stale | Client | Evidence (`last_touched`) | Suggested next touch |
|---|---|---|---|
| 27d | Tags 2 Go | 2026-08-07 — map Google Ads access, confirm admin invite status. `due: 2026-08-08` (26d overdue) | Resolve the access-mapping blocker; oldest overdue item with the freshest touch |
| 33d | Fagan Painting | 2026-08-01 — settle AEO/GEO scope and price, prep proposal | Draft proposal for approval queue |
| 33d | Revive Systems | 2026-08-01 — inspect authorized LSA account, record verification stage | Check LSA verification status; queue also flags this blocked (see below) |
| 33d | Cindy May Christmas | 2026-08-01 — build from approved site package once video/newsletter/photo/Shopify deps clear. `due: 2026-09-01` (2d overdue) | Chase the four dependencies; see Due-adjacent note below |
| 33d | Omega Landscaping | 2026-08-01 — verify Wix/Ads/GoHighLevel roles, prep access request. `due: 2026-07-15` (50d overdue) | Draft access request for approval queue |
| 33d | Everyday Life Insurance | 2026-08-01 — confirm canonical registry disposition | Decide active vs. archive |
| 33d | Bridge Software Development | 2026-08-01 — next_action TBD (Overlay: approve Phase 1 roles/acceptance criteria) | Get Phase 1 approval decision |
| 33d | Bercos Popcorn | 2026-08-01 — obtain finished Shopify build/staging handoff | Ping for Shopify handoff status |
| 33d | AMI Cleaning | 2026-08-01 — verify HubSpot form routing, lead owner | Confirm HubSpot routing owner |
| 33d | Replenish | 2026-08-01 — reconcile Google Ads billing owner, wait on San Diego decision. `due: 2026-07-15` (50d overdue) | Chase billing-owner confirmation |
| 33d | NKCDC | 2026-08-01 — get leadership pick of Phase Two priorities | Follow up for leadership decision |
| 33d | Fresh Blends | 2026-08-01 — verify Google Ads pause/restart state | Confirm live pause status before touching budget |
| 33d | Pro Fence & Deck | 2026-08-01 — recheck Yelp/Apple Maps verification after wait period | Recheck verification status |
| 33d | Momentum 360 | 2026-08-01 — reconcile agency scorecard, resolve AI/CRM/attribution decisions | Reconcile scorecard |
| 33d | VA Claims | 2026-08-01 — convert Phase 2 backlog from David's approved direction | Draft Phase 2 backlog |
| 33d | BOK Law Firm | 2026-08-01 — maintain weekly content workflow, resolve geo/embargo guardrails | Prep this week's packet — predicted work package below |
| 33d | Capsule & Tonic | 2026-08-01 — confirm canonical registry disposition | Decide active vs. archive |
| 33d | Pritzker Law Group | 2026-08-01 — confirm podcast landing-page goal/host/destination/analytics/reviewer | Get outstanding confirmations from client |
| 35d | BigOrange Marketing | 2026-07-30 — prep Custom Home Builder pillar audit + Janice interview. `due: 2026-08-10` (24d overdue) | Queue flags this as its own item too (see below) — needs approval to move |
| 36d | 16 single-file clients (AWCI, Align HCM, Bend Plastic Surgery, Blissful Events, Bluegrass Janitorial, Bridge of Hope OTC, Buzz Bull, Coach B, Commercial Cleaners Alliance, Florecita, Hardwood Artisan, Jeff Hozias, Link Eze, Next Gen Solutions, PNW Pro Clean, Vanessa) | 2026-07-29 — all carry `next_action: TBD — needs human next action` | Still reads as parked/inactive roster, not active delivery — repeat flag from yesterday |
| 53d | Onsite Concrete, Kimberly James Bridal, Shadow HVAC, Hope Wellness Center | 2026-07-12. All share `due: 2026-07-15` (50d overdue) | Oldest active-detail clients; below the fresher stalls in priority |
| 54d | Bar Crawl USA | 2026-07-11 — QA/cleanup on event pages, repair hub listing. `due: 2026-07-15` (50d overdue). Queue also carries a paid-media-optimization item needing approval (below) | Oldest touch in the roster |

## Due in 48h
None. No client's `due` frontmatter falls between 2026-09-03 and 2026-09-05 — every dated `due` field is already in the past (see overdue markers above) or `none`. Closest miss: Cindy May Christmas, `due: 2026-09-01`, now 2 days overdue.

## Likely Next Work Packages

From `12_Brain/state/work-predictor/latest.json` (regenerated 2026-09-03T11:14:05Z, 35-day lookahead, 90-day history, canonical queue now attached). 7 candidates — 1 recurrence-pattern, 6 from the canonical `client-operations` queue.

**BOK weekly three-topic designed content kit** — `bok-law-firm`
- Evidence tier: `owner-verified-recurrence` · Confidence: 0.96 (`confirmed-pattern`)
- Predicted window: 2026-09-08 to 2026-09-10 (weekly)
- Expected deliverable: three topic-specific copy records; three ChatGPT-generated topic background images (no fabricated legal claims/text baked in); three branded template graphics (PNG + JPG); source/final PDFs with rendered-page inspection; copy/geography/dates/distinctions/image-count/Facebook-duplicate-check receipt
- First safe prep step: locate and fingerprint the newest source packet before drafting anything
- Gates: missing/conflicting packet, legal or geographic ambiguity, wrong Facebook page, duplicate schedule, or content outside the approved source

**BigOrange Marketing — website design/build** (`queue-wi-20260718-0001`) — confidence 0.86 (`likely`, canonical-queue), basis `past-due-needs_approval`
- Keep the completed private WordPress pilot and review draft unsent; get BigOrange's factual sign-off and the exact invoice recipient/due date/payment timing before publication.
- Gate: canonical work item wi-20260718-0001 still requires its recorded approval — this is an approval-queue item, not a prep task.

**Bar Crawl USA — paid media optimization** (`queue-wi-20260808-0003`) — confidence 0.86 (`likely`, canonical-queue), basis `needs-approval`
- Gate: budget/bidding/targeting/creative/billing/conversion-action changes all need explicit approval; wi-20260808-0003 still requires its recorded approval.

**Revive Systems — workflow automation system** (`queue-wi-20260717-0002`) — confidence 0.68 (`watch`), basis `when-gate-clears`
- Gate: blocked on a human Google OAuth consent gate for the HighLevel location; do not treat as ready to execute.

**Momentum 360 — data source integration** (`queue-wi-20260718-0003`) — confidence 0.68 (`watch`), basis `past-due-blocked`
- Gate: blocked on restoring CallRail membership + MFA/credential access; do not treat as ready to execute.

**Align HCM — data source integration** (`queue-wi-20260723-0005`) — confidence 0.68 (`watch`), basis `when-gate-clears`
- Gate: blocked on Align HubSpot/Microsoft reauthentication (MFA); do not treat as ready to execute.

**Tags 2 Go — research/audit/decision brief** (`queue-wi-20260807-0001`) — confidence 0.68 (`watch`), basis `when-gate-clears`
- Gate: blocked on restoring agency-admin Google Ads access; do not treat as ready to execute.

Reminder: this is planning evidence, not proof a request exists or a deadline is live. The BOK item is the only one with a safe, unblocked prep step today; the other 6 are either awaiting recorded approval or blocked on a human access/consent gate.

## Capacity Shadow

- Embedded `chronos_shadow` in today's `latest.json`: status `request-ready`, `planner_consumption_gate: false` — a workload-forecast request is packaged but not consumed by planning.
- Standalone `latest-chronos.json` receipt (fingerprint `d58cc5d6…`) still doesn't match today's prediction fingerprint (`b0d9571b…`) — excluded from ranking per instructions, shown for awareness only:
  - Baseline decision: `retain-deterministic-baseline-primary` (Chronos MAE 3.34 vs. trailing-7-day-mean MAE 3.06 — baseline still wins)
  - Holdout: single 14-observation window, `single_holdout_beats_best_baseline: false`, `repeated_holdouts: false`
  - Total-workload band (14-day horizon, stale receipt): p10 = 1.3, p50 = 15.0, p90 = 96.9 work packages
  - **Planner-consumption gate: false.** Not used to rank clients or reorder priorities today.

## Tomorrow's Priority Stack

1. **Prep the BOK weekly content-kit source packet.** The only candidate above with no approval or access gate in front of it — `owner-verified-recurrence` at 0.96 confidence, window opens 2026-09-08. Locate/fingerprint the newest packet now.
2. **Push the two approval-gated queue items into the approval queue if not already there.** BigOrange Marketing (website sign-off + invoice terms) and Bar Crawl USA (paid-media budget/targeting changes) both have `likely` (0.86) canonical-queue evidence but are stuck on recorded approvals — surfacing them costs nothing and unblocks real work the moment Dillon signs off.
3. **Force a human pass on why `01_Clients/` has had zero commits in 17 days.** Every one of 40 clients reads 27+ days stale and the canonical queue (once correctly pointed at) shows real live blockers (MFA gates, OAuth consent, CallRail access) that aren't reflected back into the vault's client notes. That gap between "queue knows about live blockers" and "client overview hasn't been touched since Aug 1" is the thing worth closing before this brief can reliably tell moving from stalled.
