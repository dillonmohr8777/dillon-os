---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-09-20T16:24:18
session_last: 2026-09-20T16:24:18
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-09-20\go-through-all-of-the-40"
tags: [codex-recovery, session, 202609]
---

# Documents\Codex\2026-09-20\go-through-all-of-the-40

**1 session(s)** · 2026-09-20 16:24 → 2026-09-20 16:24 · 16m agent-time (summed; sessions may overlap) · 3 MB transcript · 1/1 turns completed

## 1. 2026-09-20 16:24 · 16m · 3.3 MB

`01a0bfa1-f79c-7123-b262-69b79f4be3b8` · turns 1/1

**Asked:**

> Go through all of the 40%. Really it was like 38% because I think 2% of the usage from yesterday was from my automations and shit. So really the 38% yesterday, I mean I'm pretty sure we did like 13 or 14 hours worth of work. Can you break down the token cost by every model used yesterday, like only OpenAI models, like for our usage and shit? I'm sure Astra ate a lot of it.

**Outcome reported:**

> Astra ate a lot, but Sol ate considerably more.
> 
> I audited 7,057 OpenAI response records across every session touching the current 40% usage window—including parent sessions, subagents, and the scheduled automation. OpenRouter models were excluded.
> 
> | OpenAI model | Uncached input | Cached input | Output | Total tokens | Credit-equivalent | Share of cost | Est. share of 40% |
> |---|---:|---:|---:|---:|---:|---:|---:|
> | GPT-5.6 Sol | 18.44M | 612.41M | 2.29M | **633.15M** | **9,472.6** | **64.42%** | **25.77 points** |
> | GPT-6 Astra | 5.07M | 98.52M | 0.39M | **103.98M** | **5,025.2** | **34.18%** | **13.67 points** |
> | GPT-5.6 Luna | 5.99M | 122.46M | 0.48M | **128.93M** | **127.3** | **0.87%** | **0.35 points** |
> | GPT-5.6 Terra | 0.36M | 6.21M | 0.04M | **6.60M** | **60.7** | **0.41%** | **0.17 points** |
> | GPT-5.5 | 0.09M | 0.26M | 0.004M | **0.35M** | **17.5** | **0.12%** | **0.05 points** |
> | **Total** | **29.94M** | **839.86M** | **3.21M** | **873.01M** | **14,703.4** | **100%** | **40 points** |
> 
> The enormous 873M number is mostly repeated cached context. Roughly **96.2% of all input tokens were cached**, so raw tokens alone badly exaggerate the cost.
> 
> The timeline also corrects the “38% yesterday” assumption:
> 
> - Weekly meter reset to 0% at **4:36 AM ET on September 19**.
> - It reached **30% around 11:42 PM September 19**.
> - It reached **35% at 1:17 AM September 20**.
> - The final **5% occurred this morning**, reaching 40% at approximately **12:24 PM September 20**.
> 
> So strict calendar-day usage yesterday was approximately **30%**. If you count the overnight continuation as part of yesterday’s work session, it was approximately **35%**.
> 
> The logged scheduled automation was only **955,562 Luna tokens and 0.93 credits**—about **0.0025 percentage points** of the 40%, effectively nothing. I cannot support subtracting 2% for automation from the local evidence. There could be separate shared-account or cloud automation absent from these local logs, but the automation recorded here definitely did not consume 2%.
> 
> For perspective, these same calls would have been approximately **$572.34 at current direct API rates**, including the logged Fast/Priority turns. That is only an API-equivalent comparison—not an additional bill on top of your included plan. OpenAI’s Codex rates charge Astra and Sol much more heavily than Luna, and Fast mode multiplies GPT-5.6 and Astra credit consumption by 2.5×. [Codex pricing and credit rates](https://learn.chatgpt.com/docs/pricing), [Fast mode multipliers](https://learn.chatgpt.com/docs/agent-configuration/speed), [direct API p

<sub>rollout: `C:\Users\dillo\.codex\sessions\2026\09\20\rollout-2026-09-20T12-24-18-01a0bfa1-f79c-7123-b262-69b79f4be3b8.jsonl`</sub>
