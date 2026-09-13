---
note_type: research
status: verified
created: 2026-08-18
updated: 2026-08-18
owner: Dillon Mohr
question: Is the TikTok Qwen3.8-27B version actually good?
verification_status: verified
confidence: 0.86
expires: 2026-11-16
review_on: 2026-09-18
source_refs:
  - "[[12_Brain/01_Captures/research/2026-08-18 - research - Qwen3.8-27B quality]]"
  - "[[12_Brain/06_Research/Qwen3.8-27B local RAM fit]]"
  - "[[12_Brain/06_Research/Qwen3.8 Ollama plan and buy list]]"
  - https://artificialanalysis.ai/models/qwen3-8-27b
  - https://artificialanalysis.ai/models/qwen3-6-27b
  - https://artificialanalysis.ai/models/qwen3-8-max
  - https://artificialanalysis.ai/models/gpt-5-6-luna
  - https://artificialanalysis.ai/models/claude-opus-5
  - https://simonwillison.net/2026/Aug/16/qwen-38-27b/
  - https://docs.ollama.com/capabilities/thinking
  - https://ollama.com/library/qwen3.8
tags:
  - brain
  - research
  - local-llm
  - qwen
  - quality
---

# Qwen3.8-27B quality

**Summary:** Yes for a local 27B. Independent score ties OpenAI's cheap cloud model and leads its size class. It is not a frontier replacement, and the default thinking setting will make it feel worse than it is.

## Conclusion

This is a **good** local Qwen — the best independently ranked open-weight model in the 4B–40B class as of 2026-08-18. Pull it if you want a Luna-tier coding/reasoning agent on the machine with no API bill. Keep Cursor Grok / Claude for hard client work. Turn thinking down on day one or the TikTok demo will not match the first run.

## Independent scorecard (Artificial Analysis, fetched 2026-08-18)

Index is v4.1.1. Open-weight "small" class is 4B–40B parameters.

| Model | Intelligence Index | What it is |
|---|---|---|
| **Qwen3.8 27B** (this download) | **52** (#1 / 135 in class; median 9) | Local Apache 2.0 27B. Text + image. |
| Qwen3.6 27B (Reasoning) | 38 (#2 / 135) | Same size, previous gen. 3.8 is +14. |
| GPT-5.6 Luna (max) | 52 | Hosted OpenAI economy model. Same number, not the same product. |
| Qwen3.8 Max | 58 | Hosted Alibaba flagship. Not the 27B. |
| Claude Opus 5 (max effort) | 63 | Current AA frontier on the live model page. |

The 27B is very verbose on that index: **160M** output tokens vs a class median of **43M**. Quality and token hunger both went up.

## How to actually use it so it feels good

Thinking is on by default. Qwen's own default is `xhigh`. Simon Willison (2026-08-16) watched one SVG prompt burn **21 minutes** and **22,276** reasoning tokens. Start lower.

Ollama spelling (not Qwen's `xhigh`):

```powershell
ollama run qwen3.8 --think=medium
ollama run qwen3.8 --think=false
```

Inside a session: `/set think` or `/set nothink`. Raise context well above 8K or the trace eats the window.

RAM/GPU fit: [[Qwen3.8-27B local RAM fit]]. Plan vs buy: [[Qwen3.8 Ollama plan and buy list]].

## Do not

- Treat vendor coding charts as proof it beats Opus. Independent AA is the quality receipt here.
- Confuse this 27B with hosted **Qwen3.8 Max** (58) or the 2.4T open flagship.
- Expect Cursor/Claude-level client work from a 27B on a 24GB card.
- Judge the model on the first `xhigh` / default-think reply. That setting is the common complaint, four days after release.

## Verification

AA live pages, Ollama thinking docs, and Willison's 2026-08-16 write-up survived this pass. Killed: Max/2.4T identity mixups; "replaces Opus"; recap-blog Index numbers that disagreed with the live Opus 5 page (63, not 61); HF claims that Ollama cannot control thinking.

Expires 2026-11-16. Re-fetch AA if the default Ollama tag or Index version changes.

## Links

- [[12_Brain/01_Captures/research/2026-08-18 - research - Qwen3.8-27B quality]]
- [[12_Brain/06_Research/Qwen3.8-27B local RAM fit]]
- [[12_Brain/06_Research/Qwen3.8 Ollama plan and buy list]]
