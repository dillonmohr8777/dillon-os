---
title: Client Pulse — 2026-09-21
date: 2026-09-21
type: daily-brief
---

# Client Pulse — 2026-09-21

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
  `de4391c869f67484ec6254e1a7a7c9a07e2dbea3e3c6991bd84311538806f7f4`. (The
  plain command without `--client-ops-root` comes back degraded — root
  unavailable, 1 candidate — because the vault's Windows-path default doesn't
  exist in this Linux session; the explicit read-only checkout path is
  required and was used.)
- **Git history in this session is a shallow clone: 95 commits, oldest
  2026-09-05.** Raw `git log -1` per client file is unreliable — most files
  show the shallow boundary itself (`Add Repository Access Map for remote
  sessions (#358)`, 2026-09-05) or a bulk disaster-recovery commit
  (`vault: commit the uncommitted working tree on this branch`, 2026-09-15,
  2,210 paths recovered from a failing disk) rather than genuine per-client
  edits. Neither commit is real client work. Classification below uses
  frontmatter `last_touched` as the primary signal and only promotes a client
  above its frontmatter date when a specific, non-bulk commit touching that
  client's content is identifiable — as with Omega Landscaping below.
- Open `- [ ]` task count inside every scanned client note: 0, except
  **Momentum 360** (14 open tasks — a Google Ads conversion-tracking audit
  checklist inside `overview.md`), which real vault content lives in but
  isn't reflected in `last_touched`.
- **Align HCM roster/reality mismatch, still open**: `01_Clients/Align
  HCM.md` carries `status: active`, `next_action: TBD` — but `CLAUDE.md`
  confirms the relationship ended 2026-09-02. The canonical queue still
  carries a live, blocked `align-hcm` work item
  (`wi-20260723-0005`, data-source-integration, gated on an Align
  Microsoft/HubSpot MFA reauth). This is a data conflict between the vault
  and the canonical queue, not something this brief resolves — flagging for
  the queue owner.
- Four clients (**Deborah-Mara, Nexla, Puttery NYC**, and the `Client
  Index`) carry no `last_touched` field at all — their primary content lives
  in `Client Intelligence Overlay.md` / README files that don't follow the
  standard client schema. Cannot classify their staleness by frontmatter;
  they default to stalled on git evidence (oldest available, since the
  9-15 bulk-recovery commit is not genuine per-client evidence).

## Moving (< 48h)

None. No client note shows genuine content changed in the last 48 hours —
neither by `last_touched` frontmatter nor by a non-bulk git commit.

## Watch (2–7 days)

- **Omega Landscaping** — real, non-bulk content commit 2026-09-14
  (`queue: closing pass 2026-09-14 -- 127 open to 109`), exactly 7 days ago
  as of this brief — the edge of the watch window; it flips to stalled
  tomorrow if untouched. `last_touched` frontmatter is still stuck at
  `2026-08-01` and was never fixed. Suggested next touch: the Zapier
  lead-field addition to Momentum's own account (the client-contact access
  path is confirmed dead), and fix the stale `last_touched` field in the
  same edit.

## Stalled (7+ days)

- **Have an active canonical work item** (real work may be moving in the
  canonical queue even though the vault note isn't touched): BigOrange
  Marketing (`website-design-build`, needs approval, past due), Revive
  Systems (`workflow-automation-system`, blocked on OAuth), Momentum 360
  (`data-source-integration`, blocked on CallRail access, past due), Align
  HCM (`data-source-integration`, blocked on MFA — see reconciliation flag
  above), Tags 2 Go (`research-audit-decision-brief`, blocked on Ads
  access), BOK Law Firm (weekly designed-content recurrence, confirmed
  pattern, next window 2026-09-22–24). Suggested next touch: clear the
  listed gates (see Likely Next Work Packages) rather than editing the
  notes themselves.
- **No canonical work item surfaced, stale by frontmatter `last_touched`**,
  grouped by that date:
  - **~72 days** (since 2026-07-11/12): Bar Crawl USA, Hope Wellness
    Center, Kimberly James Bridal, Onsite Concrete.
  - **~52 days** (since 2026-07-30): (BigOrange Marketing also has the
    canonical item above).
  - **~51 days** (since 2026-08-01): AMI Cleaning, Bercos Popcorn, Bridge
    Software Development, Capsule & Tonic, Cindy May Christmas, Everyday
    Life Insurance, Fresh Blends, NKCDC, Pritzker Law Group, Pro Fence &
    Deck, Replenish (`status: paused` — billing owner unresolved), VA
    Claims.
  - **~45 days** (since 2026-08-07): Tags 2 Go (also has the canonical item
    above).
  - **~54 days** (since 2026-07-29): AWCI, Bend Plastic Surgery, Blissful
    Events (`status: completed`), Bluegrass Janitorial, Bridge of Hope OTC,
    Buzz Bull, Coach B, Commercial Cleaners Alliance, Florecita, Hardwood
    Artisan, Link Eze, Next Gen Solutions, PNW Pro Clean, Vanessa.
  - **No frontmatter `last_touched` at all**, stalled by default: Deborah-
    Mara, Nexla, Puttery NYC.

## Due in 48h

None. No client `due:` frontmatter field falls inside 2026-09-21–2026-09-23.
Every `due` value found in scanned client notes is already months in the
past (e.g., `2026-07-15`, `2026-08-08`, `2026-08-10`, `2026-09-01`) or set to
`none` — these are stale demo/placeholder values, not live deadlines, and
are a vault data-quality gap rather than an actionable 48h list.

## Likely next work packages

1. **BOK Law Firm — weekly three-topic designed content kit.**
   Evidence tier: `owner-verified-recurrence`. Confidence: 0.96
   (confirmed-pattern). Predicted window: 2026-09-22–24 (weekly basis).
   Deliverable: three designed topics, three ChatGPT-generated topic
   background images, three branded template graphics (PNG/JPG), source +
   final PDFs, and a copy/geography/image-count/duplicate-check receipt.
   First safe prep step: locate and fingerprint the newest source packet
   before drafting or generating anything. Gate: any packet mismatch, legal/
   geographic ambiguity, wrong Facebook page, or duplicate schedule stops
   the work.
2. **BigOrange Marketing — website-design-build.** Evidence tier:
   canonical-queue (`wi-20260718-0001`). Confidence: 0.86 (likely), state
   `needs_approval`, past due. Deliverable: final factual sign-off on the
   completed private WordPress pilot plus the exact invoice recipient/date/
   timing before publication or invoicing. Gate: this item requires its
   recorded approval — do not treat as ready to execute.
3. **Revive Systems — workflow-automation-system.** Evidence tier:
   canonical-queue (`wi-20260717-0002`). Confidence: 0.68 (watch), state
   `blocked`. Gate: blocked on a human Google OAuth reauth for the recorded
   HighLevel location; no execution until the gate clears.
4. **Momentum 360 — data-source-integration.** Evidence tier: canonical-
   queue (`wi-20260718-0003`). Confidence: 0.68 (watch), state `blocked`,
   past due. Gate: blocked on restoring direct CallRail membership and
   Track 360/Google Suspension test destinations; no execution until
   cleared.
5. **Align HCM — data-source-integration.** Evidence tier: canonical-queue
   (`wi-20260723-0005`). Confidence: 0.68 (watch), state `blocked`. Gate:
   blocked on Align Microsoft/HubSpot MFA reauth. **Flag:** this client
   relationship is confirmed ended per `CLAUDE.md` (2026-09-02) — the queue
   owner should confirm whether this item should still be open before any
   prep happens.
6. **Tags 2 Go — research-audit-decision-brief.** Evidence tier: canonical-
   queue (`wi-20260807-0001`). Confidence: 0.68 (watch), state `blocked`.
   Gate: blocked on restoring agency-admin Google Ads access.

Only item 1 (BOK Law Firm) is unblocked and its predicted window opens
within 48h — everything else is either awaiting approval or blocked on a
human-only gate, so none of them belong in tomorrow's priority stack as
executable work; they're listed here as gates to clear, not tasks to start.

## Capacity shadow

- Chronos shadow status: **`request-ready`** (a routeable workload request
  was built this run, but Chronos has not cleared its own bar).
  `planner_consumption_gate: false` — per the skill's own rule, Chronos
  output is **not** used to rank clients while this gate is false.
- The only stored Chronos receipt (`latest-chronos.json`, generated
  2026-09-02) carries source fingerprint `d58cc5d6...`, which does **not**
  match this run's fingerprint (`de4391c8...`). Per the skill instructions,
  a mismatched receipt is not read into this brief — no baseline decision,
  holdout result, or total-workload band is shown today.
- Net: no capacity shadow warning this cycle. The portfolio's dated
  work-package history series is all zeros across the 90-day window scanned
  (`deliverable_events_scanned` in the local history builder found no dated
  deliverable events, separate from the 31 canonical-queue deliverable
  events picked up via `--client-ops-root`) — a coverage gap for the
  time-series builder specifically, not evidence that no work happened.

## Tomorrow's priority stack

1. **BOK Law Firm weekly content kit** — the only unblocked, confirmed-
   pattern predicted work package, window opens 2026-09-22. Locate and
   fingerprint the source packet today so drafting can start the moment the
   window opens.
2. **Omega Landscaping** — sitting at the exact watch/stalled boundary (7
   days). One small edit (the Zapier lead-field addition, plus fixing the
   stale `last_touched` field) both advances real client work and prevents
   it from falling into the stalled pile unexamined.
3. **Align HCM reconciliation** — not client delivery work, but a standing
   vault/queue data-integrity gap (ended relationship, still-open blocked
   queue item) that's been carried forward for multiple pulse cycles now.
   Worth a five-minute registry check to close the loop rather than let it
   keep surfacing as a false candidate.
