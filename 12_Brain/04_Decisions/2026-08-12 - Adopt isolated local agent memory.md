---
note_type: decision
status: active
created: 2026-08-12
updated: 2026-08-12
owner: Dillon Mohr
source_refs:
  - https://github.com/TencentCloud/TencentDB-Agent-Memory/tree/v1.0.1
  - "[[11_Agents/Rockbot Operating System/research-intake/2026-08-12-tiktok-tencentdb-agent-memory]]"
  - "[[System/agent-memory/README]]"
review_on: 2026-09-12
tags: [brain, decision, agents, memory, local-ai]
---

# Adopt isolated local agent memory

## Decision

Install TencentDB Agent Memory `v1.0.1` as a local retrieval and continuity
layer for Codex, Claude, Cursor, Grok, and Hermes.

The gateway uses local SQLite, Ollama generation, and local embeddings. Memory
spaces are isolated by exact operating, client, employer, inbox, capture,
campaign, or session scope. Codex, Claude, Cursor, and Grok receive the same
query-only MCP tools. Hermes automatic conversation capture defaults off; the
bounded vault sync is the bulk writer.

## Limits

- Memory never becomes the canonical queue or a source of approval.
- A recalled claim must be revalidated when it can drift.
- No cross-client queries or merged client context.
- No raw secrets, credentials, cookies, tokens, MFA values, or recovery data.
- Installed or healthy does not prove improved task outcomes; measure recall
  quality, stale-memory rate, token use, and leakage before expanding capture.

## Reversal

Disable the MCP registrations and Hermes provider, stop the local gateway, and
retain the local data directory for review. The live Obsidian vault and
canonical client-operations state remain independent and unaffected.
