---
tags: [entity, tool]
source: "[[12_Brain/raw/research/2026-08-17 CLI-Anything Skill Receipts]]"
updated: 2026-08-17
expires: 2026-11-17
---

# CLI-Anything

**Summary:** HKUDS catalog of agent-native CLIs — use it when an app has no
CLI, not as a way to skip the MCP gate or mint missing tokens.

Apache-2.0 repo at https://github.com/HKUDS/CLI-Anything (LightRAG / RAG-Anything
lab). Live hub: https://clianything.cc. Catalog:
https://reeceyang.sgp1.cdn.digitaloceanspaces.com/SKILL.md. Chase AI's
2026-08 TikTok (`@chase_ai_/video/7673634732797644046`) is how it entered
this vault.

`cli-hub` is a pip wrapper. `cli-hub install gimp` installs
`cli-anything-gimp`. GUI harnesses (GIMP, Blender, Audacity, Inkscape) need
those apps installed. API harnesses (Exa, Mailchimp, n8n, Zoom) need the same
secrets an MCP would.

## How Dillon OS uses it

Skill: `.claude/skills/cli-anything/SKILL.md`. Lookup (no install):

```bash
node _os/automation/bin/cli-first.js --query "<tool or error>"
```

Official CLIs already on PATH (`gh`, `node _os/…`) win. New MCPs still go
through [[12_Brain/07_Reviews/MCP/2026-07-31 - landingfolio|the MCP gate]].
Installs and account connects stay Tier 2.

## Status

Instituted as a skill + snapshot, not as a pip dependency and not as a
Claude Code marketplace plugin. Catalog rows expire 2026-11-17.

## Links

- [[12_Brain/concepts/CLI-First Integration|CLI-First Integration]]
- [[12_Brain/entities/LandingFolio MCP|LandingFolio MCP]]
- [[12_Brain/concepts/Access Verification Discipline|Access Verification Discipline]]
- Decision: [[12_Brain/decisions/2026-08-17 - Institute CLI-Anything as CLI-first fallback|2026-08-17 — CLI-first fallback]]
