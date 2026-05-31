---
tags: [agents, moc]
---

# Agent Index

Specialists invoked by [[System/competitive-task-orchestrator|Competitive Task Orchestrator]] (daily 13:00 UTC). Cursor definitions live in `.cursor/agents/`.

## Orchestration

| Agent | Phase | Role |
|-------|-------|------|
| [[Master Agent]] | — | Human-facing coordinator; delegates to specialists |
| [[Memory Consolidator Agent]] | 2 | Merges parallel outputs into daily brief |

## Phase 1 — Parallel

| Agent | Legacy cron replaced |
|-------|----------------------|
| [[Gmail Intel Agent]] | `gmail-to-vault-digest` |
| [[Slack Intel Agent]] | (new — Slack was not in vault routines) |
| [[Vault Pulse Agent]] | `nightly-client-pulse` |
| [[Codex Session Sync Agent]] | `chat-to-vault-sync` |
| [[Content Routines Agent]] | `bok-law-social-content`, `linkedin-growth-engine`, `book-site-seo-sweep` |
| [[Domain Ads SEO Agent]] | — (reporting + competitive gaps) |

## Domain specialists (on-demand)

| Agent | Use when |
|-------|----------|
| [[Google Ads Agent]] | Deep account work, PMax, disapprovals |
| [[Reporting Agent]] | Monthly HTML reports, client snapshots |
| [[SEO Agent]] | Blog pipeline, Align HCM SEO |
| [[Web Agent]] | Landing pages, WordPress, Squarespace |

## Daily output

- [[Daily-Briefs/competitive-task-today|competitive-task-today.md]]
- [[Daily-Briefs/pulse-today|pulse-today.md]] (vault pulse subset)
- [[System/urgent-replies]]
- [[System/slack-pulse]]
- [[System/claude-memory-sync]]
