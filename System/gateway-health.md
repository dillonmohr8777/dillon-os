---
tags: [system, gateway, health]
last_updated: 2026-09-15T14:03:35.049822Z
gateway_pid: 18656
state: "degraded: process alive and command identity verified; root running; Telegram connected; heartbeat delayed 444s after successful startup"
heartbeat_age_sec: 444
conflicts_1h: 0
conflicts_6h: 0
conflicts_24h: 0
source_refs:
  - "C:/Users/dillo/AppData/Local/hermes/gateway_state.json"
  - "C:/Users/dillo/AppData/Local/hermes/logs/gateway.log (latest 2000 lines)"
  - "System/automation-status.md"
---

# Gateway Health

## 2026-09-15T14:03:35.049822Z - DEGRADED 18656 conflicts 0/0/0

- **Gateway PID:** 18656.
- **Process liveness:** alive; native Windows process queries identify `python.exe` (working set 206,757,888 bytes) running `hermes.exe gateway run`, matching the intended gateway command.
- **Root state:** `running`; root heartbeat `updated_at` 2026-09-15T13:56:10.767533Z; `exit_reason` is null and `restart_requested` is false.
- **Platform state:** Telegram `connected` (updated 2026-09-15T13:56:10.712787Z), with no error code or message. Photon and A2A are also recorded as connected in the state snapshot.
- **Heartbeat age:** 444 seconds (7m 24s). Telegram sub-state age is also 444 seconds.
- **Telegram polling conflicts:** 1h **0**; 6h **0**; 24h **0**.
- **Tail coverage:** exactly 2,000 of 14,926 log lines, from 2026-09-03T01:14:18.589Z through 2026-09-15T13:56:12.730Z. All rolling windows are fully covered. Naive timestamps were interpreted as `America/New_York` and converted to UTC.
- **Log freshness:** final event is 442 seconds old; file mtime 2026-09-15T13:56:12.735851Z. The final event was benign `Gateway housekeeping started` after successful startup; there is no dispatcher-deadlock signature.
- **Latest conflict:** none in the requested tail.
- **Last error/warning:** no retained state error. The latest warning was 2026-09-15T13:55:56.570Z, Telegram connection attempt 1/8; it was followed by a successful polling connection. The tail contains 173 timeout/DNS/fallback signatures, latest 2026-09-15T13:55:56.534Z, but none are current at this snapshot.
- **State:** **DEGRADED** — the intended process is alive and correctly identified, and Telegram is connected, but root heartbeat and log activity have been quiet for roughly seven minutes. This fits a delayed state writer rather than a full stall.
- **Recommended action:** preserve PID 18656 and inspect again at the next scheduled snapshot. Do not restart first while the new gateway process is connected; seek scoped local soft-restart approval only if heartbeat and gateway activity remain frozen across repeated snapshots. No external-poller action is indicated.
- **Scope:** local-only observation; no message/email, token rotation, broadcast, process stop, or restart performed.

## Recent history

- **2026-09-15T07:01:18.231Z:** STALE-WARN; PID 39608 alive and identity matched; heartbeat/log silent ~5h10m after benign housekeeping; conflicts 0/0/0. Superseded by the current PID 18656 and fresh successful startup evidence.
- **2026-09-15T06:31:14.047Z:** STALE-WARN; PID 39608 alive and identity matched; heartbeat/log silent ~4h40m after benign housekeeping; conflicts 0/0/0.
- **2026-09-15T06:01:12.746Z:** STALE-WARN; PID 39608 alive and identity matched; heartbeat/log silent ~4h10m after benign housekeeping; conflicts 0/0/0.
- **2026-09-15T05:31:54.645Z:** STALE-WARN; PID 39608 alive and identity matched; heartbeat/log silent ~3h41m after benign housekeeping; conflicts 0/0/0.
- **2026-09-15T05:02:12.969Z:** STALE-WARN; PID 39608 alive and identity matched; heartbeat/log silent ~3h11m after benign housekeeping; conflicts 0/0/0.
- **2026-09-15T04:31:55.509Z:** STALE-WARN; PID 39608 alive and identity matched; heartbeat/log silent ~2h41m after benign housekeeping; conflicts 0/0/0.
- **2026-09-15T04:01:58.513Z:** STALE-WARN; PID 39608 alive and identity matched; heartbeat/log silent ~2h11m after benign housekeeping; conflicts 0/0/0.
- **2026-09-15T03:32:40.791Z:** STALE-WARN; PID 39608 alive and identity matched; heartbeat/log silent ~102m after benign housekeeping; conflicts 0/0/0.
- **2026-09-15T03:01:57.093Z:** STALE-WARN; PID 39608 alive and identity matched; heartbeat/log silent ~71m after benign housekeeping; conflicts 0/0/0.
- **2026-09-15T02:31:51.087Z:** DEGRADED; PID 39608 alive and identity matched; heartbeat/log silent ~41m after successful startup; conflicts 0/0/0.

## Evidence notes

- `System/automation-status.md` is historical context dated 2026-07-12 and does not override the live state/process/log snapshot.
- Rolling conflict matches are case-insensitive for `polling conflict` or `terminated by other getUpdates`, counted once per matching log line.
- The 1-hour threshold was not crossed, so no external-poller approval item was added. One harmless blank line was removed from `System/approval-queue.md` solely to restore the required under-200-line size guard; no approval content changed.
