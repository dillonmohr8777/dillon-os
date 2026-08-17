# TencentDB Agent Memory integration

This directory owns Dillon OS integration with the stable TencentDB Agent
Memory `v1.0.1` gateway. Vendor source is pinned outside the Obsidian vault at:

`C:\Users\dillo\.codex\vendor_imports\TencentDB-Agent-Memory-v1.0.1`

Runtime data is local at:

`C:\Users\dillo\AppData\Local\Codex\AgentMemory`

## Contract

- Gateway binds only to `127.0.0.1:8420`, sends no CORS headers, and requires
  a Bearer credential stored in Windows Credential Manager.
- Ollama performs generation and embeddings locally. No cloud LLM key is
  required.
- Codex, Claude, Cursor, and Grok receive the same query-only MCP tools. They
  cannot capture, delete, overwrite, or destroy memory through MCP.
- Vault ingestion is the only canonical bulk writer. It excludes `.git`,
  `.obsidian`, `node_modules`, and notes matching secret-value patterns.
- Client, employer, inbox, capture, campaign, and session material is stored in
  separate `serviceId` spaces. `dillon-shared` does not receive client folders.
- Memory is historical evidence. The live vault, current runtime state,
  canonical client registry, queue, source evidence, and approvals outrank it.
- A gateway failure must not block the main agent workflow.

The pinned gateway includes a local hardening patch that gives every
`serviceId` its own L2/L3 storage root. The upstream stable gateway already
isolated L0/SQLite by service ID, but reused standalone file storage. The
permanent isolation canary verifies both layers and destroys its temporary
spaces after every test. Runtime npm dependencies were security-upgraded until
`npm audit --omit=dev` reported no known vulnerabilities.

## Operations

```powershell
& .\System\agent-memory\Start-AgentMemoryGateway.ps1
& .\System\agent-memory\Sync-AgentMemoryFromVault.ps1
& .\System\agent-memory\Test-AgentMemory.ps1
```

Codex, Claude, Cursor, and Grok expose the same four query-only MCP tools:

- `agent_memory_list_spaces`
- `agent_memory_search`
- `agent_memory_read_core`
- `agent_memory_list_scenarios`

Always list/select the exact space before searching. For current operating
truth, open the source note returned by memory and validate it against the live
vault or canonical client-operations repository.

Hermes uses the official `memory_tencentdb_v2` provider with automatic turn
capture disabled by default. This prevents raw cross-client conversations from
silently entering the shared space. Controlled vault sync remains enabled.
Its recall path accepts the stable SDK's `items` response and uses a bounded
5,000-character L0 fallback while background L1 extraction catches up.

The gateway starts through the hidden `Codex-AgentMemory-Gateway` logon task.
`Codex-AgentMemory-VaultSync` runs at logon and hourly through the same
console-free launcher. A named mutex prevents overlapping imports, and the
sync manifest checkpoints every completed source so interrupted runs resume
without replaying the entire vault.
