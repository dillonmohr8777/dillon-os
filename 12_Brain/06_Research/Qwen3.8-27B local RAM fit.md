---
note_type: research
status: verified
created: 2026-08-18
updated: 2026-08-18
owner: Dillon Mohr
question: Can the Qwen3.8:27b model from TikTok ZP8Wq8GqE run on the 64GB RAM machine?
verification_status: verified
confidence: 0.9
expires: 2026-11-16
review_on: 2026-09-18
source_refs:
  - "[[12_Brain/01_Captures/research/2026-08-18 - research - Qwen3.8-27B 64GB RAM]]"
  - https://www.tiktok.com/@cjtrowbridge/video/7675219187538595102
  - https://ollama.com/library/qwen3.8:27b
  - https://ollama.com/library/qwen3.8/tags
  - https://unsloth.ai/docs/models/qwen3.8
  - https://huggingface.co/Qwen/Qwen3.8-27B
  - https://github.com/ollama/ollama/releases/tag/v0.32.12
tags:
  - brain
  - research
  - local-llm
  - qwen
  - hardware
---

# Qwen3.8-27B local RAM fit

**Summary:** 64GB of system RAM is enough to load the TikTok's `qwen3.8:27b` default (18GB Q4). Interactive speed still depends on GPU VRAM, which this vault does not record.

## Conclusion

Yes for RAM. The video is CJ Trowbridge showing Alibaba's **Qwen3.8-27B**, the current Ollama one-liner `ollama run qwen3.8:27b`. That default tag is an 18GB Q4_K_M package (17GB language weights + 931MB vision encoder). Unsloth's 4-bit row is 17–19GB of combined RAM+VRAM. A 64GB machine has headroom for the default and for the 30GB Q8 tag. Skip the 56GB BF16 tag on this box.

## What the video is

| Fact | Value |
|---|---|
| Short link | `https://www.tiktok.com/t/ZP8Wq8GqE/` |
| Video | `@cjtrowbridge` / `7675219187538595102` |
| Caption | "The new Qwen3.8:27b free open-source AI model is truly incredible" |
| Model | Dense ~27.3B vision-language model, Apache 2.0, native ~256K context |
| Easiest run | Ollama ≥ 0.32.12, `ollama run qwen3.8:27b` (~18GB download) |

## Memory math on 64GB RAM

Leave several GB for Windows, Chrome, and Codex. Numbers below are **weight size**, not peak runtime with a long context.

| Tag | Size | Fits 64GB RAM? | Use |
|---|---|---|---|
| `qwen3.8:27b` / `:latest` / Q4_K_M | 18GB | Yes, comfortably | Default. Start here. |
| `qwen3.8:27b-q8_0` | 30GB | Yes | Higher fidelity if you have VRAM or unified memory to match. |
| `qwen3.8:27b-bf16` | 56GB | Tight | Only if almost nothing else is running. Not the daily-driver pick. |

Unsloth's published 27B memory table (total RAM+VRAM, or unified memory): 2-bit 11–13GB, 3-bit 13–16GB, 4-bit 17–19GB, 6-bit 24GB, 8-bit 31GB, BF16 56GB.

## Speed is a GPU question this vault cannot close

Public Git names a 64GB daily Windows orchestrator. It does **not** record that machine's GPU or VRAM. The EliteDesk 800 G4 Ops Box is a different always-on chassis.

What third-party tables say, not Dillon-measured:

- If a 24GB-class NVIDIA card is present, Q4 at normal context (8K–64K) is the intended local setup.
- If VRAM is smaller than the weights, Ollama can split layers to system RAM. It will still run. It will be slower.
- If there is no usable GPU, 64GB RAM still **loads** Q4. Dense 27B on CPU is a demo, not a daily coding agent.
- The spec-sheet 256K context is not free. Third-party VRAM tables put full 256K near ~34GB without KV-cache quantization.

Thinking mode is on by default (`reasoning_effort` = `xhigh` in Unsloth's docs). First replies can run long. Drop effort to `medium` or `low` if it overthinks.

What to subscribe vs buy: [[Qwen3.8 Ollama plan and buy list]].

## Do not confuse this with the 2.4T flagship

Qwen3.8 also shipped a 2.4T-A95B open model. That is a different download (hundreds of GB even at 1-bit). The TikTok tag is the **27B**.

## Verification

- Identity, Ollama sizes, Unsloth table, Ollama 0.32.12 support, and "no GPU in this vault" survived a fresh skeptic pass on 2026-08-18.
- Killed: inventing Dillon's GPU; treating "~1 tok/s" or "40–80 tok/s" as measured on this machine; saying "VRAM is the limiter" as a Dillon hardware fact.
- Expires 2026-11-16. Re-check Ollama tags and Unsloth's table if the default quant changes.

## Links

- [[12_Brain/01_Captures/research/2026-08-18 - research - Qwen3.8-27B 64GB RAM]]
- [[12_Brain/06_Research/Qwen3.8 Ollama plan and buy list]]
- [[11_Agents/64gb Morning Orchestrator Spec 2026-07-08]]
- [[12_Brain/02_Entities/Ops Box (EliteDesk 800 G4)]]
