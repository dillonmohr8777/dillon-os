---
tags: [personal, moc]
---

# Personal Index

## Goals
- 

## Reading List
- 

## Reflections
- 

## Health / Fitness
- 

## Skills

### Market / Trading
- Market timing / pattern recognition — insider-flow awareness
  - 4/17/26: $760M in Brent crude oil shorts (7,990 lots) placed ~20 min before Trump announced the Strait of Hormuz was fully open for commercial vessels. Announcement triggered up to an 11% drop in crude prices. (Source: @WatcherGuru, 2.6M views)
  - Takeaway: unusual pre-announcement positioning in commodity futures can front-run geopolitical news. Watch options/futures flow around high-impact political events.

### Claude Code / AI Workflow
- **CPR — Compress, Preserve & Resume** (EliaAlberti/cpr-compress-preserve-resume)
  - URL: https://github.com/EliaAlberti/cpr-compress-preserve-resume
  - Three slash commands in `~/.claude/commands/` that solve Claude Code's session memory loss:
    - `/preserve` — updates CLAUDE.md with key learnings (auto-archives, keeps <280 lines)
    - `/compress` — saves full session to searchable structured log in `CC-Session-Logs/`
    - `/resume` — restores context from CLAUDE.md + recent logs, supports topic search
  - Requires disabling Claude Code's auto-compacting. MIT licensed.
  - Use-case: long-term projects where architectural decisions need to persist across sessions.
- **agentmemory — persistent memory for AI coding agents** (rohitg00/agentmemory)
  - URL: https://github.com/rohitg00/agentmemory
  - Automatic cross-session memory via 12 hooks — zero manual `/preserve` calls.
  - Hybrid search: BM25 + vector embeddings + knowledge graph (claims 95.2% retrieval accuracy).
  - 44 MCP tools; integrates with Claude Code, Cursor, Gemini CLI, OpenClaw, Hermes, 30+ agents.
  - ~92% token savings vs. pasting full context (~$10/yr vs $500+).
  - 4-tier memory consolidation (mimics sleep consolidation); real-time viewer on port 3113 with session replay; cross-agent sharing via REST API + MCP.
  - Beats static CLAUDE.md (200-line cap) by building unlimited versioned memory from actual tool interactions.
- **Compare:** CPR is lightweight, markdown-only, user-driven. agentmemory is heavier infra (hooks + MCP + vector store) but automatic and cross-agent. Start with CPR for simple setups; move to agentmemory when token costs or manual preservation become painful.

