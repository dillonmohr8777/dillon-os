---
note_type: review
status: active
created: 2026-09-07
updated: 2026-09-07
source_refs:
  - "[[11_Agents/Cloud Routine Prompts 2026-09-05]]"
  - "[[12_Brain/01_Captures/sessions/2026-09-05 - pr-sweep-and-client-archive]]"
  - "Daily-Briefs/wiki-lint-2026-09-06.md (main, commit 0444481)"
  - "origin/hygiene/2026-09-06-full (PR #374)"
  - "origin/daily-learning/2026-09-05 (PR #368), origin/daily-learning/2026-09-06 (PR #373)"
tags: [craft, agent-infrastructure, daily-learning]
window: 2026-09-05T16:00Z..2026-09-07T04:00Z
---

# Daily learning review - 2026-09-07

One line: the hygiene routine published an all-clear to `main` that its own run
contradicts on its PR branch, and the fix for the PR-refill problem has been sitting
`awaiting-paste` for two days while the routines keep running the old prompts.

VERIFIED means read from a commit, a branch, or a file in this checkout. INFERRED is
labelled inline.

## What actually moved

Six commits on `origin/main` in the window, only one of them human:

| Commit | When | Who | What |
|---|---|---|---|
| `243e045` | 2026-09-06 10:54Z | radar-bot | Radar sweep: +14 found, 14 re-graded, 13 rendered, 1378 tracked |
| `0444481` | 2026-09-06 06:14Z | Claude | `vault-clean: 2026-09-06` — two report files, nothing else |
| `033e933` | 2026-09-05 19:56Z | dillonmohr8777 | merge of #372, the client retirement + PR sweep |

Seven draft pull requests were opened between 2026-09-06 04:08Z and 2026-09-07 04:05Z
(#373 through #379). None were merged. The last merge to `main` was #372 on 2026-09-05.
`client-operations-canonical` had no commits in the window on any branch.

## The all-clear on main is not what the routine found

This is the finding worth acting on. The nightly hygiene pass ran once on 2026-09-06
and produced **two different files at the same path**:

`Daily-Briefs/wiki-lint-2026-09-06.md` **as committed to `main`** (`0444481`, 06:14Z):

> Dead Links — No dead `[[wikilinks]]` found.
> Expired Knowledge — No pages with `expires:` dates that have passed.
> Changes Made — None (all checks passed).

and `Daily-Briefs/wiki-lint-2026-09-06.md` **on `hygiene/2026-09-06-full`** (PR #374,
commits `f96be48` and `4b80797`, 06:24Z — ten minutes later, +198 lines):

> 10 of the ~18 pages carrying `expires:` are past it. […] 3 are live operating
> knowledge, unchanged since the 2026-09-03 report first flagged them, now 33 days
> past `expires: 2026-08-04`.
> `12_Brain/INDEX.md` | Repointed 1 dead link (Second Brain Architecture); added 23
> missing entity/concept entries

Same routine, same night, same filename. The weak copy is the one on `main`. VERIFIED
by `git show origin/hygiene/2026-09-06-full:Daily-Briefs/wiki-lint-2026-09-06.md`
against the working tree at `0444481`.

The mechanism is in the routine's own prompt
([[11_Agents/Cloud Routine Prompts 2026-09-05]], "Nightly vault hygiene"):

> If the only change is the report file, commit it to main directly with message
> "vault-clean: <date>" and push. If any file was moved or any link was rewritten, do
> NOT push to main: commit to the hygiene branch […]

The rule is evaluated against an interim state. The run wrote a report, saw only a
report, pushed it to `main` — and then kept working, found the dead link and the
expired pages, rewrote the same report richer, and put that on the branch. The prompt
assumes one report per run. This run made two, and published the pre-findings one.

Cost: every agent and every human who reads the vault's own hygiene record for
2026-09-06 is told the vault is clean and that no page has expired. The list of what is
actually wrong is in a draft PR.

## Three live paid-media playbooks are 33 days expired on main

VERIFIED independently of the report, by reading frontmatter in this checkout:

- `12_Brain/03_Concepts/Conversion Tracking Setup 2026.md` — `expires: 2026-08-04`
- `12_Brain/03_Concepts/Google Ads Conversion Optimization 2026.md` — `expires: 2026-08-04`
- `12_Brain/03_Concepts/Meta Lead Ads Optimization 2026.md` — `expires: 2026-08-04`

Seven more expired pages are `06_Research/` Grok daily-intelligence notes from
2026-07-30 to 2026-08-05, which are dated dailies aging out on schedule — expected.
The three Concepts are not: they are the playbooks behind live Google Ads and Meta Ads
delivery for [[01_Clients/Client Index|active paid-media clients]], and
`System/operating-status.md` still lists five accounts on paid media.

The 2026-09-06 lint added an expired-flag callout to each of the three. That callout
exists only on the PR #374 branch. On `main` the three pages still carry no warning,
so nothing reading them knows they are stale. The same three were already flagged by
the 2026-09-03 report — that flag also never reached `main`.

Refreshing their substance needs `/research-sweep` and is outside a lint pass's
authority. The flag reaching `main` is not.

## The learning loop re-derives its own fix every night

The replacement prompts written on 2026-09-05 carry `status: awaiting-paste`, and the
prompt this run executed still lacks the rolling-PR clause they prescribe — so as of
2026-09-07 they have not been pasted. VERIFIED: #373 (2026-09-06) was opened without
closing #368 or #363, which the replacement prompt requires; both are still open.

The consequence is mechanical, not merely untidy. Each night branches from `main`,
which never receives the night before, so each night rewrites the same file in
ignorance of the last attempt. `origin/daily-learning/2026-09-06` **deletes** the
staleness block that `origin/daily-learning/2026-09-05` added to
`_os/automation/bin/agent-craft-brief.js` and re-adds equivalent logic under different
names (`staleInput` → `stale`, inline arithmetic → `ageInDays()`). Two nights, one
fix, written twice, incompatibly.

`git merge-tree --write-tree origin/daily-learning/2026-09-05 origin/daily-learning/2026-09-06`
exits 1 with content conflicts in all three shared files:

```
CONFLICT (content): 12_Brain/11_Craft/earned-lessons.md
CONFLICT (content): 12_Brain/state/agent-craft-brief.json
CONFLICT (content): _os/automation/bin/agent-craft-brief.js
```

So the nightly outputs cannot be merged even in the order they were written. Three
nights of analysis (#363, #368, #373) are individually reasonable and collectively
unmergeable, which is why `12_Brain/11_Craft/` has received nothing on `main` since
`0558f09` on 2026-08-18 — 20 days of a nightly loop, zero durable output.

INFERRED: this is also why the loop's titles circle the same subject three nights
running ("the estate stopped learning and said ok", "the self-reporting layer is what
broke", "the self-audit was green on a dead queue"). Each night rediscovers the
self-reporting problem because the night before never landed. I cannot verify intent
from the branches alone.

**This run is written to the shape that survives.** One new file, one index line, no
append to `earned-lessons.md`, no edit to `agent-craft-brief.js`. It conflicts with
nothing, including the three nights ahead of it.

## Backlog, measured

`dillon-os` has **111 open pull requests**, the oldest #174 from 2026-07-13; 452
branches on `origin`. VERIFIED by paging `list_pull_requests`. The 2026-09-05 sweep
brought this down from 135, and it refilled by seven the next day. Three of that seven
came from the routines the replacement prompts were written to fix: #373
(daily-learning), #374 (hygiene), #375 (the fifth "Competitive task umbrella
orchestrator" draft after #355, #360, #367 and #370, four of which were closed
unmerged). The other four are ordinary session work.

The sweep worked. Nothing that makes it stick has shipped, so it is a manual chore that
comes due again roughly every two weeks.

## Lessons this run earns

Recorded here rather than appended to [[12_Brain/11_Craft/earned-lessons|earned-lessons]]
on purpose — that file is the one three unmerged nights already conflict on. Promote
them there in a single human-merged pass.

- **A routine that can publish before it finishes will publish its optimism.** Decide
  where output lands from the run's final state, never from an interim one.
- **Two artifacts at one path is a silent overwrite with extra steps.** The weaker copy
  won because it was written first and pushed immediately.
- **A fix that requires a human paste is not shipped, and the estate pays the old cost
  every day until it is.** Track `awaiting-paste` like an open incident, not a note.
- **A nightly loop that branches from `main` cannot accumulate.** Either it lands each
  night or every night starts from zero and fights the last one.
