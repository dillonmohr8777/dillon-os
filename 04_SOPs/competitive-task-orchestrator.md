---
tags: [sop, automation, orchestrator]
---

# Competitive Task Orchestrator SOP

## Purpose

One daily workflow replaces seven legacy automations. Protects Dillon's **competitive task**: winning against competing client priorities without dropped replies, launches, or billing.

## When to run

- **Automated:** Cursor cron `0 13 * * *` UTC
- **Manual:** "Run competitive task orchestrator" or invoke `dillon-os-orchestrator` skill

## Parallel agents

| Order | Agent | Legacy replaced |
|-------|-------|-----------------|
| Parallel | Comms | gmail-to-vault-digest |
| Parallel | Pulse | nightly-client-pulse |
| Parallel | Vault | vault-integrity-sync, chat-to-vault-sync |
| Parallel | Ops | (new queue triage) |
| Conditional | Content | bok-law-social, linkedin-growth, book-site-seo |

## Outputs

1. `Daily-Briefs/pulse-today.md` (also aliased as competitive-task-today)
2. `System/urgent-replies.md`
3. `System/claude-memory-sync.md`
4. `02_Campaigns/*Queue.md` updates when Ops finds items

## P0 tie-break

1. Launch blocked (NKCDC landing page)
2. Billing / at-risk (Hardwood Artisan)
3. Ad disapprovals / spend waste (Bar Crawl USA)
4. Hard calendar (meetings, committed delivery dates)

## Escalation

Log MCP auth failures or repeated stale vault (>7d all clients) in `10_Sessions/Automation Debug Log.md`.

## Related

- [[System/dillon-os-orchestrator]]
- [[11_Agents/Master Agent]]
- [[System/competitive-task-orchestrator-prompt]]
