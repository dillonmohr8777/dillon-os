---
title: Client Pulse — 2026-09-16
date: 2026-09-16
type: daily-brief
---

# Client Pulse — 2026-09-16

## Coverage notes

- Scanned 25 folder-based client records under `01_Clients/` plus 16
  single-file client records (41 total, `Client Index.md` excluded as an
  index, not a client) for git history, `due`/`next_action`/`last_touched`/
  `status` frontmatter, and open `- [ ]` tasks.
- Ran `node _os/automation/bin/predict-work.js --lookahead-days 35
  --history-days 90 --client-ops-root /home/user/client-operations-canonical`.
  **Status: ok** (not degraded). Provenance: `client_operations_root_available:
  true`, `canonical_queue_available: true`, source
  `client-operations://queue/work-items.json`, 31 deliverable events and 16
  active queue items scanned, 5 queue candidates used, 11 stale queue items
  excluded on freshness grounds. Source fingerprint
  `de4391c869f67484ec6254e1a7a7c9a07e2dbea3e3c6991bd84311538806f7f4`. (First
  run without `--client-ops-root` came back with the canonical root
  unavailable and only 1 candidate — the explicit path is required in this
  sandbox.)
- **Data-quality flag:** raw git file-mtime on `01_Clients/` is unreliable
  here — most clients' most recent touching commit is a bulk infra/branch
  merge (e.g. the 2026-09-01 PR #347 agent-config merge, the 2026-09-15
  308-file branch-sync merge) that carried old content forward rather than
  editing it. `last_touched` frontmatter is the trustworthy signal and is
  what the classification below uses.
- **Real finding, not a scanning artifact:** `01_Clients/Omega Landscaping/
  overview.md` was genuinely edited 2026-09-14 (commit `17dcaccb`, "Retire
  the Omega access-request path") but its `last_touched` frontmatter is still
  `2026-08-01` — the field wasn't bumped on edit. Treated as **moving** below
  on git evidence despite the stale field; worth a frontmatter fix next
  compile pass.
- **Roster/reality mismatch:** `01_Clients/Align HCM.md` still carries
  `status: active`, tags `[client, fulltime]`, and generic `next_action: TBD`
  — but per `CLAUDE.md`, Align HCM employment **ended, confirmed 2026-09-02**.
  The canonical predictive-work queue (below) still surfaces an `align-hcm`
  "watch" work package (Align HubSpot/Microsoft reauth). This is stale on
  both sides and should not be worked without reconciling the queue against
  the confirmed end date first.
- Open `- [ ]` task count inside every scanned client note: 0. Task tracking
  for active work lives in the canonical `client-operations` queue, not in
  vault client notes.

## Moving (< 48h)

- **Omega Landscaping** — `overview.md` edited 2026-09-14 (2 days ago,
  frontmatter stale — see above). Real change: the access-request path to
  the client contact is confirmed dead; next action is now to add lead
  fields to Momentum's own Zapier notification body (no client permission
  needed). Suggested next touch: implement the Zapier field addition and fix
  the `last_touched` field in the same edit.

## Watch (2–7 days)

None. No other client note falls in the 2–7 day band by `last_touched`.

## Stalled (7+ days)

- **Has an active canonical work item** (real work may be moving even though
  the vault note isn't): BigOrange Marketing (`website-design-build`, needs
  approval, past due), Revive Systems (`workflow-automation-system`, blocked
  on OAuth), Momentum 360 (`data-source-integration`, blocked on CallRail
  access, past due), Align HCM (`data-source-integration`, blocked on MFA —
  **see reconciliation flag above, relationship confirmed ended**), Tags 2 Go
  (`research-audit-decision-brief`, blocked on Ads access), BOK Law Firm
  (weekly designed-content recurrence, confirmed pattern, next window
  2026-09-22–24). Suggested next touch: clear the listed gates (see Likely
  Next Work Packages) rather than editing the notes themselves.
- **No canonical work item surfaced, note untouched 40–67 days**, grouped by
  `last_touched`:
  - **65–67 days** (since 2026-07-11/12): Bar Crawl USA, Hope Wellness
    Center, Kimberly James Bridal, Onsite Concrete.
  - **48 days** (since 2026-07-30): BigOrange Marketing (also has the
    canonical item above).
  - **46 days** (since 2026-08-01): AMI Cleaning, BOK Law Firm, Bercos
    Popcorn, Bridge Software Development, Capsule & Tonic
    (`pending-registry-reconciliation`), Cindy May Christmas, Everyday Life
    Insurance (`pending-registry-reconciliation`), Fresh Blends (Google Ads
    pause state unverified), NKCDC, Pritzker Law Group, Pro Fence & Deck,
    Replenish (`status: paused`), Revive Systems, VA Claims.
  - **40 days** (since 2026-08-07): Tags 2 Go.
  - **49 days** (since 2026-07-29), 15 single-file clients all carrying
    identical generic `next_action: TBD — needs human next action`
    boilerplate: AWCI, Bend Plastic Surgery, Blissful Events (`status:
    completed`), Bluegrass Janitorial, Bridge of Hope OTC, Buzz Bull, Coach
    B, Commercial Cleaners Alliance, Florecita, Hardwood Artisan, Link Eze,
    Next Gen Solutions, PNW Pro Clean, Vanessa, **Align HCM** (flagged
    above — this one is not just stale, it's wrong: employment ended).
  - **No `last_touched` set** (blind spot, not "moving"): Deborah-Mara (file
    is an AEO README, not an `overview.md` — schema drift from the other
    client folders), Nexla, Puttery NYC.
  - Suggested next touch: a `/vault-compile` or manual sweep across the
    15 boilerplate single-file clients to confirm which are genuinely
    dormant vs. simply never written up, and a correction pass on Align HCM
    status/tags to match the confirmed end date.

## Due in 48h

None found in vault frontmatter or the canonical queue window
(2026-09-16–2026-09-18). Nearest dated item: BOK Law Firm's weekly content
kit, window 2026-09-22–2026-09-24 (6 days out). Several `due` fields are
past-due and stale rather than upcoming: BigOrange Marketing (2026-08-10),
Tags 2 Go (2026-08-08), Cindy May Christmas (2026-09-01), Hope Wellness
Center / Kimberly James Bridal / Onsite Concrete / Bar Crawl USA / Replenish
(all 2026-07-15) — these read as unresolved rather than newly due.

## Likely next work packages

1. **BOK Law Firm — weekly three-topic designed content kit**
   Evidence tier: `owner-verified-recurrence`. Confidence: 0.96
   (confirmed-pattern). Window: 2026-09-22–2026-09-24 (weekly basis).
   Expected deliverable: three designed topics with generated image
   backgrounds; exact current packet overrides the count. First safe prep
   step: locate and fingerprint the newest source packet before drafting or
   generating images. Gate: missing/conflicting packet, legal/geographic
   ambiguity, wrong Facebook page, duplicate schedule, or content outside the
   approved source.

2. **BigOrange Marketing — website/landing-page/frontend build**
   Evidence tier: `canonical-queue`. Confidence: 0.86 (likely). Basis:
   past-due, needs approval. Deliverable: publish the completed private
   WordPress pilot once BigOrange gives factual sign-off and invoice terms
   are confirmed. First safe prep step: resolve exact deployment mapping,
   assemble approved logo/imagery/copy/tokens. Gate: work item
   `wi-20260718-0001` still needs its recorded approval — no publish or
   invoice without it.

3. **Revive Systems / Momentum 360 / Align HCM / Tags 2 Go — blocked
   integration & audit work** (confidence 0.68, `canonical-queue`, all
   "watch"). Each is stuck behind a human-only gate (OAuth, CallRail
   membership, MFA, Ads access) recorded in Access Broker. Prep is limited to
   freezing scope/field maps and building acceptance tests — no execution
   until the named human gate clears. **Align HCM specifically should be
   reconciled against the confirmed 2026-09-02 end date before any prep work
   — this may be a queue item that should be closed, not worked.** None of
   these four are ready to work today.

## Capacity shadow

- Chronos shadow status: `request-ready`. `latest-chronos.json` on disk
  (`as_of: 2026-09-02`, fingerprint `d58cc5d6…`) does **not** match today's
  prediction fingerprint (`de4391c8…`) — per protocol, not read for ranking
  or shown as a capacity band today.
- Last valid holdout (2026-09-02): decision `retain-deterministic-baseline-
  primary`. Chronos underperformed both the persistence and trailing-7-day-
  mean baselines on MAE/WAPE (Chronos MAE 3.34 vs. trailing-mean 3.06). All
  four gates (`single_holdout_beats_best_baseline`,
  `single_holdout_quantile_calibration`, `repeated_holdouts`,
  `planner_consumption`) read **false**. Baseline stays primary.
- No capacity-band figure to report today — regenerate the Chronos receipt on
  today's fingerprint before next use.

## Tomorrow's priority stack

1. **Ship the Omega Zapier lead-field addition** — it's the one item with
   confirmed fresh movement (2026-09-14), needs no client permission, and
   directly unblocks lead-quality reporting that's been stuck behind a dead
   access-request path.
2. **Clear the BigOrange approval gate** — the only near-term item with a
   concrete, revenue-adjacent deliverable (website publish + invoice) sitting
   one sign-off away.
3. **Reconcile Align HCM** — close or correct the canonical queue's
   `align-hcm` watch item and fix the client note's `status`/tags against the
   confirmed 2026-09-02 end date before it keeps surfacing as live work in
   future briefs.
