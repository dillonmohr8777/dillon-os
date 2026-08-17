---
tags: [system, gateway, health]
last_updated: 2026-08-17T13:31:06.524Z
gateway_pid: 12144
state: "STALE-WARN / gateway process alive and identity verified / heartbeat stale 6h 34m 41s and log stale 5h 31m 40s / Telegram disconnected"
heartbeat_age_sec: 23681
conflicts_1h: 0
conflicts_6h: 0
conflicts_24h: 0
source_refs: ["C:/Users/dillo/AppData/Local/hermes/gateway_state.json", "C:/Users/dillo/AppData/Local/hermes/logs/gateway.log (latest 2,000 lines)", "System/automation-status.md"]
---

# Gateway Health Log

## 2026-08-17T13:31:06.524Z - STALE-WARN PID 12144 conflicts 0/0/0

- **Gateway PID:** `12144` is alive (`python.exe`, working set `437514240` bytes); command identity is verified as `hermes.exe gateway run`.
- **State:** root `running`; Telegram `disconnected`; root heartbeat updated at `2026-08-17T06:56:25.644Z`.
- **Heartbeat age:** `23681s` (6h 34m 41s), calculated from root `updated_at` using the single UTC snapshot above.
- **Telegram state age:** `399289s` (4d 14h 54m 49s), from platform `updated_at` `2026-08-12T22:36:17.497Z`; retained error code/message are empty.
- **Polling conflicts:** **1h 0 / 6h 0 / 24h 0**. Counts use case-insensitive matches for `polling conflict` or `terminated by other getUpdates`, counting each matching line once.
- **Required log tail:** exactly 2,000 lines, spanning `2026-08-11T02:23:09.960Z` to `2026-08-17T07:59:26.772Z` (149.605h); all rolling windows are fully covered. Final event/file mtime age: `19900s` (5h 31m 40s); file mtime `2026-08-17T07:59:26.775Z`.
- **Latest conflict:** none in the required 2,000-line tail and none in any rolling window.
- **Last error:** latest warning/error is `2026-08-16T23:34:45.510Z`: lifecycle ledger reports prior PID `34212` exited uncleanly. The tail has 103 WAN-signature lines, but the latest is historical (`2026-08-14T18:16:30.690Z`) and does not coincide with this snapshot.
- **Classification:** **STALE-WARN** because PID `12144` is alive and verified, but both root heartbeat and gateway log are stale beyond 60 minutes. The final log event is benign agent-cache housekeeping, not a dispatcher-deadlock signature or Telegram retry loop. Telegram remains disconnected with a stale platform sub-state, and there is no current polling-conflict storm.
- **Recommended action:** keep PID `12144` running while inspecting the stalled state writer/logger and disconnected Telegram adapter locally. Repeated snapshots remain frozen; request a scoped local soft restart only after confirming no external poller is active, then verify heartbeat and log advancement. **Do not rotate tokens. Do not broadcast.**
- **Approval queue:** no external-poller item added because conflicts are `0/h`, below the `>10/h` threshold; `System/approval-queue.md` remains unchanged by this run.
- **Scope:** local-only observation; no restart, stop, token rotation, broadcast, email, or message was performed.

## Recent history

- `2026-08-17T13:01:25.964Z`: PID 12144 alive and verified; heartbeat stale 6h 05m 00s and log stale 5h 01m 59s, Telegram disconnected, conflicts 0/0/0.
- `2026-08-17T12:31:11.762Z`: PID 12144 alive and verified; heartbeat stale 5h 34m 46s and log stale 4h 31m 44s, Telegram disconnected, conflicts 0/0/0.
- `2026-08-17T12:01:11.358Z`: PID 12144 alive and verified; heartbeat stale 5h 04m 45s and log stale 4h 01m 44s, Telegram disconnected, conflicts 0/0/0.
- `2026-08-17T11:31:12.117Z`: PID 12144 alive and verified; heartbeat stale 4h 34m 46s and log stale 3h 31m 45s, Telegram disconnected, conflicts 0/0/0.
- `2026-08-17T11:03:17.998Z`: PID 12144 alive and verified; heartbeat stale 4h 06m 52s and log stale 3h 03m 51s, Telegram disconnected, conflicts 0/0/0.
