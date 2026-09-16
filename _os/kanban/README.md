# Dillon OS board

A read-only kanban over the vault's own state. Agents already self-report by
appending to the cadence ledger and writing state files; this board reads those
outputs and renders them as columns. It does not write anything under the vault.

Built 2026-09-15. Zero dependencies. Node 24 on this machine.

## Run it

```
cd C:\Users\dillo\repos\dillon-os
node _os\kanban\server.js
```

Open http://127.0.0.1:4717. It binds to loopback only. `--port N` picks another
port. The page re-reads the vault every 60 s (header select: 30 s / 60 s / 5 min /
off) and on the reload button. Click a card to expand its source, evidence, notes,
ledger row or state summary.

Other entry points:

```
node _os\kanban\server.js --json            # the whole board as JSON, once (agents can read this)
node _os\kanban\server.js --json --no-tasks # same, without the Task Scheduler probe
node _os\kanban\server.js --selftest        # parser assertions on fixtures AND the live queue
```

`--selftest` fails if the number of parsed open approvals ever differs from the
number of `- [ ]` lines in `System/approval-queue.md`. Run it after editing the
parser or if the queue's line format changes.

## What a card is

Five card types. Each is a direct projection of a file the vault already writes.
Nothing here invents a second state system.

| Type | Source | Column |
| --- | --- | --- |
| `approval` | one `- [ ]` line (plus its indented continuation notes) in `System/approval-queue.md` | Awaiting Dillon |
| `job` | one manifest entry in `_os/automation/cadence/{daily,weekly,monthly}.yaml`, joined by id to its latest `run-ledger.jsonl` row and to the `Cadence-<cadence>` Task Scheduler entry | Scheduled; Failed if its last row failed or it has no row for 1.5x its cadence |
| `run` | `run-ledger.jsonl` rows from the last 3 days, grouped per job per day (the hourly `daily-sweep` heartbeat collapses to one card a day) | Done; Failed if any row that day failed or an `ok` row names an artifact that is not on disk |
| `automation` | `12_Brain/registry/automations.json` entry joined to `12_Brain/state/<id>.json` | Done; Running if `finished_at` is null; Failed if status is error or the file is older than its registry `stale_after_hours` / cadence budget (rules reused from `_os/automation/bin/queue-status.js`) |
| `task` | Windows Task Scheduler entries at the root path `\` (user-registered; `\Microsoft\*` is ignored) | Scheduled / Running / Failed by State, LastTaskResult and NumberOfMissedRuns; disabled tasks are hidden unless toggled |
| `sweep` | the verdicts `daily-sweep.json` already reached: stale or missing daily artifacts, days with no ledger entry, ledger rows naming missing artifacts, MISSED sweep days, suspect-silent counters | Failed |

The approval queue is parsed in its existing shape, both line forms:

```
- [ ] 2026-07-12 - Kimberly James Bridal - Approve ... - Risk: low
- [ ] 2026-09-07 -- [Security / Tock credential] -- Approve ... -- Source: X -- Evidence: "..." -- Risk: high
- [ ] 2026-09-08 -- RE-SCOPE BEFORE ACTIONING, flagged 2026-09-09: ... -- [Onsite Concrete / Google Ads] -- ...
  — VERIFIED 2026-09-14, STAYS OPEN: ...      <- indented lines are notes on the item above
```

Fields pulled out: date, category (bracket) or client (old form), prefix
annotation, title, Source, Evidence, Risk, section heading, line number, age in
days, and `rotting` (open more than 14 days, the same rule the
`approval-queue-diff` cadence job uses). **No schema change to that file is
proposed or needed.** Note that the file's own `## Rules` heading currently sits
above 70 of the 127 open items because items were appended below it; the board
shows the section as written rather than guessing.

## What it reads

- `System/approval-queue.md`
- `_os/automation/cadence/daily.yaml`, `weekly.yaml`, `monthly.yaml` (a tiny
  line parser for the flat shape `cadence/README.md` documents; not general YAML)
- `_os/automation/cadence/run-ledger.jsonl`
- `12_Brain/registry/automations.json` and `12_Brain/state/*.json`
- `12_Brain/state/daily-sweep.json`
- Windows Task Scheduler via one `Get-ScheduledTask` PowerShell call, cached
  60 s (about 2 s per probe on this machine; `?tasks=0` on `/api/board` skips it)

## What it does not do yet

- **Write back.** Nothing is checked off, edited or appended. See below.
- **See interactive agent sessions.** A Claude Code or Codex session that is
  running right now leaves no file the vault reads, so it is not a card. The
  Running column shows Task Scheduler entries in state `Running`, which on this
  machine is mostly long-lived services (Codex Router, Ollama, tunnels); the
  "show long-running services" toggle hides those. Self-reports with
  `finished_at: null` would also land here, but no current state file uses that
  field.
- **Client-operations.** The canonical queue in `client-operations` is
  single-writer and outside the vault; not read in this pass.
- **Decode every Task Scheduler result code.** Common ones are named; the rest
  show as hex.
- **Judge whether a manifest job was due.** "No ledger row in N days" uses a
  fixed 1.5x cadence budget, not the heartbeat's weekday/Monday/1st logic. The
  heartbeat report remains the authority on ABSENT.

## Next step, not built: write-back from the board

Checking an approval item off from the board would need, and Dillon has to decide
each separately:

1. **A writer for `System/approval-queue.md`.** Today the only agent with
   authority to mark something done is `closer`, and the daily-orchestrator rule
   is "draft, append to approval-queue.md, stop." A board that flips `[ ]` to
   `[x]` is a new writer with that authority. The mechanical part is small
   (rewrite one line by its line number after re-reading the file and checking
   the line still matches); the authority part is the decision.
2. **Concurrency.** Several sessions edit that file the same hour. A write must
   re-read, verify the target line is byte-identical to what the card was
   rendered from, then replace, or refuse.
3. **Archive, not delete.** The queue's own rule is that completed items move to
   `System/approval-queue-archive.md` with their original text and date. A
   write-back should do that move, not just tick the box.
4. **An audit line.** Append `{"ts","job":"kanban-approve","line","text"}` to
   the run ledger so the heartbeat can see it, matching how every other writer
   leaves a trace.
5. **Bind stays loopback.** No auth is planned; the write endpoint must never be
   reachable off this machine.

None of that is started. This pass is read-only by design.
