---
tags: [decision, brain, automation]
decided: 2026-07-31
status: active
supersedes:
source: "12_Brain/registry/wiki-lint.json"
updated: 2026-07-31
---

# Two-lane brain layout

**Decision:** `12_Brain/` runs two lanes on purpose, and both are registered in
[[12_Brain/INDEX|INDEX]].

| Lane | Folders | Written by | Frontmatter | Shape |
|---|---|---|---|---|
| **Compiled wiki** | `entities/`, `concepts/`, `decisions/`, `projects/`, `research/`, `memory/`, `protocols/` | agent or operator, compiling from raw | `tags`, `source`, `updated` | evergreen; updated in place |
| **Automation lanes** | `01_Captures/`, `04_Decisions/`, `05_Projects/`, `06_Research/`, `07_Reviews/`, `09_Ops/`, `10_Maps/` | `_os/automation` runs | `note_type`, `source_refs`, `verification_status`, `owner`, `status` | dated, append-only records |

**Why this is a decision and not just a description:** the numbered lanes landed
on 2026-07-30 next to the existing lowercase tree without being added to
`INDEX.md` or to any folder index. That left 19 pages no link trail could reach,
which under the reading rule in `CLAUDE.md` means an agent starting at INDEX
could not find them at all. The choice was to consolidate the lanes into the
lowercase tree or to make the split explicit. Explicit won, because the lanes
are load-bearing for code and views that already point at those exact paths:

- `_os/automation/lib/evaluator.js` writes maker/checker reviews to `12_Brain/07_Reviews/Automation Runs/`.
- [[12_Brain/bases/Experiment Queue.base|Experiment Queue.base]] queries `12_Brain/05_Projects/Experiments/`.
- Ingest runs append dated records that must never overwrite a prior day.

**Which lane a new page goes in:** did an automation run produce it, with a
`verification_status` and a source it did not itself judge? Automation lane. Did
a human or agent read several sources and compile one durable lesson? Wiki lane.
A capture never gets edited into a concept — it gets compiled into one, and the
concept carries a `source:` back to it.

**Still open — the three overlapping pairs.** `04_Decisions`/`decisions`,
`05_Projects`/`projects` and `06_Research`/`research` name the same *kind* of
record. No page is duplicated today, but the lowercase `projects/` and
`research/` indexes are empty while their numbered counterparts hold every live
record. Recommended next step: keep the numbered lanes as the append-only intake
and reduce the lowercase `projects/` and `research/` to compiled roll-ups that
link into them, so there is one place to look for "what is true now" and one for
"what happened on a date". That is a content migration and an operator call, so
it is recorded here rather than done.

**Implications:**

- Every lane carries a `README.md` index, and INDEX links each one — one line per
  lane, not one line per dated record, because captures accrue daily.
- `node _os/automation/bin/wiki-lint.js` enforces reachability, so a new lane
  added without an index fails the check instead of going quietly missing.
- The automation schema counts as provenance: `wiki-lint` accepts `source_refs`
  in place of `source`.

## Links
- [[12_Brain/decisions/2026-07-29 - 12_Brain is the canonical brain layer|12_Brain is the canonical brain layer]] — the parent decision this refines.
- [[12_Brain/concepts/Second Brain Architecture|Second Brain Architecture]] · [[12_Brain/concepts/Context Economy|Context Economy]]
