# Company OS Umbrella SOP

One-lesson summary: Run one daily umbrella automation with parallel intel lanes instead of seven+ separate Cursor crons.

## When to use

- Daily at 1:00 PM America/New_York (Cursor automation `company-os-umbrella`)
- Any time Dillon asks for "the competitive task," "morning loop," or "what should I work on today"
- After returning from time off — run on-demand to rebuild the priority stack

## Prerequisites

- Repository attached to Cursor automation
- Optional: Composio Gmail + Slack for live reads (degrades to vault-fallback without them)

## Procedure

### 1. Preflight (deterministic)

```bash
node _os/automation/bin/dillon-command.js --profile company-os-umbrella --preflight --date YYYY-MM-DD
```

### 2. Phase 1 — parallel lanes

Launch all subagents in `.cursor/agents/` marked `parallel_group: intel` or `scout` in **one turn**.
See `System/company-os-umbrella-prompt.md` for the lane table.

### 3. Phase 2 — consolidate

Run `memory-consolidator` with every lane summary. Required outputs:

- `Daily-Briefs/competitive-task-today.md`
- `System/urgent-replies.md`
- `System/slack-action-queue.md`
- `System/claude-memory-sync.md`
- `System/routine-health.md`

### 4. Execute (human + Codex)

Open the daily brief. Approve Tier 1 batch items. Route execution to Codex/Marketing Chief
and the 54-routine operating team — **not** back through Cursor scouts.

## Retirement

After three green runs, disable legacy automations listed in `System/competitive-task-definition.md`.

## References

- [[System/competitive-task-definition]]
- [[11_Agents/company-os-umbrella-spec]]
- [[11_Agents/64gb Morning Orchestrator Spec 2026-07-08]]
