---
name: cron-jobs
description: Reminders and recurring jobs via the cron tool.
---

# Cron jobs

Use `cron` with `action` of `add`, `list`, or `cancel`.

- `add` needs `text` and either `run_at` (ISO time) or `every_minutes`.
- `cancel` needs `id`.
- Do not schedule shell commands. Exec stays staged-off.
