---
tags: [raw, research, local-llm, qwen, ollama, hardware]
captured: 2026-08-18
method: "official Ollama pricing + cloud docs, QwenCloud Token Plan, NVIDIA PSU FAQ, Hardware Corner, skeptic subagent"
agent: cloud (cursor/qwen38-64gb-ram-d550)
note_type: capture
status: unprocessed
created: 2026-08-18
updated: 2026-08-18
source_refs:
  - https://ollama.com/pricing
  - https://docs.ollama.com/cloud
  - https://ollama.com/library/qwen3.8
  - https://docs.qwencloud.com/token-plan/personal/token-plan-personal-overview
  - https://nvidia.custhelp.com/app/answers/detail/a_id/5396
  - https://www.hardware-corner.net/qwen3-8-27b-hardware-tests/
---

# Raw receipts — Qwen3.8 Ollama plan and buy list, 2026-08-18

Question from Dillon: what plan to get on, and what to buy, so Ollama can run Qwen the way he actually wants (the TikTok `qwen3.8:27b` coding-agent feel).

## Receipt 1 — Ollama plan

- Claim: local `qwen3.8:27b` does not need Ollama Pro or Max. Official FAQ: "Running models on your own hardware is always unlimited."
- Free $0: local unlimited + light cloud. Pro $20/mo or $200/yr: 50x cloud usage, 3 concurrent cloud models, private-model upload. Max $100/mo: 5x Pro cloud usage, 10 concurrent; **new Max signups paused**.
- Evidence: https://ollama.com/pricing (fetched 2026-08-18).
- Skeptic: SURVIVES.

## Receipt 2 — Claude Max not required for the launcher

- Claim: `ollama launch claude --model qwen3.8` is on the official library page. Ollama's Claude Code integration points the harness at `http://localhost:11434` with `ANTHROPIC_AUTH_TOKEN=ollama`.
- Evidence: https://ollama.com/library/qwen3.8 Applications section; https://docs.ollama.com/integrations/claude-code (skeptic 2026-08-18).
- Skeptic: SURVIVES.

## Receipt 3 — QwenCloud Token Plan is a different product

- Promo Individual: Lite $6 (list $8), Standard $18 (list $25), Pro $68 (list $80). 7-day credits 2,500 / 10,000 / 40,000.
- Official supported-model allowlist includes `qwen3.8-max`, **not** `qwen3.8-27b`.
- Singapore region, Global inference, cross-border data transfer. No API automation. Personal edition "does not currently support cancellation."
- Evidence: https://docs.qwencloud.com/token-plan/personal/token-plan-personal-overview (fetched 2026-08-18).
- Skeptic: SURVIVES. Do not sell Token Plan as the TikTok 27B.

## Receipt 4 — 24GB VRAM is the local "really want" floor

- Hardware Corner Q4 measured VRAM: 8k ≈ 18GB, 64k ≈ 22GB, 128k ≈ 26GB, 256k ≈ 34GB. Practical 24GB card target = 64k.
- Unsloth 4-bit row is 17–19GB total memory; 8-bit 31GB; BF16 56GB.
- 16GB cards cannot hold default Q4 fully on-GPU. CPU-only on 64GB RAM loads the file; it is not the GPU-resident agent feel.
- Evidence: https://www.hardware-corner.net/qwen3-8-27b-hardware-tests/ ; https://unsloth.ai/docs/models/qwen3.8
- Skeptic: SURVIVES.

## Receipt 5 — GPU ladder and PSU, prices not locked

- 3090 = 24GB, 4090 = 24GB faster, 5090 = 32GB (128k class).
- NVIDIA: 4090 TGP 450W, minimum recommended PSU **850W**, ≥3x 8-pin or 450W+ 12VHPWR. 3090 user guide system PSU **750W**. 5090 NVIDIA required system power **1000W** (TGP 575W).
- Used 3090: RigPrice going rate **$1,350** on 2026-08-18; other trackers lower. Do not lock a single street price.
- 5090 street: Newegg listings in this pass commonly **$4,800–$6,000** vs $1,999 MSRP. Overkill for an 18GB Q4 pull.
- Skeptic: SURVIVES with the price-range caveat. CraftRigs "$700–900" was **not** the live going rate in this pass.

## Receipt 6 — Dillon chassis unknown

- 64GB machine: RAM known, GPU / case / PSU unrecorded in public Git.
- EliteDesk 800 G4 Ops Box is a different always-on machine. Do not assume either box has a 3-slot 300mm bay or 8-pin PCIe cables.
- Skeptic: SURVIVES.

## Receipt 7 — software

- Ollama ≥ 0.32.12, default pull 18GB. NVIDIA driver only if an NVIDIA GPU exists. ~50GB disk is a buffer, not an official size.
- Skeptic: SURVIVES.

## Killed / not used

- Any invented Dillon GPU.
- "Buy Ollama Pro to run Qwen3.8 locally."
- "Token Plan Standard = the TikTok 27B."
- A single used-3090 dollar figure.
- Recommending a $4k+ 5090 as required for this 27B.
