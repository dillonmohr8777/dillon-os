---
tags: [raw, research, local-llm, qwen, ram]
captured: 2026-08-18
method: "TikTok oEmbed + curl redirect, Ollama library/tags fetch, Unsloth docs, skeptic subagent"
agent: cloud (cursor/qwen38-64gb-ram-d550)
note_type: capture
status: unprocessed
created: 2026-08-18
updated: 2026-08-18
source_refs:
  - https://www.tiktok.com/t/ZP8Wq8GqE/
  - https://www.tiktok.com/@cjtrowbridge/video/7675219187538595102
  - https://www.tiktok.com/oembed?url=https://www.tiktok.com/@cjtrowbridge/video/7675219187538595102
  - https://ollama.com/library/qwen3.8:27b
  - https://ollama.com/library/qwen3.8/tags
  - https://unsloth.ai/docs/models/qwen3.8
  - https://huggingface.co/Qwen/Qwen3.8-27B
---

# Raw receipts — Qwen3.8-27B vs 64GB RAM, 2026-08-18

Question from Dillon: TikTok `https://www.tiktok.com/t/ZP8Wq8GqE/` — can this run on the 64GB RAM machine?

## Receipt 1 — video identity

- Claim: short link redirects to `@cjtrowbridge` video `7675219187538595102`.
- Evidence: `curl -sI -L` Location `https://www.tiktok.com/@cjtrowbridge/video/7675219187538595102?_r=1&_t=ZP-98zS4qokXUc` (2026-08-18).
- Claim: title is "The new Qwen3.8:27b free open-source AI model is truly incredible".
- Evidence: TikTok oEmbed JSON `title` + `author_name` CJ Trowbridge, `embed_product_id` 7675219187538595102 (2026-08-18).
- Skeptic: SURVIVES.

## Receipt 2 — official Ollama default tag

- Claim: `qwen3.8:27b` / `qwen3.8:latest` is an 18GB Q4_K_M package (17GB language model + 931MB CLIP vision encoder), 27.3B params, Apache 2.0, 256K context, capabilities vision/tools/thinking.
- Evidence: live Ollama library page `https://ollama.com/library/qwen3.8:27b` (digest `22130167c4c2`, fetched 2026-08-18).
- Tags page lists 12 models (fetched 2026-08-18):
  - 18GB: `latest`, `27b`, `27b-mlx`, `27b-mtp-q4_K_M`, `27b-nvfp4`, `27b-q4_K_M`
  - 30GB: `27b-mtp-q8_0`, `27b-q8_0`
  - 32GB: `27b-mxfp8` (MLX)
  - 56GB: `27b-mlx-bf16`, `27b-mtp-bf16`, `27b-bf16`
- Skeptic: SURVIVES.

## Receipt 3 — Unsloth hardware table

- Claim: 4-bit Qwen3.8-27B targets 17–19GB total memory (RAM+VRAM or unified). Table: 2-bit 11–13GB, 3-bit 13–16GB, 4-bit 17–19GB, 6-bit 24GB, 8-bit 31GB, BF16 56GB.
- Evidence: `https://unsloth.ai/docs/models/qwen3.8` (fetched 2026-08-18). Unsloth also states the model "runs locally on 17GB RAM/VRAM setups."
- Skeptic: SURVIVES. Note: Unsloth's "RTX 5080" 17–19GB example is sloppy (5080 is 16GB VRAM) — that example is not a Dillon fact.

## Receipt 4 — 64GB RAM fit

- Claim: 64GB system RAM can hold the 18GB Q4_K_M and 30GB Q8_0 weights with OS headroom. 56GB BF16 is arithmetic-tight on a 64GB Windows box that also runs Chrome/Codex.
- Math: 64 − 18 = 46GB leftover (Q4); 64 − 30 = 34GB leftover (Q8); 64 − 56 = 8GB leftover (BF16).
- Killed phrasing: "RAM is not the limiter; GPU VRAM is" as a Dillon-specific assertion. Public Git does not record the 64GB machine's GPU or VRAM. Weight-fit in RAM survives; interactive-speed claims require a GPU that is not in this vault.
- Skeptic: KILL the VRAM-as-Dillon-limiter sentence. Keep the weight-fit arithmetic.

## Receipt 5 — speed (not Dillon-measured)

- Hardware Corner Q4 VRAM vs context (not independently re-run here): 4k/8k ≈ 18GB, 16k ≈ 19GB, 32k ≈ 20GB, 64k ≈ 22GB, 128k ≈ 26GB, 256k ≈ 34GB. Source: `https://www.hardware-corner.net/qwen3-8-27b-hardware-tests/`.
- GPU decode on 24GB-class cards is commonly reported in the ~40 tok/s range without MTP; MTP tables go higher. CPU-only dense 27B is slow; do not treat "~1 tok/s" as a measured receipt (orcarouter 2026-08-15 does not publish that number).
- Skeptic: CONTRADICTED on the precise "~1 tok/s" and "40–80 tok/s" band. Keep qualitative: GPU-resident Q4 is interactive; CPU-only is a demo.

## Receipt 6 — Dillon hardware in this vault

- The 64GB machine is named as the daily Windows orchestrator in `11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md`.
- `12_Brain/02_Entities/Ops Box (EliteDesk 800 G4).md` is a different always-on Ads Ops box.
- Public Git has no GPU model or VRAM for either machine.
- Skeptic: SURVIVES.

## Receipt 7 — runtime caveats

- Ollama v0.32.12 release notes add Qwen 3.8 27B support: `https://github.com/ollama/ollama/releases/tag/v0.32.12`.
- Thinking mode is on by default (Ollama library + Unsloth: `reasoning_effort` default `xhigh`).
- Native 256K context on a 24GB card needs KV-cache quantization (hardware-corner 256k ≈ 34GB vs sudoingX ~22GB with q4_0 KV).
- Skeptic: SURVIVES.

## Killed / not used

- Any invented GPU for Dillon's 64GB box.
- CPU "~1 tok/s" as a hard number.
- "RAM is not the limiter" as a Dillon hardware fact.
- Alibaba benchmark scores from the model card (not needed for a RAM-fit question; vendor-reported, not independently replicated in this pass).
