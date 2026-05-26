---
tags: [agents, moc]
---

# Agent Index

All specialists roll up to [[Master Agent]] under the [[System/dillon-os-orchestrator|Dillon OS Orchestrator]].

## Orchestration

| Agent | Legacy routine replaced |
| --- | --- |
| [[Master Agent]] | _(merges all outputs)_ |
| [[Inbox Scout]] | `gmail-to-vault-digest` |
| [[Client Pulse]] | `nightly-client-pulse` |
| [[Memory Curator]] | `vault-integrity-sync`, `chat-to-vault-sync` |
| [[Session Harvester]] | session capture from Codex/Claude |
| [[Content Scheduler]] | `bok-law-social-content`, `linkedin-growth-engine` |
| [[Google Ads Agent]] | campaign queue maintenance |
| [[SEO Agent]] | `book-site-seo-sweep`, AlignHCM SEO |
| [[Reporting Agent]] | on-demand client reports |
| [[Web Agent]] | landing page queue |

## Daily read order

1. [[Daily-Briefs/command-center|Command Center]]
2. [[System/urgent-replies|Urgent Replies]]
3. [[Daily-Briefs/pulse-today|Pulse Today]]

## Automation setup

Paste [[System/ORCHESTRATOR_PROMPT|ORCHESTRATOR_PROMPT]] into your single Cursor cron automation. Disable the seven legacy automations listed in [[System/routine-health|Routine Health]].
