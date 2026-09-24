---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-09-19T18:26:28
session_last: 2026-09-19T18:26:28
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-09-19\fix"
tags: [codex-recovery, session, 202609]
---

# Documents\Codex\2026-09-19\fix

**1 session(s)** · 2026-09-19 18:26 → 2026-09-19 18:26 · 6.3h agent-time (summed; sessions may overlap) · 5 MB transcript · 1/1 turns completed

## 1. 2026-09-19 18:26 · 6.3h · 5.0 MB

`01a0baeb-7793-7063-9cf9-bc639187c373` · turns 1/1

**Asked:**

> Fix

**Outcome reported:**

> Fixed. [config.toml](C:/Users/dillo/.codex/config.toml:146) now explicitly sets `max_concurrent_threads_per_session = 8` under `[agents]`, matching [OpenAI’s documented multi-agent example](https://developers.openai.com/codex/agent-configuration/subagents).
> 
> Verified live: two subagents ran concurrently, completed, and were stopped. The hard one-thread cap is gone. Already-running older tasks may retain their startup configuration; fresh tasks inherit the eight-worker limit.
> 

<sub>rollout: `C:\Users\dillo\.codex\sessions\2026\09\19\rollout-2026-09-19T14-26-28-01a0baeb-7793-7063-9cf9-bc639187c373.jsonl`</sub>
