# Competitive Task Orchestrator Spec

Date: 2026-08-25  
Status: operational — afternoon umbrella workflow  
Companion: [[11_Agents/64gb Morning Orchestrator Spec 2026-07-08]], [[11_Agents/claude-operating-team.json]]

## Role in the stack

| Layer | Owner | Cadence | Output |
|-------|-------|---------|--------|
| **Afternoon umbrella** (this) | Cursor cloud automation | 1:00 PM ET daily | `Daily-Briefs/competitive-task-today.md` |
| **Morning orchestrator** | Codex local | 7:00 AM ET when enabled | Approval board, Tier-1 batch |
| **Claude daily driver** | Windows Task Scheduler | Every 15 min | Routine receipts, bounded local work |
| **Codex crons** | Codex scheduler | Per `automation.toml` | Lane-specific artifacts |
| **Execution** | Codex/Marketing Chief | On demand | Canonical queue, handoffs |

This spec defines the **single Cursor automation** that replaces seven legacy afternoon crons.
It fans out **seven parallel intel lanes** plus one sequential consolidator.

## Parallel lane map

```text
Phase 1 (parallel)
  gmail-intel          → System/urgent-replies.md
  slack-intel          → System/slack-action-queue.md
  vault-pulse          → stalled/due client scan
  codex-session-sync   → 10_Sessions/ promotions
  domain-ads-seo       → campaign queue P0s
  content-routines     → Sun/Thu gated drafts
  automation-health    → Claude loop + cron health

Phase 2 (sequential)
  memory-consolidator  → Daily-Briefs/competitive-task-today.md
                         System/claude-memory-sync.md
                         System/routine-health.md
```

## Authority boundary

- **May:** read connectors, edit operator surfaces listed above, draft content locally.
- **May not:** send, post, publish, deploy, spend, write canonical client-operations queue,
  merge PRs without need, or act as parallel Marketing Chief.

Full definitions: [[System/competitive-task-definition]]  
Automation prompt: [[System/competitive-task-orchestrator-prompt]]  
SOP: [[04_SOPs/competitive-task-orchestrator]]

## Integration with 54-routine team

The afternoon brief feeds Codex/Marketing Chief intake. When P0 items need execution,
route to the matching routine ID in `11_Agents/claude-operating-team.json` rather than
re-implementing lane logic in chat.

Example routing:

| Brief signal | Routine lane |
|--------------|--------------|
| Unanswered client email | Communications routines (Codex-owned send; Claude draft) |
| Ad disapproval | Performance department |
| Stalled client note | Command D09/D10 board refresh |
| Broken automation | Reliability E04/E11 |
| Day-gated content draft | Growth or maker lane per client |

## Retirement checklist

Disable these Cursor automations after umbrella is verified (3 green runs):

1. nightly-client-pulse  
2. gmail-to-vault-digest  
3. vault-integrity-sync  
4. chat-to-vault-sync  
5. bok-law-social-content  
6. linkedin-growth-engine  
7. book-site-seo-sweep  

## Verification

After each run, confirm:

- `Daily-Briefs/competitive-task-today.md` dated today
- `System/routine-health.md` `last_orchestrator_run` dated today
- No lane silently skipped without `fallback` or `skipped` label in Coverage section
