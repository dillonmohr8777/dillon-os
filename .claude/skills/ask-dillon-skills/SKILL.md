---
name: ask-dillon-skills
description: Ask which Dillon OS skill or flow fits the situation. A router over vault skills and the engineering pack.
disable-model-invocation: true
command_deck: false
---

# Ask Dillon skills

You do not remember every skill, so ask.

A **flow** is a path through the skills. User-invoked skills have to be named by Dillon or by this router. This file only hints. It does not fire them.

## Main engineering flow: idea → ship

1. **`grill-with-docs`** — default inside this repo. Sharpens the idea and leaves glossary plus decision notes. No working directory? Use **`grill-me`** (stateless).
2. If a question needs a runnable answer, prototype in a throwaway folder, bridged by **`handoff`** both ways.
3. Multi-session build → **`to-spec`** into `12_Brain/05_Projects/`, then **`implement`** driving **`tdd`**, then **`code-review`**. Single-session → **`implement`** in the same window after the grill confirms shared understanding.

Keep grill, spec, and tickets in one window when you can. Each implement starts fresh from the spec.

## Website factory flow

Prospect or client site work still uses the factory, not a generic implement loop:

`mirror-and-improve` → `ui-design` / `ux-audit` / `motion-design` → `frontend-build` → `site-grade`. Batch: `site-batch` / `site-factory`. Grill the brief with `grill-with-docs` before a material rebuild.

## On-ramps

- Something is broken → **`diagnosing-bugs`**. No theory until a tight loop is red on this bug.
- Need to continue in another session or harness → **`handoff`**. Durable lessons → **`session-mine`**.
- Writing or editing a skill / `AGENTS.md` / `CLAUDE.md` → **`writing-for-agents`**.
- Terminology is the problem → **`domain-modeling`**.
- Daily operating work → existing HUD skills: `am-report`, `inbox-brief`, `plan-today`, `client-pulse`, `vault-compile`, `wiki-lint`, `synthesize`, `research-sweep`.

## Not installed (on purpose)

Matt Pocock's **wayfinder**, **triage**, **wizard**, and GitHub-issue ticket machine are not in this repo. Wayfinder wants an issue-tracker map and tends to diverge. Dillon OS plans live in `12_Brain/05_Projects/` and `12_Brain/04_Decisions/`. Foggy multi-session work: grill-with-docs, then to-spec, then implement. `research-sweep` already covers sourced research.

## Approval boundary

None of these flows authorize send, publish, deploy, spend, merge, or an account change.

Read `12_Brain/09_Ops/engineering-skills.md` for file locations and the glossary path.
