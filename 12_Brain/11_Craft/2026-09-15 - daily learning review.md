---
note_type: review
status: active
created: 2026-09-15
updated: 2026-09-15
window: 2026-09-13T12:00Z to 2026-09-15T04:00Z
source_refs:
  - "[[12_Brain/01_Captures/2026-09-14 - Align Search Console and GA4 direct snapshot, gap table, and the Google access answer]]"
  - "System/google-access-expansion/ACCESS-LEDGER-2026-09-14.md"
  - "https://github.com/dillonmohr8777/dillon-os/pull/397"
  - "https://github.com/dillonmohr8777/dillon-os/pull/395"
tags: [craft, agent-infrastructure, daily-learning]
---

# Daily learning review — 2026-09-15

Hand-written, not generated. The generated brief is
`_os/automation/bin/agent-craft-brief.js`; this note is the human-readable pass over
what the estate did and what its machinery got wrong.

## The day

One substantive piece of work, merged: PR **#401** (`313527c`, merged `7581e75`) pulled
the Align Search Console and GA4 dataset direct through gcloud ADC — 14 files, 128,171
lines, a per-file SHA-256 manifest and a 254-day gap table — and wrote the immutable
capture that explains the Google access position. The radar bot swept as usual
(`048f2e6`). The morning brief (`f78d3a2`) and vault-clean (`40a3120`) ran. Both other
checkouts were silent: `dillon-claude-config` has no commit since 2026-09-05 (`c4816ae`),
`client-operations-canonical` none since 2026-09-03 (`faee50b`).

## VERIFIED

- **The craft-brief staleness bug is no longer latent — it is manufacturing false dated
  history.** PR #397 (branch `cursor/competitive-task-consolidation-c4c6`, 2026-09-11)
  ran `agent-craft-brief.js` for real (`dry_run: false`, `written_at
  2026-09-11T13:13:51Z`) and committed two new files:
  `12_Brain/11_Craft/2026-09-10 - operating brief.md` and `2026-09-11 - operating
  brief.md`. Both are counted from loop receipts **2026-08-12 to 2026-08-18** — the same
  seven days as the 2026-08-19 brief, byte-identical tables. `agent-craft-brief.json` in
  that PR reads `generated_for: "2026-09-11"`, `days: [2026-08-12 … 2026-08-18]`,
  `status: "ok"`. PR #395 caught this as a `dry_run: true` latent defect on 2026-09-10;
  a day later it started writing artifacts.
- **`12_Brain/queue/` has had no new loop receipt since `claude-loop-2026-08-18.jsonl`**,
  and `12_Brain/state/claude-daily-driver.json` last cycled
  `2026-08-19T01:53:17Z` with `outcome: "noop"`, `consecutive_failures: 0`. Twenty-seven
  days. Nothing reports a fault, because a `noop` and a corpse look the same.
- **PR #397 is not another duplicate spec — it is the implementation.** It ships
  `12_Brain/registry/umbrella-workflow.json` (188 lines), seven `.cursor/agents/*.md`
  lanes, a run receipt (`competitive-task-orchestrator.json`, `status: ok`, 5 ok / 1
  blocked / 8 deferred) and a decision note,
  `12_Brain/04_Decisions/2026-09-08 - Adopt umbrella competitive-task orchestrator.md`,
  whose `supersedes` block names `claude-daily-learning-loop`,
  `claude-nightly-vault-hygiene` and `claude-morning-brief` as folded into it. The five
  earlier `cursor/competitive-task-*` PRs (#375, #381, #385, #390, #396) were iterations
  converging on this, not five copies of one idea.
- **Align HCM ended 2026-09-02 and three read-first files still say otherwise.** See
  [[12_Brain/08_Memory/2026-09-15 - Align HCM engagement ended]].
- **The stranding is flat, not clearing.** 127 open PRs counted today by pagination
  (100 on page 1 ascending, ending at #361; 27 newer). `11_Agents/Cloud Routine Prompts
  2026-09-05.md` recorded 135 on 2026-09-05 and still reads `status: awaiting-paste`.
  Oldest open PR is **#174, 2026-07-13 — 64 days**. Seven daily-learning PRs are open
  and unmerged: #363, #368, #373, #380, #384, #388, #395.
- **The producer that never misses is the one that isn't a chat session.** The radar
  GitHub Actions workflow produced `Daily-Briefs/radar-YYYY-MM-DD.md` on all fourteen
  days 2026-09-01 through 2026-09-14. Every claude.ai Routine has gaps in the same
  window: vault-clean 6/14 nights, wiki-lint 5/14 and none since 09-10, daily-learning
  no PR since 09-10.

## INFERRED

- The 09-11 → 09-13 quiet for daily-learning may be three correct silent nights rather
  than three misses. This container was created 2026-09-13T00:02Z and reused tonight,
  which shows the 09-13 run **fired**; whether 09-11 and 09-12 fired is not checkable
  from here, and "no PR" is a valid outcome under the routine's own rules. I am not
  calling it an outage.
- The morning brief's "3-day reporting gap 09-11 through 09-13"
  (`Daily-Briefs/plan-2026-09-14.md`) is one missed scheduled run, not three: 09-12 and
  09-13 were Saturday and Sunday and the brief is weekday-only. The gap is real; the
  size is overstated by the brief's own framing.

## Proposals

### 1. Fix `agent-craft-brief.js` staleness *before* merging #397 — not after

This is an ordering constraint, and it is the one thing on this page that gets worse by
waiting. #397 is the right architecture and should land. But it runs
`agent-craft-brief.js --days 14 --write` as the `learn` phase lane, and that generator
cannot tell a live window from a dead one. Merge #397 as it stands and `main` gains two
briefs dated 09-10 and 09-11 that present August data under September filenames, plus a
new one every day after. False dated history is much more expensive to unwind than a
missing brief — an agent reading `12_Brain/11_Craft/` a month from now has no way to
know the 09-11 brief describes 08-18.

The defect, exactly: `loadDays(limit)` at `_os/automation/bin/agent-craft-brief.js:41-58`
selects `.sort().slice(-limit)` — the newest *files by name*, never compared to today.
`main()` at `:135-141` returns `blocked` only when the window is **empty**. A window
full of four-week-old receipts reads as `ok`.

```js
// after:  const days = loadDays(argInt('--days', 14));      (line 135)
const newest = days.length ? days[days.length - 1].day : null;
const ageDays = newest
  ? Math.round((Date.parse(`${todayISO()}T00:00Z`) - Date.parse(`${newest}T00:00Z`)) / 864e5)
  : null;
const staleAfter = argInt('--stale-after', 2);
if (ageDays !== null && ageDays > staleAfter) {
  process.stdout.write(`${JSON.stringify({
    automation_id: 'agent-craft-brief',
    status: 'stale',
    detail: `newest receipt ${newest} is ${ageDays} days old; receipt writer has stopped`,
    newest_receipt_day: newest,
    receipt_age_days: ageDays,
  }, null, 2)}\n`);
  process.exit(2);
}
```

Carry `newest_receipt_day` and `receipt_age_days` into the `result` object at `:180-193`
unconditionally, so even a healthy run states the age it measured.

**Why this is proposed and not applied.** PR #395 recorded that #363, #364 and #368
stacked up with competing edits to this exact file, and said in as many words: *do not
let an agent do this unattended.* That finding still holds, so this run did not touch
it either. It wants one deliberate change by one person, then #397.

**Root cause underneath, unchanged and still not fixed:** the receipt writer is
`System/scripts/Invoke-ClaudeLoop.ps1:142`, Windows-only, and it stopped on 2026-08-18.
Fixing the generator makes the silence *visible*; it does not make receipts.

### 2. Correct the operating truth about Align and the job search

`System/operating-status.md` and `CLAUDE.md` are the first two files every agent reads,
and both state that Dillon is full-time at Align HCM. He has not been since 2026-09-02.
Every planning routine inherits that, and inherits ROAD TO 100 CLIENTS as the only
directive, while the real open thread is an Empeon interview with a named next contact.
`Daily-Briefs/plan-2026-09-14.md` picks "the one thing" from client work exclusively; a
job-search lane exists in PR #391 and no routine reads it.

The change, in one commit:

- `01_Clients/Align HCM.md` — `status: active` → `status: inactive`, add
  `inactive_at: 2026-09-02`, `inactive_reason: "engagement ended"`,
  `retention_policy: preserve-history-do-not-promote-or-rank`. This is the shape the
  2026-09-05 reconciliation used for Fagan Painting and Shadow HVAC.
- `System/operating-status.md:20` — replace the "Full-time, excluded from client count"
  line with a former-employer line carrying the end date.
- `CLAUDE.md` — "Full-time at Align HCM" → the current arrangement, whatever Dillon
  wants it to say.
- The client-operations registry, on the Windows box — same `inactive` patch. Not
  reachable from here.

**Judgment needed, so it is not in this diff.** Whether Align is archived or kept as an
inactive former employer, what replaces the primary directive while a job search is
live, and whether the Empeon thread belongs in the vault's operating surface at all are
all Dillon's calls. Evidence and the exact edits are in
[[12_Brain/08_Memory/2026-09-15 - Align HCM engagement ended]].

### 3. Give every access verdict a scope, and re-probe before routing around one

`12_Brain/09_Ops/Connector Map.md:100` recorded "Blocked Composio … Ads/GA4/Meta" from a
2026-09-01 workspace observation. Read later as a general fact, it sent a cloud session
down the Composio fallback path when Search Console and GA4 were open the whole time —
the real block was Google Ads *entitlement*, scoped to Cloud project 150963436905. The
recovery cost a full re-pull of the Align dataset from source.

A dated correction is applied in this diff. The standing change is the format: every row
in the Connector Map states `<surface>: <state> because <scope>`, with the observation
date and the workspace observed. A bare "blocked" is an instruction to stop checking,
and it outlives the condition that produced it. Lesson recorded in
[[12_Brain/11_Craft/earned-lessons|earned-lessons]].

### 4. Move the deterministic lanes to GitHub Actions

Fourteen of fourteen September days for the radar workflow; 6/14 and 5/14 for the two
hygiene lanes; gaps for every chat-session routine. The difference is not the work — it
is that one producer is a cron in Actions and the others are scheduled chat sessions.
Everything in #397's `intel` phase is already a plain command with a `blocked_exit`
contract — `connector-health.js`, `queue-status.js`, `predict-work.js`,
`frontmatter-validate.js`. None of it needs a model. Running that phase in Actions on
the radar workflow's schedule would give the estate a heartbeat that does not depend on
a session starting, and would leave the model-shaped lanes (pulse, inbox, plan, this
review) as the only things that can silently not happen.

Smaller than it sounds, and it is the cheapest way to stop discovering month-old
silences a month late.

## Links

- [[12_Brain/11_Craft/00_Index|Agent Craft index]]
- [[12_Brain/11_Craft/earned-lessons|earned-lessons]]
- [[12_Brain/03_Concepts/Confirm the Artifact Not the Action|Confirm the artifact, not the action]]
- [[12_Brain/08_Memory/2026-09-15 - Align HCM engagement ended|Align HCM engagement ended]]
- [[12_Brain/09_Ops/Connector Map|Connector Map]]
