---
tags: [raw, research, model-scout]
captured: 2026-08-10
method: "background research agent (Claude Fable 5), 27 searches/fetches across leaderboards, labs, OpenRouter, harnesses; cross-verified, 2 viral claims excluded as false"
---

# Raw capture — model/benchmark landscape (2026-08-10)

Full receipts from the first `/model-scout`-style sweep. Compiled into
[[12_Brain/System/Model Roster]]. Untouched after capture.

**TL;DR:** Three-way Anthropic/OpenAI/Google race — Anthropic holds the quality
crown (Fable 5 #1 LMArena, Opus 5 #1 SWE-bench Verified), OpenAI the
agentic-terminal crown (GPT-5.6 Sol, July 9). Open-weight insurgency is
frontier-adjacent: Kimi K3 (2.8T, largest open model ever), DeepSeek V4,
GLM-5.2, Qwen3.8-Max, Tencent Hy3 own OpenRouter volume. Structural shocks:
SpaceX absorbed xAI (Feb 2) and bought Cursor ($60B, June); Meta shelved
Behemoth, went closed with Muse Spark; OpenAI withdrew from SWE-bench Verified
(Feb, contamination) — SWE-bench Pro, Terminal-Bench 2.1, FrontierSWE are the
new standards.

## Summary table

| Model | Lab | Class | Headline scores | $/Mtok in/out | Best role |
|---|---|---|---|---|---|
| Claude Fable 5 | Anthropic | Flagship (Mythos-class) | LMArena #1 (~1525) · SWE-V 95% · FrontierSWE 0.900 · GPQA 92.6% | $10 / $50 | orchestrator ceiling, longest-horizon work |
| Claude Opus 5 | Anthropic | Flagship workhorse | SWE-V 96% (#1) · T-Bench 2.1 89.1% · ARC-AGI-3 30.2% (#1, ~3× next) | $5 / $25 | deep coding, daily driver, agentic knowledge work (AA: "new leader") |
| GPT-5.6 Sol | OpenAI | Flagship | T-Bench 2.1 89.5% (#1) · ARC-AGI-2 92.5% (#1) · BrowseComp 92.2% (#1) · GPQA 94.1% | $5 / $30 (>272K: $10/$45) | web research, terminal agents (Codex default since Jul 9) |
| GPT-5.6 Terra | OpenAI | Workhorse | vendor: "competitive with 5.5 at lower cost" | $2 / $12 | balanced everyday |
| GPT-5.6 Luna | OpenAI | Cheap | not published | $0.20 / $1.20 (−80% cut Jul 30) | bulk at scale |
| Claude Sonnet 5 | Anthropic | Workhorse | launch benchmarks not surfaced | $2/$10 intro → $3/$15 Sep 1 | speed+intelligence, subagents |
| Claude Haiku 4.5 | Anthropic | Cheap | near-frontier per Anthropic; 200K ctx | $1 / $5 | Claude-ecosystem bulk |
| Gemini 3.1 Pro | Google | Flagship | GPQA 94.1% (co-#1) · best effective long-ctx retention | $2/$12 ≤200K; $4/$18 above | vision/creative review, long-context |
| Gemini 3.6 Flash | Google | Workhorse/cheap | too new (Jul 21) | $1.50 / $7.50 | fast multimodal volume |
| Grok 4.5 | xAI (SpaceX) | Flagship-value | T-Bench 2.1 83.3% · AA 54 · #1 agentic tool use at launch · live X data | $2 / $6 | cheap agentic tool-calling, X-native research |
| Kimi K3 | Moonshot | Open flagship | AA 57 (top open) · T-Bench 2.1 88.3% · BrowseComp 91.2% | $3 / $15 (open weights; read the modified license) | open-stack research+coding |
| DeepSeek V4 Pro | DeepSeek | Open flagship | SWE-V 80.6% (top open at GA) · MRCR-1M 83.5% (#1) | $0.435 / $0.87 (MIT) | long-doc analysis on a budget |
| DeepSeek V4 Flash 0731 | DeepSeek | Open cheap | AA 50 · T-Bench 2.1 82.7% | $0.14 / $0.28 (MIT) | bulk extraction king |
| GLM-5.2 | Zhipu | Open coder | SWE-Pro 62.1 (>GPT-5.5) · T-Bench 2.1 81.0% | ~$1.40/$4.40 (MIT); Coding Plan $18–160/mo | budget coding agent |
| Qwen3.8-Max | Alibaba | Open(-ish) flagship | OSWorld-Verified #1 · LMArena #4 (vendor-run harness — caution) | $2 / $6 flat, 1M ctx | computer-use, multimodal value |
| Tencent Hy3 | Tencent | Open workhorse | #1 OpenRouter by volume (~1.6T tok/day) | cheap (Apache 2.0) | high-volume reasoning |
| MiniMax M3 | MiniMax | Open multimodal | vendor SWE-Pro 59.0; independent T-Bench 66.0 (gap noted) | low (restricted weights) | video/image-input agents |
| Muse Spark 1.1 | Meta MSL | Closed flagship | T-Bench 2.1 80.0% | not found | — (Meta's closed pivot) |
| Mistral Large 3 | Mistral | Open flagship | MMLU-Pro 73.1 | not found (Apache 2.0) | EU-sovereign self-hosting |

## Leaderboards (Aug 2026)

- **SWE-bench Verified** (saturated/compromised — OpenAI withdrew Feb 2026 over contamination): Opus 5 96.0% #1, Mythos 5 95.5%, Fable 5 95.0% (llm-stats Aug 10).
- **SWE-bench Pro** (the replacement): Mythos 5 80.3%, Fable 5 80.0%, Opus 5 79.2%, Sakana Fugu-Ultra 73.7%, GLM-5.2 62.1%, GPT-5.5 58.6% (CodingFleet Aug 6).
- **Terminal-Bench 2.1** (scores harness+model PAIR): Codex+Sol (xhigh) 89.5% #1, Claude Code+Opus 5 (max) 89.1%, KimiCode+K3 88.3%, Grok 4.5 83.3%, DeepSeek V4 Flash 82.7%, GLM-5.2 81.0%.
- **LMArena Text** (Aug 4): Fable 5 #1 ~1525 (re-baselined Jul 12 after pull/redeploy), Mythos 5 1531 (limited sample), Opus 5 1522, GPT-5.6 1514. WebDev post-Opus-5: stale mirrors only — not found.
- **GPQA Diamond** (saturated): Gemini 3.1 Pro & GPT-5.6 Sol 94.1%, Fable 5 92.6% (BenchLM Jul 25).
- **AIME 2026** (commodity now — mid open models hit 95%+): Inkling/A.X-K2 97.1 (MathArena).
- **ARC-AGI-2** nearly solved (Sol 92.5%, Opus 5 90.4%); **ARC-AGI-3 the new frontier: Opus 5 30.2%, ~3× next best**.
- **Long context**: MRCR-1M — DeepSeek V4 Pro 83.5% #1; only the Gemini 3 family's effective ctx matches claimed (yage.ai Mar 2026).
- **Agentic**: τ³-Banking folded into AA Index v4.1.1. OSWorld-Verified: Qwen3.8-Max #1 (llm-stats Aug 7). BrowseComp: Sol 92.2%, K3 91.2%, Opus 5 90.8%. GAIA effectively retired.
- **New de-facto standards**: FrontierSWE (hours-long projects; Fable 5 0.900 dominance) · GDPval-AA v2 (220 real work products; Opus 5 "new leader in agentic knowledge work" — AA Aug 10) · Vending-Bench 2 · MCP Atlas · AA Index v4.1.1 (Kimi K3 57 top open, Grok 4.5 54, GLM-5.2 51, DS V4 Flash 50).

## Model IDs + pricing (verified Aug 10)

Anthropic: `claude-fable-5` $10/$50 1M/128K (adaptive thinking; safety classifiers → `refusal` stop_reason + server-side fallbacks; new tokenizer ≈30–35% more tokens; 90% cache discount; pulled/restored ~Jul 1) · `claude-mythos-5` invite-only (Project Glasswing) · `claude-opus-5` $5/$25 (Jul 24; Claude Code default; May 2026 cutoff) · `claude-sonnet-5` $2/$10 intro through Aug 31 → $3/$15 · `claude-haiku-4-5` $1/$5 (no Haiku 5 yet).

OpenAI: `gpt-5.6-sol` $5/$30 (>272K in: $10/$45), 1.05M ctx (Jul 9; Codex default) · `gpt-5.6-terra` $2/$12 (post Jul-30 cut) · `gpt-5.6-luna` $0.20/$1.20 (−80% Jul 30) · `gpt-5.6-cyber` $12.50/$75 controlled · `gpt-5.3-codex-spark` research preview · legacy GPT-5.5 $5/$30; **GPT-5.4 removed from ChatGPT-auth Codex Aug 31**.

Google: Gemini 3.1 Pro (preview Feb 19) $2/$12 ≤200K / $4/$18 above (2M enterprise ctx claims conflict — treat 1M as reliable; 3.5 Pro not released) · Gemini 3.6 Flash (Jul 21) $1.50/$7.50.

xAI/SpaceX: merger Feb 2 ($1.25T combined, X in, Tesla out), Nasdaq IPO Jun 12, **Cursor acquired $60B** (Jun). Grok 4.5 (Jul 8) $2/$6, 500K ctx, reasoning dial, terse outputs, trained on Cursor telemetry. Grok 5 not released.

Meta: Behemoth shelved; Llama 5 "Avocado" → 2027; Muse Spark (Apr 8) closed API-only, Spark 1.1 T-Bench 80.0%.

China bloc: DeepSeek V4 (MIT, Jul 20 GA): Pro 1.6T/49B active $0.435/$0.87; Flash 284B/13B $0.14/$0.28; both 1M ctx. Kimi K3 (Jul 16, weights Jul 26–27): 2.8T/104B, 1M ctx, $3/$15, modified license — read it. Qwen3.8-Max (Aug 3): 2.4T/95B, $2/$6 flat 1M ctx; weights promised, NOT on HF yet; vendor-run benches. GLM-5.2 (Jun 13, MIT): 753B/40B, ~$1.40/$4.40, Coding Plan $18/$72/$160/mo. Tencent Hy3 (Jul 6, Apache 2.0): #1 OpenRouter volume. MiniMax M3 (Jun 1): native image+video input; vendor scores >> independent.

Mistral: Large 3 (Dec 2025) still flagship; Small 4 (Mar 16); mass retirements summer 2026; EU-sovereignty niche.

New names: Sakana Fugu-Ultra (SWE-Pro #2) · Thinking Machines Inkling (AIME co-#1) · Poolside Laguna S 2.1 (free tier, heavy usage) · Nvidia Nemotron 3 Ultra 550B (1M ctx, best free) · Xiaomi MiMo V2.5 · StepFun Step-3.5-Flash · Ring-2.6-1T · Ornith-1.0-397B.

## OpenRouter (Aug 9–10)

Top by daily tokens: 1 Tencent Hy3 (1.6T) · 2 DS V4 Flash 0731 (1.3T) · 3 DS V4 Flash 0423 · 4 Xiaomi MiMo V2.5 · 5 GPT-5.6 Luna (only closed US model in top 5) · 6 GLM-5.2 · 7 Nemotron 3 Ultra · 8 DS V4 Pro · 9 Poolside Laguna S 2.1 · 10 MiniMax M3 · 11 Claude Opus 5 · 12 Kimi K3. **Cheap open MoEs own bulk traffic; flagships used surgically.**

Free tier (20 req/min, ~200/day, no card; churns monthly): **best = Nvidia Nemotron 3 Ultra 550B** (1M ctx, quality 61); runners-up Gemma 4 31B IT, Poolside Laguna S/XS 2.1, Nemotron 3 Super 120B, GPT-OSS 20B (CostGoat Aug 10).

## Harnesses

Codex CLI (GPT-locked, default Sol since Jul 9, Rust rewrite, token-credit billing since Apr) #1 T-Bench 2.1 · Claude Code (Claude-locked, default Opus 5 since Jul 24) #2; authored ~4% of public GitHub commits (~135K/day, Feb 2026) · Kimi Code CLI (MIT, provider-configurable) #3 via K3 · opencode (model-agnostic, 150K+ stars) — the structural counterweight · Gemini CLI (free-tier mindshare) · Factory Droid ($150M Series C @$1.5B Apr; Nvidia/Adobe/EY) · Amp (Deep mode, ad-supported free tier) · Cursor CLI (now SpaceX; one AGENTS.md across IDE/terminal/CI) · Aider/OpenHands/Warp/Goose long tail. Research harnesses (NexAU-AHE, LemonHarness, Capy) top official tbench 2.0 but aren't products.

## Verification notes

- "Meta released Llama 5 in April with 5M context" — single low-quality source, contradicted everywhere credible → **treated as false**.
- "GPT-5 100% on AIME 2026" — failed MathArena cross-check → **excluded**.
- MiniMax M3 / Qwen3.8-Max headline scores are vendor-run; independent materially lower where they exist.
- WebDev Arena post-Opus-5: only stale June mirror available → flagged stale.

## Sources

llm-stats.com (Aug 6–10) · CodingFleet T-Bench 2.1 + SWE-Pro boards (Aug 6) · tbench.ai · platform.claude.com (Aug 10) · aipricing.guru (Aug 10) · learn.chatgpt.com/docs/models + developers.openai.com changelog · CNBC (Feb 11, Jul 30) · techjournal.org/valueaddvc.com (Jun) · Tokenmaxxing OpenRouter mirror (Aug 9) · CostGoat free models (Aug 10) · Artificial Analysis Index v4.1.1 (Aug 10) · BenchLM.ai (Jul 25–Aug) · MathArena.ai (Aug 10) · swfte.com LMArena snapshot (Aug 4) · morphllm.com (Jun–Aug) · explainx.ai/interconnects.ai/simonwillison.net (Kimi K3, Jul) · MarkTechPost/latent.space (Qwen, Jul 19/Aug 3) · digitalapplied.com/ciw.news (Hy3, Jul 6) · codersera.com/geeky-gadgets (Opus 5, Jul 24) · anthropic.com/news/claude-sonnet-5 · datacamp.com/felloai.com (Grok 4.5 Jul 8, Gemini 3.1 Feb 19) · serenitiesai.com/mistral.ai · towardsai.net/medium/tembo.io/amux.io (harnesses) · teamday.ai/buldrr.com (free tier)
