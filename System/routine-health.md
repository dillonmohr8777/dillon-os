---
last_checked: 2026-08-28
last_orchestrator_run: 2026-08-28
tags: [system, routines]
source_refs:
  - System/competitive-task-definition.md
  - 04_SOPs/competitive-task-orchestrator.md
---

# Routine Health Monitor

## Umbrella automation (canonical)

| Automation | Schedule | Status |
| --- | --- | --- |
| `competitive-task-orchestrator` | `0 13 * * *` America/New_York | **active** — replaces 7 Cursor crons + 13 Codex tasks |

**Output:** `Daily-Briefs/competitive-task-today.md`

### Phase 1 lanes (parallel)

| Lane | Agent | Last run | Status |
| --- | --- | --- | --- |
| Gmail | `gmail-intel` | 2026-08-28 | yellow — vault-fallback |
| Slack | `slack-intel` | 2026-08-28 | yellow — vault-fallback |
| Vault | `vault-pulse` | 2026-08-28 | green |
| Sessions | `codex-session-sync` | 2026-08-28 | yellow — no new exports |
| Ads/SEO/Radar | `domain-ads-seo` | 2026-08-28 | green |
| Content | `content-routines` | 2026-08-28 | skipped (Friday) |

### Phase 2 (sequential)

| Lane | Agent | Last run | Status |
| --- | --- | --- | --- |
| Consolidation | `memory-consolidator` | 2026-08-28 | green |

## Retired routines (disable in Cursor + Codex)

See [[System/competitive-task-definition#Retired standalone crons]].

## Brain layer

- Canonical: [[12_Brain/README|12_Brain]] · [[12_Brain/System/Health Automation|Health Automation]]

## Notes

- First full umbrella run on cloud branch `cursor/competitive-task-consolidation-eebe`.
- Live Gmail/Slack require Composio auth on the automation or Windows bridge for degraded scout mode.
