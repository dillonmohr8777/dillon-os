---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-07-31T21:33:51
session_last: 2026-07-31T21:33:51
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-07-31\figure-out-how-to-properly-update"
tags: [codex-recovery, session, 202607]
---

# Documents\Codex\2026-07-31\figure-out-how-to-properly-update

**1 session(s)** · 2026-07-31 21:33 → 2026-07-31 21:33 · 43m agent-time (summed; sessions may overlap) · 2 MB transcript · 1/1 turns completed

## 1. 2026-07-31 21:33 · 43m · 1.7 MB

`019fba19-0bca-7c40-9d0d-c8f377957041` · turns 1/1

**Asked:**

> for Codex:
> 
> Figure out how to properly update Hermes take over make it the very latest with the telegram worker pls and cursor they should both have their chats show up in Hermes :) make sure this Hermes desktop app has full access to all nous models like the telegram worker

**Outcome reported:**

> Hermes takeover and upgrade completed.
> 
> - Updated from `v0.18.2` to latest `v0.19.1`, commit `e444d165`.
> - Rebuilt Hermes Desktop after upgrading npm to supported `12.0.2`.
> - Telegram gateway is running and connected; Dillon’s DM is configured as the home channel.
> - Cursor private worker and control bridge are running.
> - Verified both Telegram and Cursor-controlled conversations appear in Hermes’s shared session store.
> - Refreshed Nous Portal access: 288 models available, including Kimi K3, Muse Spark, Claude, GPT, Gemini, Grok, DeepSeek, and Qwen.
> - Desktop is running in the background with the same configuration, credentials, models, memory, and session history as the CLI/gateway, matching the [official desktop architecture](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/desktop.md).
> - `hermes update --check` reports already up to date.
> 
> Rollback protection remains at `C:\Users\dillo\AppData\Local\hermes\backups\pre-update-2026-07-31-173803.zip`, and the earlier checkout changes remain preserved in Git stash.
> 

<sub>rollout: `C:\Users\dillo\.codex\archived_sessions\rollout-2026-07-31T17-33-51-019fba19-0bca-7c40-9d0d-c8f377957041.jsonl`</sub>
