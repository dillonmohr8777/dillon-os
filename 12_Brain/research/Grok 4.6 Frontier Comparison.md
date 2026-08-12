---
tags: [research, grok, benchmarks]
source: "[[12_Brain/raw/research/2026-08-12 - research - grok-4.6-benchmarks]]"
updated: 2026-08-12
expires: 2026-11-10
---

# Grok 4.6 Frontier Comparison

**Summary:** Grok 4.6 is a same-price agent upgrade over Grok 4.5 — Artificial Analysis Index 56→61 — tied with GPT-5.6 Sol Max, still behind Claude Opus 5 Max.

Live dashboard: `grok-46-dashboard/index.html` (open locally; snapshot dated 2026-08-12).

## vs Grok 4.5 (the last model)

Grok 4.6 is the next 4.x checkpoint, not a new price tier. Headline API rate stays **$2 / $6 per 1M** below 200k prompt tokens. Context stays **500k**. What moved:

- **Independent intelligence:** AA Intelligence Index v4.1.1 **56 → 61** (+5). AA also records +23 vs Grok 4.3.
- **Independent agents:** GDPval-AA v2 Elo **1526 → 1753**. AA-Briefcase Elo **1313 → 1577**. AA Terminal-Bench **v2.1** is 88.4% (do not confuse with vendor Terminal-Bench **v3.0** at 26%).
- **Speed:** AA median output **57 → 78 tok/s**. Time-to-first-token got slower (**9.32s → 42.09s**) because high-reasoning traces think longer.
- **Cost per AA task:** **$0.36 → $0.84**. Still cheaper per task than Opus 5 Max ($2.34), Fable 5 ($3.14), and Sol Max ($1.23). Cache hits rose **$0.30 → $0.50** per 1M.
- **Vendor-compiled coding:** every row on the xAI launch table is up vs 4.5 High, including DeepSWE 54%→65.9% and Terminal-Bench v3.0 15.7%→26%. Those peer numbers are not AA-run.

Vendor-only (not measured here): longer supplemental training, 4.5-regenerated SFT, more self-testing on long trajectories, stronger first visual/interactive passes, new RL environments for kernel work, web apps, and CAD.

## vs the field (independent)

As of 2026-08-12 on Artificial Analysis:

- Claude Opus 5 max / xhigh **63**
- Claude Fable 5 (with fallback) **62**
- Claude Opus 5 high, GPT-5.6 Sol max, Grok 4.6 high **61** (three-way tie)
- Kimi K3 max **60** (best open weights)
- Qwen3.8 Max **58** · Muse Spark 1.2 **57** · Grok 4.5 high **56**
- GLM-5.2 max **53** · DeepSeek V4 Flash 0731 max **52** · Gemini 3.6 Flash **52**
- Gemini 3.1 Pro Preview **48** · MiniMax-M3 **45**

Grok 4.6 is back on the intelligence frontier. It is not #1. AA’s own writeup: “alongside OpenAI, behind only Anthropic,” with standout **agentic** scores at lower cost. GDPval-AA 1753 sits behind only Opus 5 (1849) and overlaps Fable / Qwen3.8 Max on confidence intervals. Briefcase Elo 1577 is Fable-tier, reached in ~53 turns vs ~103 for Opus 5 max.

## Honest gaps

- **Long-horizon repo work still trails.** Vendor SWE-Marathon 31.9% vs Opus 5 50%. Vendor Terminal-Bench v3.0 26% vs Opus 5 43.5% / Sol 34.6%.
- **DeepSWE v1.1** 65.9% vs Opus 5 74% / Sol 73% (vendor-compiled peers).
- **Context** 500k vs 1M on Opus / Sol / Gemini / Kimi.
- **Not on consumer Grok/X** at launch (API, Cursor, Grok Build, partners).
- Do not quote an exact parameter count. Do not mix Terminal-Bench versions.

## Links

- Dashboard: `grok-46-dashboard/`
- [[12_Brain/concepts/Research Verification Loop|Research Verification Loop]]
- [[12_Brain/concepts/Evidence Boundaries in Reporting|Evidence Boundaries in Reporting]]
- Sources: [xAI launch](https://x.ai/news/grok-4-6) · [model card](https://media.x.ai/v1/website/card-7f81d41b.pdf) · [AA Grok 4.6](https://artificialanalysis.ai/models/grok-4-6) · [AA leaderboard](https://artificialanalysis.ai/leaderboards/models) · [AA analysis](https://artificialanalysis.ai/articles/grok-4-6-benchmarks-and-analysis) · [xAI pricing](https://docs.x.ai/developers/models) · [Cursor](https://cursor.com/blog/grok-4-6)
