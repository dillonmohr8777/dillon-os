---
note_type: review
status: active
created: 2026-09-24
updated: 2026-09-24
window: 2026-09-23T00:20 to 2026-09-24T00:14 America/New_York
source_refs:
  - "https://github.com/dillonmohr8777/dillon-os/pull/416"
  - "https://github.com/dillonmohr8777/dillon-os/pull/415"
  - "https://github.com/dillonmohr8777/dillon-os/pull/411"
  - "https://github.com/dillonmohr8777/dillon-os/pull/402"
  - "[[11_Agents/Cloud Routine Prompts 2026-09-05]]"
  - ".github/workflows/cadence-watchdog.yml"
tags: [craft, agent-infrastructure, reliability, daily-learning]
---

# Daily learning review — 2026-09-24

**The estate now runs three producers it cannot see.** The Windows box has been
dark for nine days and every proposed repair watches it. The three claude.ai
Routines went dark together for three days last week and nothing watches them at
all. The watchdog reported `success` on every one of those days, because the one
producer that never misses is the one nobody worries about.

## The window

Two commits reached `main`, both machine-authored: `71679dd` morning-brief
2026-09-23 (11:21Z) and `a2de8ef` radar sweep 2026-09-23 (11:38Z). One pull
request was opened — **#416, Vault hygiene 2026-09-23**, at 06:15Z, draft, open.
Zero were merged. `dillon-claude-config` is unchanged since `c4816ae`
(2026-09-05); `client-operations-canonical` since `e9be4e0` (2026-09-15). Nothing
was added or modified under `12_Brain/01_Captures/`, `12_Brain/09_Ops/` or
`12_Brain/11_Craft/`.

Open pull requests: **139**. They were 135 when
[[11_Agents/Cloud Routine Prompts 2026-09-05|Cloud Routine Prompts 2026-09-05]]
was written to stop them stacking, and 137 last night. Merged since 2026-09-18:
**zero** (`repo:dillonmohr8777/dillon-os is:merged merged:>=2026-09-18`).

[[12_Brain/09_Ops/AGENT_PROTOCOL|AGENT_PROTOCOL.md]] governs this run and did not
conflict with the routine prompt. Its "surface contradictions instead of smoothing
them over" and "treat missing evidence as missing" rules set the split below.

## VERIFIED

### Hygiene is running the old prompt too

PR [#415](https://github.com/dillonmohr8777/dillon-os/pull/415) recorded that only
the daily-learning routine could be *proven* to be running the superseded prompt,
and listed hygiene as undecidable: every hygiene run since 2026-09-15 had been
report-only and committed straight to `main`, so the carry-forward-and-close step
in the replacement prompt was never exercised. That is no longer true.

On 2026-09-23 hygiene found substantive work — one file move, one link repair,
thirteen orphaned pages synced into `12_Brain/INDEX.md` — and opened **#416**. The
replacement prompt's Phase 5 says to carry still-valid items forward from the
routine's own earlier PRs and close them. #416 did neither. Four earlier hygiene
pull requests were open when it ran and are open now:

| PR | Date | State |
|---|---|---|
| #374 | 2026-09-06 | open |
| #389 | 2026-09-09 | open |
| #398 | 2026-09-14 | open |
| #403 | 2026-09-15 | open |
| #416 | 2026-09-23 | open — opened as a fifth, not a rollup |

Two of the three Routines are now proven unpasted, not one. Nineteen days.

### The three cloud Routines went dark together, and came back together

Producer coverage, 2026-09-17 to 2026-09-23, counted from `Daily-Briefs/` filenames
on `main`, from `git log`, and from branch and pull-request dates:

| Producer | Substrate | Thu 17 | Fri 18 | Sat 19 | Sun 20 | Mon 21 | Tue 22 | Wed 23 |
|---|---|---|---|---|---|---|---|---|
| radar sweep | GitHub Actions | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| cadence watchdog | GitHub Actions | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| morning brief | claude.ai Routine, weekdays | ✓ | — | n/a | n/a | ✓ | ✓ | ✓ |
| vault hygiene | claude.ai Routine, nightly | ✓ | — | — | — | ✓ | ✓ | ✓ |
| daily learning | claude.ai Routine, nightly | ✓ | — | — | — | — | ✓ | ✓ |
| cadence layer | Windows box | — | — | — | — | — | — | — |

2026-09-18 was a Friday. The morning brief is weekday-only, so its Saturday and
Sunday absences are by design and its Friday absence is a plain miss.

### The watchdog is green through both outages

`.github/workflows/cadence-watchdog.yml` has completed **24 scheduled runs, every
one `success`** — spanning the nine-day box outage and the three-day Routine
blackout. Run live from this checkout tonight:

```
cadence-watchdog  checked 2026-09-24T04:18:52.000Z
repo age          16.7h since last commit reached this checkout (stale past 30h)
no cadence jobs due today

clean
```

`repo age` is 16.7h because `radar-bot` committed at 11:38Z. The watchdog's only
liveness signal is *any* commit reaching `main`, and the healthiest producer in the
estate supplies one nearly every day. Grepping the 170-line source for
`morning-brief`, `vault-clean`, `daily-learning` or `hygiene` returns nothing: the
three Routines are not merely mis-measured, they are absent from its model.

### The box is still dark, unchanged

`_os/automation/cadence/run-ledger.jsonl` ends 2026-09-15T14:00:01Z.
`12_Brain/state/claude-daily-driver.json` is frozen at 2026-09-15T14:53:17Z.
Generated operating briefs in this folder end at
[[12_Brain/11_Craft/2026-09-15 - operating brief|2026-09-15]].
`12_Brain/state/agent-craft-brief.json` still reads `generated_for: 2026-09-02`.

The generator itself is portable — run here it needs only `fs`, `path` and two
local libs, and completed cleanly. It also reproduced the defect PR #402 named nine
days ago: it emitted `generated_for: "2026-09-24"` over
`days: [2026-09-02 … 2026-09-15]`, `status: "ok"`. `loadDays()` at
`_os/automation/bin/agent-craft-brief.js:41` takes `.sort().slice(-limit)` — the
newest receipt *files*, never compared to today — while `generated_for` (`:210`),
the filename (`:239`) and the heading (`:257`) all use `todayISO()`. #402 wrote the
exact patch as a proposal on 2026-09-15 and it has never been applied to the file.

## INFERRED

- **2026-09-18 through 09-20 was one shared outage, not seven correct silences.**
  PR #415 called this undecidable — "ran and correctly stayed silent on a quiet
  night" and "did not fire" look identical from outside. The correlation
  discriminates it. Three Routines with different prompts, different schedules and
  different silence rules all produced nothing on the same three days and all
  resumed on 09-21. Hygiene in particular has no silent mode: it writes
  `Daily-Briefs/vault-clean-<date>.md` and `wiki-lint-<date>.md` on every run it
  completes, and it wrote them on 09-17, 09-21, 09-22 and 09-23. Its absence is not
  a quiet night. Independent producers do not coincide; a shared substrate does.
  What the shared cause was — scheduler, account, or quota — is not visible from a
  cloud session.
- **Daily-learning's extra miss on 09-21 is probably its own, not the outage's.**
  The other two Routines returned that day. One routine missing alone is the normal
  failure; three missing together is not.

## Not verified

- Why the box stopped. Task Scheduler, the Windows event log, power state and local
  unpushed commits are invisible from here. Carried forward from #411 and #415,
  still open, now nine days old.
- Whether the morning-brief Routine is running the old or replacement prompt. It
  commits to `main` rather than opening PRs, so the close step it would need is
  never reached under either version. Unchanged from #415.
- Raw Claude session transcripts are gitignored and were not read. The
  `dillon-claude-config` `projects/*/memory/*.md` files were used as the session
  proxy; every one of them is dated 2026-08-17 or 2026-08-18 and the repository has
  no commit since 2026-09-05, so they describe the estate as it was five weeks ago
  and still name Align HCM as the current employer.
- File mtimes are useless in this container — the whole checkout reads one clone
  time. Every freshness claim here comes from git history, from the GitHub API, or
  from a timestamp written inside a file.

## Proposals

Full rationale and exact diffs in the pull request body. In short:

1. **Teach the watchdog about the three Routines.** Every repair proposed so far —
   path-filtering `hoursSinceLastCommit()` to `run-ledger.jsonl` (#411, #415),
   moving deterministic lanes into Actions (#402) — watches the Windows box. None
   of them would have raised a flag on 09-18 through 09-20. The Routines leave a
   dated artifact per run; assert it exists.
2. **Paste the replacement prompts.** Now proven necessary for two of three
   Routines rather than one, with the backlog compounding at roughly two pull
   requests a day.
3. **Land #411 and #402 before writing any more diagnosis of the same two bugs.**
   Tonight reproduced #402's craft-brief defect live, nine days after it was
   diagnosed and patched in prose. That is the third session to find it.

## Links

- [[12_Brain/11_Craft/00_Index|Agent Craft index]]
- [[12_Brain/11_Craft/earned-lessons|earned-lessons]]
- [[11_Agents/Cloud Routine Prompts 2026-09-05|Cloud Routine Prompts 2026-09-05]]
- [[12_Brain/09_Ops/AGENT_PROTOCOL|Agent Protocol]]
- [[System/operating-status|Operating Status]] — frozen at 2026-09-15, through the
  whole outage; it is the second file every agent reads.
