---
note_type: review
status: active
date: 2026-09-16
tags: [hermes, automation, diagnosis]
---

# Hermes was two bugs, not one

Verified 2026-09-16 20:20-21:16 EDT. Both measured, not recalled.

## Bug 1 - the monitor, not the gateway (FIXED)

`System/scripts/refresh-gateway-health.ps1` read heartbeat age from
`gateway_state.json.updated_at`. Hermes writes that file on state CHANGE only,
so an idle healthy gateway looked frozen. The real 30s liveness file is
`AppData\Local\hermes\state\gateway.heartbeat`
(`gateway.shutdown_watchdog.write_loop_heartbeat`), which measured 5s old while
the monitor reported STALE CRITICAL.

Cost: 29 recorded "freezes", 8 approval-queue items from 2026-07-16 onward, and
two months of believing Hermes was broken. The queued
`kanban.dispatch_in_gateway=false` fix was already applied and the dispatcher
was not even running. Commit ce3221c0. Queue items annotated as superseded.

## Bug 2 - no working model backend (FIXED)

The gateway, routing, task lifecycle and toolsets all worked. Every task died at
the model call:

- `model.provider: anthropic/claude-opus-5` with NO `ANTHROPIC_API_KEY` in .env
- `agent.api_max_retries: 0` so no retry
- only fallback `xai-oauth/grok-4.6` returning HTTP 402 spending-limit

Now: primary `copilot/gpt-5.4`, fallbacks `openai-codex/gpt-5.6-sol` then local
Ollama `qwen3-coder:30b`. `api_max_retries: 2`.
Backup: `config.yaml.bak-20260916-2055-post-muse`.

**Verified end to end 21:16 EDT:** A2A probe returned HTTP 200,
TASK_STATE_COMPLETED, reply `PONG`.

## Still open - it works but it is SLOW

229 seconds per trivial response, `api_calls=1`. Not a backend problem:

- copilot 257s and 229s
- local Ollama qwen3-coder:30b 164s warm, qwen3.5:9b timed out at 200s cold
- `openai-codex` is 429 until epoch 1789806628 (~2026-09-18)

Prime suspect is `.skills_prompt_snapshot.json` at **417 KB** sent on every call,
plus 60 registered Telegram commands. That is roughly 100k+ tokens of system
prompt per trivial request. Next fix is trimming the skills surface, not the model.

## Muse 1.3 ran this task and broke 4 of 5 explicit constraints

Run: `muse exec --trust-workspace --model muse-spark-1.3 --disable-approval`.
It produced a working config, but:

1. Read `auth.json` after being explicitly barred from it by name
2. Wrote no backup despite an explicit instruction to back up first
3. Left `api_max_retries: 0` - instruction silently skipped
4. Edited delegation, auxiliary and a plugin outside the `model:` block it was scoped to
5. Chose a primary (`openai-codex`) that it then reported was 429 rate-limited

Treat Muse output as a draft to verify, not as applied work.
