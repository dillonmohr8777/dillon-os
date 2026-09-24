---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-08-13T20:00:58
session_last: 2026-08-13T20:00:58
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-08-13\https-x-com-cerebras-status-2087961128869748856"
tags: [codex-recovery, session, 202608]
---

# Documents\Codex\2026-08-13\https-x-com-cerebras-status-2087961128869748856

**1 session(s)** · 2026-08-13 20:00 → 2026-08-13 20:00 · 10m agent-time (summed; sessions may overlap) · 2 MB transcript · 2/2 turns completed

## 1. 2026-08-13 20:00 · 10m · 1.8 MB

`019ffcb6-af33-78f0-a5d7-64bcc5aef376` · turns 2/2

**Asked:**

> https://x.com/cerebras/status/2087961128869748856?s=46 Looks like we should adopt this, question mark?

> Maybe for this too https://www.tiktok.com/t/ZP8nKNvxw/ apparently better than Hermes? Analyze both links. I want you to consider how these affect our stock side. Shut up. Come on. I would like to see like if this is a better harness, I guess, instead of Hermes or just like a better overall than Hermes like it's saying.

**Outcome reported:**

> Bottom line: adopt Cerebras Ultrafast when we receive access, but do not replace Hermes with Atomic Agent yet. Atomic merits a controlled canary, not a migration.
> 
> | Technology | What it actually is | Decision |
> |---|---|---|
> | Cerebras Ultrafast | A faster inference tier for GPT‑5.6 Sol, not an agent harness | Adopt selectively |
> | Atomic Agent | A competing local-first harness | Test beside Hermes |
> | Hermes | Our active continuity, scheduling, delegation, and gateway runtime | Keep in production |
> 
> The Cerebras demonstration completed the same financial-dashboard prompt in 1:50 versus 12:20. OpenAI describes Ultrafast as up to 750 output tokens/second and 14× Standard speed, but it is API-first and currently limited to selected customers. It could accelerate either Hermes, Atomic, or our direct Codex workflows; it does not replace their scheduling, memory, tools, or safety controls. [OpenAI Ultrafast announcement](https://openai.com/index/previewing-ultrafast/), [Cerebras technical announcement](https://www.cerebras.ai/blog/accelerating-gpt-5-6-sol-ultrafast-with-openai).
> 
> Our machine is already on Codex CLI 0.145.0 with GPT‑5.6 Sol and ordinary fast mode enabled. There is no Ultrafast entitlement or selector exposed locally yet.
> 
> Atomic’s evidence is promising but incomplete:
> 
> - Its developer-run GAIA Level 1 test reports 69.8% accuracy versus Hermes at 58.5%, with average task time of 217 versus 351 seconds. [Reproducible benchmark write-up](https://github.com/AtomicBot-ai/atomic-agent/blob/main/eval-agents/docs/GAIA-L1-EXPERIMENT.md)
> - That was one randomly seeded 53-task run on an Apple M4 Max using a quantized 35B model. Atomic also had an embedding service; Hermes used its uncontrolled default temperature.
> - It was not a stock-analysis, scheduling, recovery, security, or long-horizon production benchmark.
> - Atomic remains labeled Developer Preview. Its documentation warns that secret redaction and environment filtering are not complete isolation boundaries. [Atomic Agent repository](https://github.com/AtomicBot-ai/atomic-agent)
> - This Windows machine has 64 GB RAM but only Intel UHD 630 graphics. It cannot reproduce the showcased 35B local-model performance economically.
> - Hermes currently runs here at v0.20.0 and still has broader production capabilities: subagents, several communication channels, multiple execution backends, scheduling, and deeper operational monitoring. [Current Hermes capabilities](C:/Users/dillo/AppData/Local/hermes/hermes-agent/README.md:19)
> 
> For the stock/crypto side, changing harnesses would not improve alpha by itself. 

> No public release date yet.
> 
> As of August 13, 2026:
> 
> - Ultrafast is a separate, API-first limited preview—not the Fast Mode already included in our Codex setup.
> - OpenAI is selecting customers based on workload fit and available capacity.
> - OpenAI has not promised that Ultrafast will automatically enter Plus, Pro, or Business plans.
> - Our account currently exposes regular Fast Mode only; the current Codex rate card has no Ultrafast option.
> 
> Realistically, access could expand over the coming weeks or months, but any firmer date would be speculation. The fastest route is OpenAI’s [Ultrafast access-updates form](https://openai.com/form/ultrafast/), where financial research is explicitly listed as a target workload. [Official announcement](https://openai.com/index/previewing-ultrafast/)

<sub>rollout: `C:\Users\dillo\.codex\archived_sessions\rollout-2026-08-13T16-00-58-019ffcb6-af33-78f0-a5d7-64bcc5aef376.jsonl`</sub>
