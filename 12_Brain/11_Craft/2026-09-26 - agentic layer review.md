---
note_type: review
status: active
created: 2026-09-26
updated: 2026-09-26
source_refs:
  - _os/automation/bin/cadence-watchdog.js
  - _os/automation/bin/agent-craft-brief.js
  - 12_Brain/registry/automations.json
  - _os/automation/cadence/run-ledger.jsonl
  - .github/workflows/cadence-watchdog.yml
  - .github/workflows/radar-daily.yml
  - Daily-Briefs/week-review-2026-09-25.md
  - 12_Brain/07_Reviews/2026-09-26 - The external watchdog watches nothing.md
tags: [craft, agent-infrastructure, review]
---

# Agentic layer review - 2026-09-26

Hand-written by the daily learning loop. Not generated — the dated
`operating brief` files in this folder are, and this is deliberately named
differently so `agent-craft-brief.js` never overwrites it.

The day itself was thin: five commits to `dillon-os` in 36 hours, all routine
output plus one human merge (`350a9ec`, MomoBot evidence pack), nothing in
`dillon-claude-config`, and `client-operations-canonical` last moved 2026-09-24.
The interesting finding is not in the day's work, it is in the machinery that
produced it. Full evidence:
[[12_Brain/07_Reviews/2026-09-26 - The external watchdog watches nothing|The external watchdog watches nothing]].

## The shape of the failure

Three things were built to notice a dead automation layer. On 2026-09-26 all
three are reporting healthy while the layer has been dead for 11 days.

| Mechanism | Built | What it reports now | Why |
|---|---|---|---|
| `Cadence-sweep-heartbeat` (local, hourly) | before 09-14 | nothing | shares a power supply with what it watches |
| `cadence-watchdog.js` (GitHub Actions, 6-hourly) | 2026-09-17 | `clean`, exit 0 | its job filter matches 0 of 27 registry records |
| `week-review` routine | weekly | "cadence held", "scaffolding is reliable" | reads brief-file existence, not the receipt log |

Every one of them fails in the same direction: **absence renders as health.** That
is the single lesson of the night, and it is a design rule, not a bug list. A check
whose empty case is indistinguishable from its passing case is not a check.

## Proposal 1 — make "I am watching nothing" a failure state

`_os/automation/bin/cadence-watchdog.js`, `run()`.

`jobs.length === 0` and "jobs exist but none are due today" currently produce
identical output and identical exit code. They are opposite conditions: the second
is normal on a Saturday, the first means the registry join is broken.

Applied in this PR — the smallest change that converts silence into signal, with
no decision about which automations should be paged on:

```js
  const repoStale = repoAgeHours > STALE_REPO_HOURS;
+ // A filter that matches nothing in a 27-record registry is a broken join, not
+ // a quiet day. Distinct from rows.length === 0, which is a normal weekend.
+ const checksNothing = jobs.length === 0;
  const problems = rows.filter((r) => r.state !== 'ok');
- const ok = !repoStale && problems.length === 0;
+ const ok = !repoStale && !checksNothing && problems.length === 0;
```

plus the matching human line and a `selftest` assertion that pins the invariant
against the live registry, so this can never silently regress again.

**The first run after this merges will be red, on purpose.** That red is the alarm
that has been owed since 2026-09-17.

## Proposal 2 — needs Dillon — fix the registry join the watchdog depends on

Making the watchdog honest does not make it useful. `cadenceJobs()` filters on
`a.enabled`, a field `12_Brain/registry/automations.json` does not have, and on
`/^(daily|weekly|monthly) via .*driver\.md/`, a cadence vocabulary the registry
does not use. The exact change:

```js
-  return reg.automations.filter(
-    (a) => a.enabled && typeof a.cadence === 'string' && /^(daily|weekly|monthly) via .*driver\.md/.test(a.cadence),
-  );
+  const LIVE = new Set(['active-scheduled', 'implemented']);
+  return reg.automations.filter(
+    (a) => LIVE.has(a.status) && typeof a.cadence === 'string' && /^(daily|weekly|monthly)\b/.test(a.cadence),
+  );
```

Why this is not applied here: it decides which of 27 automations page you, and 26
of them have no ledger writer at all. The ledger has only ever recorded six job
ids — `heartbeat`, `approval-queue-diff`, `unfiled-sweep`, `daily-sweep`,
`approval-queue-closing-pass`, `morning-chief` — and exactly one of those six,
`daily-sweep`, exists in the registry. Landing the filter above unasked would turn
the Action permanently red on 20-odd automations whose silence is expected, which
is how an alarm gets muted for good.

The judgment call is yours: either (a) narrow the watchdog to the ids the ledger
actually writes, and treat the registry as documentation rather than as a watch
list, or (b) require every `active-scheduled` automation to write a ledger row and
let the watchdog hold them to it. (a) is one afternoon. (b) is the right answer and
is a week.

## Proposal 3 — needs Dillon — stop letting a cloud bot mask a dead local box

`STALE_REPO_HOURS = 30` is measured from `git log -1 --format=%cI`, the newest
commit on the branch whoever wrote it. `radar-bot` runs entirely on GitHub Actions
and has pushed 17 commits in 17 consecutive days. The repo can therefore never go
stale while the Windows box is off, which is precisely the case this check exists
to catch.

```js
-  const iso = execFileSync('git', ['log', '-1', '--format=%cI'], { cwd: VAULT, encoding: 'utf8' }).trim();
+  // Bots that run in the cloud keep the repo warm while the box that runs
+  // Cadence is off. Measure staleness from commits that could only have come
+  // from the machine being watched.
+  const iso = execFileSync(
+    'git',
+    ['log', '-1', '--format=%cI', '--invert-grep', '--author=radar-bot'],
+    { cwd: VAULT, encoding: 'utf8' },
+  ).trim();
```

Needs your call because the right exclusion list is not just `radar-bot` — the
`Claude`-authored `morning-brief` and `vault-clean` commits may or may not
originate on that box (see "Inferred" in the review note; it is not determinable
from a cloud checkout). Naming the wrong authors here either re-mutes the check or
makes it cry wolf. You know which harness runs where; I do not.

## Proposal 4 — needs Dillon — the week-review must read the ledger, not the file list

`Daily-Briefs/week-review-2026-09-25.md` is good work on the business questions —
it correctly found zero closed tasks, zero client touches, and a 3-week-old "quick
fix" still open. Its one false claim is about the automation layer, and it is load
bearing: "Daily automation cadence held ... The scaffolding is reliable." For the
period it names, `morning-brief` was absent 09-19 and 09-20 and `vault-clean` was
absent 09-19, 09-20 and 09-23. It also never mentions that the run-ledger had been
silent for 10 days at the time of writing.

The cause is that the routine infers automation health from the presence of dated
brief files, which the standing lesson in [[12_Brain/11_Craft/00_Index|this index]]
already warns against: *a driver that reports `noop` cannot distinguish "nothing to
do" from "everything is stuck"; the receipt log is the only honest signal.*

The change is to the `week-review` skill, not to code: before making any claim about
cadence, read the last timestamp in `_os/automation/cadence/run-ledger.jsonl` and
the newest file in `12_Brain/11_Craft/`, and state both ages as numbers. If either
exceeds its cadence plus grace, the automation section says so instead of grading
it. Two greps, and it would have caught this 11 days earlier.

## Proposal 5 — needs Dillon — run the recursive layer off the box

`_os/automation/bin/agent-craft-brief.js` is deterministic Node with no model call
and no Windows dependency. Verified on 2026-09-26: it ran clean in this Linux cloud
checkout in dry-run mode (`status: ok`, `window_days: 14`, `days: 2026-09-02 ..
2026-09-15`) reading only `12_Brain/queue/claude-loop-*.jsonl` and
`11_Agents/claude-operating-team.json`. Nothing about it needs the Windows box
except the fact that it is wired to routine D26 inside the loop that runs there.

Be clear about what this does and does not buy. It does **not** resurrect the data
— the receipts it counts are written by the local loop, so in the cloud it would
currently report an empty window. That is exactly the point: a daily Action that
writes "0 receipts in the last 14 days" is an alarm, where a routine that simply
never runs is silence. The same absence, rendered as absence.

The shape is the watchdog's: a 5-minute `ubuntu-latest` job, `node-version: 22`,
`permissions: contents: write` to commit the brief, on a daily cron. It should exit
non-zero when the window is empty, for the reason in Proposal 1.

Your call because it moves a write-authority routine into CI, and because it
overlaps Proposal 2 — if the ledger and the receipt log are being reconciled anyway,
do that first and wire this to the result.

## Observation, no proposal attached

Every scheduled-routine commit since 2026-09-14 — `morning-brief`, `vault-clean`,
`week-review`, 16 commits checked — carries `Co-Authored-By: Claude Fable 5.1`.
Fable is the creative-writing model. `week-review`/`synthesize` is documented as
"the only loop that earns the premium tier" and `vault-compile` as cheap-model
routine work; neither is a prose-craft task. Whether that routing is deliberate is
not something this checkout can tell, so it is recorded rather than proposed. If it
is not deliberate, it is one line per routine to fix and it is the cheapest quality
win in the estate.
