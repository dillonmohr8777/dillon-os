---
note_type: review
status: active
created: 2026-09-01
updated: 2026-09-01
owner: Dillon Mohr
verification_status: partial
source_refs:
  - "https://techsy.io/en/blog/higgsfield-mcp-claude-code"
  - "https://github.com/robonuggets/higgsfield-skill"
  - "[[12_Brain/02_Entities/Higgsfield MCP]]"
tags:
  - brain
  - review
  - mcp
  - security
---

# MCP acceptance - Higgsfield

## Verdict

**Approved with a spend gate**, on Dillon's "do all" instruction of 2026-09-01.
Wired into `.cursor/mcp.json` as a streamable-http server with no stored secret.
The `.mcp.json` block was blocked by the remote session's classifier; add it with
`claude mcp add` on the Windows box, then complete the OAuth grant with `/mcp`.
The Inspector check stays pending until that login enumerates the five tools.

## Rules

- Every `generate_*` call is external spend. Queue it in `System/approval-queue.md`
  unless Dillon has approved the batch in the current session.
- Stage 480p for structure, 1080p only after cuts hold.
- HyperFrames first for code-driven motion; Higgsfield only for footage.
- Generated media is untrusted content. Never put client or prospect facts in a prompt.

## Rollback

Delete the `higgsfield` block from both MCP configs and revoke the OAuth grant.
