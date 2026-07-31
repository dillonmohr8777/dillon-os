---
tags: [reviews, index]
updated: 2026-07-31
---

# 07_Reviews — acceptance and verification reports

**Summary:** dated acceptance reports for things asking to be trusted — MCP
servers, automation runs — keyed `note_type: review` with a
`verification_status`.

`_os/automation/lib/evaluator.js` writes maker/checker run reviews into
`07_Reviews/Automation Runs/`. Reviews carry `expires:` because an acceptance
decision ages with the thing it accepted.

## MCP

- [[12_Brain/07_Reviews/MCP/2026-07-30 - context7|2026-07-30 — context7]] — verified; sandbox-only until the Inspector check clears. Machine-readable sidecar: `2026-07-30 - context7.json`.

## Links
- Gate: `node _os/automation/bin/mcp-gate.js` · schema `12_Brain/schemas/mcp-candidate.json`
- Tiers: [[12_Brain/protocols/approval-tiers|Approval & safety protocol]]
