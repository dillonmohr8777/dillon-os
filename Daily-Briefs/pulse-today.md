---
title: Client Pulse — 2026-09-22
date: 2026-09-22
type: daily-brief
---

# Client Pulse — 2026-09-22

## Coverage notes

- Scanned all 40 client entries under `01_Clients/` (25 folder-clients + 15
  single-file clients; `Client Index.md` excluded as a non-client index
  page) for `due`/`next_action`/`last_touched`/`status` frontmatter, open
  `- [ ]` tasks, and git history. Window: moving ≥2026-09-20, watch
  2026-09-15→09-20, stalled <2026-09-15.
- Ran `node _os/automation/bin/predict-work.js --lookahead-days 35
  --history-days 90 --client-ops-root /home/user/client-operations-canonical`.
  **Status: ok** (not degraded). Provenance: `client_operations_root_available:
  true`, `canonical_queue_available: true`, source
  `client-operations://queue/work-items.json`, 31 deliverable events and 16
  active queue items scanned, 5 queue candidates used, 11 stale queue items
  excluded on freshness grounds. Source fingerprint
  `de4391c869f67484ec6254e1a7a7c9a07e2dbea3e3c6991bd84311538806f7f4` —
  identical to every snapshot since at least 2026-09-16, confirming the
  canonical queue hasn't moved. (The plain command without
  `--client-ops-root` comes back degraded — root unavailable, 1 candidate —
  because the vault's Windows-path default doesn't exist in this Linux
  session; the explicit read-only checkout path was used instead, and never
  written to.)
- **BOK Law Firm window clarification** (not a correction — verified against
  `_os/automation/lib/work-predictor.js`): the live candidate ID reads
  `recurrence-bok-law-firm-weekly-designed-content-2026-09-29`
  (window 2026-09-29–10-01), which looks like it disagrees with
  `Dashboard.md`'s "window opens 2026-09-22" line. It doesn't. The
  recurrence engine (`nextRecurrenceDate`) deliberately skips forecasting an
  occurrence that lands exactly on `asOf` (today) — it treats a same-day
  match as already current rather than a future prediction, and reports the
  *following* occurrence instead. Since today is 2026-09-22 and yesterday's
  run (`predicted-work-2026-09-21.md`) already named this exact window as
  **2026-09-22–09-24, confidence 0.96**, today's BOK window is real and
  live, not superseded. The 2026-09-29–10-01 candidate is next week's
  occurrence surfacing early because the algorithm always reports the next
  *future* date, never today's. `Dashboard.md` is correct as written.
- **No client's `last_touched` frontmatter or git history is inside the
  moving or watch windows** — every signal in the vault is 8+ days old
  (closest: Tags 2 Go, git/body evidence 2026-09-13; Omega Landscaping, body
  text dated 2026-09-14, 8 days out). This is the same finding as
  yesterday's brief, one day further stale — Omega Landscaping has now
  crossed the 7-day watch/stalled boundary it was sitting on yesterday.
- **Open `- [ ]` task total across all 40 clients: 8** — 5 in BigOrange
  Marketing (pillar audit + Janice interview checklist), 3 in Replenish
  (blocked on a Google Ads billing-owner decision). Every other client has
  zero open checkboxes. (Momentum 360's `ebook-05-names-not-numbers.md`
  carries 14 unchecked boxes but they're a reader-facing self-audit
  checklist inside a content draft, not operational tasks — excluded.)
- **Schema/data-quality gaps found this pass** (not fixed here, per the
  "report, don't fix" rule):
  - 14 of 40 single-file clients carry a literal `next_action: TBD — needs
    human next action` placeholder with `due: none` — no real forward
    signal for over a third of the roster: Align HCM, AWCI, Bend Plastic
    Surgery, Bluegrass Janitorial, Bridge of Hope OTC, Buzz Bull, Coach B,
    Commercial Cleaners Alliance, Florecita, Hardwood Artisan, Link Eze,
    Next Gen Solutions, PNW Pro Clean, Vanessa. Bridge Software
    Development's `overview.md` (a folder client) carries the same
    placeholder.
  - Deborah-Mara's only content file (`README-AEO-2026-09-10.md`) has no
    YAML frontmatter at all — an inline "Updated: 2026-09-10 ET" line was
    used as a proxy date. Schema violation, invisible to the validator.
  - Nexla and Puttery NYC use `updated` + a separate "Client Intelligence
    Overlay" `next_action`/`review_on` instead of the standard
    `last_touched`/`due` pair — non-standard schema, still classifiable but
    inconsistent with the other ~30 clients.
  - Omega Landscaping's `overview.md` frontmatter `last_touched` still reads
    `2026-08-01` even though its own body text records a real 2026-09-14
    update (the client-contact channel confirmed dead) — frontmatter
    discipline gap, unresolved for at least two pulse cycles.
  - Capsule & Tonic and Everyday Life Insurance both carry `status:
    pending-registry-reconciliation` — live/paused/duplicate disposition
    unclear from the vault alone.
  - Blissful Events carries `status: completed` but an unresolved
    `next_action: TBD` — candidate to archive rather than keep in the active
    sweep.
  - Replenish carries `status: paused` with 3 open tasks and no resumption
    trigger date.

## Moving (< 48h)

None. No client shows genuine content change or a `last_touched` inside
2026-09-20–09-22.

## Watch (2–7 days)

None. Omega Landscaping was the sole client sitting at the exact 7-day
boundary in yesterday's brief; it is 8 days out today and has moved to
stalled below.

## Stalled (7+ days)

- **Have an active canonical work item** (real work may be moving in the
  canonical queue even though the vault note isn't touched): BigOrange
  Marketing (`website-design-build`, needs approval, past due, 5 open
  tasks), Revive Systems (`workflow-automation-system`, blocked on OAuth),
  Momentum 360 (`data-source-integration`, blocked on CallRail access, past
  due), Align HCM (`data-source-integration`, blocked on MFA — see
  reconciliation flag below), Tags 2 Go (`research-audit-decision-brief`,
  blocked on Ads access, last real signal 2026-09-13). Suggested next touch:
  clear the listed gates (see Likely Next Work Packages) rather than editing
  the notes themselves.
- **Closest to current, no canonical item**: Omega Landscaping (body-text
  update 2026-09-14, frontmatter still stuck at 2026-08-01 — fix the stale
  field and finish the Zapier lead-field workaround into Momentum's own
  account, since the client-contact access path is confirmed dead), Nexla
  (2026-09-09 — confirm exact budget/landing pages/conversion action/GA4 vs
  Ads tracking authority before nonbrand launch), Puttery NYC (2026-09-02 —
  rotate/verify the Tock credential, approve a durable host, register the
  webhook), Deborah-Mara (2026-09-10 by body date — AEO plan + addendum
  delivered, no dated next step recorded).
- **No canonical work item, stale by frontmatter `last_touched`, grouped by
  date**:
  - **~72 days** (since 2026-07-12): Hope Wellness Center, Kimberly James
    Bridal, Onsite Concrete.
  - **~53 days** (since 2026-08-01): AMI Cleaning, Bar Crawl USA, Bercos
    Popcorn, BOK Law Firm, Bridge Software Development, Capsule & Tonic,
    Cindy May Christmas, Everyday Life Insurance, Fresh Blends, NKCDC,
    Pritzker Law Group, Pro Fence & Deck, Replenish (`status: paused`),
    Revive Systems, VA Claims.
  - **~55 days** (since 2026-07-29): Align HCM, AWCI, Bend Plastic Surgery,
    Blissful Events (`status: completed`), Bluegrass Janitorial, Bridge of
    Hope OTC, Buzz Bull, Coach B, Commercial Cleaners Alliance, Florecita,
    Hardwood Artisan, Link Eze, Next Gen Solutions, PNW Pro Clean, Vanessa.

## Due in 48h

None. No `due:` frontmatter field or inline date anywhere in `01_Clients/`
falls inside 2026-09-22–09-24. Every `due` value found is already months in
the past (e.g. `2026-07-15`, `2026-08-08`, `2026-09-01`) or set to `none` —
a vault data-quality gap, not an actionable 48h list.

## Likely next work packages

1. **BOK Law Firm — weekly three-topic designed content kit.** Evidence
   tier: `owner-verified-recurrence`. Confidence: 0.96 (confirmed-pattern).
   **Window: 2026-09-22–09-24 — today**, per yesterday's run
   (`predicted-work-2026-09-21.md`); today's raw candidate shows
   2026-09-29–10-01 only because the recurrence engine always reports the
   *next future* date and skips a same-day match (see coverage notes above)
   — this is next week's echo, not a supersession. Deliverable: three
   designed topics, three ChatGPT-generated topic background images, three
   branded template graphics (PNG/JPG), source + final PDFs, and a
   copy/geography/image-count/duplicate-check receipt. This is the one
   unblocked, confirmed-pattern package live today — see priority stack.
2. **BigOrange Marketing — website-design-build.** Evidence tier:
   canonical-queue (`wi-20260718-0001`). Confidence: 0.86 (likely), state
   `needs_approval`, past due. Deliverable: final factual sign-off on the
   completed private WordPress pilot plus the exact invoice
   recipient/date/timing before publication or invoicing. Gate: requires its
   recorded approval — not ready to execute.
3. **Revive Systems — workflow-automation-system.** Evidence tier:
   canonical-queue (`wi-20260717-0002`). Confidence: 0.68 (watch), state
   `blocked`. Gate: blocked on a human Google OAuth reauth for the recorded
   HighLevel location; no execution until the gate clears.
4. **Momentum 360 — data-source-integration.** Evidence tier: canonical-
   queue (`wi-20260718-0003`). Confidence: 0.68 (watch), state `blocked`,
   past due. Gate: blocked on restoring direct CallRail membership and Track
   360/Google Suspension test destinations.
5. **Align HCM — data-source-integration.** Evidence tier: canonical-queue
   (`wi-20260723-0005`). Confidence: 0.68 (watch), state `blocked`. Gate:
   blocked on Align Microsoft/HubSpot MFA reauth. **Flag, unresolved across
   multiple pulse cycles:** this client relationship is confirmed ended per
   `CLAUDE.md` (2026-09-02) — the queue owner should confirm whether this
   item should still be open before any prep happens.
6. **Tags 2 Go — research-audit-decision-brief.** Evidence tier: canonical-
   queue (`wi-20260807-0001`). Confidence: 0.68 (watch), state `blocked`.
   Gate: blocked on restoring agency-admin Google Ads access.

Item 1 (BOK) is the only confirmed-pattern, unblocked package and its
window is today (2026-09-22–09-24) — see the clarification above. Items 2-6
are gated on approval or a human-only access fix and belong in the gates
list, not today's priority stack.

## Capacity shadow

- Chronos shadow status: **`request-ready`** (a routeable workload request
  was built this run, but Chronos has not cleared its own bar).
  `planner_consumption_gate: false` — per the skill's own rule, Chronos
  output is **not** used to rank clients while this gate is false.
- The only stored Chronos receipt (`latest-chronos.json`, generated
  2026-09-02, decision `retain-deterministic-baseline-primary`) carries
  source fingerprint `d58cc5d6...`, which does **not** match this run's
  fingerprint (`de4391c8...`) — now 20 days stale. Per the skill
  instructions, a mismatched receipt is not read into this brief — no
  baseline decision, holdout result, or total-workload band is shown today.
- Net: no capacity shadow warning this cycle. The portfolio's dated
  work-package history series is all zeros across the 90-day window scanned
  by the local time-series builder (separate from the 31 canonical-queue
  deliverable events picked up via `--client-ops-root`) — a coverage gap for
  the time-series builder specifically, not evidence that no work happened.

## Tomorrow's priority stack

1. **BOK Law Firm weekly content kit** — the window is live today
   (2026-09-22–09-24, confirmed-pattern, 0.96). Locate and fingerprint the
   source packet and resolve topics/copy/dates today; see the window
   clarification above before treating the raw 2026-09-29 candidate ID as a
   date change.
2. **Omega Landscaping frontmatter + Zapier fix.** Real, dated client work
   (contact channel confirmed dead 2026-09-14) sitting behind stale
   `last_touched: 2026-08-01` frontmatter. Fixing the field and finishing
   the Zapier lead-field addition to Momentum's own account both advances
   real work and stops the client from silently vanishing into the
   undifferentiated stalled pile.
3. **Align HCM reconciliation.** Standing vault/queue data-integrity gap
   (relationship ended 2026-09-02, canonical queue still carries a live
   blocked item) carried forward across multiple pulse cycles — a five-
   minute registry check would close it rather than let it keep resurfacing
   as a false candidate.
