---
tags: [entity, tool]
source: "[[12_Brain/raw/2026-06-26 - intel-core-7-master-operating-transfer]]"
updated: 2026-08-01
---

# Hermes

**Summary:** local worker agent whose last verified home was the retired
Intel Core 7 machine — auth/provider state is orphaned until rebuilt or
replaced. SuperGrok's 2026-08-01 "lives on the 64 GB machine" claim is
unverified.

## Last verified facts (2026-06)

- 12 active cron jobs; 3 local webhook routes on `localhost:8644`
- Delivery targets: GitHub comments / Telegram / Slack
- Provider: OpenAI Codex on `gpt-5.5`
- Slack auth broken (`invalid_auth`); email/SMS/Discord/WhatsApp/Signal never configured
- OpenRouter Fusion free profile live; priority profile staged pending credits
- Dashboard port floated between 9119/9120 (rediscover each time); `Frontend not built` = `npm run build`
- Ran inside **Orgo** ("Hermes Agent Desktop") with vault→Google Docs ingest
  (66 native Docs, index prefix `Dillon OS Hermes Orgo Vault -`)

## 2026-08-01 status check

1. Dillon OS cloud workspace: nothing listens on `:8644` or `:8544`.
2. Live tunnel for this cloud run exposes Dillon OS HUD `:4242` only — not Hermes.
3. SuperGrok asked to expose webhooks + hand over `WEBHOOK_SECRET`. That is a
   Tier-2 connect gate. Do not paste the secret into SuperGrok or public Git.
   Evidence page: [[12_Brain/research/2026-08-01 - SuperGrok Hermes bridge claims|SuperGrok Hermes bridge claims]].

## Decision still open

Rebuild Hermes on the 64 GB / sole-writer host, or let Dillon OS
(`12_Brain` + `_os/automation`) replace it.

## Links

- [[12_Brain/entities/Codex Workspace (Legacy)|Codex Workspace (Legacy)]]
- [[12_Brain/concepts/Google Docs Sharding Pattern|Google Docs Sharding Pattern]]
- [[12_Brain/entities/Marketing Chief Operator|Marketing Chief Operator]]
- [[12_Brain/research/2026-08-01 - SuperGrok Hermes bridge claims|SuperGrok Hermes bridge claims]]
