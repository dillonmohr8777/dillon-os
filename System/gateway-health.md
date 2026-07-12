---
tags: [system, gateway, health]
last_updated: 2026-07-12T20:31:22Z
gateway_pid: 20848
state: running (heartbeat stale 75m)
heartbeat_age_sec: 4520
conflicts_1h: 0
conflicts_6h: 0
conflicts_24h: 2251
---

# Gateway Health
> Local-only health report. No broadcasts. Latest at top.

## 2026-07-12T20:31:22Z - WARN Heartbeat Stale 75m, 0/hr Conflicts (external poller stopped)
- **timestamp:** 2026-07-12T20:31:22Z (2026-07-12 16:31:22 EDT) - local-only cron dillon-gateway-health
- **gateway_pid:** 20848 - ALIVE pythonw.exe WS 188MB StartTime 15:16:02 local (verified via Get-Process)
- **state file:** `C:\Users\dillo\AppData\Local\hermes\gateway_state.json` 437B mtime 15:16:21 local / 19:16:21Z frozen
  - `gateway_state`: running / exit_reason null / restart_requested false / active_agents 0
  - `updated_at`: 2026-07-12T19:16:21.840704+00:00 - age **4520s (75.3m)** STALE CRITICAL (healthy <120s)
  - `telegram.state`: connected / error_code null / error_message null / updated_at 19:16:21.798253Z
- **log:** `C:\Users\dillo\AppData\Local\hermes\logs\gateway.log` 1,017,021 bytes mtime 15:16:28 local / 19:16:28Z frozen 74.9m
  - last lines: kanban dispatcher holding lock + embedded 60s - no errors after restart
  - restart marker: `2026-07-12 15:16:19 Starting Hermes Gateway` + polling mode + telegram connected
  - total conflicts in file: 2251 since 2026-07-11 18:54:09 first WARNING
- **conflict counts (polling conflict | terminated by other getUpdates):**
  - **1h: 0** - OK (threshold 10/hr) - no conflicts since 15:16 restart, 75m clean
  - **6h: 0** strict window >=10:31 EDT (>=14:31Z) - OK; line 4592+ shows 0
  - **24h: 2251** - historical total, all 2026-07-11 18:54 to 2026-07-12 14:33:04
  - after restart line 4592: **0 conflicts** confirmed
- **last error:** `2026-07-12 14:33:04 WARNING Telegram polling conflict (1/5) - terminated by other getUpdates` - last before restart, none after
- **recommended action (DO NOT rotate tokens, DO NOT broadcast):**
  1. External poller appears STOPPED since 15:16 restart (0/hr for 75m vs prev 139/hr). No approval-queue escalation this run.
  2. Heartbeat stale 75m despite PID alive - writer frozen since restart. PID not exiting but not updating state.json or gateway.log. Likely buffered I/O hang or eventloop stall.
  3. Soft-restart recommended now (low-risk): kill PID 20848 via external shell, wait 8s, run Startup Hermes_Gateway.vbs, verify updated_at <60s and log new Starting.
  4. If restart still freezes, check kanban lock `kanban\.dispatcher.lock` + disk space + AV.

## 2026-07-12T20:00:58Z - WARN Heartbeat Stale 44.6m, 0/hr Conflicts
- pid 20848 ALIVE 180MB, state running mtime frozen 19:16:28Z age 2676s, log 1017021B mtime 19:16:28Z frozen, conflicts 1h0 6h143 24h2251, last error 14:33:04 conflict, rate 0/min post-restart

## 2026-07-12T19:57:33Z - WARN Gateway Probe
- pid 20848 ALIVE WS 180.8MB, updated_at 19:16:21Z age 41m stale, telegram connected, log 1017021B, conflicts 1h0 6h631 24h2251

## 2026-07-12 19:45:15 UTC - 0/hr Conflicts Hold; Heartbeat 28.9m Stale
- pid 20848 ALIVE, updated_at 19:16:21Z age 1734s stale, telegram connected, log frozen 15:16:28 local, conflicts 0/672/2251, serve 0

## 2026-07-12 19:31:30 UTC - RECOVERED 0/hr, Heartbeat 14.9m Stale After Restart
- pid 20848 ALIVE, updated_at 19:16:21Z age 896s stale improved from 119m, log 1,017,021B mtime 15:16:28 frozen, conflicts total 2251 1h0 recovered from 139/hr

## 2026-07-12 19:01:04 UTC - CRITICAL External Poller 139/hr + Heartbeat Stale 119m
- pid 37852 ALIVE heartbeat 7149s stale frozen since 13:01, log mtime 14:33:25 last conflict 14:33:04 looping 26s, conflicts 1h139 6h826 24h2251

## 2026-07-12 18:32:15 UTC - CRITICAL 139/hr + Stale 90m
- pid 37852 ALIVE heartbeat 5414s stale conflicts 1h139 6h826 24h2248

## 2026-07-12 18:01:27 UTC - CRITICAL 138/hr + Stale 59m
- pid 37852 145M stale 59.9m conflicts 1h138 6h826 24h2178

## 2026-07-12 17:31:11 UTC - CRITICAL 136/hr + Stale 29m
- pid 37852 144M heartbeat 1756s stale 1h136 6h827 24h2108 rate 1/26s

## 2026-07-12 13:01 UTC - Repair Reference
- PID 37852 started after deleteWebhook+getUpdates drain. Conflict returned in 8s - proved external.
- Backups: *.bak_20260712_130019 under HERMES_HOME. Bot DillonHermesAgentBot 8542609781 webhook '' polling
