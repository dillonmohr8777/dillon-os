---
name: spawn-tasks
description: Hand long work to a background subagent with spawn.
---

# Spawn tasks

If a job will take a while (multi-step search, a pile of files), call `spawn`
with a clear `task`. The subagent gets its own session. It can leave a result
with `message`.

Do not spawn for a one-line answer.
