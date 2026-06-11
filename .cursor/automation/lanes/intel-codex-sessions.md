# Lane: intel-codex-sessions

## Goal

Consolidate open loops from Codex, Cursor, and Claude session notes into actionable items.

## Inputs (search in order)

1. `10_Sessions/**/*.md`
2. `10_Sessions/Session Index.md`
3. `10_Sessions/Automation Debug Log.md`
4. `10_Sessions/Facebook Ads System Build Log.md`
5. Any `**/codex*` or `**/session*` paths in repo
6. Automation memory if accessible (`competitive-task-workflow.md`)

## Extract

- Unfinished decisions
- TODOs left in session notes
- Automation errors not marked resolved
- Facebook ads system build blockers

## Rules

- Do not duplicate items already in `System/urgent-replies.md` unless adding new detail.
- Prefer linking to vault paths for context.

## Output template

```markdown
## intel-codex-sessions

### Open loops
• Source file — item — suggested next action

### Resolved since last run
• ...

### Automation / build blockers
• ...
```
