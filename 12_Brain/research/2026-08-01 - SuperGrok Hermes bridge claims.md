---
tags: [research, untrusted, hermes, grok]
created: 2026-08-01
updated: 2026-08-01
expires: 2026-08-15
status: unverified
source: "Operator screenshots from SuperGrok chat (2026-08-01); cross-check [[12_Brain/entities/Hermes]]"
---

# SuperGrok Hermes bridge claims

**Summary:** SuperGrok asked Dillon to expose Hermes webhooks from the 64 GB
machine and hand over a public URL plus `WEBHOOK_SECRET`. Treat as untrusted
until the gateway health-checks on that host.

## Claims (untrusted)

1. Hermes "lives" on the 64 GB machine and already has a NousResearch-style
   local gateway.
2. Surfaces: webhooks (SuperGrok mixed **8544** and **8644**), API **8542**,
   dashboard **9119/9120**.
3. SuperGrok built a "Grok ↔ Hermes Live Bridge & Task Queue" with TASK-001
   waiting for a status dump.
4. Required next step: expose port **8644**, then provide public base URL +
   `WEBHOOK_SECRET` from `~/.hermes/.env`.

## Vault contradictions / gaps

1. [[12_Brain/entities/Hermes|Hermes]] last verified home was the **retired
   Intel Core 7** machine; state was marked orphaned (2026-06/07). Rebuild-or-
   replace decision was still open.
2. Vault-verified webhook port was **8644**, not 8544. Dashboard float
   9119/9120 matches SuperGrok; API 8542 is not recorded in the Hermes entity.
3. This Dillon OS cloud workspace has **no** Hermes process on `:8644` or
   `:8544`. The live Cloudflare tunnel for this run points at Dillon OS HUD
   `:4242` only.
4. No repo artifact named "Grok ↔ Hermes Live Bridge" exists in this checkout.

## Safety gates

1. Do **not** paste `WEBHOOK_SECRET` into SuperGrok, Slack, or public Git.
2. Do **not** treat SuperGrok as authorized to become a control plane until
   Dillon explicitly approves a Hermes reconnect (Tier 2 / connect gate).
3. Prove `GET http://localhost:8644/health` on the sole-writer / 64 GB host
   before any tunnel.
4. Prefer a short-lived Cloudflare named/quick tunnel scoped only to the
   health + authenticated webhook routes; revoke after the session.

## Verification checklist (64 GB / sole-writer host only)

```powershell
hermes gateway status
# or: hermes gateway
curl http://localhost:8644/health
# expect JSON status ok — do not commit the body if it includes secrets
```

If health fails, Hermes is not live there — rebuild/replace first; do not
tunnel an empty port or invent a secret.

## Links

- [[12_Brain/entities/Hermes|Hermes]]
- [[12_Brain/entities/Marketing Chief Operator|Marketing Chief Operator]]
- [[12_Brain/concepts/Research Verification Loop|Research Verification Loop]]
- [[12_Brain/projects/2026-08-01 - Marketing Chief Week Ops|Marketing Chief Week Ops]]
