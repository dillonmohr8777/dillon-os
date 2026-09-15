---
note_type: review
status: active
created: 2026-09-08
updated: 2026-09-08
source_refs:
  - "[[11_Agents/Cloud Routine Prompts 2026-09-05]]"
  - "[[12_Brain/09_Ops/Repository Access Map]]"
  - "_os/automation/bin/predict-work.js (main, commit 760a532)"
  - "origin/claude/predictive-workflows-v2 (PR #356)"
  - "origin/daily-learning/2026-09-07 (PR #380)"
  - "12_Brain/state/work-predictor/latest.json (commit 4e3b91e)"
tags: [craft, agent-infrastructure, daily-learning]
window: 2026-09-06T12:00Z..2026-09-08T04:00Z
---

# Daily learning review - 2026-09-08

One line: the prompt-level workaround the estate has been waiting three days to paste
by hand is a patch for a code bug whose four-line fix was already written on
2026-09-02 and is still stranded in an open pull request that has since rotted into
conflict.

VERIFIED means reproduced by running a command or read from a commit, branch, or file
in this checkout. INFERRED is labelled inline.

## What actually moved

Two commits reached `origin/main` in the window, both machine-authored:

| Commit | When (UTC) | Author | What |
|---|---|---|---|
| `4e3b91e` | 2026-09-07 11:19 | Claude | `morning-brief: 2026-09-07` — 9 files, the four daily skills plus `predicted-work-2026-09-07.*` |
| `760a532` | 2026-09-07 12:25 | radar-bot | Radar sweep — +9 found, 9 re-graded, 1387 tracked |

`dillon-claude-config` and `client-operations-canonical` had **zero** commits on any
branch in the window (`git log --since='36 hours ago' --all`, empty in both).

Human-directed work did happen, but none of it landed on `main`. Three draft pull
requests were opened after PR #380 was written: #381 (Cursor bot, 13:04Z), #382
(advisor subagent, 18:08Z), #383 (Momentum 360 HubSpot degraded streak, 23:02Z), and
#377 was pushed to again at 2026-09-08 02:46Z. Nothing merged. The last merge to
`main` remains #372 on 2026-09-05.

## The finding: a fix written once, then rediscovered as a prompt patch

[[11_Agents/Cloud Routine Prompts 2026-09-05]] prescribes, as its morning-brief
change, exporting `DILLON_CLIENT_OPERATIONS_ROOT` before the skills run — with the
measured justification that "without the variables `predict-work.js` resolves the
canonical queue only intermittently (1 candidate vs 7)". That note has carried
`status: awaiting-paste` since 2026-09-05 because the Routines were created through
the HTTP API and no agent session can edit them.

VERIFIED — the underlying bug, reproduced tonight on `main` at `760a532`:

```
$ env -u DILLON_CLIENT_OPERATIONS_ROOT node _os/automation/bin/predict-work.js --dry-run
{ "status": "ok", "candidates": 1,
  "deliverable_events_scanned": 0, "active_queue_items_scanned": 0, ... }
```

`discoverClientOpsRoot()` in `_os/automation/bin/predict-work.js:32` has exactly two
candidates: the env var, and `~/Documents/Codex/projects/client-operations`. The
second is a Windows-shaped path. In this container it does not exist
(`ls` → No such file or directory), while the canonical checkout *does* exist at
`/home/user/client-operations-canonical/registry/clients.json` (44,546 bytes). So in
every cloud session the resolver falls through to `null` and the planner scans
nothing — and still prints `"status": "ok"`.

VERIFIED — the fix already exists. `origin/claude/predictive-workflows-v2` (PR #356,
opened 2026-09-02, **not** a draft) adds precisely the two missing sibling candidates
to that same function, and #356's own body says so in one line: "`predict-work.js`
also discovers a sibling `client-operations-canonical` clone for cloud runs."

VERIFIED — the fix is now trapped. #356 is 9,861 additions across 42 files, and
`git merge-tree --write-tree origin/main origin/claude/predictive-workflows-v2` exits
1 with conflicts. A four-line fix cannot be taken without taking a rewritten
forecasting stack with it.

So the estate arrived at the same defect twice by two different routes, and the second
route produced a hand-paste chore instead of a merge. The prompt patch also only
covers the one routine whose prompt got the export; every other cloud caller of
`predict-work.js` stays broken.

INFERRED: that the 2026-09-05 author did not know #356 already contained the fix. The
note reasons from measured symptoms (1 candidate vs 7) and never mentions #356. That
is consistent with, but not proof of, not having found it.

## The second-order defect: `status: ok` on a run that read nothing

The before-state above is the sharper problem. A planner that resolved no canonical
root, scanned 0 deliverable events and 0 queue items, and emitted one lone candidate
reported itself **ok**. Every consumer downstream — `plan-today`, `Dashboard.md`,
the morning-brief final message — reads that as a healthy run.

This is [[12_Brain/11_Craft/earned-lessons|earned lesson 2026-08-18]], "a zero exit
code and a zero error count can still be a failed routine", recurring in a second
component. By the craft index's own promotion rule ("once a lesson has appeared
twice, write it into `12_Brain/03_Concepts/`") this one is now due for promotion. It
is not promoted in this diff — see *Why nothing else is applied* below.

#356 also already fixes this ("Missing canonical sources set `status: degraded`").
Same fix, same stranded PR.

## Why the mtime half of this routine's own instructions is dead — found again

This is the third night this has been written down. `origin/daily-learning/2026-09-06`
(PR #373) carries the section "File mtimes are not evidence in a cloud container".
The routine's PHASE 2 still tells it to use "`git log` and file mtimes as your
evidence base", because the finding lives in an unmerged PR and the prompt lives in
the Routines UI. Restating it a third time is not progress; changing the prompt is.

VERIFIED again tonight, since the numbers are new to this container:

- `12_Brain/09_Ops/Repository Access Map.md` — mtime `2026-09-08 00:02:28`, but last
  actually changed in `d623bf5` on `2026-09-05 15:54`.
- `CLAUDE.md` — mtime `2026-09-05 00:02:07`, from the original clone.

Two different container events, neither an edit. `find -newermt '36 hours ago'`
returns files that have not changed in three days and would miss a genuine same-day
edit that arrived in the first checkout pass. Git is the only honest clock here.

## The Cursor bot fired again

#381 on 2026-09-07 is the **sixth** draft of the same consolidation orchestrator
after #355, #360, #367, #370 and #375. [[11_Agents/Cloud Routine Prompts 2026-09-05]]
recorded on 2026-09-05 that it "has to be switched off inside Cursor"; PR #380
proposed it again on 2026-09-07. It fired again the same day. Three consecutive
nights of proposal, zero change — because no agent path reaches the Cursor settings.

INFERRED: a proposal with no receipt and no owner-side gate converges on nothing, no
matter how many nights restate it. The estate already knows the fix for that shape of
problem — it is the circuit-breaker pattern in `12_Brain/registry/automations.json` —
and does not apply it to its own recurring hand-off asks.

## Why nothing else is applied

PR #380 established, with a merge proof, that the nightly loop makes itself
unmergeable when it appends to `12_Brain/11_Craft/earned-lessons.md`, edits
`_os/automation/bin/agent-craft-brief.js`, or touches root `INDEX.md` — that is
exactly the set that makes #363, #368 and #373 mutually exclusive. That discipline
held, so this run keeps it: one new dated note and one four-line code hunk copied
verbatim from #356 so it merges as identical content rather than as a competing
rewrite.

It also has to be extended by one file. #380 permitted itself a single line in
`12_Brain/11_Craft/00_Index.md` — a new entry at the top of the Briefs list. This run
wrote the same kind of line, measured the result, and reverted it:

```
$ git merge-tree --write-tree HEAD origin/daily-learning/2026-09-07
CONFLICT (content): Merge conflict in 12_Brain/11_Craft/00_Index.md
```

Two nights, one shared list, two prepends, mutually exclusive — the exact shape #380
diagnosed, in the one file it exempted. With the index line reverted this branch is
VERIFIED clean against `origin/daily-learning/2026-09-05`, `/2026-09-06`, `/2026-09-07`
and `origin/hygiene/2026-09-06-full`, and `_os/automation/bin/predict-work.js`
auto-merges against `origin/claude/predictive-workflows-v2` (#356 still conflicts on
`12_Brain/state/work-predictor/latest.json`, which predates this branch and is
untouched by it).

The consequence is that this note is unlinked from the craft index until a human
merges it. That is the correct trade tonight, and the durable fix is to stop
hand-appending the list at all — see the proposal to generate the Briefs section from
the directory.

Checks run before pushing: `node --test _os/test/public-safety.test.js` → 9/9 pass.
`node --test _os/automation/tests/*.test.js` → 210/210 pass. `frontmatter-validate.js`
→ `status: ok`, 37/37 complete, 0 incomplete (its regenerated state files were
reverted so they stay out of the diff).

## Lessons this run earns

Recorded here rather than appended to `earned-lessons.md`, for promotion in one
human-merged pass:

1. **A workaround in a prompt is a fork of a fix in code.** The prompt gets pasted by
   hand, covers one caller, and hides that the real defect is still shipped. Check
   the open-PR backlog for the code fix before writing the prompt patch.
2. **A large PR is a place fixes go to die.** #356 carried a four-line correctness fix
   inside 9,861 lines of forecasting rework. Six days later the small fix is
   unreachable without the large one. Correctness fixes belong in their own PR.
3. **A resolver whose fallback is another machine's absolute path has no fallback.**
   `~/Documents/Codex/projects/client-operations` cannot exist in a Linux container;
   the cloud lane had one candidate, the env var, and no second chance.
4. **File mtimes in a fresh clone are checkout timestamps.** Any routine instructed
   to read "what changed recently" from a cloud checkout must read git, not the
   filesystem. Second recording — PR #373 wrote this on 2026-09-06, so by the craft
   index's promotion rule it is due in `12_Brain/03_Concepts/` now.
5. **A hand-maintained index is a shared mutable file, and a nightly writer will
   collide with itself on it.** Any list every run prepends to has to be generated
   from the directory, or the run has to leave it alone.
6. **`git add -A` after running the test suite is how generated state strands a
   branch.** The automation tests rewrite `12_Brain/state/agent-craft-brief.json`;
   it entered this commit silently and produced content conflicts against both
   `daily-learning/2026-09-05` and `/2026-09-06` until it was reverted. Stage named
   paths, or verify the diff against `origin/main` before pushing.
