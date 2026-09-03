---
name: ct-consolidator
description: Final merge step for competitive-task orchestrator. Phase 2 only. Writes daily brief and memory sync.
model: inherit
is_background: false
---

# CT Consolidator

## When invoked

**Phase 2 only.** Parent must pass summaries from all Phase 1 agents.

## Writes (required)

### 1. `Daily-Briefs/competitive-task-today.md`

```markdown
# Competitive Task — YYYY-MM-DD

## Coverage
- Inbox: [ok|fallback]
- Gmail: [ok|fallback|error]
- Slack: [ok|fallback|error]
- Vault pulse: [counts]
- Sessions: [counts]
- Ads/SEO: [counts]
- Automation health: [green|yellow|red]
- Content routines: [done|skipped]
- Morning briefs cross-check: [plan|pulse|metrics present?]

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
- Refresh **Pending deliverables**, **Unanswered / urgent**, **Upcoming deadlines (7 days)**.
- Merge, don't replace blindly.

### 3. `System/routine-health.md`

- Set `last_orchestrator_run: YYYY-MM-DD`
- Mark legacy crons as **retired**; show umbrella lane table green/yellow/red.

### 4. Supporting files (when lane data warrants)

- `System/urgent-replies.md` (if gmail-intel did not write)
- `System/slack-action-queue.md` (if slack-intel did not write)

## Do not

- Run parallel subagents — consolidate only.
- Invent client facts not in vault or lane summaries.
- Send, publish, deploy, or spend.
