---
tags: [raw, research, local-llm, qwen, quality]
captured: 2026-08-18
method: "Artificial Analysis live model pages + Ollama docs + Simon Willison 2026-08-16"
agent: cloud (cursor/qwen38-64gb-ram-d550)
note_type: capture
status: compiled
created: 2026-08-18
updated: 2026-08-18
source_refs:
  - https://artificialanalysis.ai/models/qwen3-8-27b
  - https://artificialanalysis.ai/models/qwen3-6-27b
  - https://artificialanalysis.ai/models/qwen3-8-max
  - https://artificialanalysis.ai/models/gpt-5-6-luna
  - https://artificialanalysis.ai/models/claude-opus-5
  - https://simonwillison.net/2026/Aug/16/qwen-38-27b/
  - https://ollama.com/library/qwen3.8
  - https://docs.ollama.com/capabilities/thinking
---

# Raw receipts — Qwen3.8-27B quality, 2026-08-18

Question from Dillon: is this version of Qwen good? Context is the TikTok `qwen3.8:27b` local 27B, not hosted Max and not the 2.4T flagship.

## Receipt 1 — Independent intelligence (this 27B)

- Claim: Qwen3.8 27B scores **52** on Artificial Analysis Intelligence Index v4.1.1.
- Rank in class: **#1 / 135** open-weight models in the 4B–40B (small) class. Class median: **9**.
- Released 2026-08-14. Apache 2.0. Text + image in, text out. Context listed as 256k on the AA card (Ollama tags say 256K).
- Verbosity: **160M** output tokens on the Index vs class median **43M**. Ranked #23 / 135 for verbosity (higher = more tokens).
- Evidence: https://artificialanalysis.ai/models/qwen3-8-27b fetched 2026-08-18.
- Skeptic: SURVIVES as an independent composite, not as a Dillon-measured coding-agent score. AA does not publish local tok/s for this card (Speed N/A).

## Receipt 2 — Same-size predecessor

- Claim: Qwen3.6 27B (Reasoning) scores **38**, #2 / 135 in the same open-weight small class.
- Delta: **+14** Intelligence Index points at the same ~27B size.
- Verbosity: 140M vs median 43M.
- Evidence: https://artificialanalysis.ai/models/qwen3-6-27b fetched 2026-08-18.
- Skeptic: SURVIVES. Do not read this as "3.6 is bad"; 38 was already well above the class median of 9.

## Receipt 3 — Hosted cousins, not this download

- Claim: hosted **Qwen3.8 Max** scores **58** (#10 / 180 in its proprietary price class). Different product: proprietary, $2 / $6 per 1M in/out, 1M context, text+image+video. Released 2026-08-03 per AA FAQ.
- Evidence: https://artificialanalysis.ai/models/qwen3-8-max fetched 2026-08-18.
- Skeptic: SURVIVES. Do not sell Max's 58 as the local 27B's score.

## Receipt 4 — Cloud economy and frontier references

- Claim: **GPT-5.6 Luna (max)** also scores **52**. Economy cloud model, not a local weight. $0.20 / $1.20. 1M context.
- Claim: **Claude Opus 5 (Adaptive Reasoning, Max Effort)** scores **63**, #1 / 180 in its class on the live AA model page fetched 2026-08-18. Index v4.1.1 article (2026-08-06) also lists Opus 5 at 63. An older AA launch article quoted 61; prefer the live model page.
- Evidence: https://artificialanalysis.ai/models/gpt-5-6-luna ; https://artificialanalysis.ai/models/claude-opus-5 ; https://artificialanalysis.ai/articles/artificial-analysis-intelligence-index-v4-1-1
- Skeptic: SURVIVES with the 61-vs-63 note. Local 27B ties Luna; it does not match Opus 5.

## Receipt 5 — Default thinking is the feel-killer

- Claim: Qwen documents `reasoning_effort` default **`xhigh`**. Simon Willison (2026-08-16): one pelican-on-bicycle SVG at that default took **21 minutes** and **22,276** reasoning tokens to emit **3,223** answer tokens. A "draw an svg of a circle" prompt produced an unrequested animated geometric study. Recommendation: start on **low** or no reasoning.
- Evidence: https://simonwillison.net/2026/Aug/16/qwen-38-27b/
- Skeptic: SURVIVES as practitioner evidence on one quantized local run, not as an AA score. Hardware and quant will move the minutes.

## Receipt 6 — Ollama can turn thinking down

- Claim: Ollama thinking docs: thinking is on by default for supported models. CLI: `--think=false` disables; levels `low` / `medium` / `high` / `max`. Interactive `/set think` and `/set nothink`. Native API field is `think`. OpenAI-compat field is `reasoning_effort` (`low`/`medium`/`high`/`none`).
- Qwen's native spelling `xhigh` is not the Ollama CLI list. Closest high setting on Ollama is `max` or `high`.
- A Hugging Face thread claimed Ollama cannot pass `reasoning_effort` because it replaces the chat template. That is **not** treated as current Ollama fact against the official thinking docs.
- Evidence: https://docs.ollama.com/capabilities/thinking ; https://ollama.com/library/qwen3.8 (Flexible Thinking Control in the readme).
- Skeptic: SURVIVES for "you can turn it down on Ollama." Do not claim a Dillon-measured mapping of `xhigh` → `max`.

## Receipt 7 — Vendor coding tables are not the lead

- Claim: Alibaba/Ollama library pages show vendor coding/agent charts. Those are **vendor-reported**. Do not lead with "beats Opus." Independent AA is the quality receipt for this note.
- Evidence: https://ollama.com/library/qwen3.8 Benchmark section (charts only in this pass).
- Skeptic: SURVIVES as a negative control. Specific SWE-bench vs Opus numbers were not re-fetched this pass; leave them off the compiled page until independently sourced.

## Killed / not used

- Treating Qwen3.8 Max 58 or the 2.4T-A95B as this TikTok 27B.
- "This 27B replaces Cursor Grok / Claude Opus for hard client work."
- Inventing Dillon-measured tok/s or coding-agent success rate.
- Hugging Face "Ollama cannot control thinking" as current docs.
- Recap-blog Intelligence Index figures that disagree with the live AA model page.
