---
note_type: review
status: active
created: 2026-09-04
updated: 2026-09-04
source_refs:
  - "12_Brain/state/agent-craft-brief.json"
  - "_os/automation/bin/agent-craft-brief.js"
  - "12_Brain/queue/claude-loop-2026-08-18.jsonl"
  - "12_Brain/11_Craft/2026-08-19 - operating brief.md"
  - "System/approval-queue.md"
tags: [craft, agent-infrastructure, review]
window: 2026-09-02..2026-09-04
---

# Daily learning loop review - 2026-09-04

Hand-written, not generated. The generated brief is
`YYYY-MM-DD - operating brief.md`; this file deliberately does not match that
name so `agent-craft-brief.js` will not overwrite it.

**One line: the estate kept executing and stopped learning.** Delivery
automations all ran on 2026-09-03. Every loop that feeds the recursive layer has
been dead for 17 days, and the tool built to notice that reported `ok`.

## The delivery layer is healthy

VERIFIED from `git log --since='36 hours ago'` in all three checkouts:

- `7fc48ba` radar sweep, +17 found, 31 re-graded, 1329 tracked.
- `e7cb0fc` morning brief for 2026-09-03: inbox, metrics, plan, pulse, predicted
  work.
- `12c2b5e` vault hygiene (#359): `vault-clean` and `wiki-lint` reports.
- `faee50b` / `7d7c612` in client-operations-canonical: the Momentum caller
  blocker, recorded and then refreshed.

Nothing here is broken. The scheduled work ran and produced output.

## The learning layer is dead, and it said `ok`

VERIFIED. `12_Brain/queue/` holds one receipt file per driver day. The newest is
`claude-loop-2026-08-18.jsonl`. `claude-daily-driver-*` also stops at 08-18.
The last generated brief is `2026-08-19 - operating brief.md`. The last commit in
`dillon-claude-config` is `7a45db1`, 2026-08-18.

So four independent streams stopped on the same day, and the vault has had no
craft brief for 17 days.

The part that matters is why nobody was told. `12_Brain/state/agent-craft-brief.json`,
written for 2026-09-02, records:

```json
"status": "ok",
"generated_for": "2026-09-02",
"days": ["2026-08-16", "2026-08-17", "2026-08-18"]
```

`status: ok` on a window that ended 15 days before the run. The cause is in
`loadDays()`: it lists `12_Brain/queue/`, filters by filename, sorts, and takes
the last N. Recency is never checked against today. The only fail-closed branch
is `!days.length` — an empty directory. One surviving historical receipt file is
enough to keep the routine reporting healthy forever, recomputing the same frozen
numbers.

This is the estate's own standing lesson turned on the instrument that recorded
it: *a fail-closed probe pointed at a source nothing writes is not caution, it is
a dead routine.* The craft brief was the probe.

INFERRED, not verified: the receipt stream stopping on 2026-08-18 coincides with
`7a45db1 Install the seven dillon-os agents at user level` in
`dillon-claude-config` the same day. Plausible that the reinstall moved or
renamed the driver's write path, but the driver runs on Dillon's Windows box and
is not reachable from a cloud session. **The generator is fixed; the reason the
receipts stopped is still unknown and needs the local machine.**

## Retrying an access-gated routine does not clear the gate

VERIFIED from client-operations-canonical `7d7c612` (03:03) and `faee50b`
(22:08), both 2026-09-03. Work item `wi-20260718-0003`, the Momentum caller
auto-response acceptance test, ran twice in one day and failed closed before
dialing both times.

The blockers are human-authentication gates, not code: no direct CallRail
membership for the mapped account, Bitwarden vault locked, the two approved test
destinations and the controlled caller route absent from canonical artifacts.
Between 03:03 and 22:08 none of those changed, because clearing any of them
requires Dillon. The second run resolved one incidental defect (the in-app
browser package regained its executable) and immediately hit a fresh one (the
browser-control runtime was unavailable), so it burned a full run to arrive at
the same place.

Correct behaviour on both runs — it sent nothing and dialed nothing. The waste is
that it was attempted at all. The work item has been `Blocked` on the same four
gates since 2026-07-18.

**The lesson is about scheduling, not about the routine.** An item blocked purely
on human gates should not be re-attempted until at least one gate's state has
changed. Re-running it produces an identical blocker note and a queue revision
bump — `CONTROL.md` went 424 → 425 — which reads like progress in the log and is
not.

## The approval queue is 64% stale noise

VERIFIED by line count: 132 of 206 lines in `System/approval-queue.md` are Hermes
Gateway conflict-storm entries. They are near-identical, differ only in a PID and
a conflict rate, and the newest is 2026-08-04 — a month old. One incident emitted
an approval row per 30-minute health check instead of updating a single open one.

The cost is that the two genuinely current items — the With Not For private repo
(blocked on a 403 from the remote session token) and the Prospect Radar
Cloudflare Worker deploy, both 2026-09-01 — sit at the bottom of a file whose
first 130 lines are a resolved incident. The frontmatter still says
`last_updated: 2026-08-17` while entries run to 2026-09-01, so the file's own
staleness marker is wrong too.

Not fixed here. Pruning a human's approval gate is the human's call.

## What this run changed

- `_os/automation/bin/agent-craft-brief.js` now compares the newest receipt day
  against today and exits `status: stale` past two days instead of reporting
  `ok`. Verified against live state: it now returns
  `newest receipt log is 2026-08-18, 17 day(s) old`.

## Related

- [[12_Brain/11_Craft/00_Index|Agent Craft index]]
- [[12_Brain/11_Craft/earned-lessons|earned-lessons]]
- [[12_Brain/11_Craft/2026-08-19 - operating brief|2026-08-19 - operating brief]]
  — the last brief generated before the receipt stream stopped.
