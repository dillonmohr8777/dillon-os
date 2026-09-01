---
last_checked: 2026-09-01
last_orchestrator_run: 2026-09-01
tags: [system, routines]
---

# Routine Health Monitor

**Canonical automation:** `competitive-task-orchestrator` (cron `0 13 * * *` America/New_York).

Seven legacy crons are retired — see `System/competitive-task-definition.md`.

## Lane status — 2026-09-01

| Lane | Status | Notes |
| --- | --- | --- |
| gmail-intel | yellow | Vault fallback — connect Gmail MCP |
| slack-intel | yellow | Vault fallback — 4 open inbox captures |
| vault-pulse | green | 40/40 frontmatter complete |
| codex-session-sync | green | No pending session exports |
| domain-ads-seo | yellow | Replenish billing + Bar Crawl disapprovals open |
| websites | green | Fixture preflight ok |
| outreach | green | Radar sweep current (2026-09-01) |
| content-routines | skipped | Not day-gated (Tuesday) |
| memory-consolidator | green | Brief written |

## CLI

```bash
node _os/automation/bin/competitive-task-orchestrator.js --preflight --date 2026-09-01
```

## Retired (do not re-enable)

- `nightly-client-pulse`
- `gmail-to-vault-digest`
- `vault-integrity-sync`
- `chat-to-vault-sync`
- `bok-law-social-content`
- `linkedin-growth-engine`
- `book-site-seo-sweep`
- `dillon-command-morning-loop` (merged into umbrella)

## Brain layer

- Canonical: [[12_Brain/README|12_Brain]] · [[12_Brain/System/Health Automation|Health Automation]]
