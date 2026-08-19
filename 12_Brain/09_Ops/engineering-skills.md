---
note_type: protocol
status: active
created: 2026-08-19
updated: 2026-08-19
owner: Dillon Mohr
source_refs:
  - "[[12_Brain/04_Decisions/2026-08-19 - Adopt adapted Matt Pocock engineering skills]]"
  - "[[12_Brain/01_Captures/X/2026-08-19 - theo-mattpocock-skills]]"
tags:
  - brain
  - protocol
  - skills
---

# Engineering skills

Operator map for the Dillon-adapted Matt Pocock loop. Router skill: `ask-dillon-skills`. Lesson: [[12_Brain/03_Concepts/Grill Spec Verify Loop]].

These skills live in `.claude/skills/`. They set `command_deck: false` so the HUD does not launch them headlessly. Copilot wrappers live in `.github/skills/`.

## Default flow

`grill-with-docs` → `to-spec` → `implement` (drives `tdd`) → `code-review` by a different identity → approval queue for anything outbound.

Website factory work still uses `mirror-and-improve`, `ui-design`, `frontend-build`, and `site-grade`. Grill the brief first when the rebuild is material.

## File locations

| Artifact | Path |
|---|---|
| Product glossary | `CONTEXT.md` in that product tree |
| Vault glossary | `12_Brain/09_Ops/engineering-glossary.md` |
| Spec / project | `12_Brain/05_Projects/YYYY-MM-DD - <title>.md` |
| Hard decision | `12_Brain/04_Decisions/YYYY-MM-DD - <title>.md` |
| Session handoff | `12_Brain/01_Captures/sessions/YYYY-MM-DD - handoff - <topic>.md` |
| Durable session lessons | `session-mine`, not handoff |

## Installed

grilling, grill-me, grill-with-docs, domain-modeling, handoff, tdd, diagnosing-bugs, code-review, to-spec, implement, writing-for-agents, ask-dillon-skills.

GitHub: `dillon-plan-grill` (now actually grills), `dillon-code-review`, plus the existing maker and checker wrappers.

## Not installed

wayfinder, triage, wizard, teach, wait-what, to-questionnaire, to-tickets-on-GitHub, setup-matt-pocock-skills, the upstream Claude plugin. `research-sweep` already covers sourced research.

## Hard rules

- Facts from the vault and codebase. Decisions from Dillon.
- A grilled plan is not permission to send, publish, deploy, spend, merge, or change an account.
- Do not create GitHub issues from these skills.
- Do not install the upstream plugin beside these copies.
- Update the existing skill instead of adding a second grill.
