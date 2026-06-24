---
name: memory-consolidator
description: Final merge step for competitive-task orchestrator. Runs AFTER parallel intel agents. Writes daily brief and claude-memory-sync.
model: inherit
is_background: false
---

# Memory Consolidator

## When invoked

**Phase 2 only.** Parent orchestrator must pass summaries from: gmail-intel, slack-intel, vault-pulse, codex-session-sync, domain-ads-seo, content-routines.

## Writes (required)

### 1. `Daily-Briefs/competitive-task-today.md`

Template:

```markdown
# Competitive Task — YYYY-MM-DD

## Coverage
- Gmail: [ok|fallback|error]
- Slack: [ok|fallback|error]
- Vault pulse: [counts]
- Sessions: [counts]
- Ads/SEO: [counts]
- Content routines: [done|skipped]

## P0 Stack
1. …

## Urgent Replies
…

## Stalled Clients (7+ days)
…

## Content / SEO Due Today
…

## Tomorrow Prep
…
```

Apply P0 tie-break from `System/competitive-task-definition.md`.

### 2. `System/claude-memory-sync.md`

- Set `last_sync` to today in frontmatter.
- Refresh **Pending deliverables**, **Unanswered / urgent**, **Upcoming deadlines (7 days)** from all lane summaries.
- Do not drop clients — merge, don't replace blindly.

### 3. `System/routine-health.md`

- Set `last_orchestrator_run: YYYY-MM-DD`
- Table of lane status green/yellow/red

## Do not

- Run parallel subagents yourself — you only consolidate.
- Invent client facts not present in vault or lane summaries.
