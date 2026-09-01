---
name: handoff
description: Compact the current conversation into a handoff document so another agent can continue the work.
argument-hint: "What will the next session be used for?"
disable-model-invocation: true
command_deck: false
---

# Handoff

Write a handoff so a fresh agent can continue. This is a continuation packet, not a memory mine.

Save to `12_Brain/01_Captures/sessions/YYYY-MM-DD - handoff - <short-topic>.md`. Do not write to the OS temp directory: this vault is the continuity layer.

If Dillon passed arguments, treat them as what the next session will focus on.

## Include

- Exact outcome still open
- Repo or folder boundary
- Client route if any
- Skills the next agent should call (`suggested skills`)
- Pointers to specs, plans, decisions, diffs, and tests already written
- Known blockers and the next safe action
- Approval state: what is still gated

## Do not include

- Secrets, tokens, cookies, payment data, or personal addresses
- Content already captured in other artifacts. Reference those paths instead.
- A claim that the work is complete unless checks already passed

`session-mine` is different: it extracts durable lessons into memory. Use `handoff` to continue work; use `session-mine` to keep what was learned.

Do not send, publish, deploy, or merge as part of writing the handoff.

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT). Storage path is Dillon OS specific.
