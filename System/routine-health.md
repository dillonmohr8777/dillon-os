---
last_checked: 2026-09-02
last_orchestrator_run: 2026-09-02T13:00Z
tags: [system, routines, competitive-task]
---

# Routine Health Monitor

Canonical umbrella: **competitive-task-orchestrator** (1:00 PM ET daily).
See [[04_SOPs/competitive-task-orchestrator]] and [[System/competitive-task-definition]].

## Umbrella lanes (Cursor — Phase 1 parallel)

| Lane | Agent | Last run | Status |
|------|-------|----------|--------|
| Inbox | ct-inbox-intel | 2026-09-02 | green |
| Gmail | ct-gmail-intel | 2026-09-02 | yellow (vault-fallback) |
| Slack | ct-slack-intel | 2026-09-02 | yellow (vault-fallback) |
| Vault pulse | ct-vault-pulse | 2026-09-02 | green |
| Sessions | ct-session-sync | 2026-09-02 | green |
| Ads/SEO | ct-ads-seo | 2026-09-02 | green |
| Automation health | ct-automation-health | 2026-09-02 | yellow |
| Content routines | ct-content-routines | 2026-09-02 | skipped (Wed) |
| Consolidator | ct-consolidator | 2026-09-02 | green |

## Retired Cursor crons (superseded — disable in UI)

- `nightly-client-pulse` → ct-vault-pulse
- `gmail-to-vault-digest` → ct-gmail-intel + daily-communications-brain feeder
- `vault-integrity-sync` → ct-consolidator
- `chat-to-vault-sync` → ct-session-sync
- `bok-law-social-content` → ct-content-routines (Sunday)
- `linkedin-growth-engine` → ct-content-routines (Sunday)
- `book-site-seo-sweep` → ct-content-routines (Thursday)
- `morning-loop` cloud automation → folded into umbrella Phase 1

## Windows feeders (active — not duplicates)

| Job | Cadence | Status |
|-----|---------|--------|
| daily-communications-brain | 7 AM ET | active-scheduled (Codex) |
| Claude-Autonomous-Daily-Driver | every 15m | active-scheduled |
| Prospect Radar Next 20 | 5:20 AM | active-scheduled |
| obsidian-guard-dog | 8:30 AM | active-scheduled |
| marketing-chief-twice-daily-brief | 9 AM / 5 PM | active-scheduled (infra only) |

## Brain layer

- Canonical: [[12_Brain/README|12_Brain]] · [[12_Brain/System/Health Automation|Health Automation]]
