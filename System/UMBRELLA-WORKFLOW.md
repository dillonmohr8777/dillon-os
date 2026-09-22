---
tags: [system, automation, orchestration]
last_updated: 2026-09-22
status: active
source_refs:
  - "[[12_Brain/07_Reviews/2026-09-03 - Year Quarter Month Alignment]]"
  - "[[11_Agents/Cloud Routine Prompts 2026-09-05]]"
  - "[[System/daily-orchestrator]]"
  - "[[System/MASTER-ORCHESTRATOR]]"
---

# Umbrella workflow — one automation, parallel agents

## Problem this solves

Dillon OS had **four cloud schedulers** (morning brief, daily learning, nightly hygiene, and the Cursor “competitive task consolidation” job) each opening **draft pull requests** that never merged. The same umbrella proposal was recreated daily (#333–#360). Meanwhile **Windows Task Scheduler** runs the Claude daily driver, Immohrtal crew, prospect radar, and cadence manifests on a different clock.

That is not “more automation.” It is **competing automations** with no completion condition.

## One entry point

```bash
node _os/automation/bin/umbrella-run.js --slice morning   # operating picture
node _os/automation/bin/umbrella-run.js --slice midday    # competitive task board
node _os/automation/bin/umbrella-run.js --slice nightly   # hygiene + learning signals
```

Manifest: `_os/automation/umbrella/manifest.json`

Outputs every run:

- `12_Brain/state/umbrella-latest.json` — machine ledger (staleness contract matches `12_Brain/schemas/automation-run.json`)
- `Daily-Briefs/umbrella-YYYY-MM-DD.md` — human board: lane results + ranked competitive tasks + which **agents** may run in parallel next

Deterministic lanes run **in parallel** inside each `parallel_group` (today: all `deterministic`). Model work is **not** faked in Node; `agent_lanes` in the manifest names the five Cursor/Claude agents that may run concurrently after evidence exists.

## Competitive tasks (what “competitive” means here)

Not competitor SEO. **Competing priorities** pulled from evidence already in the vault:

1. `Daily-Briefs/plan-YYYY-MM-DD.md` — “The one thing”
2. `Daily-Briefs/inbox-brief-YYYY-MM-DD.md` — open commitments (Slack captures filed under `00_Inbox/slack/`)
3. `System/approval-queue.md` — consequential gates still open

Codex sessions, Gmail, and live Slack are **not** read inside `umbrella-run.js`. They arrive through bridges (`00_Inbox/`, `Daily-Briefs/`, client-operations queue) per [[System/daily-orchestrator]].

## Map legacy schedulers → slices (retire duplicates)

| Old trigger | Replace with |
| --- | --- |
| Cursor cron “competitive task consolidation” | `--slice midday`; **commit to `main`**, do not open a daily PR |
| claude.ai morning brief (`0 11 * * 1-5`) | `--slice morning` + skills `/client-pulse` … `/plan-today`; export `DILLON_CLIENT_OPERATIONS_ROOT` per [[11_Agents/Cloud Routine Prompts 2026-09-05]] |
| claude.ai daily learning (`0 4 * * *`) | `--slice nightly` + one rolling `daily-learning/*` PR max (see Cloud Routine Prompts) |
| claude.ai vault hygiene (`0 6 * * *`) | `--slice nightly` + `/vault-clean` `/wiki-lint` |
| `Cadence-daily` | Keep manifest jobs; **also** run `umbrella-run --slice morning` so cadence and brief share one ledger |
| `Claude-Autonomous-Daily-Driver` | Unchanged on Windows; `local-continuous` slice only **checks** `12_Brain/state/claude-loop.json` freshness |

## Parallel agent lanes (after deterministic slice)

| Agent | Runs when |
| --- | --- |
| `marketing-chief` | Plan or pulse missing/stale; assembles the day |
| `paid-media-analyst` | Conversion integrity, billing, negatives (e.g. Omega, Replenish, KJB) |
| `revenue-ops-analyst` | MRR, invoices, registry reconciliation |
| `reliability-scout` | Sweep ABSENT, claude-loop stale, automation gaps |
| `brain-curator` | Nightly hygiene signals only |

Launch these **in parallel** only when their `when` clause is true and they do not write the same files. Maker/checker separation unchanged (`web-product-builder` ≠ `qa-critic`).

## Cursor automation prompt (midday slice)

Use this as the **only** Cursor scheduled job for consolidation:

```text
You are the Dillon OS umbrella orchestrator (midday slice). Work in the vault on branch main. git pull first.

Run: node _os/automation/bin/umbrella-run.js --slice midday

Read Daily-Briefs/umbrella-<today>.md and 12_Brain/state/umbrella-latest.json.

For each agent lane whose "when" matches today's evidence, delegate in parallel (Task tool): marketing-chief, paid-media-analyst, revenue-ops-analyst, reliability-scout — at most one outcome each, draft-only, no send/publish/spend.

If deterministic lanes failed, fix only what is safely local (missing brief → run the relevant skill scripts as documented in .claude/skills/).

Ship: git add Daily-Briefs/umbrella-*.md 12_Brain/state/umbrella-latest.json _os/automation/cadence/run-ledger.jsonl; commit "umbrella: <date> midday"; push to main. Do NOT open a new pull request for this workflow.

Budget: under 80k tokens. Final message: top 3 competitive tasks, lane failures, agents launched.
```

## Verification

```bash
node --test _os/test/umbrella-run.test.js
node _os/automation/bin/umbrella-run.js --slice midday --dry-run
```

## Related

- [[12_Brain/04_Decisions/2026-09-22 - Umbrella workflow supersedes competing daily automations]]
- [[11_Agents/Cursor Umbrella Automation 2026-09-22]]
