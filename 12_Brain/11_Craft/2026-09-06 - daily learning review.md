---
note_type: review
status: active
created: 2026-09-06
updated: 2026-09-06
source_refs:
  - "[[12_Brain/01_Captures/sessions/2026-09-05 - pr-sweep-and-client-archive]]"
  - "[[11_Agents/Cloud Routine Prompts 2026-09-05]]"
  - "[[12_Brain/11_Craft/earned-lessons]]"
  - "12_Brain/state/agent-craft-brief.json"
  - "System/approval-queue.md"
  - "System/gateway-health.md"
tags:
  - craft
  - agent-infrastructure
  - review
---

# Daily learning review - 2026-09-06

Hand-written, not generated. The generator's own namespace is
`<date> - operating brief.md` and it rewrites `00_Index.md` on every `--write`, so a
hand-authored note has to live outside both or the next run silently eats it.

One finding runs through everything below: **this estate's self-reporting is greener
than the estate.** Three separate layers report healthy while their inputs are dead,
and each one was designed by someone who already knew that failure mode.

## The recursive layer has been reporting on August since August

VERIFIED. `node _os/automation/bin/agent-craft-brief.js --days 3`, run today,
2026-09-06, returned `"status": "ok"` over the window `2026-08-16` to `2026-08-18`.
The newest file matching its only input glob,
`12_Brain/queue/claude-loop-*.jsonl`, is `claude-loop-2026-08-18.jsonl`. Nothing has
written a loop receipt for 19 days.

The defect is one line. `loadDays()` does `.sort().slice(-limit)` — it takes the last
N *files present*, never the last N *calendar days*. An abandoned queue therefore
yields a full-looking window, and `status: 'ok'` was a hardcoded literal. The only
`blocked` path in the CLI is "no receipt logs found", which requires an *empty*
directory. A directory frozen in August is indistinguishable from a live one.

Downstream: `12_Brain/state/agent-craft-brief.json` recorded
`generated_for: "2026-09-02"`, `written_at: "2026-09-02T02:32:58.290Z"`,
`status: "ok"`, `dry_run: true` — so on 2026-09-02 the loop ran the tool, got a green
light on 15-day-old data, and wrote no brief. `12_Brain/11_Craft/` still ends at
[[12_Brain/11_Craft/2026-08-19 - operating brief|2026-08-19 - operating brief]].
[[12_Brain/11_Craft/00_Index|The craft index]] says "Briefs are generated daily from
the loop receipts" and has been wrong for 18 days.

This is standing lesson three in that index wearing the opposite mask: *a fail-closed
probe pointed at a source nothing writes is not caution, it is a dead routine.* Here
it failed **open**, which is worse — a dead routine that reports green teaches the
estate that it is healthy.

INFERRED, not checked: what stopped writing the receipts. The writer is
`System/scripts/Invoke-ClaudeDailyDriver.ps1` on the Windows box; a cloud session
cannot see whether it still runs. `claude-daily-driver-*.jsonl` and
`claude-invariants-*.jsonl` stop on the same date, which points at the driver rather
than at the receipt-writing code specifically.

Applied in this PR: `status` is now `stale` when the newest receipt is older than the
window it claims to cover, alongside `newest_receipt` and `receipt_age_days`; a stale
run prints to stderr and stamps a **STALE - do not read these numbers as today**
banner into the brief. Today it reports `"status": "stale"`, `"receipt_age_days": 19`.
The old test asserted `status === 'ok'` unconditionally, which is part of why this
survived; it now asserts the honest contract.

## 132 of 182 approval asks are one incident from July

VERIFIED by count. `System/approval-queue.md` holds 182 unchecked items. 132 of them
are `[Hermes Gateway / System]` conflict-storm entries dated 2026-07-15 to 2026-08-10,
each a near-verbatim restatement of the last with a new PID and conflict count. Fifty
items — every real client and operating ask, including the 2026-09-05 registry
retirement patch and the Netlify cleanup — are buried under them.

The incident is over. `System/gateway-health.md` carries
`last_updated: 2026-08-17T13:31:06.524Z` with `conflicts_1h: 0`, `conflicts_6h: 0`,
`conflicts_24h: 0`, and Telegram `disconnected`; its last commit is `113f58e`
(2026-08-17). So the source that generated 132 approval asks stopped writing 20 days
ago, and its own final entry says there is nothing to approve.

INFERRED: the append mechanism. `System/scripts/refresh-gateway-health.ps1` does not
touch the queue itself — its only reference is line 68, which emits the string
`'External poller likely - see approval-queue; do NOT auto-rotate token'`. An agent
routine reading that recommendation each probe appended a fresh item instead of
updating one standing item. Not verifiable from a cloud session.

A queue whose items are 72% one dead incident is not a queue; the approval boundary
only works while the list is readable. The collapse is proposed, not applied — 131
pending approval items are Dillon's to close, not a routine's.

## The prompt fixes written yesterday were never pasted

VERIFIED from this session's own inputs. [[11_Agents/Cloud Routine Prompts 2026-09-05]]
is still `status: awaiting-paste`, and the prompt that started this run is the old
PHASE 5 text: it lacks the carry-forward-and-self-close paragraph written for it
yesterday. Consistent with the artifact: `daily-learning/2026-09-05` (#368) and
`daily-learning/local-2026-09-03` (#363) are both still open today.

The constraint behind it is real and recorded: an agent session cannot edit a Routine
created through the HTTP API. Every prompt fix is a hand-off, so a prompt fix left in
the vault is a prompt fix that has not happened. The follow-up belongs somewhere with
a due date, not only in a note headed `awaiting-paste`.

## File mtimes are not evidence in a cloud container

VERIFIED. All 742 markdown files in this checkout share the clone timestamp
(`find . -name '*.md' -newermt 2026-09-05 | wc -l` returns 742 of 742). The repository
is cloned fresh when the container starts, so mtime records the clone and nothing
else. Any routine prompt telling a cloud session to use file mtimes as an evidence
base — this one does — is asking for a signal that cannot exist there. `git log` and
file content are the whole evidence base remotely.

## What actually happened in the last 36 hours

Little, and that part is healthy. Two merges into `dillon-os` main
(`1a97d64` #358 Repository Access Map, `033e933` #372 the retirement sweep), one
radar-bot sweep (`8f850f3`), and `dillon-claude-config` #1 and #2. No commits in
`client-operations-canonical` since `faee50b` on 2026-09-03. The 2026-09-05 sweep is
already documented in full in
[[12_Brain/01_Captures/sessions/2026-09-05 - pr-sweep-and-client-archive|its own capture]]
and is not restated here.

## Follow-ups

- Find and restart the loop-receipt writer, or retire the receipt contract. The craft
  brief is honest now, but honest about being blind.
- Collapse the Hermes block in `System/approval-queue.md` to one standing item.
- Give the awaiting-paste Routine prompts an owner and a date.
