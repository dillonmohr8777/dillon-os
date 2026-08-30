---
last_checked: 2026-08-30
last_orchestrator_run: 2026-08-30T13:05:00Z
tags: [system, routines]
---

# Routine Health Monitor

## Umbrella automation (canonical)

| Automation | Schedule | Status | Output |
| --- | --- | --- | --- |
| `competitive-task-orchestrator` | `0 13 * * *` ET | **active** | `Daily-Briefs/competitive-task-today.md` |

Runbook: `04_SOPs/competitive-task-orchestrator.md` · Definition: `System/competitive-task-definition.md`

### Phase 1 lanes (parallel)

| Lane | Agent | 2026-08-30 | Notes |
| --- | --- | --- | --- |
| Gmail | `gmail-intel` | 🟡 fallback | Vault + approval queue; MCP not connected |
| Slack | `slack-intel` | 🟡 fallback | 4 July 30 loops still open |
| Vault | `vault-pulse` | 🟢 ok | 37 active stalled; Cindy due tomorrow |
| Sessions | `codex-session-sync` | 🟢 ok | Session Index updated; partial promotions |
| Ads/SEO | `domain-ads-seo` | 🟢 ok | P0s surfaced; campaign queues empty |
| Content | `content-routines` | 🟢 done | Sunday — BOK + Align drafts written |

### Phase 2 (sequential)

| Lane | Agent | 2026-08-30 |
| --- | --- | --- |
| Consolidation | `memory-consolidator` | 🟢 ok — brief + sync files updated |

## Retired standalone crons (disable in Cursor UI)

These seven legacy automations are superseded by the umbrella orchestrator:

- `nightly-client-pulse`
- `gmail-to-vault-digest`
- `vault-integrity-sync`
- `chat-to-vault-sync`
- `bok-law-social-content`
- `linkedin-growth-engine`
- `book-site-seo-sweep`

See `System/competitive-task-definition.md` for Codex/Rockbot tasks folded into Marketing Chief daily driver.

## Notes

- Canonical implementation branch: `cursor/competitive-task-consolidation-dabf` (supersedes `00b6` consolidation runs).
- Connect Gmail + Slack MCP on the automation to turn fallback lanes green.
