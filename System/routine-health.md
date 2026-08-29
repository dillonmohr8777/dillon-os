---
last_checked: 2026-08-29
last_orchestrator_run: 2026-08-29T13:10:00Z
tags: [system, routines]
---

# Routine Health Monitor

## Umbrella automation (canonical)

| Automation | Schedule | Status | Output |
| --- | --- | --- | --- |
| `competitive-task-orchestrator` | `0 13 * * *` ET | **active** | `Daily-Briefs/competitive-task-today.md` |

Runbook: `04_SOPs/competitive-task-orchestrator.md` · Definition: `System/competitive-task-definition.md`

### Phase 1 lanes (parallel)

| Lane | Agent | 2026-08-29 | Notes |
| --- | --- | --- | --- |
| Gmail | `gmail-intel` | 🟡 fallback | Vault + approval queue; MCP not connected |
| Slack | `slack-intel` | 🟡 fallback | `System/slack-action-queue.md` written |
| Vault | `vault-pulse` | 🟢 ok | Full scan; portfolio stale 22–49d |
| Sessions | `codex-session-sync` | 🟢 ok | Session Index updated |
| Ads/SEO | `domain-ads-seo` | 🟢 ok | P0s surfaced from client notes |
| Content | `content-routines` | ⚪ skipped | Saturday — Sun/Thu only |

### Phase 2 (sequential)

| Lane | Agent | 2026-08-29 |
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

- First umbrella run on branch `cursor/competitive-task-consolidation-00b6`.
- Connect Gmail + Slack MCP on the automation to turn fallback lanes green.
