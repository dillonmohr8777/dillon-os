---
note_type: research
status: verified
created: 2026-08-18
updated: 2026-08-18
owner: Dillon Mohr
question: What Ollama plan and hardware should Dillon buy so Qwen3.8-27B feels like the TikTok, not just loads?
verification_status: verified
confidence: 0.88
expires: 2026-11-16
review_on: 2026-09-18
source_refs:
  - "[[12_Brain/01_Captures/research/2026-08-18 - research - Qwen3.8 Ollama plan and buy list]]"
  - "[[12_Brain/06_Research/Qwen3.8-27B local RAM fit]]"
  - https://ollama.com/pricing
  - https://ollama.com/library/qwen3.8
  - https://docs.qwencloud.com/token-plan/personal/token-plan-personal-overview
  - https://nvidia.custhelp.com/app/answers/detail/a_id/5396
  - https://www.hardware-corner.net/qwen3-8-27b-hardware-tests/
tags:
  - brain
  - research
  - local-llm
  - qwen
  - ollama
  - hardware
---

# Qwen3.8 Ollama plan and buy list

**Summary:** Ollama Free is the plan. The TikTok feel is a 24GB NVIDIA GPU that actually fits the 64GB box, not a subscription.

## Conclusion

You do not buy an Ollama paid tier to run `qwen3.8:27b` on your machine. Local is unlimited on Free. What you buy — if the case and power supply can take it — is **24GB of VRAM**. Without that card, 64GB of system RAM still loads the 18GB Q4 file and it will crawl. That is not the video.

Spend stays approval-gated. This page is a shopping spec, not a purchase. Quality vs Cursor/Claude: [[Qwen3.8-27B quality]].

## Plan (software)

| Product | Get this? | Why |
|---|---|---|
| **Ollama Free** | Yes | Local models are unlimited. This is the TikTok path. |
| Ollama Pro ($20/mo) | No, for this goal | Extra **cloud** quota and 3 concurrent hosted models. Not required to run 27B locally. |
| Ollama Max ($100/mo) | No | New signups paused. Cloud-only capacity. |
| Claude Max | No, for this path | `ollama launch claude --model qwen3.8` points Claude Code at local Ollama. |
| QwenCloud Token Plan ($6 / $18 / $68 promo) | Only as a **different** product | Hosted `qwen3.8-max`, not the 27B. Singapore/Global inference. No API automation. Personal plan currently cannot be cancelled. |

Install free: Ollama 0.32.12 or newer, current NVIDIA driver **if** the card is NVIDIA, and about 50GB disk for the 18GB pull plus headroom.

```powershell
ollama run qwen3.8
ollama launch claude --model qwen3.8
```

## Buy (hardware) if you want it fast

Check the 64GB box **before** ordering a card. Public Git does not record that machine's GPU, case, or PSU. The EliteDesk 800 G4 Ops Box is a different chassis and is the wrong place to assume a 350W+ card will fit.

Look at: GPU slot length (need ~300mm+), how many PCIe slots the cooler needs (often 3), PSU wattage sticker, and whether you have spare 8-pin PCIe cables.

| Want | Buy | Notes |
|---|---|---|
| Value, same 24GB class as the 4090 | Used **RTX 3090 24GB** | NVIDIA system PSU rec **750W**. Street prices move; verify live listings. This pass saw a used going-rate around $1,350 and other trackers lower. |
| Faster at the same 24GB ceiling | **RTX 4090 24GB** | NVIDIA: 450W TGP, **850W** PSU, ≥3x 8-pin or 450W+ 12VHPWR. Same 64k-class context as the 3090. |
| 128k on-GPU without squeezing | **RTX 5090 32GB** | NVIDIA **1000W** system floor, huge dual-slot/triple-slot card. Street listings this pass were commonly $4,800+. Overkill for an 18GB Q4. |
| Card will not physically fit | Do not force it | Buy a mid-tower + 850W (3090/4090) or 1000W+ ATX 3.1 (5090) first, or skip hardware and use a hosted plan. |
| Disk | 50GB+ free on a fast NVMe | The pull is 18GB. Leave room for a second quant. |
| RAM | Keep the 64GB | Already enough. Do not buy more RAM for this 27B. |

A 16GB card is a squeeze on the default Q4. A 24GB card is the floor for GPU-resident Q4 at 8K–64K. Full 256K is a 32GB+ (or quantized-KV) problem.

## If you refuse to buy a GPU

Use Ollama Free locally only if you accept demo speed. For a fast **hosted** Qwen agent, Token Plan Standard ($18 promo) or Ollama Pro ($20) are the cheap monthly lanes — they are **not** the local 27B, and prompts leave the machine.

## Verification

Skeptic pass 2026-08-18: plan split, Claude-launcher path, Token Plan ≠ 27B, 24GB floor, unknown chassis, and "do not lock a 3090 price" all survived. Killed: inventing Dillon's GPU; "need Pro to run locally"; treating Token Plan as the TikTok model.

## Links

- [[12_Brain/01_Captures/research/2026-08-18 - research - Qwen3.8 Ollama plan and buy list]]
- [[12_Brain/06_Research/Qwen3.8-27B local RAM fit]]
- [[12_Brain/06_Research/Qwen3.8-27B quality]]
- [[11_Agents/64gb Morning Orchestrator Spec 2026-07-08]]
- [[12_Brain/02_Entities/Ops Box (EliteDesk 800 G4)]]
