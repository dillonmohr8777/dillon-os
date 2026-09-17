---
title: Client Pulse — 2026-09-17
date: 2026-09-17
type: daily-brief
---

# Client Pulse — 2026-09-17

## Coverage notes

- Scanned 25 folder-based client records under `01_Clients/` plus 16
  single-file client records (41 total, `Client Index.md` excluded as an
  index, not a client) for `due`/`next_action`/`last_touched`/`status`
  frontmatter, open `- [ ]` tasks, and git history.
- Ran `node _os/automation/bin/predict-work.js --lookahead-days 35
  --history-days 90 --client-ops-root /home/user/client-operations-canonical`.
  **Status: ok** (not degraded). Provenance: `client_operations_root_available:
  true`, `canonical_queue_available: true`, source
  `client-operations://queue/work-items.json`, 31 deliverable events and 16
  active queue items scanned, 5 queue candidates used, 11 stale queue items
  excluded on freshness grounds. Source fingerprint
  `de4391c869f67484ec6254e1a7a7c9a07e2dbea3e3c6991bd84311538806f7f4` — **identical
  to yesterday's run**, confirming the canonical queue has not moved since
  2026-09-16. (As before, the plain command without `--client-ops-root` comes
  back degraded — root unavailable, 1 candidate — because the vault's own
  Windows-path default doesn't exist in this Linux sandbox; the explicit
  read-only checkout path is required.)
- **No genuine vault movement since yesterday's brief.** Checked
  `git log --since=2026-09-15` against `01_Clients/`: the only commits
  touching client files are the same 2026-09-14/09-15 branch-sync merges
  already reflected in yesterday's pulse (e.g. Momentum 360 AI Division
  Library sync, Puttery/Nexla/Tags 2 Go intelligence-overlay merges). Nothing
  landed on 2026-09-17 before this run (`git log --since="2026-09-17 00:00"`
  shows only the automated `vault-clean: 2026-09-17` commit).
- Carrying forward yesterday's two flags, both still open:
  - **Omega Landscaping** `overview.md` — real edit was 2026-09-14 (now 3
    days ago); `last_touched` frontmatter is still stuck at `2026-08-01` and
    was not fixed. Moves from "moving" into the **watch** band today on git
    evidence.
  - **Align HCM** roster/reality mismatch (`status: active`, `next_action:
    TBD`) vs. confirmed end date 2026-09-02 in `CLAUDE.md` — still
    unreconciled; the canonical queue still carries a live `align-hcm` watch
    item.
- Open `- [ ]` task count inside every scanned client note: 0 (task tracking
  for active work lives in the canonical `client-operations` queue, not vault
  client notes).

## Moving (< 48h)

None. No client note (by `last_touched` frontmatter or git history) has
genuine content changed in the last 48 hours as of 2026-09-17.

## Watch (2–7 days)

- **Omega Landscaping** — real edit 2026-09-14 (3 days ago; access-request
  path to the client contact confirmed dead, next action is adding lead
  fields to Momentum's own Zapier notification body). Suggested next touch:
  implement the Zapier field addition and fix the stale `last_touched` field
  in the same edit — it's been sitting one edit away for two days.

## Stalled (7+ days)

- **Has an active canonical work item** (real work may be moving even though
  the vault note isn't): BigOrange Marketing (`website-design-build`, needs
  approval, past due), Revive Systems (`workflow-automation-system`, blocked
  on OAuth), Momentum 360 (`data-source-integration`, blocked on CallRail
  access, past due), Align HCM (`data-source-integration`, blocked on MFA —
  see reconciliation flag above), Tags 2 Go (`research-audit-decision-brief`,
  blocked on Ads access), BOK Law Firm (weekly designed-content recurrence,
  confirmed pattern, next window 2026-09-22–24). Suggested next touch: clear
  the listed gates (see Likely Next Work Packages) rather than editing the
  notes themselves.
- **No canonical work item surfaced, note untouched by `last_touched`**,
  grouped by age:
  - **66–68 days** (since 2026-07-11/12): Bar Crawl USA, Hope Wellness
    Center, Kimberly James Bridal, Onsite Concrete.
  - **49 days** (since 2026-07-30): BigOrange Marketing (also has the
    canonical item above).
  - **47 days** (since 2026-08-01): AMI Cleaning, BOK Law Firm, Bercos
    Popcorn, Bridge Software Development, Capsule & Tonic
    (`pending-registry-reconciliation`), Cindy May Christmas, Everyday Life
    Insurance (`pending-registry-reconciliation`), Fresh Blends (Google Ads
    pause state unverified), NKCDC, Pritzker Law Group, Pro Fence & Deck,
    Replenish (`status: paused`), Revive Systems, VA Claims.
  - **41 days** (since 2026-08-07): Tags 2 Go.
  - **50 days** (since 2026-07-29), 15 single-file clients still carrying
    identical generic `next_action: TBD — needs human next action`
    boilerplate: AWCI, Bend Plastic Surgery, Blissful Events (`status:
    completed`), Bluegrass Janitorial, Bridge of Hope OTC, Buzz Bull, Coach
    B, Commercial Cleaners Alliance, Florecita, Hardwood Artisan, Link Eze,
    Next Gen Solutions, PNW Pro Clean, Vanessa, **Align HCM** (flagged above
    — not just stale, wrong: employment ended).
  - **No `last_touched` set** (blind spot, not "moving"): Deborah-Mara (file
    is an AEO README, not an `overview.md` — schema drift from the other
    client folders), Nexla, Puttery NYC.
  - Suggested next touch: unchanged from yesterday — a `/vault-compile` or
    manual sweep across the 15 boilerplate single-file clients, plus the
    Align HCM status/tags correction.

## Due in 48h

None found in vault frontmatter or the canonical queue window
(2026-09-17–2026-09-19). Nearest dated item: BOK Law Firm's weekly content
kit, window 2026-09-22–2026-09-24 (5 days out). Several `due` fields remain
past-due and stale rather than newly due: BigOrange Marketing (2026-08-10),
Tags 2 Go (2026-08-08), Cindy May Christmas (2026-09-01), Hope Wellness
Center / Kimberly James Bridal / Onsite Concrete / Bar Crawl USA / Replenish
(all 2026-07-15) — unresolved, not upcoming.

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
   until the named human gate clears. Align HCM specifically should be
   reconciled against the confirmed 2026-09-02 end date before any prep
   work — this may be a queue item that should be closed, not worked. None
   of these four is ready to work today.

## Capacity shadow

- Chronos shadow status: `request-ready`. `latest-chronos.json` on disk
  (`as_of: 2026-09-02`, fingerprint `d58cc5d6…`) still does **not** match
  today's prediction fingerprint (`de4391c8…`) — per protocol, not read for
  ranking or shown as a capacity band today.
- Last valid holdout (2026-09-02): decision `retain-deterministic-baseline-
  primary`. Chronos underperformed both the persistence and trailing-7-day-
  mean baselines on MAE/WAPE (Chronos MAE 3.34 vs. trailing-mean 3.06). All
  four gates (`single_holdout_beats_best_baseline`,
  `single_holdout_quantile_calibration`, `repeated_holdouts`,
  `planner_consumption`) read **false**. Baseline stays primary.
- No capacity-band figure to report today — the Chronos receipt still needs
  regenerating on today's fingerprint before next use.

## Tomorrow's priority stack

1. **Ship the Omega Zapier lead-field addition** — the only item with
   confirmed recent movement (2026-09-14, now aging into the watch band),
   needs no client permission, and directly unblocks lead-quality reporting
   that's been stuck behind a dead access-request path for three days now.
2. **Clear the BigOrange approval gate** — the only near-term item with a
   concrete, revenue-adjacent deliverable (website publish + invoice) sitting
   one sign-off away.
3. **Reconcile Align HCM** — close or correct the canonical queue's
   `align-hcm` watch item and fix the client note's `status`/tags against the
   confirmed 2026-09-02 end date before it keeps surfacing as live work in
   future briefs.
