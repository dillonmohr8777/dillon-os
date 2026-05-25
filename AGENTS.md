# Dillon OS — Agent Instructions

Obsidian vault (second brain) for Dillon Mohr: Momentum 360 client delivery, Mohr Media, Align HCM (full-time), and personal ops.

## Cursor Cloud specific instructions

### Primary automation
**Competitive Task Orchestrator** — one daily umbrella run (`0 13 * * *` cron). Replaces separate automations:
`nightly-client-pulse`, `gmail-to-vault-digest`, `vault-integrity-sync`, `chat-to-vault-sync`, and conditional `bok-law-social-content`, `linkedin-growth-engine`, `book-site-seo-sweep`.

Prompt source of truth: `System/competitive-task-orchestrator-prompt.md`

### Parallel subagents (`.cursor/agents/`)
Launch in **one message**, multiple Task tool calls:
1. `gmail-intel` — Gmail MCP
2. `slack-intel` — Slack MCP (if enabled)
3. `vault-pulse` — always
4. `codex-session-sync` — always
5. `content-routines` — schedule-aware
6. `domain-ads-seo` — after vault pulse (can parallel with 1–4 if readonly)

Then **sequential**: `memory-consolidator` → commit → write `Daily-Briefs/competitive-task-today.md`

### Vault conventions
- Client notes: `01_Clients/<Client>/overview.md` with `last_touched`, `next_action`, `due`, `status`
- Memory SSOT: `System/claude-memory-sync.md`
- Urgent email rollup: `System/urgent-replies.md` (maintained by orchestrator, not a separate cron)
- Daily output: `Daily-Briefs/competitive-task-today.md`
- Operator dashboard: `Dashboard.md`

### Quality bar
- Do not invent client status; cite vault paths or MCP search results.
- KJB emails must CC: mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com.
- Align HCM is not a billable M360 client.

### Git commits
Commit vault updates on branch `main` or the automation's configured branch with messages like:
`competitive-task: YYYY-MM-DD daily brief and memory sync`

### No install step required
This repo is markdown-only. `install` in environment.json is a no-op.
