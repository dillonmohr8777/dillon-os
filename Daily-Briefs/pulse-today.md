# Daily Pulse — 2026-09-07

## Coverage Notes

- Scanned all 38 entries under `01_Clients/` (37 clients + `Client Index.md`) — 22 folder-based clients (`overview.md` + supporting notes) and 15 single-file clients — for `due` / `next_action` / `last_touched` frontmatter and open `- [ ]` tasks.
- Roster is down 3 from the 2026-09-04 brief: Fagan Painting, Shadow HVAC, and Jeff Hozias were retired and archived to `_archive/01_Clients/` on 2026-09-05 (owner-confirmed retirements, `System/client-roster-reconciliation-2026-09-05.md`). No longer scanned here.
- Filesystem mtimes are not usable as a signal (git-checkout artifact — every file in this fresh clone shows the checkout timestamp). Classification runs on `last_touched` frontmatter, cross-checked against `git log` on `01_Clients/`. Git log is itself dominated by a single 2026-08-18 bulk-touch commit (repo-wide reorg, 2029 files) that isn't real client work, so `last_touched` frontmatter is the only trustworthy signal — and it agrees with the last three briefs: **nothing under `01_Clients/` has a `last_touched` inside 7 days.**
- Zero open `- [ ]` tasks anywhere in `01_Clients/` — unchanged. No task-level signal to report.
- Re-ran `predict-work.js` with `--client-ops-root /home/user/client-operations-canonical` (the read-only checkout this session was given; the script's own default is a Windows-only path and silently reports `client_operations_root_available: false` without the flag). With the correct root: `client_operations_root_available: true`, `canonical_queue_available: true`, source `client-operations://queue/work-items.json`, `deliverable_events_scanned: 28`, `active_queue_items_scanned: 16`, `queue_candidates_used: 6` (10 excluded as stale). Provenance/fingerprint: `b0d9571b093db41aff4d5238d64f60ca71f2424e3cbe1d8aa114fe4f4e4a0969`. **Status is not degraded** — full prediction below.
- `latest-chronos.json` fingerprint (`d58cc5d6…`, generated 2026-09-02) still does not match today's prediction fingerprint (`b0d9571b…`) — per instructions its holdout/forecast numbers stay excluded from ranking, shown only as a stale receipt.
- No Gmail/Slack access performed. Checked `00_Inbox/slack/` — the same 4 notes as the last brief, all dated 2026-07-30, nothing new in the last 24h.

## Moving (touched < 48h)
None.

## Watch (2–7 days)
None.

## Stalled (7+ days untouched)
**All 37 clients.** No client's `last_touched` frontmatter falls inside 7 days — the freshest is 31 days stale. Same headline as every recent brief; confirmed directly against `git log` on `01_Clients/`, whose only recent activity is the 2026-09-05 retirement commit (deletions, not new work). Sorted least-to-most stale.

| Days stale | Client | Evidence (`last_touched`) | Suggested next touch |
|---|---|---|---|
| 31d | Tags 2 Go | 2026-08-07 — map Google Ads access, confirm admin invite status. `due: 2026-08-08` (30d overdue) | Resolve the access-mapping blocker; oldest overdue item with the freshest touch |
| 37d | Cindy May Christmas | 2026-08-01 — build from approved site package once video/newsletter/photo/Shopify deps clear. `due: 2026-09-01` (6d overdue) | Chase the four dependencies; closest live overdue date in the roster |
| 37d | Omega Landscaping | 2026-08-01 — verify Wix/Ads/GoHighLevel roles, prep access request. `due: 2026-07-15` (54d overdue) | Draft access request for approval queue |
| 37d | Everyday Life Insurance | 2026-08-01 — confirm canonical registry disposition | Decide active vs. archive |
| 37d | Bridge Software Development | 2026-08-01 — next_action TBD (Overlay: approve Phase 1 roles/acceptance criteria) | Get Phase 1 approval decision |
| 37d | Bercos Popcorn | 2026-08-01 — obtain finished Shopify build/staging handoff | Ping for Shopify handoff status |
| 37d | AMI Cleaning | 2026-08-01 — verify HubSpot form routing, lead owner | Confirm HubSpot routing owner |
| 37d | Replenish | 2026-08-01 — reconcile Google Ads billing owner, wait on San Diego decision. `due: 2026-07-15` (54d overdue) | Chase billing-owner confirmation |
| 37d | NKCDC | 2026-08-01 — get leadership pick of Phase Two priorities | Follow up for leadership decision |
| 37d | Fresh Blends | 2026-08-01 — verify Google Ads pause/restart state | Confirm live pause status before touching budget |
| 37d | Pro Fence & Deck | 2026-08-01 — recheck Yelp/Apple Maps verification after wait period | Recheck verification status |
| 37d | Momentum 360 | 2026-08-01 — reconcile agency scorecard, resolve AI/CRM/attribution decisions | Reconcile scorecard |
| 37d | VA Claims | 2026-08-01 — convert Phase 2 backlog from David's approved direction | Draft Phase 2 backlog |
| 37d | BOK Law Firm | 2026-08-01 — maintain weekly content workflow, resolve geo/embargo guardrails | Prep this week's packet — predicted work package below, window opens tomorrow |
| 37d | Capsule & Tonic | 2026-08-01 — confirm canonical registry disposition | Decide active vs. archive |
| 37d | Pritzker Law Group | 2026-08-01 — confirm podcast landing-page goal/host/destination/analytics/reviewer | Get outstanding confirmations from client |
| 39d | BigOrange Marketing | 2026-07-30 — prep Custom Home Builder pillar audit + Janice interview. `due: 2026-08-10` (28d overdue) | Queue flags this as its own item too (see below) — needs approval to move |
| 40d | 15 single-file clients (AWCI, Align HCM, Bend Plastic Surgery, Blissful Events, Bluegrass Janitorial, Bridge of Hope OTC, Buzz Bull, Coach B, Commercial Cleaners Alliance, Florecita, Hardwood Artisan, Link Eze, Next Gen Solutions, PNW Pro Clean, Vanessa) | 2026-07-29 — all carry `next_action: TBD — needs human next action` | Still reads as parked/inactive roster, not active delivery — repeat flag |
| 57d | Onsite Concrete, Kimberly James Bridal, Hope Wellness Center | 2026-07-12. All share `due: 2026-07-15` (54d overdue) | Oldest active-detail clients; below the fresher stalls in priority |
| 58d | Bar Crawl USA | 2026-07-11 — QA/cleanup on event pages, repair hub listing. `due: 2026-07-15` (54d overdue). Queue also carries a paid-media-optimization item needing approval (below) | Oldest touch in the roster |

## Due in 48h
None. No client's `due` frontmatter falls between 2026-09-07 and 2026-09-09 — every dated `due` field is already in the past (see overdue markers above) or `none`. Cindy May Christmas (`due: 2026-09-01`) is now 6 days overdue — closest thing to a live deadline, but it's past-due, not upcoming.

## Likely Next Work Packages

From `12_Brain/state/work-predictor/latest.json` (regenerated 2026-09-07T11:13Z, 35-day lookahead, 90-day history, canonical queue attached). 7 candidates — 1 recurrence-pattern, 6 from the canonical `client-operations` queue. Unchanged in substance from the last brief.

**BOK weekly three-topic designed content kit** — `bok-law-firm`
- Evidence tier: `owner-verified-recurrence` · Confidence: 0.96 (`confirmed-pattern`)
- Predicted window: 2026-09-08 to 2026-09-10 (weekly) — opens **tomorrow**
- Expected deliverable: three topic-specific copy records; three ChatGPT-generated topic background images (no fabricated legal claims/text baked in); three branded template graphics (PNG + JPG); source/final PDFs with rendered-page inspection; copy/geography/dates/distinctions/image-count/Facebook-duplicate-check receipt
- First safe prep step: locate and fingerprint the newest source packet before drafting anything
- Gates: missing/conflicting packet, legal or geographic ambiguity, wrong Facebook page, duplicate schedule, or content outside the approved source

**BigOrange Marketing — website design/build** (`queue-wi-20260718-0001`) — confidence 0.86 (`likely`, canonical-queue), basis `past-due-needs_approval`
- Keep the completed private WordPress pilot and review draft unsent; get BigOrange's factual sign-off and the exact invoice recipient/due date/payment timing before publication.
- Gate: canonical work item wi-20260718-0001 still requires its recorded approval — this is an approval-queue item, not a prep task.

**Bar Crawl USA — paid media optimization** (`queue-wi-20260808-0003`) — confidence 0.8 (`likely`, canonical-queue), basis `needs-approval`
- Gate: budget/bidding/targeting/creative/billing/conversion-action changes all need explicit approval; wi-20260808-0003 still requires its recorded approval.

**Revive Systems — workflow automation system** (`queue-wi-20260717-0002`) — confidence 0.68 (`watch`), basis `when-gate-clears`
- Gate: blocked on a human Google OAuth consent gate for the HighLevel location; do not treat as ready to execute.

**Momentum 360 — data source integration** (`queue-wi-20260718-0003`) — confidence 0.68 (`watch`), basis `past-due-blocked`
- Gate: blocked on restoring CallRail membership + MFA/credential access; do not treat as ready to execute.

**Align HCM — data source integration** (`queue-wi-20260723-0005`) — confidence 0.68 (`watch`), basis `when-gate-clears`
- Gate: blocked on Align HubSpot/Microsoft reauthentication (MFA, portal 242825734); do not treat as ready to execute.

**Tags 2 Go — research/audit/decision brief** (`queue-wi-20260807-0001`) — confidence 0.68 (`watch`), basis `when-gate-clears`
- Gate: blocked on restoring agency-admin Google Ads access; do not treat as ready to execute.

Reminder: this is planning evidence, not proof a request exists or a deadline is live. The BOK item is the only one with a safe, unblocked prep step today, and its window opens tomorrow; the other 6 are either awaiting recorded approval or blocked on a human access/consent gate.

## Capacity Shadow

- Baseline decision: `retain-deterministic-baseline-primary` (from the 2026-09-02 receipt — Chronos has not beaten the simple baselines).
- Holdout result: 14 observations; Chronos MAE 3.34 / WAPE 93.6% vs. trailing-7-day-mean MAE 3.06 / WAPE 85.7% (baseline still wins) vs. persistence MAE 3.57 / WAPE 100%. p10–p90 coverage 0.57.
- Total 14-day workload band (shadow only): point 14.98, p10 1.34, p90 96.92 — wide enough to be a non-signal.
- Planner-consumption gate: **false**. Source fingerprint (`d58cc5d6…`, 2026-09-02) doesn't match today's prediction fingerprint (`b0d9571b…`) either — the receipt is 5 days stale relative to today's run. Not used to rank clients — shown as a capacity warning only: if the p90 tail is real, the portfolio could see up to ~97 work-package arrivals in 14 days, but nothing here is calibrated enough to act on.

## Tomorrow's Priority Stack

1. **BOK Law Firm weekly content packet** — the only unblocked, confirmed-pattern predicted work; window opens 2026-09-08, so today is fingerprint-the-source-packet time, not draft-and-ship time yet.
2. **Cindy May Christmas** — the one client with an actual overdue `due:` field (6 days overdue and climbing); chase the video/newsletter/photo/Shopify dependency chain before it slips further.
3. **BigOrange Marketing sign-off** — oldest approval-queue item (28 days overdue on its `due:` field) with a completed deliverable sitting idle; getting factual sign-off + invoice details unblocks it without needing new work.
