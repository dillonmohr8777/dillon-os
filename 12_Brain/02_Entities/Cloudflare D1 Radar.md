---
tags: [entity, tool]
source: "[[System/approval-queue.md]]"
updated: 2026-09-01
note_type: entity
status: active
created: 2026-09-01
source_refs: ["[[System/approval-queue.md]]", "[[Daily-Briefs/radar-2026-09-01]]"]
---

# Cloudflare D1 Radar

**Summary:** the live backend for [[12_Brain/05_Projects/Prospect Radar V2|Prospect Radar V2]] — a Cloudflare D1 database
plus a read-only Worker that serves the prospect queue as JSON and an HTML
dashboard.

## What it is

A D1 database named `dillon-radar` (id starting `2c57ba27`) holding three
tables: `prospects` (current state per business), `audits` (score history),
and `builds` (rebuild/deploy status). It replaces flat-file reads of
`12_Brain/state/radar/build-queue.csv` with a queryable store other tools can
hit directly. Source lives in `_os/radar-d1/` (`schema.sql`, `import.mjs`,
`worker.js`, `wrangler.toml`, `README.md`).

## Status: database live, Worker undeployed

Schema is applied and the first 50 prospects from the 2026-09-01 build queue
are loaded (`priority_score` -> `score`, `worst_fault`, `last_graded` ->
`last_audit`/`tracked_since`). The Worker code is written and read-only
(no writes, CORS off) but `wrangler deploy` is approval-gated per
[[System/approval-queue.md]] — it has not been pushed live.

## Re-import

`node _os/radar-d1/import.mjs <csv> <outDir>` regenerates batched
`INSERT OR REPLACE` SQL files from the build queue; no network calls happen
in that script. Loading the files into D1, and deploying the Worker, both
still require the approval-gated steps in `_os/radar-d1/README.md`.
