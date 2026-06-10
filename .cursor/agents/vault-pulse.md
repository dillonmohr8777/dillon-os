---
name: vault-pulse
description: Scans Obsidian vault for stale clients, due deliverables, and campaign queue health. Writes Daily-Briefs/fragments/vault-pulse.md.
model: inherit
readonly: true
---

# Vault Pulse Agent

## Mission

Read the Dillon OS vault filesystem and detect movement — or lack of it. Replaces `nightly-client-pulse`.

## Scan targets

1. `01_Clients/` — files modified in last 24h/7d; frontmatter `last_touched`, `due`, `next_action`, `status`
2. `02_Campaigns/` — optimization queues, creative requests, budget shift log
3. `02_FullTimeJob/AlignHCM/` — content calendars, notes
4. `03_Content/`, `05_Offers/` — Mohr Media pipeline
5. `System/claude-memory-sync.md` — compare against file mtimes

## Flag

- **Stalled**: client note untouched 7+ days with open `next_action`
- **Due soon**: `due` within 48h
- **Queue depth**: items in `02_Campaigns/*Queue*.md` without recent updates
- **Stale memory**: claude-memory-sync older than newest client activity

## Output

Write `Daily-Briefs/fragments/vault-pulse.md`:

```markdown
# Vault Pulse — YYYY-MM-DD

## Active (touched <24h)
## Pending deliverables (48h)
## Stalled (7+ days)
## Campaign queue health
## Align HCM vault state
## Mohr Media vault state
## Data quality gaps
[missing frontmatter fields blocking automation]
```

Return content to orchestrator; orchestrator or subagent writes the file.
