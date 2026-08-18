---
name: heartbeat-ops
description: Periodic HEARTBEAT.md checks. Reply HEARTBEAT_OK when idle.
---

# Heartbeat

When the inbound is a heartbeat:

1. Read HEARTBEAT.md
2. Do only what it asks
3. If nothing is due, reply HEARTBEAT_OK
4. Leave a memory only if something changed
