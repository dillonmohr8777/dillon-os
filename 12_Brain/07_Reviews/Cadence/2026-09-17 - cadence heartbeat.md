# Cadence heartbeat - 2026-09-17

Reporting on **2026-09-16 (Tuesday)**. Due: the 8 daily jobs. No weekly (Monday only), no monthly (1st only).

## ABSENT - no ledger entry at all

Five of eight daily jobs have no line in `run-ledger.jsonl` for 2026-09-16.

| Job | Ledger | Artifact on disk | Read |
|---|---|---|---|
| `agent-verifier` | ABSENT | **none** | The driver died before the last job. Nothing verified yesterday's work. |
| `leads-triage` | ABSENT | `2026-09-16 - lead triage.md` (3,354 B) | Job ran, ledger line never written |
| `ops-decision-packets` | ABSENT | `2026-09-16 - ops decision packets.md` (8,934 B) | Job ran, ledger line never written |
| `production-briefs` | ABSENT | `2026-09-16 - production briefs.md` (9,198 B) | Job ran, ledger line never written |
| `delivery-milestones` | ABSENT | `2026-09-16 - delivery milestones.md` (13,215 B) | Job ran, ledger line never written |

Two distinct failures, not one:

1. **`agent-verifier` genuinely did not run.** No ledger line, no artifact. It is the last job in the manifest and the one that checks the others, so its absence is silent by construction - exactly the failure mode this cadence exists to catch.
2. **Four jobs ran and produced real artifacts but wrote no ledger line.** File mtimes cluster at 18:24-18:49, four to ten hours after the 08:09-08:14 trio that did get ledgered. So 09-16 was two separate passes: a morning pass (3 jobs, ledgered, committed) and an evening pass (4 jobs, artifacts only, no ledger, no `runs.jsonl` row). The evening pass never reached step 2's ledger append.

Consequence: `runs.jsonl` and the HUD roster show nothing for those four agents yesterday. The work exists on disk and is invisible to every consumer of the ledger.

## failed

None.

## ok

| Job | Ledger | Artifact verified on disk |
|---|---|---|
| `heartbeat` | ok, commit 6dd2f6dd | yes, 3,354 B |
| `approval-queue-diff` | ok, commit 2f9560e7 | yes, 7,974 B |
| `unfiled-sweep` | ok, commit d1263607 | yes, 4,051 B |

No ledger entry names a path that does not exist. No lying rows this pass.

## skipped

None. All eight daily jobs are `enabled: true` in `12_Brain/registry/automations.json`.

## Also on disk, not a manifest job

`2026-09-16 - roster run.md` (3,336 B) - output of driver step 3, `run-roster.js`. Not ledgered by design.

## Note on ledger noise

87 lines in the ledger, 76 of them are hourly `daily-sweep` rows from a separate scheduled task writing into the same file. `daily-sweep` is not in any cadence manifest. It is drowning the cadence signal at roughly 24 rows a day, and its `runs.jsonl` rows carry `exit_code: 2` with `status: ok`, which is itself a contradiction worth a human look.
