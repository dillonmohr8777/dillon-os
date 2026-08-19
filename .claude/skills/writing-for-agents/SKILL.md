---
name: writing-for-agents
description: Writing documents for agents. Use when creating or editing skills, or modifying AGENTS.md or CLAUDE.md.
command_deck: false
---

# Writing for agents

Reference for any document an agent consumes: a skill, `AGENTS.md` / `CLAUDE.md`, or a doc reached by a pointer. The goal is the agent taking the same **process** every run, not producing the same output.

When the document is a skill, also read [SKILL-MECHANICS.md](SKILL-MECHANICS.md).

## Context pointers

A **context pointer** names out-of-context material and the condition for reaching it. A skill description is one. A line in `AGENTS.md` naming a doc is the same object. The pointer's wording decides when the agent reaches the material.

- Front-load the leading word.
- One trigger per branch. Collapse synonyms.
- Cut identity the body already carries.

`CLAUDE.md` stays under 200 lines and points at the vault. That is the always-paid tax. See `12_Brain/03_Concepts/Context Economy.md`.

## The two loads

- **Context load** — always-loaded material: `AGENTS.md` lines, skill descriptions.
- **Cognitive load** — the human remembering which documents exist. Spend it where judgement matters.

## Information hierarchy

1. In-file step (what the agent does, in order)
2. In-file reference (consulted on demand)
3. Disclosed reference (sibling file, loaded when the pointer fires)

Push too little down and the top bloats. Push too much and you hide what the agent needs. Inline what every branch needs. Disclose what only some branches reach.

## Steps and completion criteria

Every step ends on a completion criterion the agent can check. Sharpen the bound first. Demand exhaustiveness where it matters ("every modified model accounted for"), not vague "understanding reached".

## Leading words

A compact concept the model already knows (_lesson_, _frontier_, _tracer bullet_, _tight_ loop, _red_ test). Repeat the token. Do not restate the paragraph.

Steer with the target behaviour, not a prohibition. A ban drags the forbidden thing into context.

## Pruning

- One source of truth per meaning.
- Do not cache what the environment already states (`package.json` scripts, directory layout).
- Delete no-ops: instructions the model already obeys by default.
- Update the existing skill instead of creating a duplicate.

Dillon OS: never put secrets in a skill. Never let a skill description authorize send, publish, deploy, spend, or merge.

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT).
