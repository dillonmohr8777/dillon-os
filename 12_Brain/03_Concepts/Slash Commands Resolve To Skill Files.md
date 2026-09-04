---
tags: [concept, agents, skills]
source: "[[12_Brain/05_Projects/2026-08-19 - 138-site unslop]]"
updated: 2026-08-19
note_type: concept
status: active
created: 2026-08-19
source_refs:
  - "[[12_Brain/05_Projects/2026-08-19 - 138-site unslop]]"
---

# Slash commands resolve to skill files

**Summary:** `/unslop` and `/grill-me` only fire when a `SKILL.md` exists. A factory folder is not a skill.

Cursor and Command Deck look up `.claude/skills/<name>/SKILL.md` and `.github/skills/<name>/SKILL.md`. `automation/prospect-unslop/` is the factory; it cannot answer a slash command on its own. `dillon-plan-grill` is the contract format; `grill-me` is the slash alias. Write the contract into the working folder (`GRILL.md` for unslop) before a material build.

Public skill packs such as `mattpocock/skills` stay out of this vault until they are copied in as Dillon OS files.
