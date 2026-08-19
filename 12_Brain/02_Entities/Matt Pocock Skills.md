---
note_type: entity
status: active
created: 2026-08-19
updated: 2026-08-19
review_on: 2026-11-19
verification_status: partial
summary: MIT agent-skill pack (grill, spec, tdd, review) that Dillon OS adapted rather than installed as a plugin.
source_refs:
  - "[[12_Brain/01_Captures/X/2026-08-19 - theo-mattpocock-skills]]"
  - "https://github.com/mattpocock/skills"
tags:
  - brain
  - entity
  - skills
  - agents
---

# Matt Pocock Skills

**Summary:** a composable MIT skill pack for grilling plans, writing a shared glossary, building test-first, and reviewing on two axes. Dillon OS owns adapted copies, not a live plugin subscribe.

## What it is

Public repo: https://github.com/mattpocock/skills. Two install philosophies: a Claude Code plugin that updates behind you, or `npx skills add` copies you own. Dillon OS took the second path and then rewired file locations and approval gates.

Upstream user-invoked highlights: `grill-me`, `grill-with-docs`, `to-spec`, `implement`, `handoff`, `ask-matt`. Upstream model-invoked highlights: `grilling`, `tdd`, `diagnosing-bugs`, `code-review`, `domain-modeling`, `writing-for-agents`.

## Status in this vault

Adapted into `.claude/skills/` and Copilot wrappers under `.github/skills/`. Operator map: [[12_Brain/09_Ops/engineering-skills]]. Lesson: [[12_Brain/03_Concepts/Grill Spec Verify Loop]]. Decision: [[12_Brain/04_Decisions/2026-08-19 - Adopt adapted Matt Pocock engineering skills]].

Not installed: wayfinder, triage, wizard, teach, the GitHub-issue ticket machine, and the Claude plugin. Wayfinder wants an issue-tracker map and a practitioner reply on the source tweet said it diverges.

pstack is a different pack from the same Theo thread. Only `unslop` was adapted later, as a named copy pass, not always-on. See [[12_Brain/04_Decisions/2026-08-19 - Adopt adapted pstack unslop]].

## How agents must use it

- Name `grill-with-docs` before a material build in this repo.
- Do not treat a grilled plan as send, publish, deploy, spend, or merge authority.
- Do not create GitHub issues from these skills. Specs land in `12_Brain/05_Projects/`.
- Do not subscribe to the upstream plugin beside the adapted copies. That would duplicate every skill.

## Open questions

- Whether a later upstream release of Matt's pack should be diffed in as a bounded update. Review on 2026-11-19.
