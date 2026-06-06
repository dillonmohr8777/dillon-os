# Lane: intel-vault-pulse

## Goal

Detect client note movement, due items, and stalls from the Obsidian vault (this repo).

## Inputs

- `01_Clients/**/*.md` — file mtime, frontmatter: `client`, `last_touched`, `next_action`, `due`, `status`
- `02_Campaigns/*Queue*.md`
- `02_FullTimeJob/AlignHCM/`

## Logic

- **Active (24h):** any client file modified in last 24 hours.
- **Due 48h:** `due:` frontmatter within 48 hours OR explicit dates in note body near today.
- **Stalled (7d+):** no mtime change in 7+ days AND active status in `System/claude-memory-sync.md` pending list.

If frontmatter sparse, say so and infer from `claude-memory-sync.md` pending section.

## Output template

```markdown
## intel-vault-pulse

### Active clients (24h movement)
• ...

### Due within 48h
• ...

### Stalled 7+ days
• ...

### Data quality
• Notes missing frontmatter: ...
```
