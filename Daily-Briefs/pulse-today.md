---
title: Client Pulse — 2026-09-15
date: 2026-09-15
type: daily-brief
---

# Client Pulse — 2026-09-15

## Coverage notes

- Scanned all 37 client pages/folders under `01_Clients/` for git last-modified
  time, `due`/`next_action`/`last_touched`/`status` frontmatter, and open
  `- [ ]` tasks.
- Ran `node _os/automation/bin/predict-work.js --lookahead-days 35
  --history-days 90 --client-ops-root /home/user/client-operations-canonical`.
  Status **ok**. Provenance: `client_operations_root_available: true`,
  `canonical_queue_available: true`, source
  `client-operations://queue/work-items.json`, 28 deliverable events and 16
  active queue items scanned, 5 queue candidates used, 11 stale queue items
  excluded on freshness grounds. Source fingerprint
  `b0d9571b093db41aff4d5238d64f60ca71f2424e3cbe1d8aa114fe4f4e4a0969`.
  (First run without an explicit `--client-ops-root` silently missed the
  Linux-sandbox checkout path and came back with zero queue items — re-run
  with the explicit path to get real signal if this recurs.)
- **Blind spot / real finding:** git history shows the most recent commit
  touching any `01_Clients/` file was 2026-09-08 (Momentum 360 AI Division
  archival), and every other client file's last touch was 2026-08-30. No
  client note in the vault has been edited in the last 7 days save that one.
  This makes the moving/watch/stalled split below nearly binary — it reflects
  vault note-editing cadence, not actual client delivery, which is tracked
  separately in the canonical `client-operations` queue (16 active items).
  Open-task counts (`- [ ]`) inside client notes are all 0 — task tracking for
  active work lives in the canonical queue, not in these notes.
- No `due` dates are set on any client frontmatter (all `none` or unset), so
  the 48h list below is built from canonical queue windows only.

## Moving (< 48h)

None. No client file in `01_Clients/` was touched in the last 48 hours.

## Watch (2–7 days)

- **Momentum 360** — `01_Clients/Momentum 360/` last touched 2026-09-08 (7
  days ago, AI Division Library archival work). No `due`/`next_action` set on
  the client note itself. Canonical queue carries a blocked
  `data-source-integration` item (CallRail/Track 360 restore) — see Likely
  Next Work Packages. Suggested next touch: confirm Access Broker CallRail
  credential status before this slides into stalled.

## Stalled (7+ days)

All other 35 client pages — last vault touch 2026-08-30 (16 days), uniformly,
per git history. Grouped by canonical-queue signal rather than listed
individually since the note-level evidence is identical:

- **Has an active canonical work item** (real work is moving even though the
  vault note isn't): BigOrange Marketing (website-design-build, needs
  approval), Revive Systems (workflow-automation-system, blocked on OAuth),
  Align HCM (data-source-integration, blocked on MFA), Tags 2 Go
  (research-audit-decision-brief, blocked on Ads access), BOK Law Firm
  (weekly designed-content recurrence, confirmed pattern). Suggested next
  touch: none needed on the vault note itself — clear the listed gates
  instead (see Likely Next Work Packages).
- **No canonical work item surfaced, note untouched 16 days**: AMI Cleaning,
  AWCI, Bar Crawl USA, Bend Plastic Surgery, Bercos Popcorn, Blissful Events
  (status: completed), Bluegrass Janitorial, Bridge Software Development,
  Bridge of Hope OTC, Buzz Bull, Capsule & Tonic (pending-registry-
  reconciliation), Cindy May Christmas, Coach B, Commercial Cleaners
  Alliance, Everyday Life Insurance (pending-registry-reconciliation),
  Florecita, Fresh Blends (campaigns paused pending restart authority),
  Hardwood Artisan, Hope Wellness Center, Kimberly James Bridal, Link Eze,
  NKCDC, Next Gen Solutions, Omega Landscaping, Onsite Concrete, PNW Pro
  Clean, Pritzker Law Group, Pro Fence & Deck, Replenish, VA Claims, Vanessa.
  Suggested next touch: a `/vault-compile` or manual sweep to confirm these
  are genuinely quiet vs. just undocumented — 16 days of silence across the
  entire roster is itself the flag worth acting on.

## Due in 48h

None found — no client frontmatter `due` date and no canonical queue window
falls inside 2026-09-15–2026-09-17. Nearest dated item is BOK Law Firm's
weekly content kit, window 2026-09-22–2026-09-24 (7+ days out).

## Likely next work packages

1. **BOK Law Firm — weekly three-topic designed content kit**
   Evidence tier: `owner-verified-recurrence`. Confidence: 0.96
   (confirmed-pattern). Window: 2026-09-22–2026-09-24 (weekly basis).
   Deliverable: three branded topic graphics (PNG/JPG) with generated
   background art, source + final PDFs, contact-sheet inspection set.
   First safe prep step: locate and fingerprint the newest source packet
   before drafting or generating any images. Gate: any packet mismatch,
   legal/geographic ambiguity, wrong Facebook page, or duplicate schedule
   stops work.

2. **BigOrange Marketing — website-design-build**
   Evidence tier: `canonical-queue`. Confidence: 0.86 (likely). Basis:
   past-due, needs approval. Deliverable: publish the completed private
   WordPress pilot once BigOrange gives factual sign-off and invoice terms
   are confirmed. First safe prep step: resolve exact deployment mapping and
   assemble the approved logo/imagery/copy/tokens. Gate: work item
   wi-20260718-0001 still needs its recorded approval — no publish or invoice
   without it.

3. **Revive Systems / Momentum 360 / Align HCM / Tags 2 Go — blocked
   integration & audit work** (confidence 0.68, `canonical-queue`, all
   "watch"). Each is stuck behind a human-only gate (OAuth, CallRail
   membership, MFA, Ads access) recorded in Access Broker. Prep is limited to
   freezing scope/field maps and building acceptance tests — no execution
   until the named human gate clears. These are not ready to work today.

## Capacity shadow

- Chronos shadow status: `request-ready`, `planner_consumption_gate: false`.
  `latest-chronos.json` on disk is stale (source fingerprint from
  2026-09-02, `d58cc5d6…`) and does **not** match today's prediction
  fingerprint (`b0d9571b…`) — per protocol, not used for ranking or shown as
  a capacity band today.
- Last valid holdout (2026-09-02): decision `retain-deterministic-baseline-
  primary`. Chronos underperformed both persistence and trailing-7-day-mean
  baselines on MAE/WAPE. Baseline stays primary; Chronos remains a shadow
  challenger only.
- No capacity-band figure to report today — regenerate the Chronos receipt on
  today's fingerprint before next use.

## Tomorrow's priority stack

1. **Clear the BigOrange approval gate** — it's the only near-term item with
   a concrete, revenue-adjacent deliverable (website publish + invoice)
   sitting one sign-off away.
2. **Chase the three blocked human-auth gates** (Revive OAuth, Momentum
   CallRail, Align MFA) — each is one login away from unblocking real queued
   work; batching them into one Access Broker pass is more efficient than
   three separate touches.
3. **Run a vault-note sweep** on the 30 clients with no canonical-queue
   signal and no vault touch in 16 days — confirm which are genuinely
   dormant vs. simply undocumented before the next planning cycle.
