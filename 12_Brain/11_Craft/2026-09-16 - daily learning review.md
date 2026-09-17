---
note_type: review
status: active
created: 2026-09-16
updated: 2026-09-16
window: 2026-09-14T12:00Z to 2026-09-16T04:00Z
source_refs:
  - "e32672f4fe63a9e557a0ed99a8dfebca85677042"
  - "215c09c"
  - "121bf05202edd494fb52f3bedfc47aae27f9771d"
  - "54c4ac6c9fa5085efea9d85215f50446daccc742"
  - "_os/automation/cadence/run-ledger.jsonl"
  - "https://github.com/dillonmohr8777/dillon-os/pull/404"
  - "https://github.com/dillonmohr8777/dillon-os/pull/402"
tags: [craft, agent-infrastructure, daily-learning]
---

# Daily learning review — 2026-09-16

Hand-written, not generated. The generated brief comes from
`_os/automation/bin/agent-craft-brief.js`; so does `00_Index.md` in this folder
(`agent-craft-brief.js:385`), which is why neither is edited here.

One thing happened in this window and everything else is downstream of it: on
2026-09-15 the vault's working tree rejoined `main` after twenty-eight days
apart, and the merge that reunited them deleted two live cadence jobs.

## Verified

**The working tree had been off `main` since 2026-08-18, and could not commit
since 2026-08-23.** Three commits ended it. `e32672f` deleted a zero-byte file
named `NUL` — a reserved Windows device name created by a `> NUL` redirect on
2026-08-23 — which had been making `git add -A` fail with `invalid path`.
`215c09c` then committed the working tree that had accumulated behind it:
**2,210 files, 584,366 insertions**. `121bf05` merged `origin/main` back in,
**466 files / 179,017 insertions**, its own message recording the tree as 109
commits behind with 308 tracked files absent from disk. `54c4ac6` (PR #404) put
the result on `main`.

**The self-reporting layer never stopped. It was writing to a tree git could not
commit.** `215c09c` added twenty-eight consecutive loop receipt files,
`claude-loop-2026-08-19.jsonl` through `claude-loop-2026-09-15.jsonl`, with no
gaps. Before it, the newest receipt reachable on `main` was
`claude-loop-2026-08-18.jsonl` — confirmed by
`git ls-tree 7581e75 12_Brain/queue/`. Every cloud-side reading of this estate
between 2026-09-05 and 2026-09-15 concluded from that absence that the producer
had died: PR #368 "the self-reporting layer is what broke", PR #373 "the
self-audit was green on a dead queue", PR #402 "the receipt writer … last wrote
`claude-loop-2026-08-18.jsonl`". The receipts existed on disk the entire time. A
reader whose only surface is `origin/main` cannot tell a stopped producer from
an uncommitted one, and this estate has spent eleven nights proving it.

**The merge deleted two cadence jobs.** `_os/automation/cadence/daily.yaml` was
changed on both sides after the fork — `main` added Morning Chief and other
edits (`dc9a271`, `988ef62`, `11451ed`), the working tree added `daily-sweep` —
so it conflicted, and the resolution took `main`'s side whole:

| version | jobs |
|---|---|
| `e32672f` (working tree) | `daily-sweep` `morning-chief` `heartbeat` `approval-queue-diff` `unfiled-sweep` |
| `1310d5a` (`main`) | `heartbeat` `approval-queue-diff` `unfiled-sweep` |
| `HEAD` (merged, live) | `heartbeat` `approval-queue-diff` `unfiled-sweep` |

Both deleted jobs were demonstrably running hours earlier. `run-ledger.jsonl`
carries three `daily-sweep` rows on 2026-09-15 (13:55:12Z, 13:57:41Z,
14:00:01Z), and `5a15192` is a `cadence(daily): morning-chief` commit from
10:03 the same morning. `_os/automation/bin/daily-sweep.js` is still on `main`;
only the manifest entry that runs it is gone.

**The absence detector lost two of the five things it watched, and cannot say
so.** The heartbeat's own 2026-09-15 ledger note reads: *"3 ABSENT for
2026-09-14: morning-chief, omega-search-terms, report-pairing-check."* It names
absence by comparing the ledger against the manifest. `morning-chief` is no
longer in the manifest, so from now on it is not absent — it is not expected.
This is the exact failure the cadence layer was built to catch, and it arrived
through the one path the layer does not watch: a merge.

**The same resolution rewound generated state on `main`.**
`12_Brain/state/agent-craft-brief.json` now reads `generated_for: "2026-09-02"`,
`window_days: 3`, `days: [2026-08-16, 2026-08-17, 2026-08-18]`, `status: "ok"`,
while `2026-09-15 - operating brief.md` sitting beside it correctly counts
2026-09-02 to 2026-09-15. `System/sweep-status.md` and
`12_Brain/state/daily-sweep.json` both went from `2026-09-15T14:00:01.764Z` back
to `2026-09-14T16:12:54.073Z`. `INDEX.md` tells every reader that if the date at
the top of `sweep-status.md` is not today, nothing below it was collected today
— so `main` currently under-reports its own freshness by a day. These files are
regenerable and are not edited here.

**The staleness defect in `agent-craft-brief.js` is unfixed and its symptom is
gone.** PR #402 proposed a guard for `loadDays()`
(`_os/automation/bin/agent-craft-brief.js:41-58`), which takes `.sort().slice(-limit)`
— newest files *by name*, never compared to today — and for `main()` (`:135-141`),
which returns `blocked` only on an empty window. Nothing was applied. The brief
stopped printing August under September dates on 2026-09-15 because receipts
started reaching `main` again, not because the generator learned to check. The
next time the receipt writer stops, or a tree diverges, it will silently do it
again.

## Inferred

- The 2026-08-18 fork and the 2026-08-23 `NUL` file are a sufficient joint
  explanation for the whole "the estate stopped learning" arc: the fork made
  `main` stop receiving, and `NUL` made it impossible to fix by committing.
  Nothing verifies that they are the *only* causes.
- Nothing in the merge commit indicates the two job deletions were deliberate.
  A conflict resolved wholesale toward one side is the simplest explanation and
  the job text carries no removal rationale, unlike every other retirement in
  this estate.

## Not verified

- Session transcripts. Gitignored, genuinely unreachable from the cloud; none
  were read.
- Local and unpushed work, and whether the Windows tree still runs a local
  `daily.yaml` that differs from `main`. If it does, the two jobs are still
  firing there and only `main` is wrong — which would make this a divergence,
  not an outage.
- `dillon-claude-config` distilled memory (`projects/*/memory/*.md`) contributed
  nothing: that repo's newest commit is `c4816ae`, 2026-09-05.
  `client-operations-canonical` moved only by two merge commits (`e9be4e0`,
  `459d7b3`) carrying work from 2026-09-08.

## Related

- [[12_Brain/11_Craft/earned-lessons|earned-lessons]] — two entries appended for
  this window.
- [[12_Brain/09_Ops/AGENT_PROTOCOL|Agent Protocol]] — "surface contradictions
  instead of smoothing them over" is why the eleven nights of wrong root cause
  are named here rather than quietly superseded.
- [[System/operating-status|Operating Status]],
  [[System/approval-queue|Approval Queue]].
