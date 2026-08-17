# CLAUDE.md

## Current Dillon operating context

The machine-level context map at `C:\Users\dillo\CLAUDE.md` identifies the
active Obsidian vault, Codex memory bank, shared agent-vault projection,
canonical client queue, and the complete local workflow estate. Read it before
cross-project or orchestration work.

The authoritative live vault is `C:\Users\dillo\repos\dillon-os`. Start with
`INDEX.md`, `System\operating-status.md`, `System\approval-queue.md`,
`12_Brain\00_Home.md`, and `12_Brain\09_Ops\AGENT_PROTOCOL.md`. The Codex
memory bank is `C:\Users\dillo\.codex\memories`; search `MEMORY.md` first and
verify current claims against live files. Do not sweep the entire vault or
memory bank into context; retrieve the relevant notes and follow their links.

The agent-vault projection at
`C:\Users\dillo\Documents\Codex\projects\agent-vault` must be refreshed and
validated with `scripts\Sync-AgentVault.ps1` followed by
`scripts\Test-AgentVault.ps1` before relevant client or orchestration work.
It is a generated read layer, not a second queue. The canonical queue remains
`C:\Users\dillo\Documents\Codex\projects\client-operations`.

Rockbot/Grok Bot's recorded operating curriculum, 54-routine manifest,
verification receipts, workflow estate, training simulator, and screenshots
are assembled at
`11_Agents\Rockbot Operating System`. Start with its `README.md` and
`00-CLAUDE-START-HERE.md`; refresh with `Sync-RockbotKnowledge.ps1` when new
records are created.

The local `agent-memory` MCP server gives Claude query-only retrieval across
isolated operating and client spaces. Call `agent_memory_list_spaces` before
searching, select exactly one space, and never blend spaces. Memory is
historical evidence only; current vault files, the canonical client queue,
source evidence, and approvals outrank it. Full operations and validation are
documented in `System\agent-memory\README.md`.

## Remote Browser Bridge

This environment uses a persistent browser bridge on the Windows box:

- Start bridge (on the box): `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\dillo\start-box-bridge.ps1`
- The script writes `C:\Users\dillo\start-box-bridge-state.json` and the user environment variable `BOX_CDP_URL`.

Before remote automation, source the URL:

```powershell
$statePath = "$env:USERPROFILE\start-box-bridge-state.json"
if (Test-Path $statePath) {
    $state = Get-Content $statePath | ConvertFrom-Json
    if ($state.tunnelUrl) {
        $env:BOX_CDP_URL = $state.tunnelUrl
    }
}
```

If you want to verify the bridge session:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\dillo\test-box-bridge.ps1 -TunnelUrl $env:BOX_CDP_URL
```
