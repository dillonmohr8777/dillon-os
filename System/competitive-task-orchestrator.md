---
tags: [system, orchestrator, automation]
last_updated: 2026-06-05
---

# Competitive Task Orchestrator

One umbrella automation. Six parallel agents. One consolidator. One daily brief.

## Architecture

```
                    ┌─────────────────────────────────────┐
                    │  competitive-task-orchestrator      │
                    │  cron: 0 13 * * * (8 AM ET)         │
                    └──────────────┬──────────────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
    ┌─────▼─────┐  ┌──────▼──────┐  ┌─────▼─────┐  ┌──────▼──────┐
    │gmail-intel│  │ slack-intel │  │vault-pulse│  │codex-session│
    │           │  │             │  │           │  │    sync     │
    └─────┬─────┘  └──────┬──────┘  └─────┬─────┘  └──────┬──────┘
          │               │               │               │
    ┌─────▼─────┐  ┌──────▼──────┐        │               │
    │  content  │  │ domain-ads  │        │               │
    │ routines  │  │    seo      │        │               │
    └─────┬─────┘  └──────┬──────┘        │               │
          │               │               │               │
          └───────────────┴───────────────┴───────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   memory-consolidator       │
                    │   (sequential, after all)   │
                    └──────────────┬──────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
    competitive-task-today    claude-memory-sync    routine-health
```

## What it replaces

| Before (7 crons) | After (1 cron) |
|------------------|----------------|
| nightly-client-pulse | vault-pulse agent |
| gmail-to-vault-digest | gmail-intel agent |
| vault-integrity-sync | memory-consolidator agent |
| chat-to-vault-sync | codex-session-sync agent |
| bok-law-social-content | content-routines agent (Sunday) |
| linkedin-growth-engine | content-routines agent (Sunday) |
| book-site-seo-sweep | domain-ads-seo agent (Thursday) |

## Daily read

→ [[Daily-Briefs/competitive-task-today|Competitive Task Brief — Today]]

## Agent definitions

All agents live in `.cursor/agents/`:
- gmail-intel.md
- slack-intel.md
- vault-pulse.md
- codex-session-sync.md
- content-routines.md
- domain-ads-seo.md
- memory-consolidator.md

## Master prompt

The Cursor automation uses: `System/competitive-task-orchestrator-prompt.md`

## Operator rules

• KJB emails MUST CC Mac, Sean, Melissa
• Align HCM is full-time, not M360 revenue
• P0 tie-break: launch blocked > billing risk > ad disapprovals > calendar
