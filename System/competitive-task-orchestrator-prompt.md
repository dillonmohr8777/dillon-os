---
automation_id: bc523644-815a-43a9-b434-fd2967c1be2c
name: competitive-task-orchestrator
schedule: "0 13 * * *"
timezone: America/New_York
replaces:
  - nightly-client-pulse
  - gmail-to-vault-digest
  - vault-integrity-sync
  - chat-to-vault-sync
  - bok-law-social-content
  - linkedin-growth-engine
  - book-site-seo-sweep
last_updated: 2026-06-09
tags: [system, orchestrator, automation]
---

# Competitive Task Orchestrator

One umbrella automation. Seven legacy crons retired. Parallel agents gather intel; one consolidator writes the daily brief.

## What this does

Every day at **1:00 PM ET**, this automation:

1. **Phase 1 — Parallel** (launch all 6 subagents simultaneously via Task tool):
   - `gmail-intel` — unread/urgent email across M360 + Align HCM
   - `slack-intel` — DMs, @mentions, client escalations
   - `vault-pulse` — stale clients, overdue deliverables, campaign queues
   - `codex-session-sync` — open loops from Codex/Cursor sessions
   - `content-routines` — BOK Law social, LinkedIn calendar, book SEO (schedule-aware)
   - `domain-ads-seo` — ad disapprovals, optimization queues, SEO pipeline

2. **Phase 2 — Sequential** (after all parallel agents return):
   - `memory-consolidator` — merges outputs into one daily brief + memory sync

3. **Phase 3 — Commit** (if vault is a git repo):
   - Commit updated briefs and system files
   - Push to main branch

## Operator prompt (paste into automation)

```
You are the Competitive Task Orchestrator for Dillon OS.

Read System/competitive-task-orchestrator-prompt.md for the full workflow.

PHASE 1 — Launch these 6 subagents IN PARALLEL using the Task tool:
1. gmail-intel (.cursor/agents/gmail-intel.md)
2. slack-intel (.cursor/agents/slack-intel.md)
3. vault-pulse (.cursor/agents/vault-pulse.md)
4. codex-session-sync (.cursor/agents/codex-session-sync.md)
5. content-routines (.cursor/agents/content-routines.md)
6. domain-ads-seo (.cursor/agents/domain-ads-seo.md)

PHASE 2 — After all 6 return, launch memory-consolidator sequentially.
It writes Daily-Briefs/competitive-task-today.md and updates System/claude-memory-sync.md.

PHASE 3 — Commit and push vault changes.

Priority tie-break: launch blocked > billing risk > ad disapprovals > calendar.
KJB emails MUST CC: mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com.
Align HCM is full-time W2 — not M360 client revenue.

Mark each section LIVE (Gmail/Slack MCP available) or VAULT-FALLBACK (vault files only).
```

## Daily read target

Open `Daily-Briefs/competitive-task-today.md` each morning. This is your single source of truth for what to do today.

## Agent definitions

All subagents live in `.cursor/agents/`:

| Agent | Replaces | Schedule logic |
|-------|----------|----------------|
| gmail-intel | gmail-to-vault-digest | Every run |
| slack-intel | (new) | Every run |
| vault-pulse | nightly-client-pulse | Every run |
| codex-session-sync | chat-to-vault-sync | Every run |
| content-routines | bok-law + linkedin + book SEO | Conditional (see agent) |
| domain-ads-seo | (new) | Every run |
| memory-consolidator | vault-integrity-sync | Sequential after parallel |

## MCP dependencies

| Source | MCP / Tool | Fallback |
|--------|-----------|----------|
| Gmail | Gmail MCP or `gog gmail` | System/urgent-replies.md + client overview Gmail intel |
| Slack | Slack MCP | Vault session notes |
| Vault | Local filesystem | N/A (always available) |
| Codex sessions | 10_Sessions/ folder | N/A |

## Legacy cron retirement

Disable these separate automations once competitive-task-orchestrator is confirmed stable:

- [ ] nightly-client-pulse
- [ ] gmail-to-vault-digest
- [ ] vault-integrity-sync
- [ ] chat-to-vault-sync
- [ ] bok-law-social-content
- [ ] linkedin-growth-engine
- [ ] book-site-seo-sweep
