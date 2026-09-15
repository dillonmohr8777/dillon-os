# Company OS Umbrella Spec

Date: 2026-08-27  
Status: operational — **the single daily automation**  
Companion: [[11_Agents/64gb Morning Orchestrator Spec 2026-07-08]], [[11_Agents/claude-operating-team.json]], [[System/competitive-task-definition]]

## Role in the stack

| Layer | Owner | Cadence | Output |
|-------|-------|---------|--------|
| **Company OS Umbrella** (this) | Cursor cloud automation | Daily 1:00 PM ET + on-demand | `Daily-Briefs/competitive-task-today.md`, approval board |
| **Morning orchestrator** | Codex local (optional) | 7:00 AM ET when enabled | Tier-1 batch execution across Chrome |
| **Claude daily driver** | Windows Task Scheduler | Every 15 min | Routine receipts, bounded local work |
| **Codex crons** | Codex scheduler | Per `automation.toml` | Lane-specific artifacts |
| **Execution** | Codex/Marketing Chief | On demand | Canonical queue, handoffs |

This spec defines the **one Cursor automation** that replaces fragmented morning
loops, seven afternoon crons, and duplicate competitive-task consolidation PRs.
It fans out **eleven parallel lanes** plus one sequential consolidator.

## Parallel lane map

```text
Phase 0 (parallel CLIs)
  frontmatter-validate, site-health --dry-run, queue-status

Phase 1 (parallel subagents)
  gmail-intel          → System/urgent-replies.md
  slack-intel          → System/slack-action-queue.md
  vault-pulse          → stalled/due client scan
  codex-session-sync   → 10_Sessions/ promotions
  domain-ads-seo       → campaign queue P0s
  content-routines     → Sun/Thu gated drafts
  automation-health    → Claude loop + cron health
  websites-scout       → site-health report
  outreach-scout       → prospect radar / factory queue
  ads-scout            → metrics / ledger hypotheses
  reporting-scout      → report gaps list

Phase 2 (sequential)
  memory-consolidator  → Daily-Briefs/competitive-task-today.md
                         System/claude-memory-sync.md
                         System/routine-health.md
                         automation-runs/company-os-umbrella/approval-board.md
```

## Authority boundary

- **May:** read connectors, edit operator surfaces listed above, draft content locally.
- **May not:** send, post, publish, deploy, spend, write canonical client-operations queue,
  merge PRs without need, or act as parallel Marketing Chief.

Full definitions: [[System/competitive-task-definition]]  
Automation prompt: [[System/company-os-umbrella-prompt]]  
SOP: [[04_SOPs/company-os-umbrella]]

## Integration with 54-routine team

The daily brief feeds Codex/Marketing Chief intake. When P0 items need execution,
route to the matching routine ID in `11_Agents/claude-operating-team.json` rather than
re-implementing lane logic in chat.

| Brief signal | Routine lane |
|--------------|--------------|
| Unanswered client email | Communications (Codex-owned send; Claude draft) |
| Ad disapproval | Performance department |
| Stalled client note | Command D09/D10 board refresh |
| Broken automation | Reliability E04/E11 |
| Day-gated content draft | Growth or maker lane per client |

## Verification

After each run, confirm:

- `Daily-Briefs/competitive-task-today.md` dated today
- `System/routine-health.md` `last_orchestrator_run` dated today
- No lane silently skipped without `fallback` or `skipped` label in Coverage section
- `node --test _os/automation/tests/automation.test.js` passes if CLI/profile changed
