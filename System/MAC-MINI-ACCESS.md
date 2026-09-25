# Mac Mini and cloud access

This repository is publicly readable. Dillon confirmed on 2026-09-25 that it should stay public. Keep keys, cookies, runtime volumes, private machine inventories, and new raw client evidence out of this repo.

## Read order

1. Start with [`INDEX.md`](../INDEX.md), [`System/operating-status.md`](operating-status.md), and [`12_Brain/09_Ops/AGENT_PROTOCOL.md`](../12_Brain/09_Ops/AGENT_PROTOCOL.md). Treat dated status as dated evidence.
2. Resolve client work through [`client-operations-canonical/registry/clients.json`](https://github.com/dillonmohr8777/client-operations-canonical/blob/main/registry/clients.json). Its queue and ledgers have a single writer contract.
3. Use the shared [`claude-skills-repo/skills`](https://github.com/dillonmohr8777/claude-skills-repo/tree/main/skills) and this repo's `.agents/skills/` and `.claude/skills/` for actual skill files. Installed Codex plugins are per environment.
4. For MomoBot, read the model menu in [`deer-flow`](https://github.com/dillonmohr8777/deer-flow/blob/main/deploy/momentum/workspace.config.postgres.yaml). Configured models are not proof of live entitlement. Jev is in the separate private [`jev-router`](https://github.com/dillonmohr8777/jev-router) repo. Muse Spark 1.3 is configured in the MomoBot menu and in Jev's router ladder.

## Cloud boundary

A cloud session reads only repositories attached to that environment; it cannot read the Mac's `~/code`, downloads, Keychain, or locally installed plugins by path. Attach the exact repos needed for the task. The original Mac migration kit and full machine access map live in the private [`mac-mini-handoff`](https://github.com/dillonmohr8777/mac-mini-handoff) repo. An authenticated cloud environment must be granted that repo separately.

Use the secret names `OPENROUTER_API_KEY` and, for Jev, `AI_GATEWAY_API_KEY` in the relevant environment's protected secret settings. Never commit their values or paste them into chat. External sends, deployment, spend, account changes, and destructive actions still require Dillon's live approval.
