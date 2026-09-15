---
name: brain-compile
description: Compile new captures and session outcomes into sourced canonical entities, concepts, decisions, projects, and memory without duplicating client truth.
---

# Brain Compile

Read `INDEX.md`, `12_Brain/09_Ops/Schema.md`, and the source captures.

1. Find captures with `status: unprocessed`.
2. Search for existing canonical pages before creating anything.
3. Update the relevant page with `source_refs`, observation dates, confidence,
   and review or expiry dates.
4. Keep client facts in `01_Clients/`.
5. Mark a capture `compiled` only after every durable item has a destination.
6. Run `System/scripts/Test-SecondBrain.ps1` and report the diff.
