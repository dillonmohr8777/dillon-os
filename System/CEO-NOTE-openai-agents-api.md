# CEO note — OpenAI Agents API wiring (updated 2026-09-10)

Integrated as an **optional managed Codex harness** on the agent operating surface. Does **not** replace The CEO conversation, Hermes, OmniRoute, Cursor CloudAgent, or Marketing Chief. No client sends.

Official overview: https://developers.openai.com/api/docs/guides/agents-api/overview

## Docs facts (exact)

- **Harness:** OpenAI manages sessions, orchestration, context compaction, recovery. App provides tools + chooses execution environment.
- **Pricing:** model @ API rates; tools @ standard rates; `openai_hosted` sandboxes @ container rates.
- **Concepts:** Agent · Environment · Session · Events/items.
- **Flow:** create session → task → stream/webhooks → continue/steer.
- **Harness capabilities:** sandbox cmds, skills, MCP/tools, steer, context summarize, subagents, resume.
- **Example config:** model `gpt-6-astra`; tools `programmatic_tool_calling`, `mcp` (openai_docs http), `web_search`; `multi_agent.enabled` with `max_concurrent_subagents: 4`.
- **Environments:** `openai_hosted` **or** `self_hosted` (`workspace_directory` + `capability_directories`).
- **API:** header `OpenAI-Beta: agents=v1`; `POST https://api.openai.com/v1/agents/sessions`.
- **Data:** US residency only; **NO ZDR** (`self_hosted` does **not** make ZDR-eligible).
- **Showcase apps (docs):** sev-bot / incident response, Slack bot, data analyst, GitHub issue investigator, document reviewer.

## When to use — matrix

| Job | Prefer | Why |
|---|---|---|
| Dillon ↔ The CEO; gates; triage | **Grok CEO** | Standing conversation; no Agents spend |
| Local vault / docs / scripts | **Cursor / local Shell** | Reversible; no spend |
| Repo PR/branch cloud coding | **Cursor CloudAgent** | Existing SCM → branch/PR path |
| Local Hermes worker / Telegram / cron | **Hermes** `:9900` | Already live on DESKTOP-4AHKEC4 |
| Model routing / free tiers | **OmniRoute** `:20128` | Gateway, not a session harness |
| Durable coding/research in managed Codex sandbox | **Agents API** | Sessions + compaction + recovery + subagents |
| Client send/post/publish/spend | **Never via Agents API alone** | Draft/stage only unless exact CEO yes |
| Momentum client-ops / Mohr Media outbound Slack | **Forbidden** | See Mohr Media `FORBIDDEN.md` |

## How specialists should treat it

- Operator / Hunter / Outbound / Closer: ignore unless CEO hands a coding/research subtask that explicitly names Agents API.
- Agent Factory: may cite `product/AGENTS-API.md` when proposing long-running coding/research employees after a pin — local drafts only.
- All: dry-run first; live needs key + spend yes. Never print the full key.

## Operator paths

- Skill: `.agents/skills/openai-agents-api/SKILL.md`
- Wrapper: `System/scripts/Invoke-OpenAIAgentsSession.ps1`
  - `-Environment openai_hosted|self_hosted`
  - optional `-MultiAgent` (docs tools + max_concurrent_subagents 4)
  - default `-DryRun`; `-Live` only with key + spend yes

```powershell
& .\System\scripts\Invoke-OpenAIAgentsSession.ps1 -DryRun -Environment openai_hosted
& .\System\scripts\Invoke-OpenAIAgentsSession.ps1 -DryRun -Environment self_hosted -MultiAgent
```

## Secret status

`OPENAI_API_KEY` is set as **User** env on DESKTOP-4AHKEC4 (source file `C:\Users\dillo\.secrets\openai_api_key`, chmod-equivalent locked). Box copy: `/home/box/.secrets/openai_api_key`. Never paste into chat. Grant `api.agents.read`, `api.agents.write`, `api.responses.write`.

## Live smoke result (2026-09-10 ~6:30 PM ET)

- **Env:** User `OPENAI_API_KEY` set on DESKTOP-4AHKEC4 from `C:\Users\dillo\.secrets\openai_api_key` — SET_OK last4=7LYA (full key never printed).
- **Session:** `sess_02ddc50ec7cb632e006aa32f3cd2d481919e452ba6f9468a7b`
- **Model / env:** `gpt-6-astra` + `openai_hosted`
- **Outcome:** Turn completed; status went `in_progress` → `idle`. Agent created `outputs/tree.py`, ran it, returned directory tree including `tree.py`. No 401/403.
- **Turn:** `turn_02ddc50ec7cb632e006aa32f4697a08191b27075b39b315a05` status=completed
- **Cleanup:** DELETE session → `deleted: true` (confirmed 404 on subsequent GET).
- **Scopes:** api.agents.read/write worked for GET session/turns/items and DELETE. No client sends.
