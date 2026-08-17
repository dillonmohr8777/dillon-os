---
tags: [decision]
decided: 2026-07-29
status: active
supersedes:
source: "[[12_Brain/README]]"
updated: 2026-07-29
---

# 12_Brain is the canonical brain layer

**Decision:** Port and reconcile the second-brain layer into `12_Brain/` inside
this `dillon-os` GitHub vault. Do not create a competing `1Z_Brain/` tree.

**Why:** Vault numbering continues from `11_Agents` → `12_Brain`. One canonical
structure keeps Obsidian Bases, templates, projects, decisions, research,
bi-temporal memory, agent protocols, Cursor rules, Claude skills, health
automation, and the D.I.L.L.O.N. HUD pointed at the same tree.

**Implications:**

- Agents start at `12_Brain/INDEX.md`.
- Skills (`vault-compile`, `wiki-lint`, `synthesize`, `session-mine`,
  `research-sweep`) read/write under `12_Brain/`.
- Git remains source of truth; live Obsidian Sync verification is an operator gate.
