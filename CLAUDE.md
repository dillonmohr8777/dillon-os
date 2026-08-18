# CLAUDE.md — Dillon OS vault instructions

This repo is Dillon Mohr's Obsidian vault and second brain. You read and write
the same markdown files Obsidian displays. Treat the vault like a codebase: the
wiki is the code, you are the compiler.

**This GitHub repository is PRIVATE** (since 2026-08-18). Client evidence, comms,
transcripts, and reports belong in the vault — that is what lets the brain
compound. Credentials, access inventories, Bitwarden locators, and recovery codes
still go in `12_Brain/private/` (gitignored) and never into tracked files;
`_os/test/public-safety.test.js` fails the build on any secret-shaped value.

## Who this vault serves

- Dillon Mohr — marketing operator. Full-time at Align HCM, account manager at
  Momentum 360, plus direct/1099 clients.
- Services: Google Ads, Meta Ads, local SEO, GBP content, web design, landing
  page design, WordPress.
- Primary directive: ROAD TO 100 CLIENTS (see `System/OS Config.md`).
- Style: direct, execution-focused. Lead with the action, skip the fluff.

## Start here

Read only what the task needs, in this order:

1. `INDEX.md`
2. `System/operating-status.md`
3. `System/approval-queue.md`
4. `12_Brain/00_Home.md`
5. `12_Brain/09_Ops/AGENT_PROTOCOL.md`
6. The relevant client, project, decision, or source notes linked from those

## Vault map

The brain layer is `12_Brain/` and uses **numbered folders**. This is the only
taxonomy. Do not create `entities/`, `concepts/`, `projects/`, `decisions/`,
`research/`, `memory/`, `raw/`, or `1Z_Brain/` — those are a retired second
scheme; new notes there are invisible to the Bases and to the HUD.

| Path | What it is |
|------|------------|
| `12_Brain/00_Home.md` | Brain front door — projects, decisions, memory, research, operating views |
| `12_Brain/01_Captures/` | Ground truth. Captures, transcripts, receipts. **Immutable — add, never rewrite.** |
| `12_Brain/02_Entities/` | One page per concrete thing: org, person, tool, competitor |
| `12_Brain/03_Concepts/` | One page per idea: strategy, pattern, lesson |
| `12_Brain/04_Decisions/` | Bi-temporal decision log (what, when, why, what it supersedes) |
| `12_Brain/05_Projects/` | Active delivery threads and goals |
| `12_Brain/06_Research/` | Compiled research (dated, with `expires:`) |
| `12_Brain/07_Reviews/` | Review and reconciliation passes |
| `12_Brain/08_Memory/` | Believed state + point-in-time snapshots |
| `12_Brain/09_Ops/` | Agent protocol, architecture, health, coverage audits |
| `12_Brain/10_Maps/` | Maps of content; `10_Maps/00_Atlas` is the connected map |
| `12_Brain/Bases/` | Native Obsidian Bases — the database views over frontmatter |
| `12_Brain/protocols/` | Agent protocols distilled from `11_Agents/` |
| `12_Brain/schemas/` | Frontmatter contracts the validator enforces |
| `12_Brain/registry/` | `automations.json` — the automation registry |
| `12_Brain/state/` | Last-run JSON per automation id. Regenerable; safe to delete |
| `12_Brain/queue/` | Pending ingest payloads |
| `12_Brain/private/` | Gitignored private layer (PII, access, secrets) |
| `00_Inbox` → `07_DBA` | Working folders: clients, campaigns, content, SOPs, offers, personal |
| `10_Sessions`, `11_Agents` | Build logs and agent definitions |
| `System/` | OS config, scripts, health automation |
| `Daily-Briefs/` | Output of the daily skills (am-report, inbox-brief, pulse) |
| `_os/` | D.I.L.L.O.N. OS HUD — reads this vault live (`node _os/server.js`) |

Client truth stays in `01_Clients/`. Link to it from the brain; never duplicate
a client page under `12_Brain/`.

## Writing rules

1. **One lesson per file**, with a one-line summary at the top.
2. **Update the existing page instead of creating a duplicate.** Search
   `INDEX.md` and grep before creating anything new.
3. **Delete notes that turn out to be wrong.** A wrong page is worse than none.
4. **Never rewrite `12_Brain/01_Captures/`.** Compile from it; the capture stays
   exactly as captured.

Plus:

- Every durable claim or decision carries `source_refs` pointing at the capture
  or note it came from. No source ⇒ label it `unverified`, never invent evidence.
- Connect pages with `[[wikilinks]]` as you write — the links are the graph.
- Every note carries the frontmatter its folder's schema requires
  (`12_Brain/schemas/`). The validator is
  `node _os/automation/bin/frontmatter-validate.js`; it is what makes the Bases
  work. A note without frontmatter is invisible to the database.
- Research findings carry a date and an `expires:` date so stale knowledge
  announces itself.
- New or removed pages ⇒ update `INDEX.md` in the same commit.
- Ship changes as diffs, not claims.

## Reading rules (the context economy)

1. Start at `INDEX.md`, then **walk the links**. Never sweep whole folders.
2. Grep for keywords to find pages; open only the pages the trail points at.
3. For big cross-vault questions, **send a subagent**.
4. This file stays under 200 lines. It points at the vault; it never contains it.

## Machine context

The machine-level context map at `C:\Users\dillo\CLAUDE.md` identifies the
active vault, Codex memory bank, shared agent-vault projection, canonical client
queue, and the local workflow estate. Read it before cross-project or
orchestration work.

- Live vault: `C:\Users\dillo\repos\dillon-os` (this repo).
- Codex memory bank: `C:\Users\dillo\.codex\memories` — search `MEMORY.md`
  first, then verify current claims against live files.
- Agent-vault projection: `C:\Users\dillo\Documents\Codex\projects\agent-vault`.
  Refresh with `scripts\Sync-AgentVault.ps1`, then `scripts\Test-AgentVault.ps1`
  before client or orchestration work. It is a generated read layer, not a
  second queue.
- Canonical client queue:
  `C:\Users\dillo\Documents\Codex\projects\client-operations`.
- Rockbot/Grok Bot recorded curriculum, routine manifest, and verification
  receipts: `11_Agents/Rockbot Operating System/` — start with `README.md` and
  `00-CLAUDE-START-HERE.md`; refresh via `Sync-RockbotKnowledge.ps1`.

The local `agent-memory` MCP server gives query-only retrieval across isolated
operating and client spaces. Call `agent_memory_list_spaces` first, select
exactly one space, never blend spaces. Memory is historical evidence only; live
vault files, the canonical queue, source evidence, and approvals outrank it.
Operations: `System\agent-memory\README.md`.

## Remote browser bridge

A persistent browser bridge runs on the Windows box:

- Start: `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\dillo\start-box-bridge.ps1`
- It writes `C:\Users\dillo\start-box-bridge-state.json` and the user
  environment variable `BOX_CDP_URL`.

Source the URL before remote automation:

```powershell
$statePath = "$env:USERPROFILE\start-box-bridge-state.json"
if (Test-Path $statePath) {
    $state = Get-Content $statePath | ConvertFrom-Json
    if ($state.tunnelUrl) { $env:BOX_CDP_URL = $state.tunnelUrl }
}
```

## Approval boundary

External sending, publishing, deployment, spend, account changes, merges, and
destructive actions stay approval-gated. Draft locally, append to
`System/approval-queue.md`, stop. Report what was verified, and distinguish
complete, drafted, blocked, degraded, and live-verified states.

## Loops

- After every session: `/session-mine`.
- Nightly: `/vault-compile` on a cheap model.
- Weekly: `/wiki-lint`, one `/synthesize` pass, `/research-sweep`.
- Before reporting completion: `& .\System\scripts\Test-SecondBrain.ps1`.
