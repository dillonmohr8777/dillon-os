---
tags: [concept, ops-rule]
source: "[[12_Brain/raw/research/2026-08-17 CLI-Anything Skill Receipts]]"
updated: 2026-08-17
expires: 2026-11-17
---

# CLI-First Integration

**Summary:** when an MCP or API is missing, broken, or rate-limited, try an
official CLI (or a catalog harness) before proposing another MCP — a missing
CLI is not a missing credential.

Order:

1. Name the failure (auth, rate limit, missing server, GUI-only app, bloat).
2. Use an official CLI already on PATH (`gh` for GitHub).
3. Look up [[12_Brain/entities/CLI-Anything|CLI-Anything]] /
   `node _os/automation/bin/cli-first.js`.
4. If the match still needs a secret, stop. Token minting is Tier 2.
5. If there is no CLI-shaped gap, keep the existing gate
   (`mcp-gate.js`, LandingFolio verify, JSON exports, Chrome-on-64GB).

This does **not** replace the five MCP checks, does not authorize
`pip install`, and does not treat VE Twini / browser-automation X wrappers
as a substitute for the X MCP.

## Links

- [[12_Brain/entities/CLI-Anything|CLI-Anything]]
- [[12_Brain/concepts/Access Verification Discipline|Access Verification Discipline]]
- [[12_Brain/protocols/approval-tiers|Approval & safety protocol]]
- Skill: `/cli-anything`
