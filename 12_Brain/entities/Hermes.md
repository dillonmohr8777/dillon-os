---
tags: [entity, tool]
source: "[[12_Brain/private/raw/2026-06-26 - intel-core-7-master-operating-transfer]]"
updated: 2026-07-04
---

# Hermes

Local worker agent that ran on the (now retired) Intel Core 7 machine — that machine was Hermes' authoritative home for auth/provider state, so **Hermes state is effectively orphaned** until rebuilt.

Last verified state (2026-06): 12 active cron jobs, 3 local webhook routes (localhost:8644), GitHub-comment/Telegram/Slack delivery targets, OpenAI Codex provider on `gpt-5.5`. Slack auth broken (`invalid_auth`); email/SMS/Discord/WhatsApp/Signal never configured. OpenRouter Fusion free profile live, priority profile staged pending credits. Dashboard port floated between 9119/9120 (rediscover each time); `Frontend not built` = `npm run build`.

Runs inside **Orgo** ("Hermes Agent Desktop") — the environment that also hosted the vault→Google Docs ingest (66 native Docs, index prefix `Dillon OS Hermes Orgo Vault -`).

Decision needed: rebuild Hermes elsewhere or let this vault's loops replace it.

## Links
- [[12_Brain/entities/Codex Workspace (Legacy)|Codex Workspace (Legacy)]] · [[12_Brain/concepts/Google Docs Sharding Pattern|Google Docs Sharding Pattern]]
