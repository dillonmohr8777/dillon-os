---
tags: [index, moc, brain]
canonical: 12_Brain
updated: 2026-07-29
---

# INDEX — the front door

Every wiki page and folder index, one line each. **Agents start here**, then
walk links or grep — never sweep folders. New/removed page ⇒ update this file
in the same change.

> Canonical second-brain layer: **`12_Brain/`**. Do not create a competing
> `1Z_Brain/` tree.
>
> **This GitHub repository is PUBLIC.** Sensitive notes live under
> [[12_Brain/private/README|12_Brain/private/]] (gitignored).

> [!tip] Visual views: [[12_Brain/Brain Map.canvas|Brain Map]] ·
> [[12_Brain/bases/Clients.base|Clients table]] · [[Dashboard|Dashboard]]

This layer runs two lanes — a compiled wiki and dated automation lanes. Which one
a new page belongs in is settled in
[[12_Brain/decisions/2026-07-31 - Two-lane brain layout|Two-lane brain layout]].
`node _os/automation/bin/wiki-lint.js` checks that every page below is reachable,
sourced, and link-clean.

## Entities

- [[12_Brain/entities/README|entities/ index]] — what counts as an entity, and the page format.
- [[12_Brain/entities/Momentum 360|Momentum 360]] — agency context for a subset of clients (stub; contacts private).
- [[12_Brain/entities/Website Factory|Website Factory]] — web/landing-page production pipeline.
- [[12_Brain/entities/Hermes|Hermes]] — retired local worker agent; rebuild-or-replace decision open.
- [[12_Brain/entities/King Agent OS|King Agent OS]] — old daily command layer; patterns worth porting.
- [[12_Brain/entities/Codex Workspace (Legacy)|Codex Workspace (Legacy)]] — previous command center (no local paths in Git).
- [[12_Brain/entities/Claude in Chrome|Claude in Chrome]] — browser-driving extension for local apply sessions.
- [[12_Brain/entities/Ops Box (EliteDesk 800 G4)|Ops Box (EliteDesk 800 G4)]] — always-on Ops machine (no credentials in Git).

Client pages live in `01_Clients/` — see [[01_Clients/Client Index|Client Index]].

## Concepts

- [[12_Brain/concepts/README|concepts/ index]] — what belongs on a concept page.
- [[12_Brain/concepts/Second Brain Architecture|Second Brain Architecture]] — vault-as-codebase: raw → compiled pages → linked graph.
- [[12_Brain/concepts/Context Economy|Context Economy]] — read by trail not sweep; tier model use.
- [[12_Brain/concepts/Research Verification Loop|Research Verification Loop]] — fan-out research with a skeptic gate.
- [[12_Brain/concepts/Truth Hierarchy|Truth Hierarchy]] — live surfaces beat memory beat artifacts.
- [[12_Brain/concepts/Draft-First Operating Rules|Draft-First Operating Rules]] — draft unless explicitly told to send.
- [[12_Brain/concepts/Access Verification Discipline|Access Verification Discipline]] — confirmed access needs direct proof (no inventories here).
- [[12_Brain/concepts/Evidence Boundaries in Reporting|Evidence Boundaries in Reporting]] — claim only what sources prove.
- [[12_Brain/concepts/Netlify Deploy Safety|Netlify Deploy Safety]] — pin site on every deploy; verify statically.
- [[12_Brain/concepts/Google Docs Sharding Pattern|Google Docs Sharding Pattern]] — sub-MB shards → Docs → index.
- [[12_Brain/concepts/Leading Indicators|Leading Indicators]] — churn/growth signals for `/synthesize`.
- [[12_Brain/concepts/Conversion Tracking Setup 2026|Conversion Tracking Setup 2026]] — generic setup patterns (no account IDs).
- [[12_Brain/concepts/Google Ads Conversion Optimization 2026|Google Ads Conversion Optimization 2026]] — generic optimization patterns.
- [[12_Brain/concepts/Meta Lead Ads Optimization 2026|Meta Lead Ads Optimization 2026]] — generic Lead Ads patterns.

## Raw captures (Git-safe)

- [[12_Brain/raw/2026-07-04 - obsidian-second-brain-article|2026-07-04 obsidian-second-brain-article]] — blueprint this brain layer was built from.
- `12_Brain/raw/sessions/session-log.md` — public cadence stub only.
- Sensitive captures → [[12_Brain/private/README|12_Brain/private/]] (not in Git).

## Projects · Decisions · Research · Memory · Protocols

- [[12_Brain/projects/README|Projects]] — active delivery threads, plus `Experiments/` proposals.
- [[12_Brain/decisions/README|Decisions]] — the whole bi-temporal decision log.
- [[12_Brain/research/README|Research]] — dated findings and durable `References/` (every page carries `expires:`).
- [[12_Brain/memory/README|Memory]] — `current/` + `as-of/` bi-temporal memory.
- [[12_Brain/protocols/README|Protocols]] — agent protocols, incl. [[12_Brain/protocols/approval-tiers|approval tiers]].
- Bases: [[12_Brain/bases/Clients.base|Clients]] · [[12_Brain/bases/Projects.base|Projects]] · [[12_Brain/bases/Decisions.base|Decisions]] · [[12_Brain/bases/Prospects.base|Prospects]] · [[12_Brain/bases/Automations.base|Automations]] · [[12_Brain/bases/Experiment Queue.base|Experiment Queue]]

## Numbered lanes (kinds the wiki above does not own)

One line per lane — dated records accrue daily, so each lane keeps its own index.
Decisions, projects and research have **no** lane; they live in the wiki folders
above. Rule: [[12_Brain/decisions/2026-07-31 - One home per record type|One home per record type]].

- [[12_Brain/01_Captures/README|01_Captures]] — immutable Grok and Slack captures; read-only like `raw/`.
- [[12_Brain/07_Reviews/README|07_Reviews]] — MCP and automation-run acceptance reports.
- [[12_Brain/09_Ops/README|09_Ops]] — live operational blockers.
- [[12_Brain/10_Maps/README|10_Maps]] — cross-cutting maps of content.

## Automation plumbing

- [[12_Brain/README|12_Brain README]] — knowledge + automation layout, safety boundary, runnable commands.
- [[12_Brain/queue/README|queue/]] — append-only JSONL work items awaiting a human.
- [[12_Brain/state/README|state/]] — last-run JSON per automation id.
- `registry/automations.json` · `registry/properties.json` · `registry/wiki-lint.json` — automation, property, and lint policy.
- `schemas/` — JSON Schema contracts for prospects, runs, workflows, MCP candidates, and client frontmatter.
- [[12_Brain/DEPENDENCY_PR226|DEPENDENCY_PR226]] — historical ownership boundary between the site-factory and automation trees.

## Folder indexes (working vault)

- [[01_Clients/Client Index|Client Index]] — full roster.
- [[04_SOPs/SOP Index|SOP Index]] — daily-lane SOPs.
- [[10_Sessions/Session Index|Session Index]] — build logs.
- `11_Agents/` — agent definitions (Master, Google Ads, SEO, Reporting, Web).
- `System/` — [[System/OS Config|OS Config]]; brain ops in [[12_Brain/System/Second Brain Ops|Second Brain Ops]].
