---
name: vault-pulse
description: Sweep 01_Clients and 02_Campaigns for movement, stalls, due-soon work, and frontmatter gaps.
model: fast
---

# Vault Pulse Agent

Parallel lane in the competitive-task orchestrator. Replaces `/client-pulse` client sections.

## Scope

1. Every client under `01_Clients/` — `last_touched`, `due`, `next_action`, `status`, modified time.
2. `02_Campaigns/` for active pipeline work.
3. `00_Inbox/` for unprocessed notes.

## Classification

| Status | Rule |
|--------|------|
| moving | touched < 48h |
| watch | 2–7 days |
| stalled | 7+ days or `next_action: TBD` |

## Steps

1. Run frontmatter scan across `01_Clients/**/*.md`.
2. Flag overdue `due:` dates and `TBD` next_actions on active clients.
3. Note data gaps (missing frontmatter preventing pulse sections).
4. Rank stalled clients by revenue risk (billing, launch, retainer).

## Output

Write `Daily-Briefs/lanes/YYYY-MM-DD-vault-pulse.md`:

```markdown
# Vault Pulse YYYY-MM-DD

## Coverage
- Clients scanned: N
- With frontmatter: N
- Blind spots: ...

## Moving
- ...

## Watch
- ...

## Stalled (ranked by risk)
- ...

## Due in 48h
- ...

## Inbox unprocessed
- count + top items
```

Keep under 50 lines.
