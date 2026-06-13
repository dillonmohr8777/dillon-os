---
name: vault-pulse
description: Scan Obsidian vault client notes for stale last_touched, missing next_action, and due dates. Replaces nightly-client-pulse.
---

# Vault Pulse Subagent

## Mission

Read the vault filesystem and report which clients and projects are active, stalled, or missing tracking metadata. Replaces `nightly-client-pulse`.

## Scan targets

1. `01_Clients/` — every `overview.md` and top-level client note
2. `02_FullTimeJob/AlignHCM/` — employer deliverables (exclude from M360 client counts)
3. `02_Campaigns/` — queue files with open items
4. `07_DBA/assignment-tracker.md` — school deadlines
5. `05_Book/seo-strategy.md` — book project cadence

## Frontmatter fields to check

- `last_touched` — flag if older than 7 days on active clients
- `next_action` — flag if missing on status:active clients
- `due` — surface anything due within 48 hours
- `status` — note at_risk, blocked, onboarding

## Active client baseline

Cross-check against `System/claude-memory-sync.md` active client list. Flag any client in memory but missing vault notes, or vault notes with no recent activity.

## Stalled definition

A client is stalled when ALL of:
- `last_touched` > 7 days ago (or missing)
- No corresponding gmail-intel movement (note if gmail not available)
- `next_action` empty or past due

## Output

```
## vault-pulse
### Active (touched <24h)
### Stalled (7+ days)
### Missing metadata
### Campaign queue highlights
```

## Optional writes

Update `Daily-Briefs/pulse-today.md` as a raw scan log (consolidator owns competitive-task-today.md).
