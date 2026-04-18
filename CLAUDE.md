# Dillon OS — Claude Memory

Obsidian vault + ops system for Momentum 360 clients and personal work. See `System/claude-memory-sync.md` for the canonical client/deliverable state.

## Token optimization (Claude Code)

Reference: [[System/claude-code-token-optimization]] — 10 community tools that cut Claude Code tokens 60–90%. Quick picks:

- Heavy terminal output → **RTK** (github.com/rtk-ai/rtk)
- Big codebase → **code-review-graph** + **Token Savior**
- Lots of MCP servers → **Context Mode**
- Quick fix → **Caveman Claude** + **claude-token-efficient**

Don't stack all 10 — pick 2–3 for the workflow.

## Vault conventions
- Clients live under `01_Clients/` (one folder per client).
- SOPs under `04_SOPs/`.
- Agents under `11_Agents/`.
- Nightly sync at 2:00 AM (`vault-integrity-sync`); chat-to-vault every 2 hours.
- Full-time employer is **Align HCM** — not a client, never counted in client totals.
