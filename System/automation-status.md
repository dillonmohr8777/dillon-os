---
tags: [system, automation, health]
last_updated: 2026-07-12
gateway_pid: 20848
---

# Automation Status

## Gateway (2026-07-12 19:45 UTC — Cursor takeover audit)

- Current PID **20848** (restarted 15:16 local after conflict storm). Prior PID 37852 superseded.
- Conflicts: **0/hr** since restart; external poller appears stopped. Monitor via `dillon-gateway-health` cron.
- Heartbeat: **stale ~29m** — state file and log frozen since 19:16:28Z; PID alive. Soft-restart if >30m persists.
- Serve duplicates: **cleared** (0 serve processes observed; was 2 on 2026-07-11).
- Cron jobs verified in `cron/jobs.json`: all 3 `dillon-*` jobs enabled, last_status ok.

## Gateway (2026-07-12 13:01 UTC repair)

- HERMES_HOME: C:\Users\dillo\AppData\Local\hermes
- Config: C:\Users\dillo\AppData\Local\hermes\config.yaml — model default muse-spark-1.1, reasoning xhigh (to be changed to medium per cost control)
- Gateway process after repair:
  - PID 37852 — "C:\Users\dillo\AppData\Roaming\uv\python\cpython-3.11-windows-x86_64-none\pythonw.exe -m hermes_cli.main gateway run"
  - Created: 2026-07-12 13:01:16 (local restart after conflict diagnosis)
  - State file: C:\Users\dillo\AppData\Local\hermes\gateway_state.json — state running, telegram connected (updated_at 2026-07-12T17:01:55)
  - Lock files: gateway.lock / gateway.pid — both now point to 37852 after restart (previous pointed to 33996, created 2026-07-11 23:54:57)
  - Startup method: Startup folder — C:\Users\dillo\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\Hermes_Gateway.vbs (single entry, launches gateway-service VBS)
  - No scheduled task duplicate found
  - No second HERMES_HOME gateway_state.json found in search depth 5 under C:\Users\dillo
  - Token location: single .env file C:\Users\dillo\AppData\Local\hermes\.env contains TELEGRAM_BOT_TOKEN (one instance)
  - Webhook status (via Bot API getWebhookInfo at 2026-07-12): url='' pending=0 — polling mode, no webhook
  - Bot username: DillonHermesAgentBot id 8542609781 (verified via getMe)

- Conflict evidence:
  - First conflict: 2026-07-11 18:54:09 WARNING Telegram polling conflict 1/5 — terminated by other getUpdates
  - Pattern: conflict every ~25s, 1620+ conflicts in last 5000 log lines (continuous from 2026-07-11 18:54 to now)
  - After local cleanup (deleteWebhook drop_pending_updates=true + getUpdates offset -1 drain) and restart at 13:01:52 UTC-4, conflict returned at 13:02:00 within 8s — indicates external second poller still alive (remote deployment, second machine, or test env using same token)
  - Local process evidence after repair: exactly ONE hermes_cli.main gateway run process (PID 37852) — no duplicate local gateway
  - Duplicate serve processes observed: 2x serve (PID 26368 venv and PID 1676 uv) created 2026-07-11 17:41:56 — not owning Telegram but worth deduplicating later to save resources

- Mitigation applied 2026-07-12:
  - Backups: gateway_state.json.bak_20260712_130019, config.yaml.bak_20260712_130019, .env.bak_20260712_130019 under HERMES_HOME
  - API cleanup: deleteWebhook drop_pending_updates=true (result ok=True webhook already deleted) + getUpdates drain offset -1 count 0
  - Stop old gateway PID 33996 force, wait 8s, start new gateway via same detached method as gateway-service
  - New gateway verified running, telegram state connected

- Remaining blocker:
  - External poller impossible to kill from local without token rotation (forbidden per boundaries)
  - Documented for user: locate any VPS/Fly.io/Railway/other laptop running same token; either stop that deployment or rotate token manually via @BotFather outside this task
  - Gateway health monitor cron will continue to report conflicts

## Hermes Cron / Scheduler

- Ticker heartbeat: C:\Users\dillo\AppData\Local\hermes\cron\ticker_heartbeat — last tick ~2026-07-12 17:0x (epoch 1783875...)
- No user jobs before this init (empty cron dir except ticker files)
- After this init, 3 safe jobs to be created (workdir C:\Users\dillo\repos\dillon-os, local-only):
  1. dillon-daily-brief — daily 07:00 local briefing
  2. dillon-gateway-health — every 30m health check
  3. dillon-approval-queue — hourly approval queue consolidation

- Delivery: local-only artifacts in vault + origin interface alert only if safe (no broadcasts)
- Avoid duplicate schedules: job names prefixed dillon-*

## Serve / Desktop

- Serve processes: 2 observed (venv and uv interpreters) — both hermes serve --host 127.0.0.1 --port 0
- Desktop Electron: 5x Hermes.exe processes (release/win-unpacked)
- These serve processes are for dashboard/desktop Chat tab, not for telegram polling
- Recommendation: after Task E, evaluate consolidating to single serve (desktop should launch one)

## Cost Controls (Task D)

- Model: muse-spark-1.1 primary (verified in config.yaml model.default)
- Reasoning: currently xhigh — to be changed to medium per request (ordinary convos medium, explicit xhigh for heavy architecture/audit)
- Provider: custom base_url https://api.meta.ai/v1

## Kanban (Task E)

- Kanban DB exists: C:\Users\dillo\AppData\Local\hermes\kanban.db (116K, exists from 2026-07-11)
- Dispatcher lock: kanban/.dispatcher.lock — held by gateway
- To be initialized with 3 tasks if safe

## Verification Steps Done

- [x] Process evidence collected via Win32_Process CimInstance
- [x] StartupCommand and Startup folder inspected
- [x] No second HERMES_HOME found
- [x] Bot API getWebhookInfo and getMe called (redacted token)
- [x] Backup created before config change
- [x] Gateway stopped and restarted, new PID captured
- [x] Duplicate serve noted
- [ ] External poller remains — requires user action outside boundaries (token rotation or remote shutdown)

## Rollback Locations

- Config backups: C:\Users\dillo\AppData\Local\hermes\config.yaml.bak_20260712_130019
- Env backup: C:\Users\dillo\AppData\Local\hermes\.env.bak_20260712_130019
- Gateway state backup: gateway_state.json.bak_20260712_130019
- To rollback: stop gateway PID 37852, restore config/.env if changed, restart via Startup VBS
