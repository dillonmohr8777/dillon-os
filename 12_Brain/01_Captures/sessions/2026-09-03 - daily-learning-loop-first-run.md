---
note_type: capture
status: unprocessed
created: 2026-09-03
updated: 2026-09-03
source_refs: ["11_Agents/Daily Learning Loop (Local).md", "_os/automation/bin/harvest-sessions.py", "System/operating-status.md", "System/approval-queue.md"]
tags: [capture, session, agent-infrastructure, loop, pr-hygiene, backup-risk]
---

# 2026-09-03 — Daily learning loop, first local run (mined)

First execution of the local daily learning loop. Window 2026-09-02 13:38Z to
2026-09-04 01:38Z. Nothing pushed; findings only.

The loop exists in two forms: cloud routine `trig_0147wYE44A32VYGkixrX31B9`
(nightly 04:00Z, reads `origin/main` only) and the local playbook
[[11_Agents/Daily Learning Loop (Local)|Daily Learning Loop (Local)]]. This run
was local. Every finding below is one the cloud twin structurally could not see.

## What the day actually was

From 147 human turns across 10 workspaces and 19 transcripts, harvested with
`_os/automation/bin/harvest-sessions.py`:

- VA Claims and Bridge phases 4-6, named repeatedly as top priority.
- BigOrange Marketing proposal prep and an end-to-end WordPress pillar-page pass
  against `bigorange.marketing` over a dedicated CDP browser on `127.0.0.1:9223`.
- Bridge launch-video generation via Higgsfield, client-approved.
- A ConnectWise job-application batch.

## Findings

### 1. The vault has a pull-request graveyard

127 open PRs, 116 of them drafts. 22 are older than 30 days; the oldest, #222, is
37 days old. Only 10 were opened in the last two days.

`cursor/competitive-task-consolidation` accounts for 13 of them on its own —
#333 (2026-08-21) through #360 (2026-09-03), one per day, **+16,843 / -509 lines
across the set, none merged**. Author `app/cursor`. Each regenerates the same two
files, so thirteen branches now hold thirteen competing versions of one brief.

### 2. A daily signal that has never reached main

`System/slack-action-queue.md` **does not exist on `origin/main`**
(`git show origin/main:System/slack-action-queue.md` → `fatal: path ... does not
exist`). It is generated fresh inside each competitive-task PR branch and
discarded with it.

PR #360's body describes that file as carrying an "M360 Slack quartet (~5 weeks
unanswered)". That claim is **unverified** — it is text from a PR body, not an
independent read of Slack — but if it is even approximately right, a client-facing
escalation has been regenerated and thrown away daily for two weeks.

### 3. Five projects exist only on this disk

Zero commits, no remote, nothing pushed anywhere:

| Project | Source files | Size | Last touched |
|---|---:|---:|---|
| `job-search-2026` | 674 | 80 MB | **2026-09-03** |
| `website-design-engine` | 235 | 31 MB | 2026-08-23 |
| `deepseek-harness-canary` | 39 | 901 KB | 2026-08-24 |
| `box-company-brain` | 18 | 61 KB | 2026-08-29 |
| `local-ai-worker` | 12 | 94 KB | 2026-08-26 |

(All under `C:\Users\dillo\Documents\Codex\projects\`; counts exclude
`node_modules`, `.git`, `dist`, `.venv`.)

`job-search-2026` was written to today and holds the ConnectWise outreach run with
its receipt and screenshot evidence. [[System/operating-status|Operating Status]]
calls the remote job search "a live priority, not a background want." A live
priority with 674 files and no second copy is one disk failure from gone.

This re-earns a lesson [[12_Brain/11_Craft/00_Index|the craft index]] already
carries as standing — *untracked code that a scheduler runs is the highest-risk
code in an estate* — which means the lesson is recorded but not enforced.

### 4. The vault is checked out twice, diverging

`C:\Users\dillo\repos\dillon-os` sits on `cursor/immohrtal-standing-canary-3c2e`
with 386 uncommitted files. `C:\Users\dillo\Documents\Codex\projects\dillon-os`
sits on `main` with 33. Two working copies of the same repository, both dirty,
neither pushed. `client-operations` is worse: 694 uncommitted files on
`cursor/momentum-ai-director-outreach-4754`, with 11 commits in the window.

### 5. The loop's own learn output is empty while all of this accrues

`11_Craft/00_Index.md` reports **0 concrete lessons, 9 explicit no-findings, 0
promotion candidates** over the last 14 days. Findings 1-4 were all visible for
most of that period. A learn stage that emits `no_finding` nine times while a PR
backlog triples is not observing; it is reporting on a source that does not carry
the evidence.

## Mistakes caught

- Mistake (mine): nearly reported the ConnectWise run as failed on the strength of
  `*-error.png` filenames in `outreach/2026-09-03-connectwise-senior/screenshots/`.
  `CONNECTWISE_RECEIPT.md` shows all four roles submitted, verified 19:35Z, with
  `We've Received Your Application!` captured per role. The error frames are
  intermediate states. Read the receipt before reading the filenames.
- Mistake: `11_Craft/00_Index.md` states "**13** recorded" earned lessons;
  `grep -c '^## 2026-'` returns 15. Generated-file drift, unfixed here because the
  index is generated and must not be hand-edited.
- Mistake: the local playbook instructed the loop to write a dated note into
  `12_Brain/11_Craft/`. The craft index reserves dated briefs for generation and
  routes agent writing to `earned-lessons.md`. Protocol wins; the playbook is wrong
  and is corrected in this same change.

## Verified vs inferred

**Verified** — PR counts and ages (GitHub search API); the 13-PR series and its
line totals (`gh pr list`); `slack-action-queue.md` absent from `origin/main`;
all five unbacked projects (`git log`, `git remote`, `find`); both dillon-os
checkouts and their dirty counts; the ConnectWise receipt; the harvest totals.

**Inferred / unverified** — the "~5 weeks unanswered" Slack claim (PR body only);
whether the competitive-task PRs were ever intended to merge; whether the two
dillon-os checkouts hold conflicting edits (not diffed).

## Links

- [[12_Brain/11_Craft/earned-lessons|earned-lessons]] — two entries appended.
- [[11_Agents/Daily Learning Loop (Local)|Daily Learning Loop (Local)]]
- [[12_Brain/09_Ops/AGENT_PROTOCOL|Agent Protocol]]
