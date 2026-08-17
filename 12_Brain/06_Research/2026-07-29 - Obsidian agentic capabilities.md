---
note_type: research
status: verified
created: 2026-07-29
updated: 2026-07-29
owner: Dillon Mohr
question: Which current Obsidian capabilities materially improve an agentic second brain?
verification_status: verified
confidence: 0.96
expires: 2026-10-29
review_on: 2026-09-29
source_refs:
  - https://obsidian.md/help/bases
  - https://obsidian.md/help/cli
  - https://obsidian.md/help/web-clipper
  - https://obsidian.md/help/sync/security
tags:
  - brain
  - research
  - obsidian
  - agents
---

# Obsidian agentic capabilities

## Verified findings

| Capability | Operating value | Evidence |
|---|---|---|
| Bases | Database-like table, list, card, and map views backed by local Markdown properties | Official Bases documentation |
| CLI | Supported commands for Bases, tasks, files, links, properties, history, plugins, workspaces, and Sync | Official CLI documentation; requires installer 1.12.7 or newer |
| Web Clipper | Local capture, highlighting, Reader mode, site templates, variables, logic, and optional interpretation | Official Web Clipper documentation |
| Sync | Encrypted remote vault, version history, and device continuity | Official Sync security documentation |
| Git | Reviewable diffs, checkpoints, and rollback for agent changes | Existing Dillon OS repository workflow |

## Operating conclusion

The strongest design is native-first: Markdown properties and Bases for data,
CLI for automation and verification, Web Clipper for intake, Sync for devices,
and Git for agent review. MCP or in-app AI plugins can be added later, but they
should not become the only path to the vault.

## Contradictions and limits

- Obsidian CLI requires the desktop app to be running; official headless Sync
  is a separate deployment path.
- Sync and Git can conflict if multiple writers edit the same files
  concurrently, so agent leases and bounded diffs remain necessary.
- Community agent plugins can execute powerful tools and need a separate
  security review before installation.
