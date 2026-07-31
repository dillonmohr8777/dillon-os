---
tags: [decision, brain, automation]
decided: 2026-07-31
status: active
supersedes: "[[12_Brain/decisions/2026-07-31 - Two-lane brain layout]]"
source: "12_Brain/registry/wiki-lint.json"
updated: 2026-07-31
---

# One home per record type

**Decision:** every record type in `12_Brain/` has exactly one folder. A numbered
lane exists only for a *kind* of note the compiled wiki does not already own.

| Folder | Holds | Who writes it |
|---|---|---|
| `entities/`, `concepts/` | compiled things and ideas | human or agent |
| `decisions/` | the whole decision log | human, agent, or automation |
| `projects/` (+ `projects/Experiments/`) | delivery threads and proposals | human or automation |
| `research/` (+ `research/References/`) | dated findings and durable references | human or automation |
| `memory/`, `protocols/` | believed state, agent protocols | human or agent |
| `01_Captures/` | immutable dated evidence | automation only, never edited |
| `07_Reviews/` | acceptance reports for things asking to be trusted | automation |
| `09_Ops/` | live operational blockers | human or automation |
| `10_Maps/` | pages whose only job is connecting other pages | human or agent |

**Why this supersedes [[12_Brain/decisions/2026-07-31 - Two-lane brain layout|Two-lane brain layout]]:**
that decision split the layer by *who wrote the note* — a compiled wiki for
humans and agents, dated lanes for automation. It kept `04_Decisions` beside
`decisions/`, `05_Projects` beside `projects/`, and `06_Research` beside
`research/`, and named that overlap as the open question. The overlap was the
whole problem, and author is the wrong axis to split on:

- [[12_Brain/bases/Decisions.base|Decisions.base]] queried `decisions/` and so
  showed two of the three decisions. A decision log you cannot read in one place
  is not a log.
- [[12_Brain/bases/Projects.base|Projects.base]] queried `projects/`, which held
  nothing but a README, while every live project sat in `05_Projects/`. The view
  read as "no active work".
- `research/` was an empty landing page pointing elsewhere.

Splitting by *kind* keeps the property that actually mattered — captures stay
immutable, reviews stay auditable — without duplicating a record type. Who wrote
a note is already recorded in its frontmatter (`owner`, `source_refs`,
`verification_status`); it does not need to be a folder.

**What moved.** `04_Decisions/`, `05_Projects/` and `06_Research/` are gone:

- `2026-07-30 - Adopt gated intelligence stack` → `decisions/`
- both 2026-07-30 project notes and `Experiments/` → `projects/`
- `2026-07-30 - Grok daily intelligence` and `References/` → `research/`

Frontmatter schemas coexist inside a folder: `wiki-lint` accepts `source` or
`source_refs` as provenance, so an automation record and a compiled page can sit
side by side without either being rewritten.

**Code and views updated in the same change:** `RESEARCH_DIR` and
`EXPERIMENT_DIR` in `_os/automation/lib/intelligence.js`,
[[12_Brain/bases/Experiment Queue.base|Experiment Queue.base]], the `Projects.base`
filter that now excludes `Experiments/`, the `wiki-lint` scopes, and the
`automations.json` output paths.

**Adding a new lane** means adding a genuinely new *kind*. If the answer to "which
existing folder would this go in?" is any folder, it goes there instead.

## Links
- [[12_Brain/decisions/2026-07-29 - 12_Brain is the canonical brain layer|12_Brain is the canonical brain layer]] — the parent decision.
- [[12_Brain/concepts/Second Brain Architecture|Second Brain Architecture]] · [[12_Brain/concepts/Context Economy|Context Economy]]
