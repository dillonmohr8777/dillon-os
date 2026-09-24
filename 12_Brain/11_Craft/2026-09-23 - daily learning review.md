---
note_type: review
status: active
created: 2026-09-23
updated: 2026-09-23
source_refs:
  - "[[11_Agents/Cloud Routine Prompts 2026-09-05]]"
  - "https://github.com/dillonmohr8777/dillon-os/pull/411"
  - "https://github.com/dillonmohr8777/dillon-os/pull/409"
  - "_os/automation/cadence/run-ledger.jsonl"
tags: [craft, agent-infrastructure, reliability]
window: 2026-09-22T00:14 to 2026-09-23T00:14 America/New_York
---

# Agent craft review — 2026-09-23

**This estate diagnoses itself correctly and then never installs the fix.** Every
repair for the pull-request backlog was already written down — the replacement
routine prompts on 2026-09-05, the watchdog repair in PR #411 on 2026-09-22 — and
neither is installed. Open PRs went 135 → 137 across those eighteen days.

## The window

Three commits reached `main`, all machine-authored: `2c71b39` vault-clean,
`04eead2` morning-brief, `b53c3fe` radar sweep. Four pull requests were opened:
#411 (this routine), #412, #413, #414. Zero were merged. `dillon-claude-config`
is unchanged since `c4816ae` (2026-09-05) and `client-operations-canonical` since
`e9be4e0` (2026-09-15).

By commit volume that reads quiet. It is not quiet: the production lane ran at
four pull requests in the day and the integration lane ran at zero, and it has
run at zero since 2026-09-17.

## The finding: two lanes, one of them stopped

The last merge into `main` was PR #409 on 2026-09-17 16:44Z. Its merge commit
`aaba6cc` is also the last commit on `main` authored by a human. Everything since
— six days — is `radar-bot`, `morning-brief`, and `vault-clean`, all of which run
in GitHub Actions or a cloud session, none of which run on the Windows box.

The same date bounds the other half. `_os/automation/cadence/run-ledger.jsonl`
ends at `2026-09-15T14:00:01Z`. `12_Brain/state/claude-daily-driver.json` is
frozen at `2026-09-15T14:53:17Z`. `12_Brain/11_Craft/` has twenty-nine
consecutive generated operating briefs from 2026-08-18 to
[[12_Brain/11_Craft/2026-09-15 - operating brief|2026-09-15]] and then nothing.
`12_Brain/state/agent-craft-brief.json` still reads `generated_for: 2026-09-02`.

Those are not two outages. Merging and the cadence layer both happen on the same
machine, and that machine has been out of the loop since mid-September. Work did
not stop — PRs #412 and #414 were opened on 2026-09-22 from `cursor/` and
`claude/` branches, which are cloud sessions — so the estate is producing into a
queue that nothing drains.

## Why the backlog is a prompt bug, not a discipline problem

[[11_Agents/Cloud Routine Prompts 2026-09-05|Cloud Routine Prompts 2026-09-05]]
was written the day dillon-os hit 135 open PRs. It names the exact cause — three
claude.ai Routines that "open a pull request a day and nothing closes them" — and
carries the complete replacement prompts. Its Phase 5 replacement for this
routine reads: *carry every still-valid proposal forward from your own earlier
daily-learning PRs, then close them.* One rolling pull request, never a stack.

That note still reads `status: awaiting-paste`, because the Routines were created
through the HTTP API and an agent session can only edit Routines it created
itself. The paste has to be done by hand in the Routines UI, and it has not been.

This run is first-hand evidence. The prompt that fired tonight is verbatim the
**old** Phase 5 — "open a SINGLE DRAFT pull request … never close or comment on
someone else's PR" — with no carry-forward step and no close step. The routine
written to stop stacking pull requests is still running the prompt that stacks
them, eighteen days after the replacement was drafted.

The cost is measurable. Four daily-learning PRs are open and unmerged — #402
(09-15), #405 (09-16), #407 (09-17), #411 (09-22) — each carrying proposals the
next night cannot see. PR #411 diagnosed `cadence-watchdog.js` as checking zero
jobs and exiting clean; tonight's run reproduced that diagnosis independently
from the same files, because the fix lives on a branch and the next session
starts from `main`.

## Verified

- Open pull requests: **137** (GitHub search `repo:dillonmohr8777/dillon-os
  is:open`, 2026-09-23). The 2026-09-05 note recorded 135.
- Merged since 2026-09-18: **0**. Last merge PR #409, 2026-09-17 16:44Z.
- Opened since 2026-09-18: **5** — #410, #411, #412, #413, #414. All still open.
- `main` commits since `aaba6cc` (2026-09-17): `6b60695`, `1c391f5`, `0f7b334`,
  `9db12f8`, `586a98c`, `88baa54`, `2c71b39`, `04eead2`, `b53c3fe` — every one
  from `radar-bot`, `morning-brief`, or `vault-clean`.
- Cadence ledger last row `2026-09-15T14:00:01.764Z`; 11_Craft briefs end
  2026-09-15; `agent-craft-brief.json` `generated_for: 2026-09-02`.
- `cadence-watchdog.js` run here against `main`: 27 registry records, **0** match
  its `enabled && /^(daily|weekly|monthly) via .*driver\.md/` filter, verdict
  `clean`, exit 0. Twenty scheduled GitHub Actions runs, every one `success`.
  Already filed in PR #411; repeated here only as the proof that an unlanded fix
  does not compound.
- The daily-learning replacement prompt is not installed: tonight's fired prompt
  contains the old Phase 5 text.

## Inferred

- **That the Windows box is dark, rather than running and not pushing.** Both
  fit the evidence. Nothing about Task Scheduler, power state, or local commits
  is visible from a cloud session.
- **That Dillon's work moved to cloud agents.** PRs #412 and #414 are authored
  under his account on `cursor/` and `claude/` branch prefixes while the box
  produces nothing. Consistent, not proven.
- **Whether the morning-brief and hygiene replacement prompts were pasted.**
  `12_Brain/state/work-predictor/latest.json` reads
  `client_operations_root_available: true` with 5 queue candidates, so the
  morning brief is *not* in the degraded state the note predicted — but that is
  equally explained by the fallback resolving on its own. Undecidable from here.
- **Whether this routine ran on 09-18 through 09-21.** No branch exists for those
  nights. "Ran and correctly stayed silent" and "did not fire" look identical
  from outside; absence is not evidence of failure.

## What to change

1. Paste the three replacement prompts from
   [[11_Agents/Cloud Routine Prompts 2026-09-05]] into the Routines UI. It is the
   only step nothing else can do, it is eighteen days old, and it is why this note
   exists.
2. Drain or close the daily-learning stack — #402, #405, #407, #411 — before the
   next one opens. #411 carries applied code fixes that are worth landing.
3. Find out why the box stopped on 2026-09-15, because merging and the cadence
   layer both live there. Carried forward from PR #411.

## Related

- [[12_Brain/11_Craft/00_Index|Agent Craft index]]
- [[12_Brain/11_Craft/earned-lessons|Earned lessons]]
- [[12_Brain/07_Reviews/2026-09-15 - Cadence tasks cannot run unattended|Cadence tasks cannot run unattended]]
- [[12_Brain/09_Ops/AGENT_PROTOCOL|Agent Protocol]]
