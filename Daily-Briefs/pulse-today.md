# Daily Pulse — 2026-09-02

## Coverage Notes

- Scanned all 40 client entries under `01_Clients/` — 24 folder-based clients (`overview.md` + supporting notes) and 16 single-file clients — for filesystem last-modified time, `due`/`next_action`/`last_touched` frontmatter, and open `- [ ]` tasks.
- **Filesystem last-modified time is not usable as a signal this run.** Every file in `01_Clients/` carries the identical mtime `2026-09-02T03:25:34 UTC` — a git-checkout artifact, not real edit history. Classification below runs entirely on the `last_touched` frontmatter field instead.
- **Zero open `- [ ]` tasks anywhere in `01_Clients/`.** No task-level signal to report; either work isn't tracked as checkboxes here or the board is genuinely clear.
- Predictive work file (`12_Brain/state/work-predictor/latest.json`, generated 2026-09-02T11:11:29Z) read as instructed — not re-run.
- `latest-chronos.json` fingerprint (`d58cc5d6…`) does **not** match the current prediction's fingerprint (`4f53cda1…`) — the file itself flags this ("not attached to this brief"). Per instructions, its holdout/forecast numbers are excluded from ranking and shown only as a stale receipt below.
- No Gmail or Slack access performed (out of scope for this run; only local `00_Inbox/slack/` vault files would have qualified, and none were referenced by client frontmatter).
- Blind spot inherited from the predictor: canonical client-operations queue was unavailable, so predictions rest on folder/deliverable evidence only, not a live queue.

## Moving (touched < 48h)
None. No client's `last_touched` frontmatter falls inside the last 2 days.

## Watch (2–7 days)
None. No client's `last_touched` frontmatter falls inside the 2–7 day window.

## Stalled (7+ days untouched)
All 40 clients. Nothing in the vault's own `last_touched` frontmatter shows a touch inside the last 26 days — that gap itself is the headline finding (see Tomorrow's Priority Stack). Sorted least-to-most stale within the 24 folder-based clients; the 16 single-file clients are grouped since they're identical in shape (skeleton note, no real next_action recorded).

| Days stale | Client | Evidence (`last_touched` / `next_action`) | Suggested next touch |
|---|---|---|---|
| 26d | Tags 2 Go | 2026-08-07 — "Map Google Ads access through Access Broker/Bitwarden, confirm admin invite status, then produce a redacted audit baseline before any rebuild." `due: 2026-08-08` (25 days overdue) | Resolve the access-mapping blocker; this is the freshest stalled item and has a blown due date |
| 32d | AMI Cleaning | 2026-08-01 — verify HubSpot form routing and lead owner | Confirm HubSpot routing owner |
| 32d | BOK Law Firm | 2026-08-01 — maintain approved weekly content workflow, resolve geo/embargo guardrails | See predicted work package below — content kit expected ~9/8 |
| 32d | Bercos Popcorn | 2026-08-01 — obtain finished Shopify build/staging handoff | Ping for Shopify handoff status |
| 32d | Capsule & Tonic | 2026-08-01 — confirm canonical registry disposition | Decide active vs. archive |
| 32d | VA Claims | 2026-08-01 — convert Phase 2 backlog from David's approved direction | Draft Phase 2 backlog |
| 32d | Bridge Software Development | 2026-08-01 — next_action TBD (Overlay note has real detail: approve Phase 1 roles/acceptance criteria) | Get Phase 1 approval decision |
| 32d | Revive Systems | 2026-08-01 — inspect authorized Local Services Ads account, record verification stage | Check LSA verification status |
| 32d | Everyday Life Insurance | 2026-08-01 — resolve missing decision context, confirm registry disposition | Decide active vs. archive |
| 32d | Cindy May Christmas | 2026-08-01 — build from approved site package once video/newsletter/photo/Shopify deps resolve. **`due: 2026-09-01` — already 1 day overdue.** | See Due in 48h below |
| 32d | Fresh Blends | 2026-08-01 — verify Google Ads pause/restart state | Confirm live pause status before touching budget |
| 32d | Omega Landscaping | 2026-08-01 — verify Wix/Ads/GoHighLevel roles, prep access request for approval | Draft access request for approval queue |
| 32d | NKCDC | 2026-08-01 — get leadership pick of Phase Two priorities | Follow up for leadership decision |
| 32d | Pro Fence & Deck | 2026-08-01 — recheck Yelp/Apple Maps verification after wait period | Recheck verification status |
| 32d | Fagan Painting | 2026-08-01 — settle AEO/GEO scope and price, prep proposal for approval | Draft proposal for approval queue |
| 32d | Momentum 360 | 2026-08-01 — reconcile agency-level scorecard, resolve AI/CRM/attribution decisions | Reconcile scorecard |
| 32d | Pritzker Law Group | 2026-08-01 — confirm podcast landing-page goal, form destination, analytics, reviewer | Get outstanding confirmations from client |
| 32d | Replenish | 2026-08-01 — reconcile Google Ads billing owner, wait on San Diego expansion decision. `due: 2026-07-15` (49 days overdue) | Chase billing-owner confirmation |
| 34d | BigOrange Marketing | 2026-07-30 — prep Custom Home Builder pillar audit + Janice interview. `due: 2026-08-10` (23 days overdue) | Schedule Janice interview |
| 35d | 16 single-file clients (AWCI, Align HCM, Bend Plastic Surgery, Blissful Events, Bluegrass Janitorial, Bridge of Hope OTC, Buzz Bull, Coach B, Commercial Cleaners Alliance, Florecita, Hardwood Artisan, Jeff Hozias, Link Eze, Next Gen Solutions, PNW Pro Clean, Vanessa) | 2026-07-29 — every one carries `next_action: TBD — needs human next action` | These read as parked/inactive roster entries, not active delivery threads. Worth a human pass to confirm active vs. archive rather than treating as daily-touch clients |
| 52d | Onsite Concrete, Kimberly James Bridal, Shadow HVAC, Hope Wellness Center | 2026-07-12 | Oldest active-detail clients; prioritize below the fresher stalls |
| 53d | Bar Crawl USA | 2026-07-11 — complete QA/cleanup on event pages, repair hub listing | Oldest touch in the whole roster |

## Due in 48h

- **Cindy May Christmas — `due: 2026-09-01`, already 1 day past.** Not a new deadline surfacing inside the window; it's already missed. Flagging because it's the only client whose recorded due date sits at the edge of "now." Blocked on video destination / newsletter connection / photo map / Shopify prerequisites per its own `next_action`.
- No other client carries a `due` date inside 2026-09-02 through 2026-09-04. Most `due` fields are either `none` or already weeks overdue (Tags 2 Go 8/8, BigOrange Marketing 8/10, Replenish 7/15) — those are stale-due, not upcoming-due, and are logged in the Stalled table above rather than repeated here.

## Likely Next Work Packages

From `12_Brain/state/work-predictor/latest.json` (generated 2026-09-02T11:11:29Z, 35-day lookahead, 90-day history). One candidate this cycle:

**BOK weekly three-topic designed content kit**
- Evidence tier: `owner-verified-recurrence`
- Confidence: 0.96 (`confirmed-pattern`)
- Predicted window: 2026-09-08 to 2026-09-10 (weekly basis)
- Expected deliverable: three topic-specific copy records; three ChatGPT-generated topic background images (no fabricated legal claims/text in the art); three branded template graphics (PNG + JPG); source/final PDFs with a rendered-page inspection set; a copy/geography/dates/distinctions/image-count/Facebook-duplicate-check receipt
- First safe preparation step: locate and fingerprint the newest source packet before drafting or generating anything — do not draft copy or images off a stale packet
- Gates (stop conditions, not authorization to act): missing/conflicting packet, legal or geographic ambiguity, wrong Facebook page, duplicate schedule, or content outside the exact approved source
- Reminder: this is planning evidence, not proof a request exists or a deadline is live — confirm against the actual weekly packet before treating it as real work

No other candidates were generated this cycle (`deliverable_events_scanned: 0`, `canonical_queue_available: false`) — the predictor is working off a thin evidence base.

## Capacity Shadow

- Embedded `chronos_shadow` block inside `latest.json`: status `request-ready`, `planner_consumption_gate: false` — a workload-forecast request is packaged but not yet consumed by planning.
- The standalone `latest-chronos.json` holdout/forecast receipt (fingerprint `d58cc5d6…`) does **not** match the current prediction's fingerprint (`4f53cda1…`), so per instructions it is excluded from today's ranking and shown only for awareness, not as live capacity guidance:
  - Baseline decision: `retain-deterministic-baseline-primary` (Chronos did not beat the trailing-7-day-mean baseline: MAE 3.34 vs. 3.06)
  - Holdout: single 14-observation window, `single_holdout_beats_best_baseline: false`, `single_holdout_quantile_calibration: false`, `repeated_holdouts: false`
  - Total-workload band (14-day horizon, stale receipt): p10 = 1.3, p50 = 15.0, p90 = 96.9 work packages — a very wide, low-confidence spread
  - **Planner-consumption gate: false.** Not used to rank clients or reorder priorities today, per instructions.

## Tomorrow's Priority Stack

1. **Confirm the Cindy May Christmas launch blockers.** It's the only client with a blown `due` date this close to today (2026-09-01, 1 day overdue) and the site package is implementation-ready — the fastest deliverable if video/newsletter/photo/Shopify dependencies clear.
2. **Prep the BOK weekly content-kit source packet.** `owner-verified-recurrence` at 0.96 confidence, window opens 2026-09-08 — the one safe prep step (locate/fingerprint the newest packet) can start now without waiting on the window.
3. **Force a human pass on the 16 parked single-file clients and the oldest stalls (Bar Crawl USA, Onsite Concrete, Kimberly James Bridal, Shadow HVAC, Hope Wellness Center).** Every client in the vault reads as 26+ days untouched by frontmatter — that's either a real backlog or a sign `last_touched` isn't being updated as work happens. Either way it blocks this brief from telling moving from stalled, and it's cheaper to fix once than to keep flagging.

**Kept out of the stack as gates, not priorities:** the BOK content kit is approval-gated on packet/Facebook-page/geography checks before anything ships; the Chronos capacity band is excluded from ranking per the `planner_consumption` gate.
