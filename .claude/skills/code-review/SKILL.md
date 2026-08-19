---
name: code-review
description: Review changes since a fixed point along two axes. Standards (does the code follow this repo's documented standards?) and Spec (does the code match the originating issue or spec?). Use when reviewing a branch, a PR, work-in-progress, or "review since X".
command_deck: false
---

# Code review

Two-axis review of the diff between `HEAD` and a fixed point Dillon supplies:

- **Standards** — does the code conform to this repo's documented coding standards?
- **Spec** — does the code faithfully implement the originating spec or project note?

Both axes run as **parallel sub-agents** so they do not pollute each other's context. Aggregate them. Do not merge or rerank findings across axes.

This skill is a checker. It cannot mark a human gate approved, deploy, or send.

## Process

### 1. Pin the fixed point

Whatever Dillon said is the fixed point. If they did not specify one, ask.

Capture `git diff <fixed>...HEAD` (three-dot) and `git log <fixed>..HEAD --oneline`. Confirm the ref resolves and the diff is non-empty before spawning reviewers.

### 2. Identify the spec source

Look in this order:

1. Issue or project references in commit messages
2. A path Dillon passed
3. A matching note under `12_Brain/05_Projects/` or a spec file under `docs/` / `specs/`
4. If nothing is found, ask. If there is no spec, the Spec sub-agent skips and reports "no spec available".

### 3. Identify the standards sources

Read `AGENTS.md`, `CLAUDE.md`, `System/writing-rules.md` when the change is user-facing copy, `.cursor/rules/` that apply, and any `CODING_STANDARDS.md` or product README in the touched tree.

On top of those, carry this **smell baseline** (Fowler, *Refactoring* ch.3). Repo docs override the baseline. Smells are judgement calls, never hard violations. Skip anything tooling already enforces.

- Mysterious Name → rename, or the design is murky
- Duplicated Code → extract the shared shape
- Feature Envy → move the method onto the data it envies
- Data Clumps → bundle travelling fields into one type
- Primitive Obsession → give the domain concept its own type
- Repeated Switches → polymorphism or one shared map
- Shotgun Surgery → gather what changes together
- Divergent Change → split so each module changes for one reason
- Speculative Generality → delete unused abstraction
- Message Chains → hide the walk behind one method
- Middle Man → cut the pure delegate
- Refused Bequest → drop the inheritance, use composition

### 4. Spawn both sub-agents in parallel

Standards brief: report per file/hunk (a) documented-standard breaches with file + rule, (b) baseline smells as judgement calls. Under 400 words.

Spec brief: (a) missing or partial requirements, (b) scope creep, (c) implemented-but-wrong. Quote the spec line. Under 400 words.

### 5. Aggregate

Present `## Standards` and `## Spec` separately. End with a one-line summary: total findings per axis, and the worst issue within each axis.

A change can pass one axis and fail the other. That is the point of keeping them separate.

Maker/checker: if you built the diff, you may draft this review but you cannot be the passing checker. Hand to `qa-critic` or another identity.

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT). Spec lookup uses the vault, not a required GitHub issue tracker.
