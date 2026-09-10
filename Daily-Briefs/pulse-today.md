# Daily Pulse — 2026-09-10

## Coverage Notes

- Scanned all 38 entries under `01_Clients/` (37 clients + `Client Index.md`) — 22 folder-based clients (`overview.md` + supporting notes) and 15 single-file clients — for `due` / `next_action` / `last_touched` frontmatter and open `- [ ]` tasks.
- `git pull` was NOT already current: local `main` was 16 commits behind (`698deea6..fa2e372f`), including a detached-HEAD state from container init. Fast-forwarded cleanly onto `origin/main` at session start — no conflicts, no reconciliation needed beyond the merge itself.
- Filesystem mtimes are unusable as a signal (git-checkout artifact — every file in this clone shares the same checkout timestamp). Classification runs on `last_touched` frontmatter, cross-checked against `git log` on `01_Clients/` to catch real work the frontmatter hasn't caught up to.
- That cross-check found one real signal: **Momentum 360**'s last real commit is still 2026-09-08 (21:39 local / 2026-09-09 01:39 UTC) — the same `#386`/`#387` work from yesterday's brief (AI Division library archive + delivered Drive assets). No new Momentum commits landed overnight, but at ~33.6h old it's still inside the 48h moving window today — last day it will read that way unless touched again. `last_touched` frontmatter (2026-08-01) remains stale relative to the real git evidence.
- No other client folder shows any commit newer than the 2026-08-21 bulk reorg — confirmed via `git log -1 --format=%cI -- 01_Clients/<client>` for every entry (all return the same ~484h-old timestamp). No new individual client work since yesterday's brief.
- Zero open `- [ ]` tasks anywhere in `01_Clients/` except Momentum 360 (14 open items in its overview) — unchanged from yesterday.
- Re-ran `predict-work.js --lookahead-days 35 --history-days 90` — first pass used the script's own default root (a Windows-only path) and correctly reported `client_operations_root_available: false`; re-ran with `--client-ops-root /home/user/client-operations-canonical` (the read-only checkout this session was given). **Provenance with the flag**: `client_operations_root_available: true`, `canonical_queue_available: true`, source `client-operations://queue/work-items.json`, `deliverable_events_scanned: 28`, `active_queue_items_scanned: 16`, `queue_candidates_used: 6` (10 excluded as stale), fingerprint `b0d9571b093db41aff4d5238d64f60ca71f2424e3cbe1d8aa114fe4f4e4a0969`. Chronos shadow status: `request-ready`. **Status is not degraded** — full prediction below, predicted preparation included.
- `latest-chronos.json` fingerprint (`d58cc5d6…`, generated 2026-09-02) does not match today's prediction fingerprint (`b0d9571b…`) — per instructions its holdout/forecast numbers stay excluded from ranking, shown only as a stale receipt in the capacity shadow.
- No Gmail/Slack access performed. Checked `00_Inbox/slack/` for notes from the last 24 hours as part of this sweep — flagging any candidate tasks found there to `/plan-today` downstream.

## Moving (touched < 48h)

| Client | Evidence | Note |
|---|---|---|
| Momentum 360 | Last real commit 2026-09-08 21:39 (~33.6h old) — AI Division library archive + delivered Drive assets | Same work as yesterday's brief, no new activity overnight; will drop out of Moving tomorrow unless touched again. `last_touched` frontmatter (2026-08-01) is stale and should be corrected |

## Watch (2–7 days)
None.

## Stalled (7+ days untouched)

**All other 36 active clients.** No other client's `last_touched` frontmatter falls inside 7 days, and no other folder shows real (non-bulk) git activity since 2026-08-21. Sorted least-to-most stale.

| Days stale | Client | Evidence (`last_touched`) | Suggested next touch |
|---|---|---|---|
| 34d | Tags 2 Go | 2026-08-07 — map Google Ads access, confirm admin invite status. `due: 2026-08-08` (33d overdue) | Resolve the access-mapping blocker; freshest-touched stalled client |
| 40d | Cindy May Christmas | 2026-08-01 — build from approved site package once video/newsletter/photo/Shopify deps clear. `due: 2026-09-01` (9d overdue) | Chase the four dependencies; closest live overdue date in the roster |
| 40d | Omega Landscaping | 2026-08-01 — verify Wix/Ads/GoHighLevel roles, prep access request. `due: 2026-07-15` (57d overdue) | Draft access request for approval queue |
| 40d | Everyday Life Insurance | 2026-08-01 — confirm canonical registry disposition | Decide active vs. archive |
| 40d | Bridge Software Development | 2026-08-01 — next_action TBD (Overlay: approve Phase 1 roles/acceptance criteria) | Get Phase 1 approval decision |
| 40d | Bercos Popcorn | 2026-08-01 — obtain finished Shopify build/staging handoff | Ping for Shopify handoff status |
| 40d | AMI Cleaning | 2026-08-01 — verify HubSpot form routing, lead owner | Confirm HubSpot routing owner |
| 40d | Replenish | 2026-08-01 — reconcile Google Ads billing owner, wait on San Diego decision. `due: 2026-07-15` (57d overdue) | Chase billing-owner confirmation |
| 40d | NKCDC | 2026-08-01 — get leadership pick of Phase Two priorities | Follow up for leadership decision |
| 40d | Fresh Blends | 2026-08-01 — verify Google Ads pause/restart state | Confirm live pause status before touching budget |
| 40d | Pro Fence & Deck | 2026-08-01 — recheck Yelp/Apple Maps verification after wait period | Recheck verification status |
| 40d | VA Claims | 2026-08-01 — convert Phase 2 backlog from David's approved direction | Draft Phase 2 backlog |
| 40d | BOK Law Firm | 2026-08-01 — maintain weekly content workflow, resolve geo/embargo guardrails | Prep this week's packet — predicted work package below, window opens 2026-09-15 |
| 40d | Capsule & Tonic | 2026-08-01 — confirm canonical registry disposition | Decide active vs. archive |
| 40d | Pritzker Law Group | 2026-08-01 — confirm podcast landing-page goal/host/destination/analytics/reviewer | Get outstanding confirmations from client |
| 42d | BigOrange Marketing | 2026-07-30 — prep Custom Home Builder pillar audit + Janice interview. `due: 2026-08-10` (31d overdue) | Queue flags this as its own item too (see below) — needs approval to move |
| 43d | 15 single-file clients (AWCI, Align HCM, Bend Plastic Surgery, Blissful Events, Bluegrass Janitorial, Bridge of Hope OTC, Buzz Bull, Coach B, Commercial Cleaners Alliance, Florecita, Hardwood Artisan, Link Eze, Next Gen Solutions, PNW Pro Clean, Vanessa) | 2026-07-29 — all carry `next_action: TBD — needs human next action` | Still reads as parked/inactive roster, not active delivery — repeat flag |
| 60d | Onsite Concrete, Kimberly James Bridal, Hope Wellness Center | 2026-07-12. All share `due: 2026-07-15` (57d overdue) | Oldest active-detail clients; below the fresher stalls in priority |
| 61d | Bar Crawl USA | 2026-07-11 — QA/cleanup on event pages, repair hub listing. `due: 2026-07-15` (57d overdue). Queue also carries a paid-media-optimization item needing approval (below) | Oldest touch in the roster |

## Due in 48h
None. No client's `due` frontmatter falls between 2026-09-10 and 2026-09-12 — every dated `due` field is already in the past (see overdue markers above) or `none`. Cindy May Christmas (`due: 2026-09-01`) is now 9 days overdue — closest thing to a live deadline, but it's past-due, not upcoming.

## Likely Next Work Packages

From `12_Brain/state/work-predictor/latest.json` (regenerated 2026-09-10T11:14:06Z, 35-day lookahead, 90-day history, canonical queue attached via `--client-ops-root /home/user/client-operations-canonical`). 7 candidates — 1 recurrence-pattern, 6 from the canonical `client-operations` queue.

**BOK weekly three-topic designed content kit** — `bok-law-firm`
- Evidence tier: `owner-verified-recurrence` · Confidence: 0.96 (`confirmed-pattern`)
- Predicted window: 2026-09-15 to 2026-09-17 (weekly)
- Expected deliverable: three topic-specific copy records; three ChatGPT-generated topic background images (no fabricated legal claims/text baked in); three branded template graphics (PNG + JPG); source/final PDFs with rendered-page inspection; copy/geography/dates/distinctions/image-count/Facebook-duplicate-check receipt
- First safe prep step: locate and fingerprint the newest source packet before drafting anything — not urgent today, window is 5 days out
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

Reminder: this is planning evidence, not proof a request exists or a deadline is live. All 7 candidates are either awaiting recorded approval or blocked on a human access/consent gate today — none has a ready, unblocked prep step for today's date except the BOK source-packet lookup (not urgent, window opens 2026-09-15).

## Capacity Shadow

- Baseline decision: `retain-deterministic-baseline-primary` (from the 2026-09-02 receipt — Chronos has not beaten the simple baselines).
- Holdout result: 14 observations; Chronos MAE 3.34 / WAPE 93.6% vs. trailing-7-day-mean MAE 3.06 / WAPE 85.7% (baseline still wins) vs. persistence MAE 3.57 / WAPE 100%. p10–p90 coverage 0.57.
- Total 14-day workload band (shadow only): point 14.98, p10 1.34, p90 96.92 — wide enough to be a non-signal.
- Planner-consumption gate: **false**. Source fingerprint (`d58cc5d6…`, 2026-09-02) doesn't match today's prediction fingerprint (`b0d9571b…`) — the receipt is now 8 days stale relative to today's run. Not used to rank clients — shown as a capacity warning only: if the p90 tail is real, the portfolio could see up to ~97 work-package arrivals in 14 days, but nothing here is calibrated enough to act on.

## Tomorrow's Priority Stack

1. **Cindy May Christmas** — the one client with an actual overdue `due:` field (9 days overdue and climbing); chase the video/newsletter/photo/Shopify dependency chain before it slips further.
2. **BigOrange Marketing sign-off** — oldest approval-queue item (31 days overdue on its `due:` field) with a completed deliverable sitting idle; getting factual sign-off + invoice details unblocks it without needing new work.
3. **Tags 2 Go access mapping** — freshest-touched stalled client (34d) with an overdue `due:` field (33d); resolving the Google Ads access blocker is the cheapest unstick on the board.
