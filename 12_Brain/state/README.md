# State

Machine state written by the `_os/automation/bin/*` CLIs and the radar workflow.
Two very different durability classes live here — know which you are touching:

## Ephemeral (safe to delete; next run recreates)

- The loose `*-last.json` / `*.json` files at this level (last-run state per
  automation id: `radar-last.json`, `site-grader-last.json`, `qualify.json`, …)
- `workflow-runs/` (maker/checker run records)

## Durable (do NOT delete — this is accumulated memory, not cache)

- `radar/registry.json` — the prospect radar's only durable memory: every
  tracked business with grade history. Deleting it loses the radar's knowledge
  of what it has seen, graded, and built.
- `radar/build-queue.csv` and `radar/build-*.json` — the build pipeline state.
- `radar/image-briefs/` — generated briefs referenced by the build queue.
- `grades/` and `candidates/` — dated scoring snapshots; regenerable only by
  re-running full discovery against the live web (expensive, and history is lost).

The daily radar workflow (`.github/workflows/radar-daily.yml`) commits this
directory on purpose — treat it like data, not temp files.
