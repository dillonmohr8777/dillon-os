---
tags: [raw, research, grok]
captured: 2026-08-12
topic: grok-4.6-benchmarks
---

# Raw receipts — Grok 4.6 vs Grok 4.5 vs the field

Captured 2026-08-12. Do not rewrite. Compile into
`12_Brain/research/Grok 4.6 Frontier Comparison.md`.

X MCP was credit-depleted this session; Exa MCP was rate-limited. Receipts
are from official pages, Artificial Analysis, Cursor, and a fresh-context
skeptic pass. Grok/X posts were not retrieved.

## Question

What are the measured benefits of Grok 4.6 over Grok 4.5, and where does it
sit versus other major models?

## Receipts

### R1 — Launch date and positioning

- **Claim:** Grok 4.6 released 2026-08-12. Builds on Grok 4.5 for long-running
  agents and more ambitious interactive/visual work.
- **Source:** https://x.ai/news/grok-4-6 (Aug 12, 2026)
- **Also:** https://cursor.com/blog/grok-4-6 (same day, co-release copy)
- **Also:** https://media.x.ai/v1/website/card-7f81d41b.pdf (model card, rev 2026-08-12)
- **Killed elsewhere:** kie.ai “August 7” is a pre-launch target, not the ship date.

### R2 — Independent AA Intelligence Index (v4.1.1, fetched 2026-08-12)

Source: https://artificialanalysis.ai/leaderboards/models
Also: https://artificialanalysis.ai/models/grok-4-6
Also: https://artificialanalysis.ai/articles/grok-4-6-benchmarks-and-analysis

| Model | Lab | Index | Cost/task | tok/s | TTFT s | Context |
|---|---|---:|---:|---:|---:|---|
| Claude Opus 5 (max) | Anthropic | 63 | $2.34 | 55 | 52.35 | 1M |
| Claude Opus 5 (xhigh) | Anthropic | 63 | $1.80 | 54 | 23.83 | 1M |
| Claude Fable 5 (with fallback) | Anthropic | 62 | $3.14 | 63 | 99.62 | 1M |
| Claude Opus 5 (high) | Anthropic | 61 | $1.23 | 54 | 12.57 | 1M |
| GPT-5.6 Sol (max) | OpenAI | 61 | $1.23 | 62 | 153.87 | 1M |
| Grok 4.6 (high) | SpaceXAI | 61 | $0.84 | 78 | 42.09 | 500k |
| Kimi K3 (max) | Kimi | 60 | $0.84 | 41 | 2.84 | 1.05M |
| GPT-5.6 Sol (xhigh) | OpenAI | 59 | $0.81 | 61 | 43.35 | 1M |
| Claude Opus 5 (medium) | Anthropic | 59 | $0.72 | 54 | 6.84 | 1M |
| Qwen3.8 Max | Alibaba | 58 | $1.13 | 47 | 2.75 | 1M |
| Muse Spark 1.2 (xhigh) | Meta | 57 | $0.40 | — | — | 1.05M |
| GPT-5.6 Sol (high) | OpenAI | 57 | $0.55 | 56 | 15.73 | 1M |
| GPT-5.6 Terra (max) | OpenAI | 57 | $0.51 | 119 | 164.01 | 1M |
| Grok 4.5 (high) | SpaceXAI | 56 | $0.36 | 57 | 9.32 | 500k |
| Claude Sonnet 5 (max) | Anthropic | 55 | $1.72 | 73 | 188.91 | 1M |
| GLM-5.2 (max) | Z AI | 53 | $0.31 | 124 | 1.51 | 1M |
| DeepSeek V4 Flash 0731 (max) | DeepSeek | 52 | $0.03 | 125 | 1.43 | 1M |
| Gemini 3.6 Flash | Google | 52 | $0.56 | 234 | 17.76 | 1M |
| GPT-5.6 Luna (max) | OpenAI | 52 | $0.05 | 153 | 132.71 | 1M |
| Gemini 3.1 Pro Preview | Google | 48 | $0.33 | 115 | 32.87 | 1M |
| MiniMax-M3 | MiniMax | 45 | $0.14 | 83 | 1.57 | 1M |
| DeepSeek V4 Pro (max) | DeepSeek | 45 | $0.05 | 76 | 1.68 | 1M |
| Mistral Medium 3.5 | Mistral | 30 | $0.46 | 119 | 2.49 | 256k |
| Llama 4 Maverick | Meta | 14 | $0.04 | 131 | 1.03 | 1M |
| Llama 4 Scout | Meta | 10 | $0.01 | 122 | 0.84 | 10M |

AA FAQ: Opus 5 max ranks #1 of 144 ranked models. Grok 4.6 page says #6 / 183.
Do not print a single denominator. Safe form: Index 61, tied with Sol max and
Opus 5 high, behind Opus 5 max/xhigh (63) and Fable 5 (62).

AA article (independent, same day): Grok 4.6 is +5 vs Grok 4.5 and +23 vs
Grok 4.3; GDPval-AA v2 Elo 1753; τ³-Banking 50.7%; Terminal-Bench **v2.1**
88.4%; AA-Briefcase Elo 1577; ~53 turns / ~0.5B input tokens vs Opus 5 max
~103 turns / ~2.0B input tokens on Briefcase.

### R3 — Official API price and context

Source: https://docs.x.ai/developers/models and
https://docs.x.ai/developers/models/grok-4.6

- Grok 4.6 context: 500,000 tokens (same as 4.5).
- < 200k prompt: $2.00 in / $0.50 cached / $6.00 out per 1M.
- ≥ 200k prompt: $4.00 / $1.00 / $12.00 for **all** tokens in that request.
- Grok 4.5 cached is $0.30 / $0.60 — 4.6 cache is dearer.
- Fast variant: launch post says twice the price; not a named row on the
  models table.
- First-week 2x included usage in Cursor and Grok Build: launch/Cursor copy.
- Docs knowledge cutoff: February 1, 2026. Card: January 2026. Do not print
  one cutoff.

### R4 — xAI launch table (vendor-compiled)

Source: https://x.ai/news/grok-4-6
Note: “Competitor figures are drawn from the respective developers’ published
system cards or benchmark leaderboards.” Best of self-reported or public.

| Eval | Grok 4.6 High | Grok 4.5 High | GPT-5.6 Sol Max | Fable 5 Max |
|---|---:|---:|---:|---:|
| AA Intelligence Index | 61 | 56 | 61 | 62 |
| GDPVal-AA v2 | 1753 | 1526 | 1728 | 1741 |
| CursorBench v3.2 | 69.9% | 66.7% | 67.2% | 70.5% |
| DeepSWE v1.1 | 65.9% | 54% | 73% | 70% |
| FrontierCode v1.1 Extended | 61.3% | 56.6% | 60.6% | 63.6% |
| APEX-Agents | 57.5% | 47.1% | 56.7% | 59.2% |
| Terminal-Bench v3.0 | 26% | 15.7% | 34.6% | 34.1% |
| APEX-SWE | 56.4% | 53.6% | — | 58.8% |
| AA-Briefcase | 1577 | 1313 | 1502 | 1574 |
| Harvey LAB (Vals) | 15.8% | 12.9% | 2.5% | 11.3% |

**Contradiction:** model card FrontierCode Fable = 64.9% and Opus 5 = 63.6%.
Launch table lists Fable 63.6% (looks like the Opus number reused). Prefer
the card for FrontierCode peers.

### R5 — Model card peer stacks (vendor-compiled; peers = best of cards/leaderboards)

Source: https://media.x.ai/v1/website/card-7f81d41b.pdf

CursorBench 3.2: chart only; launch table gives Grok 4.6 = 69.9%. Do not
invent peer percentages from the chart.

APEX-SWE pass@1: Opus 5 63.7%, Fable 58.8%, Grok 4.6 56.4%, Grok 4.5 53.6%,
Kimi K3 48.0%, Sonnet 5 46.4%, Sol xhigh 45.8%.

FrontierCode v1.1 Extended: Fable 64.9%, Opus 5 63.6%, Grok 4.6 61.3%,
Sol max 60.6%, Opus 4.8 59.6%, GPT-5.5 56.7%, Grok 4.5 56.6%, Sonnet 5 56.2%.

DeepSWE v1.1: Opus 5 74.0%, Sol max 73.0%, Fable 70.0%, Kimi K3 69.0%,
GPT-5.5 67.0%, Grok 4.6 65.9%, Opus 4.8 59.0%, Grok 4.5 54.0%.

SWE-Marathon v1.1: Opus 5 50.0%, Opus 4.8 48.8%, Kimi K3 48.1%, Fable 45.0%,
Sol max 42.5%, Grok 4.6 31.9%, Sonnet 5 30.0%, Grok 4.5 29.4%.

Terminal-Bench **3.0**: Opus 5 43.5%, Sol max 34.6%, Fable 34.1%, Grok 4.6
26.0%, Opus 4.8 21.1%, Grok 4.5 15.7%, Sonnet 5 14.6%.

AA GDPVal Elo (AA-run, cited on card): Opus 5 1849, Grok 4.6 1753, Fable 1741,
Sol max 1728, Kimi K3 1682, Sonnet 5 1601, Opus 4.8 1588, Terra max 1578,
Grok 4.5 1526.

AA-Briefcase Elo: Opus 5 1715, Grok 4.6 1577, Fable 1574, Kimi K3 1541,
Sol max 1502, Sonnet 5 1383, Opus 4.8 1340, Grok 4.5 1313.

APEX-Agents: Opus 5 60.6%, Fable 59.2%, Grok 4.6 57.5%, Sol max 56.7%,
Opus 4.8 56.2%, GPT-5.5 55.5%, Kimi K3 55.4%, Grok 4.5 47.1%, Sonnet 5 32.5%.

Vals Index: Fable 75.1%, Opus 5 74.8%, Kimi K3 74.7%, Sol max 73.1%,
Grok 4.6 71.1%, Opus 4.8 70.4%, Sonnet 5 68.6%, GPT-5.5 68.0%,
Grok 4.5 65.3%, Terra max 65.1%.

Card: “1.5T-scale model family” — not an exact parameter count. AA: parameter
count not disclosed. Kill “1.5 trillion parameters.”

Card: consumer Grok/X/web/mobile later, not at launch.

### R6 — Availability

- Cursor, Grok Build, SpaceXAI API, OpenRouter, Vercel, Cloudflare.
- Office add-ins (Word, PowerPoint, Excel) per card.
- Not on consumer Grok/X at launch (card).

## Skeptic gate (fresh-context agent, 2026-08-12)

| ID | Verdict | Dashboard-safe |
|---|---|---|
| Launch date Aug 12 | SURVIVES | yes |
| Extends 4.5 / agent+visual positioning | SURVIVES | with-caveat (vendor) |
| AA Index table | SURVIVES | with-caveat (no single rank denominator) |
| Launch eval table | CONTRADICTED on FrontierCode Fable | with-caveat |
| Card peer stacks | SINGLE-SOURCE | with-caveat (label vendor-compiled) |
| Official price/context | SURVIVES | yes |
| AA cost/speed | SURVIVES | yes |
| Knowledge cutoff | CONTRADICTED (Jan vs Feb 1) | no as one date |
| Exact 1.5T params | KILL | no |

Do not mix Terminal-Bench v2.1 (AA Index, Grok 88.4%) with v3.0 (vendor table, 26%).
Do not print Harvey LAB as independently confirmed.
Do not print “world’s third-best.”
