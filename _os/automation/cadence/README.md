# Cadence manifests

Three scheduled tasks (daily, weekly, monthly) read the manifests in this folder
and run whatever they list. **Adding work is a manifest entry, not a new routine.**
That keeps the routine count at 3 of the 15/day Max allows, forever.

## Why this shape

The failure this replaces: work that runs and produces nothing, and nobody
notices. Verified 2026-09-14 — `run-the-implemented-dillon-os-daily` was empty
three days running, `daily-communications-brain` went silent for four days in
September and self-recovered unremarked, and `client-operations` carries 3,408
untracked files because finished work never gets filed.

So a job is **not done when it runs**. It is done when its artifact exists, is
committed, and is in the ledger. A job that produces nothing is a **failure**, and
the driver says so out loud.

## Manifest schema

```yaml
version: 1
cadence: daily          # daily | weekly | monthly
jobs:
  - id: kebab-case-id   # required, unique within the file, used in the ledger
    title: Human name   # required
    enabled: true       # required. false = skipped, still reported as skipped
    client: omega-landscaping   # optional. Exact id from registry/clients.json.
                                # Present = artifact files into that client's
                                # deliverables/. Absent = vault-internal.
    outputs: 12_Brain/07_Reviews/Daily   # required. Vault-relative dir.
    accept: |           # required. One sentence. What must be true to pass.
      A dated markdown file exists listing every channel checked.
    prompt: |           # required. Self-contained. The run has no memory.
      ...
```

### Rules the driver enforces

- `client` must resolve in
  `C:\Users\dillo\Documents\Codex\projects\client-operations\registry\clients.json`.
  An unresolvable id fails the job rather than guessing a folder.
- Nothing here may write the canonical queue (`queue/work-items.json`,
  `CONTROL.md`, `state/corrections.jsonl`). Findings go to
  `client-operations/intake/`; Marketing Chief promotes them.
- No job sends, posts, publishes, deploys, or spends. Anything needing that
  appends to `System/approval-queue.md` and stops.
- Jobs run in file order. One failing job does not stop the rest.

## The ledger

`_os/automation/cadence/run-ledger.jsonl` — one JSON object per job per run:

```json
{"ts":"2026-09-14T09:05:00-04:00","cadence":"daily","job":"comms-sweep",
 "status":"ok","artifact":"12_Brain/07_Reviews/Daily/2026-09-14 - comms.md",
 "commit":"a1b2c3d","note":""}
```

`status` is `ok` | `failed` | `skipped`. A `failed` entry must carry a `note`
saying what was missing. The heartbeat reads this file — an absent entry and a
failed entry are both failures, and the difference matters: absent means the
driver never ran at all.
