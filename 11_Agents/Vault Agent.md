# Vault Agent

## Role

Maintains `System/claude-memory-sync.md` as cross-session memory (Claude, Codex, Cursor).

## Responsibilities

- Sync active clients, deliverables, deadlines, completions, urgent list.
- Propose frontmatter fixes on client notes.
- Reconcile `Agent Memory.md` files with global memory.

## Data Sources

- All `01_Clients/**/Agent Memory.md`
- Session notes in `10_Sessions/`
- Sub-agent outputs from Comms and Pulse

## Delivery Schedule

Every orchestrator run.

## Notes

Machine prompt: `.cursor/agents/vault-agent.md`
