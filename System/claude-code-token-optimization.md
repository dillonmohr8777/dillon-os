---
tags: [system, claude-code, tokens, optimization, tools]
created: 2026-04-18
source: community list of token-savers for Claude Code
---

# Claude Code Token Optimization — 10 GitHub Repos

Reference list of tools that cut token usage in Claude Code by 60–90%. Pick 2–3 based on workflow; don't stack all 10.

## The 10 repos

### 1. RTK (Rust Token Killer)
- **What**: CLI proxy that filters terminal output before it hits context.
- **Wins**: 60–90% reduction on common dev commands; one binary, zero deps.
- **Works with**: Claude Code, Cursor, Copilot.
- **Repo**: https://github.com/rtk-ai/rtk

### 2. Context Mode
- **What**: Sandboxes raw tool output into SQLite instead of dumping into context.
- **Wins**: 98% context reduction on Playwright, GitHub, logs; only clean summaries enter the conversation.
- **Works as**: Claude Code plugin.
- **Repo**: https://github.com/mksglu/context (truncated in source)

### 3. code-review-graph
- **What**: Local knowledge graph that maps your codebase with Tree-sitter.
- **Wins**: 49x token reduction on large monorepos; 6.8x on average reviews. Claude reads only what matters.
- **Repo**: https://github.com/tirth8205/code (truncated in source)

### 4. Token Savior
- **What**: MCP server that navigates code by symbols, not full files.
- **Wins**: 97% reduction on code navigation; persistent memory across sessions; 69 tools, zero external deps.
- **Repo**: https://github.com/Mibayy/token-s (truncated in source)

### 5. Caveman Claude
- **What**: Makes Claude talk like a caveman to cut output tokens.
- **Wins**: 65–75% output reduction; one-line install; keeps full technical accuracy.
- **Repo**: https://github.com/JuliusBrussee (truncated in source)

### 6. claude-token-efficient
- **What**: One CLAUDE.md file that keeps responses terse.
- **Wins**: Drop-in, no code changes; reduces output verbosity on heavy workflows.
- **Best for**: output-heavy sessions.
- **Repo**: https://github.com/drona23/claude (truncated in source)

### 7. token-optimizer-mcp
- **What**: MCP server with caching, compression, and smart tool intelligence.
- **Wins**: 95%+ token reduction through intelligent caching; compresses repeated tool outputs.
- **Repo**: https://github.com/ooples/token-o (truncated in source)

### 8. claude-token-optimizer
- **What**: Reusable setup prompts for optimizing any project.
- **Wins**: 90% token savings in 5 minutes; reduces doc token usage from 11K to 1.3K.
- **Repo**: https://github.com/nadimtuhin/cla (truncated in source)

### 9. token-optimizer
- **What**: Finds ghost tokens that silently eat your context.
- **Wins**: Survives compaction without losing quality; fixes context quality decay.
- **Repo**: https://github.com/alexgreensh/to (truncated in source)

### 10. claude-context (by Zilliz)
- **What**: Code search MCP that makes your entire codebase the context.
- **Wins**: ~40% reduction with equivalent retrieval quality; hybrid BM25 + dense vector search.
- **Repo**: https://github.com/zilliztech/cla (truncated in source)

## How to stack them

Pick 2–3 based on the workflow — don't install all 10.

| Workflow | Stack |
|---|---|
| Heavy terminal output | **RTK** |
| Big codebase | **code-review-graph** + **Token Savior** |
| Lots of MCP servers | **Context Mode** |
| Quick fix | **Caveman** + **claude-token-efficient** |

## Notes
- Repo URLs in several items were truncated in the source post; verify full slugs before cloning.
- Before installing any MCP server or plugin, confirm license + last-commit recency.
- Test token savings on one project before rolling vault-wide.
