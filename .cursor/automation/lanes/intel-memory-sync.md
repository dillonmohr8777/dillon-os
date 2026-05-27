# Lane: intel-memory-sync

## Goal

Produce an updated draft of `System/claude-memory-sync.md` so all Claude/Codex/Cursor instances share one operator truth.

## Inputs

- Current `System/claude-memory-sync.md`
- `01_Clients/Client Index.md`
- Recent changes in `01_Clients/`, `02_Campaigns/`
- Phase context from other lanes (if already available; otherwise use existing sync file)

## Sections to maintain

1. Active clients (Momentum 360) with rate and one-line status
2. Full-time (Align HCM only — not a client)
3. Pending deliverables (bullet per client blocker)
4. Upcoming deadlines (7 days)
5. Recent completions (7 days)
6. Unanswered / urgent

## Rules

- Do not remove clients without evidence they churned.
- Align HCM stays under Full-time, never M360 list.
- Return full markdown file body in output (operator will write to vault in synthesis).

## Output template

```markdown
## intel-memory-sync

### Draft claude-memory-sync.md
(full file content with updated last_sync date in frontmatter)
```
