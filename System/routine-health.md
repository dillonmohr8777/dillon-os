---
last_checked: 2026-05-31
tags: [system, routines]
status: consolidated
---

# Routine Health Monitor

## Active: umbrella automation

| Setting | Value |
|---------|--------|
| Name | `competitive-task-orchestrator` |
| Cron | `0 13 * * *` |
| Spec | [[System/competitive-task-orchestrator]] |
| Prompt | [[System/competitive-task-orchestrator-prompt]] |
| Daily brief | [[Daily-Briefs/competitive-task-today]] |

Phase 1 runs six agents in parallel; Phase 2 merges via Memory Consolidator. See [[11_Agents/Agent Index]].

## Legacy crons — retire after 3 green umbrella days

| Legacy | Status | Absorbed by |
|--------|--------|-------------|
| `nightly-client-pulse` | **Replace** | vault-pulse |
| `gmail-to-vault-digest` | **Replace** | gmail-intel |
| `vault-integrity-sync` | **Replace** | memory-consolidator |
| `chat-to-vault-sync` | **Replace** | codex-session-sync |
| `bok-law-social-content` | **Replace** | content-routines (Sun) |
| `linkedin-growth-engine` | **Replace** | content-routines (Sun) |
| `book-site-seo-sweep` | **Replace** | content-routines (Thu) |

Disable legacy Cursor automations in the dashboard once `legacy_crons_safe_to_disable` is true in the daily brief automation health section.

## Vault frontmatter

Client notes should include: `client`, `last_touched`, `next_action`, `due`, `tags`, `status`, `division`, `cc_list`, `contact_email`.

## Last run notes

- 2026-05-31: Umbrella workflow committed to repo; first live merged run pending.
