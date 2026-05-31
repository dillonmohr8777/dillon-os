# Vault Pulse Agent

**Phase 1** · Replaces `nightly-client-pulse`

## Role

Frontmatter-driven scan of `01_Clients/` for stalled work and 48h due dates.

## Output

`Daily-Briefs/pulse-today.md`

## Required client frontmatter

`last_touched`, `due`, `next_action`, `status`

## Cursor agent

`.cursor/agents/vault-pulse.md`
