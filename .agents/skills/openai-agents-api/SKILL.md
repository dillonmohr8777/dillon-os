---
name: openai-agents-api
description: When and how to use OpenAI Agents API (managed Codex harness, beta agents=v1) vs Grok CEO / Cursor CloudAgent / Hermes. Dry-run first; never spend without an explicit CEO yes and a scoped OPENAI_API_KEY.
---

# OpenAI Agents API

Public beta (docs as of 2026-09-10). Official overview:
https://developers.openai.com/api/docs/guides/agents-api/overview

**What it is:** Managed Codex harness via Agents API. OpenAI manages sessions, orchestration, context compaction, and recovery. Your app provides tools and chooses the execution environment. Agents can run in a sandbox (code, files, MCP, artifacts).

**Auth / endpoint**
- Header: `OpenAI-Beta: agents=v1`
- `POST https://api.openai.com/v1/agents/sessions`
- Application API key scopes: `api.agents.read`, `api.agents.write`, `api.responses.write`

**Pricing (docs)**
- Model usage → selected model’s API rates
- OpenAI tools → standard tool rates
- `openai_hosted` sandboxes → standard container rates

**Data controls (docs)**
- Data residency: **US only**
- **No ZDR** — Agents API does not support Zero Data Retention
- `self_hosted` does **not** make the API ZDR-eligible

## Core concepts (docs)

| Concept | Meaning |
|---|---|
| **Agent** | Model, instructions, tools, and MCP servers available to the agent |
| **Environment** | Optional sandbox/computer where the agent accesses files, loads skills, runs commands |
| **Session** | Durable instance of an agent that works on tasks and responds to input |
| **Events / items** | Inputs sent to an agent and outputs produced during a session |

## Session flow (docs)

1. **Create a session** — configure agent; OpenAI provisions environment (for hosted)
2. **Give it a task** — user input starts a turn once the environment is ready
3. **Follow progress** — stream output or use webhooks when the agent finishes / needs input
4. **Continue or steer** — send another task to the same session, or guide during the current turn

## Managed harness capabilities (docs)

- Sandbox commands / code execution
- Skills and instructions
- Tools + MCP
- Steer while working
- Context summarize / compaction
- Subagents (delegate subtasks)
- Resume where left off

## Docs example shape (match exactly when multi-agent research)

Model: `gpt-6-astra`  
Tools: `programmatic_tool_calling`, `mcp` (openai_docs over http → `https://developers.openai.com/mcp`), `web_search`  
`multi_agent`: `{ enabled: true, max_concurrent_subagents: 4 }`  
Environment: `openai_hosted` **or** `self_hosted` with `workspace_directory` + `capability_directories`

## Environments (docs)

| `environment.type` | Use when | Notes |
|---|---|---|
| `openai_hosted` | Default first smoke / coding in OpenAI sandbox | OpenAI provisions + manages sandbox; container rates |
| `self_hosted` | Need local workspace + skills dirs | Requires `workspace_directory` + `capability_directories` |

## When to use — matrix vs Grok CEO / Cursor CloudAgent / Hermes

| Job | Prefer | Why |
|---|---|---|
| Dillon talks to The CEO; standing gates; triage | **Grok CEO** (this chat) | Single conversation surface; no Agents spend |
| Local reversible vault / docs / scripts on DESKTOP | **Cursor / local Shell** | No spend; machine already authorized |
| Repo branch/PR cloud coding on connected SCM | **Cursor CloudAgent** | Existing PR/branch path; Max Mode cloud agents |
| Local Hermes worker / Telegram / cron on DESKTOP | **Hermes** `:9900` | Already live; not an OpenAI session harness |
| Model routing / free tiers | **OmniRoute** `:20128` | Gateway only — not a durable agent harness |
| Durable multi-turn coding in a managed Codex sandbox | **Agents API** | OpenAI sessions + compaction + recovery |
| Multi-agent research with MCP + web_search + subagents | **Agents API** | Docs harness: tools + multi_agent + steer |
| Self-hosted workspace + skills dirs under Agents API | **Agents API** `self_hosted` | App owns filesystem; OpenAI still orchestrates session |
| Client send / post / publish / spend / Slack outbound | **Never via Agents API alone** | Standing gates: draft/stage only unless Dillon names exact recipient + content |
| Mohr Media Momentum client-ops / Matt Otten / Mac Frederick messaging | **Forbidden** | See Mohr Media `FORBIDDEN.md` |

## Safety gates (non-negotiable)

- Draft/stage only. Never send, post, publish, deploy, or spend unless Dillon names exact recipient + content.
- Default mode is **dry-run**. Live sessions require: key present + explicit spend approval for that run.
- Keep `OPENAI_API_KEY` out of sandboxes, chats, commits, and tracked files. Wire via User env per `System/api-keys-setup.md`. Never print the full key.
- Do not mutate `client-operations` `CONTROL.md` / `queue/work-items.json` from this skill.
- US residency only; not ZDR-eligible even with `self_hosted`.

## Showcase apps (docs)

- sev-bot / incident response (investigate alerts; request approval for recovery)
- Slack bot (workplace tools)
- Data analyst (read-only SQL)
- GitHub issue investigator
- Document reviewer (policy skills + specialist agents)

## Operator steps

1. Confirm the task fits Agents API (matrix above).
2. Dry-run (prints exact request; no network spend):

```powershell
& .\System\scripts\Invoke-OpenAIAgentsSession.ps1 -DryRun -Environment openai_hosted
& .\System\scripts\Invoke-OpenAIAgentsSession.ps1 -DryRun -Environment self_hosted -MultiAgent
```

3. If Dillon approved spend and `OPENAI_API_KEY` is set with agents scopes:

```powershell
& .\System\scripts\Invoke-OpenAIAgentsSession.ps1 -Live -Environment openai_hosted -InputText "..."
& .\System\scripts\Invoke-OpenAIAgentsSession.ps1 -Live -Environment self_hosted -MultiAgent -InputText "..."
```

4. Store `session_id` from events; continue / steer / delete per docs. Prefer delete after smoke tests.
5. Report paths + whether live ran to The CEO. Never claim completion from a dry-run. Do not live-smoke if the key is missing.

## Mohr Media / Agent Factory

Agent Factory may **propose** Agents API as an option for long-running coding/research inside a pinned customer folder — still local drafts only. Product kit note: `product/AGENTS-API.md`. Factory does not deploy or send.

## Wrapper

Canonical script: `System/scripts/Invoke-OpenAIAgentsSession.ps1`  
Params: `-Environment openai_hosted|self_hosted`, optional `-MultiAgent`, `-DryRun` (default) / `-Live`.
