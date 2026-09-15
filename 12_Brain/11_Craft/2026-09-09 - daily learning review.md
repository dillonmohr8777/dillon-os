---
note_type: review
status: active
created: 2026-09-09
updated: 2026-09-09
source_refs:
  - "12_Brain/05_Projects/2026-09-07 - Momentum AI division launch.md"
  - "https://github.com/dillonmohr8777/dillon-os/commit/6a8f3d3"
  - "https://github.com/dillonmohr8777/dillon-os/commit/7310838"
  - "12_Brain/09_Ops/AGENT_PROTOCOL.md"
  - "11_Agents/Cloud Routine Prompts 2026-09-05.md"
  - ".claude/skills/wiki-lint/SKILL.md"
  - "System/scripts/Update-SecondBrainMaps.ps1"
tags: [craft, agent-infrastructure]
window: 2026-09-07T12:00Z to 2026-09-09T00:00Z
---

# Daily learning review — 2026-09-09

**Summary:** The vault's largest knowledge commit in a week landed with seven of
its cited source notes absent from the repository, and every hygiene check the
vault owns is structurally incapable of noticing, because the references were
written as inline code instead of `[[wikilinks]]` and live in a folder no linter
scans.

Not a generated brief. `12_Brain/11_Craft/*operating brief*` is produced by
`_os/automation/bin/agent-craft-brief.js` and must not be hand-edited; this note
occupies a separate filename so the generator can never overwrite it and two
nights can never contend for the same file.

## What the day actually was

Five commits reached `main` between 2026-09-07 12:00Z and 2026-09-09 00:00Z.
Three were machine cadence — `ff324be` (radar sweep, 11:16Z, 1,393 prospects),
`2ec6ceb` (morning brief, 11:20Z), `722ab3d` (vault-clean + wiki-lint, 19:14Z).
Two were human-directed and merged: `6a8f3d3` (#386, 2026-09-09T00:28:59Z) and
`7310838` (#387, 01:39:18Z), together the Momentum 360 AI Division Library —
11,666 insertions across 67 files, then an 858-line asset-manifest rewrite.

VERIFIED: those two are the first merges to `main` since #372 on 2026-09-05, and
both are Dillon's own work. No agent pull request merged. `list_pull_requests`
returned a full page of 100 open PRs, five of them this routine's own — #363,
#368, #373, #380, #384.

VERIFIED: `dillon-claude-config` and `client-operations-canonical` had zero
commits in the window (`git log --since='36 hours ago'`, both empty). Their
`projects/*/memory/*.md` files last changed in `c4816ae` on 2026-09-05, so they
tell us nothing about the last 24 hours. Raw session transcripts are gitignored
and were not available.

## The finding: evidence that terminates outside the repository

`12_Brain/05_Projects/2026-09-07 - Momentum AI division launch.md` arrived in
`6a8f3d3`. It is a good note — dated, structured, explicit about what holds and
what fails. It cites its evidence eight times, at lines 57, 62, 64, 66, 68, 70,
72 and 115, in this shape:

```
`Local source note: 12_Brain/03_Concepts/2026-09-07 - One token cannot do two jobs`
```

VERIFIED: none of the seven distinct paths exists in the repository at
`7310838`. Checked individually with `test -f "<path>.md"`; all seven missing:

| Cited path | On `main` |
|---|---|
| `12_Brain/03_Concepts/2026-09-07 - The delivery machinery is the product` | absent |
| `12_Brain/03_Concepts/2026-09-07 - One token cannot do two jobs` | absent |
| `12_Brain/03_Concepts/2026-09-07 - Conversion match-back is the differentiator` | absent |
| `12_Brain/06_Research/2026-09-07 - AI search retainer pricing and Philadelphia position` | absent |
| `12_Brain/07_Reviews/2026-09-07 - AI division evidence pass` | absent |
| `12_Brain/08_Memory/2026-09-07 - Corrections from the AI division evidence pass` | absent |
| `12_Brain/04_Decisions/2026-09-07 - Align HCM registry record is superseded` | absent |

VERIFIED: the note's `source_refs` frontmatter compounds it. Four of its six
entries are `C:\Users\dillo\Documents\Codex\projects\client-operations\...`
Windows paths — unreachable from the repository and from any cloud session.
`01_Clients/Momentum 360/AI Division Library/Editable Sources/planning-PLAN.md`
carries five more `Local source note:` references of the same kind.

So the vault now asserts, with no reachable support: *"the thesis holds"*, *"31
contrast pairs, 0 failures"*, *"37 of 120 measured pairs across ten live builds
fail AA"*, and *"No `SKILL.md` exists under any `momentum-*` path"*. Those are
exactly the durable claims `CLAUDE.md` requires to carry `source_refs` "pointing
at the capture or note it came from."

**Why nothing caught it.** VERIFIED from `.claude/skills/wiki-lint/SKILL.md`: the
dead-link check inspects "every `[[wikilink]]` in `12_Brain/02_Entities/`,
`12_Brain/03_Concepts/` and `12_Brain/INDEX.md`." The note is in
`12_Brain/05_Projects/` — outside the scanned set — and its references are
backticked strings, not wikilinks. The check misses on both axes independently.
`vault-clean` explicitly defers link checking to `wiki-lint`. The 2026-09-08
hygiene pass ran at 19:14Z, before the 00:28Z merge, and reported "No dead
wikilinks detected"; that run is blameless. INFERRED, but on the skill's own
stated scope: the next run will report clean too, and will keep doing so
indefinitely. The gap does not announce itself.

The `Local source note:` prefix reads as a deliberate accommodation — a way to
name a file that is not here without tripping a validator. It is the more
dangerous shape, because a broken `[[wikilink]]` is a defect the graph surfaces,
while a backticked path is prose that no tool has an opinion about.

This is the same family as the standing craft lesson *"a brief that says LIVE is
a claim, not a fact"*, one layer up: a citation is a claim about a file, and the
only authority on whether that file exists is the filesystem.

## Second finding: the map generator stamps a date it did not earn

VERIFIED: of the 32 files under `12_Brain/10_Maps/` in `6a8f3d3`, **27 changed
exactly one line** (`git show --numstat 6a8f3d3 -- 12_Brain/10_Maps | awk '$1==1
&& $2==1' | wc -l` → 27). That line is `updated: 2026-09-02` → `updated:
2026-09-08`. Five had real content changes; `client-momentum-360.md` was the
only substantial one at +28/-1.

Cause, at `System/scripts/Update-SecondBrainMaps.ps1:71`: `Get-Frontmatter`
interpolates `"updated: $today"` into every map unconditionally, and
`Write-GeneratedMap` at line 87 writes every file every run with no comparison
against what is already on disk.

Two costs. Review noise: 27 of the 67 files in the day's largest PR carried no
information. And `updated:` becomes a lie — every generated map claims to have
been updated on 2026-09-08, so the field cannot be used to find what actually
moved, which is the one thing a generated map's `updated:` is for.

## Third finding: this routine is five pull requests deep and still running the old prompt

VERIFIED: the prompt that fired this run contains "never close or comment on
someone else's PR". `11_Agents/Cloud Routine Prompts 2026-09-05.md` line 66
prescribes "never close or comment on a PR that is not one of your own
daily-learning/* pull requests". They differ, so the replacement prompt has not
been pasted. That file has carried `status: awaiting-paste` for four days.

VERIFIED cost, unchanged from #384 and now one night larger: #363, #368, #373,
#380 and #384 are all open. The remediation exists, is written, is correct, and
cannot be applied by any agent — the Routines were created through the HTTP API
and a session may only edit Routines it created.

Meanwhile the morning-brief remediation *is* working: `12_Brain/state/work-predictor/latest.json`
at `2ec6ceb` shows `client_operations_root_available: true`,
`active_queue_items_scanned: 16`, `queue_candidates_used: 6`. Whether that came
from the pasted prompt or from elsewhere is not determinable here, but the
canonical queue resolved.

## What this run did not do

Did not touch `12_Brain/11_Craft/00_Index.md`, `12_Brain/11_Craft/earned-lessons.md`,
root `INDEX.md`, or `_os/automation/bin/agent-craft-brief.js`. PR #384 measured
a merge conflict on `00_Index.md` between two consecutive nights of this routine
writing to the same shared list, and #363/#368/#373 were made mutually
unmergeable by competing edits to `agent-craft-brief.js`. Consequence, stated
plainly: this note is unlinked from the craft index until a human merges it, and
the lessons above are not yet appended to `earned-lessons.md`. Both linkages are
in the pull request body as proposals.
