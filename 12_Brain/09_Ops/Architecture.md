---
note_type: architecture
status: active
owner: Dillon Mohr
created: 2026-07-29
updated: 2026-08-11
review_on: 2026-08-29
source_refs:
  - https://obsidian.md/help/bases
  - https://obsidian.md/help/cli
  - https://obsidian.md/help/web-clipper
  - "[[12_Brain/03_Concepts/Evidence Context and Learning Loops]]"
  - https://github.com/dillonmohr8777/dillon-os/commit/a9ecdeab63420e5bb0db4e6f556c5dabab1713f4
tags:
  - brain
  - architecture
  - system
---

# Second Brain Architecture

## Purpose

Dillon OS is not a filing cabinet. It is a local-first operating memory that
turns work into reusable context, makes commitments visible, and lets Codex,
Cursor, Claude, and Hermes continue from verified state.

## The eight layers

1. **Capture** — `00_Inbox/` for frictionless intake and
   `12_Brain/01_Captures/` for immutable receipts.
2. **Truth** — canonical client and operating facts stay in the existing
   numbered folders.
3. **Knowledge** — entities and concepts compile source material into
   updateable pages.
4. **Execution** — projects, decisions, and approval gates turn knowledge into
   bounded action.
5. **Memory** — the memory ledger stores durable corrections, preferences, and
   time-bound facts without secrets.
6. **Reflection** — daily, weekly, and quarterly reviews find drift and create
   the next priorities.

7. **Connection** - `12_Brain/10_Maps/` keeps the vault navigable as one
   connected system.
8. **Strategy** - `12_Brain/03_Concepts/` compiles evidence into reusable
   operating systems, while `12_Brain/09_Ops/Knowledge Coverage.md` measures
   whether the core domains are deep and connected enough to use.

Client overlays apply those shared systems without copying or blending client
truth. `12_Brain/Bases/Client Strategy Overlays.base` exposes the portfolio;
each overlay links back to the exact client or employer record and dated source
evidence. Registry reconciliation is generated in
`12_Brain/09_Ops/Client Intelligence Coverage.md`.

## The compile loop

The connection layer at `12_Brain/10_Maps/` links stable domains, client
clusters, operating front doors, and individual notes into one navigable graph
without moving canonical source material.

```text
capture -> verify source -> update canonical page -> link related pages
        -> record decision/correction -> run health checks -> review
```

Captures are evidence. Compiled notes are interpretations. They must never be
confused.

The compile loop is complete only when a lesson has a canonical home, source
references, limits, internal connections, a review date, and a route back into
execution through a template, project, experiment, scorecard, or workflow.

## Write surfaces and compounding contract

The vault compounds by reducing uncertainty and improving future execution, not
by maximizing file count. Each operating cycle should move information through
one bounded chain:

```text
machine or human capture -> verified evidence -> canonical update
-> bounded decision or workflow change -> observed outcome -> reusable lesson
```

The author classes are deliberately separated:

| Surface | Primary paths | Contract |
|---|---|---|
| Capture and machine evidence | `12_Brain/01_Captures/`, `12_Brain/05_Projects/Experiments/`, `12_Brain/06_Research/`, `12_Brain/07_Reviews/` | Append or emit dated evidence. These records may be incomplete and do not become current truth merely because automation wrote them. |
| Canonical compiled brain | `12_Brain/02_Entities/`, `03_Concepts/`, `04_Decisions/`, `05_Projects/` outside `Experiments/`, `08_Memory/`, `09_Ops/`, and `10_Maps/` | Update the strongest existing owner, preserve source references and freshness, and avoid duplicate canonical pages. |
| Runtime state | `12_Brain/state/` and `12_Brain/queue/` | Store machine checkpoints and run records only. Runtime state never outranks canonical knowledge, exact source evidence, or the current Marketing Chief queue. |

Automations may collect, normalize, score, and propose. Compilation decides what
the evidence means. Consequential agency execution remains in the Marketing
Chief Operator and Canonical Queue at `client-operations`; Dillon OS is the
knowledge, evidence, and telemetry layer, not a competing command center.

## Autonomous multi-model execution

The model fleet is a set of bounded specialists, not a committee with shared
authority. GPT-5.6 Sol coordinates owner-facing work through the Marketing
Chief. Other models may collect evidence, make an artifact, independently check
it, or observe an outcome. They do not promote their own output into current
truth, write the canonical queue, or authorize an external action.

The executable routing contract lives with the canonical Marketing Chief
system, where task lane, data class, current route health, action class, and
approval state can be checked against live operational evidence. The brain
retains the durable architecture and lessons, not provider credentials, quota
telemetry, or a duplicate model queue.

For consequential work, the maker and checker must use different model
families. A route that is installed, listed, or saved but not live-verified is
unavailable. Public or free routes receive only public or non-client-sensitive
internal context. Sensitive client evidence stays on an authorized route or a
verified local model. Interactive media generators such as Seedance remain
human-gated production tools rather than autonomous reasoning agents.

Every material run follows the same compounding boundary:

```text
capture -> verify -> compile -> decide -> execute -> observe -> learn
```

The run may retain one demonstrated reusable correction, precedent, workflow
change, or explicit non-finding. More model output is not more learning.

## Native Obsidian leverage

- **Bases** provide editable database-like views while keeping data in local
  Markdown properties.
- **CLI** gives agents a supported path to query tasks, links, properties,
  Bases, history, and Sync after it is enabled in the desktop app.
- **Sync** moves the vault between devices with encrypted remote storage.
- **Web Clipper** captures pages and highlights locally, with site-specific
  templates and optional natural-language interpretation.
- **Git** remains the diff, checkpoint, and rollback surface for agent work.

## Context economy

Agents pay for every file loaded. They start at `INDEX.md`, read the current
operating status, search for the target, and follow links. Broad synthesis is a
separate review pass, not the default behavior of every task.

## Memory model

Durable facts carry two clocks:

- `valid_from` and `valid_to`: when the fact was true in the world.
- `observed_at`: when the vault learned it.

Corrections link to the note they supersede. Research carries `expires` and a
review date. This keeps historical truth without forcing agents to treat old
truth as current truth.

## Safety model

The vault may prepare and verify work. It never treats stored context or tool
access as permission to send, publish, spend, change accounts, or destroy data.
Secrets never enter notes.
