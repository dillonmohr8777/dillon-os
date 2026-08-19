---
note_type: protocol
status: active
created: 2026-08-19
updated: 2026-08-19
source_refs:
  - "[[12_Brain/09_Ops/engineering-skills]]"
tags:
  - brain
  - glossary
  - skills
---

# Engineering glossary

Vault-wide engineering language for agent work on Dillon OS itself. Product trees (`_os/`, `immohrtal-site/`, client websites) keep their own `CONTEXT.md`. This page is not a spec and not a restatement of `CLAUDE.md`.

`domain-modeling` updates this file when a vault-wide term is resolved.

## Language

**Grill**:
A round-based interview that walks a design tree until the frontier is empty.
_Avoid_: Quick clarifying questions, rubber-stamp plan review

**Frontier**:
The set of decisions whose prerequisites are already settled, so they can be asked in this round.

**Seam**:
The public interface a test observes. Tests live at seams, never against internals.

**Standards axis**:
Whether a diff follows documented repo standards and a smell baseline.
_Avoid_: Combined "looks good" review

**Spec axis**:
Whether a diff implements the originating project note or spec, and only that.

**Handoff**:
A continuation packet for another agent. Distinct from `session-mine`, which extracts durable lessons.

**Command Deck**:
HUD one-click skills that can run headlessly. Interactive engineering skills stay off it.
