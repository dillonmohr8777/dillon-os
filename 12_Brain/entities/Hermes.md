---
tags: [entity, tool]
source: "[[12_Brain/raw/2026-06-26 - intel-core-7-master-operating-transfer]]"
updated: 2026-08-01
---

# Hermes

Hermes remains retired; client X research runs through the gated direct xAI collector unless a separately reviewed rebuild is approved.

Local worker agent that ran on the (now retired) Intel Core 7 machine — that machine was Hermes' authoritative home for auth/provider state, so **Hermes state is effectively orphaned** until rebuilt.

Last verified state (2026-06): 12 active cron jobs, 3 local webhook routes (localhost:8644), GitHub-comment/Telegram/Slack delivery targets, OpenAI Codex provider on `gpt-5.5`. Slack auth broken (`invalid_auth`); email/SMS/Discord/WhatsApp/Signal never configured. OpenRouter Fusion free profile live, priority profile staged pending credits. Dashboard port floated between 9119/9120 (rediscover each time); `Frontend not built` = `npm run build`.

Runs inside **Orgo** ("Hermes Agent Desktop") — the environment that also hosted the vault→Google Docs ingest (66 native Docs, index prefix `Dillon OS Hermes Orgo Vault -`).

Current decision: use [[12_Brain/projects/2026-08-01 - Client-scoped Grok marketing OS|the client-scoped direct xAI pipeline]]. Hermes subscription OAuth and read-only X search are documented capabilities, but the local worker remains orphaned and OAuth can fail on provider allowlisting. A rebuild must pass the existing connector and approval gates rather than inheriting old state.

Official references: [xAI Hermes connection](https://x.ai/news/grok-hermes) · [Hermes X Search](https://hermes-agent.nousresearch.com/docs/user-guide/features/x-search)

## Links
- [[12_Brain/entities/Codex Workspace (Legacy)|Codex Workspace (Legacy)]] · [[12_Brain/concepts/Google Docs Sharding Pattern|Google Docs Sharding Pattern]]
