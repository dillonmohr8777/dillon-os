---
last_checked: 2026-09-07
last_orchestrator_run: 2026-09-07
tags: [system, routines, umbrella]
---

# Routine Health Monitor

**Single owner:** `company-os-umbrella` (daily 1:00 PM America/New_York). Legacy per-lane Cursor crons are superseded — see `System/competitive-task-definition.md`.

## Umbrella lane status (2026-09-07)

| Lane | Status | Last evidence |
| --- | --- | --- |
| gmail-intel | yellow | vault-fallback; inbox frozen 6d |
| slack-intel | yellow | vault-fallback; captures 2026-07-30 |
| vault-pulse | red | 37/37 clients stalled 7+ days |
| codex-session-sync | green | 7 session notes, no promotions queued |
| domain-ads-seo | yellow | approval-gated queue items |
| content-routines | green | Monday — no day gate |
| automation-health | yellow | loop receipts end 2026-08-18 |
| websites-scout | yellow | fixture fail book form |
| outreach-scout | green | radar 2026-09-06 |
| ads-scout | yellow | needs-approval items only |
| reporting-scout | yellow | sample figures in Bar Crawl draft |
| memory-consolidator | green | `competitive-task-today.md` written |

## Local schedulers (surfaced, not replaced)

| Job | Cadence | Health |
| --- | --- | --- |
| Claude-Autonomous-Daily-Driver | 15 min (Windows) | yellow — stale receipts on cloud clone |
| DillonAgentOS-GmailBridge / SlackBridge | ~15 min | unknown — desktop only |
| Prospect Radar Next 20 | daily 05:20 ET | green |
| daily-communications-brain | daily 07:00 ET (Codex) | yellow — owner on Windows box |
| obsidian-guard-dog | daily 08:30 ET | unknown |
| report-brain-ingest | scheduled | yellow — last ingest 2026-08-11 |

## Retired standalone routines (do not re-enable)

- `nightly-client-pulse` → vault-pulse lane
- `gmail-to-vault-digest` → gmail-intel lane
- `vault-integrity-sync` → memory-consolidator
- `chat-to-vault-sync` → codex-session-sync lane
- `bok-law-social-content` / `linkedin-growth-engine` / `book-site-seo-sweep` → content-routines lane
- Duplicate `competitive-task-consolidation` Cursor crons → this umbrella

## Brain layer

- Canonical: [[12_Brain/README|12_Brain]] · [[12_Brain/System/Health Automation|Health Automation]]
- Spec: [[11_Agents/company-os-umbrella-spec]]
