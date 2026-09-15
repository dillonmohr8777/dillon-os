---
note_type: concept
status: active
created: 2026-09-10
updated: 2026-09-10
tags:
  - agents
  - openai
  - harness
verification_status: verified
source_refs:
  - "https://developers.openai.com/api/docs/guides/agents-api/overview"
  - "https://developers.openai.com/api/docs/guides/agents-api/quickstart"
  - "12_Brain/01_Captures/2026-09-10 - openai-agents-api-integration.md"
---

# OpenAI Agents API

Managed Codex harness exposed as an API (public beta 2026-09-10).

## Fit in Dillon's stack

| Harness | Role | Agents API fit |
|---|---|---|
| The CEO (Grok Bot) | Only human conversation surface | Does **not** replace; may *delegate* long coding/research jobs |
| Cursor / CloudAgent | Local + PR coding | Prefer for repo PR work; Agents API for hosted sandbox sessions |
| Hermes `:9900` | Local gateway / Telegram / cron worker | Keep; do not replace with Agents API |
| OmniRoute `:20128` | Model router / free tiers | Complementary; not a session harness |
| Mohr Media Agent Factory | Builds AI-employee kits (files only) | May offer Agents API as an install option for long-running coding/research agents |
| Marketing Chief / client-operations | Canonical client queue | Out of scope for Agents API product wiring |

## Auth

Application API key needs `api.agents.read`, `api.agents.write`, `api.responses.write`. Header `OpenAI-Beta: agents=v1`. Secret: User env `OPENAI_API_KEY` per `System/api-keys-setup.md` — never paste into chat.

## Operator artifacts

- Skill: `.agents/skills/openai-agents-api/SKILL.md`
- Wrapper: `System/scripts/Invoke-OpenAIAgentsSession.ps1` (dry-run default)
