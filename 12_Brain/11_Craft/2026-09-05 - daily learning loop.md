---
note_type: review
status: active
created: 2026-09-05
updated: 2026-09-05
source_refs: ["12_Brain/state/agent-craft-brief.json", "_os/automation/bin/agent-craft-brief.js", "System/approval-queue.md", "System/gateway-health.md", "12_Brain/registry/automations.json"]
tags: [craft, agent-infrastructure, learning-loop]
window: 2026-09-03T12:00 to 2026-09-05T00:00
---

# Daily learning loop — 2026-09-05

The self-reporting layer is the part of this estate that has stopped working. Three
routines each report a healthy state that is not true, and in every case the untrue
signal has already been consumed downstream as if it were a measurement.

Not a repeat of [[Daily-Briefs/week-review-2026-09-04|week-review 2026-09-04]], which
covers the week's client and delivery picture. This note covers only the machinery.

## What the window actually contained

Every commit to this vault in the 36 hours to 2026-09-05 00:00 was machine-authored:
`d0a4b61` week-review, `7636bf0` morning-brief, `ba9a8f2` radar sweep, and `12c2b5e`,
Dillon's merge of Claude's vault-hygiene PR #359. One human-authored commit landed
anywhere in the estate: `faee50b` in `client-operations-canonical`. No new captures, no
`12_Brain/09_Ops/` changes, no `12_Brain/11_Craft/` changes.

VERIFIED from `git log` in all three checkouts. File mtimes are useless here — every
file in a cloud checkout carries checkout time — so git history is the only evidence
base, and unpushed local work is invisible to this loop by construction.

## 1. The recursion routine is dead and its ledger says `ok`

`agent-craft-brief` is the routine whose entire job is to notice routines that have
stopped. It has stopped, and none of its own instrumentation caught it.

VERIFIED:

- Last brief in this folder: [[12_Brain/11_Craft/2026-08-19 - operating brief|2026-08-19]].
  17 days ago. `00_Index.md` still reads `updated: 2026-08-19`.
- `12_Brain/state/agent-craft-brief.json` as committed: `status: "ok"`,
  `generated_for: 2026-09-02`, `window_days: 3`, over receipt days
  `2026-08-16..2026-08-18` — already 15 days stale at write time. `dry_run: true` sits
  at line 272, 269 lines below the `status` a reader checks first.
- `12_Brain/queue/claude-loop-*.jsonl` ends at `2026-08-18`. The only writer is
  `System/scripts/Invoke-ClaudeLoop.ps1`, which runs on Dillon's Windows box. Nothing
  in the cloud can observe or restart it.
- Re-running `node _os/automation/bin/agent-craft-brief.js --days 3` on 2026-09-05
  returned the same `days` array, the same 22 routines, the same 10 workhorses, with
  `generated_for` moved forward three days.

Two mechanisms, both in `_os/automation/bin/agent-craft-brief.js`:

- `loadDays()` (~line 41) does `.sort().slice(-limit)` — the last N *files*, never
  filtered by date. `--days 3` means "three files", so the window number stays correct
  while the window itself ages without limit.
- `writeRunState(...)` (line 344) sits outside the `if (write)` block (line 217), so a dry run
  stamps `status: "ok"` into the state ledger having produced no brief.

The estate predicted this exact failure and then shipped it. `00_Index.md` already
carries the standing lesson *"A fail-closed probe pointed at a source nothing writes is
not caution, it is a dead routine"*, and
[[12_Brain/11_Craft/earned-lessons|earned-lessons]] already carries *"A zero exit code
and a zero error count can still be a failed routine"* (2026-08-18). Both were written
by this layer. The routine that wrote them is the current instance.

INFERRED, not verified: that `Invoke-ClaudeLoop.ps1` stopped on 2026-08-18 rather than
running and failing to write. From the cloud I can see the absence of output, not the
cause.

## 2. The approval queue is 72% dead noise, and the number has been consumed

VERIFIED in `System/approval-queue.md`: 183 open `- [ ]` items, of which **132 are
Hermes Gateway conflict-storm entries** dated 2026-07-30 to 2026-08-04. The real open
backlog is **51**.

The monitor appended a fresh approval item on every ~30-minute poll instead of updating
one standing item, so a single unresolved incident produced 132 near-identical requests
that differ only in a PID and a conflict count. `System/gateway-health.md` then froze at
`last_updated: 2026-08-17` with `conflicts_1h/6h/24h: 0` — the incident is over, and
every one of the 132 asks is permanently unactionable.

This has already corrupted a measurement.
[[Daily-Briefs/week-review-2026-09-04|week-review 2026-09-04]] reports "183 still open"
as the backlog. Nothing in that review was wrong to do; the input lied to it. Noise from
one routine became a headline number in another, which is how a compounding system
compounds the wrong thing.

Second, smaller defect in the same file: its own frontmatter reads
`last_updated: 2026-08-17` while items dated 2026-09-01 sit in the body. The appender
does not touch the header, so the queue's freshness field is decorative.

## 3. Fail-closed runs retry access gates and data gates as one thing

VERIFIED in `client-operations-canonical`: `wi-20260718-0003` failed closed twice on
2026-09-03 — `7d7c612` at 03:03 and `faee50b` at 22:08 — with an identical blocker list
in `evidence/2026-09-03-caller-auto-response-acceptance-blocker.md`. Queue revision
moved 424 → 425 and the work item's status did not change.

Three blockers need Dillon at a keyboard: CallRail membership, a locked Bitwarden vault,
an unavailable browser-control runtime. The fourth does not — *"the exact Track 360 and
Google Suspension test destinations are not recorded in the canonical work item"* is two
phone numbers. The second run re-verified the HubSpot portal and re-derived the same
four blockers instead of raising the one gate that costs a sentence to close.

The run behaved correctly at the boundary — it stopped before dialing, and no call,
email, or Slack message was sent on either attempt. The waste is in the retry shape,
not the safety.

## The pattern under all three

Each of these routines distinguishes "the code finished" from "the work happened" only
in a field nobody reads: `dry_run` at line 272, a `last_updated` header the appender
skips, a blocker list that does not say who can clear each entry. A status field that
cannot express *"I ran and there was nothing to read"* will report success instead, and
success is the one answer no one investigates.

See [[12_Brain/11_Craft/earned-lessons|earned-lessons]] for the two entries this pass
appended, and [[12_Brain/09_Ops/AGENT_PROTOCOL|Agent Protocol]] for the verification
rules these routines are supposed to satisfy.
