---
name: model-router
description: Pick among the ten configured brains. Opus 5 first, then Grok 4.6.
---

# Model router

Ten brains. Five local open-weight. Five cloud.

Default cloud order: Claude Opus 5 (Align HCM key) → Grok 4.6 → GPT-5.6 Sol → Gemini 2.5 Pro. Composer 2.5 is Cursor-IDE-only unless `CLAW_COMPOSER_BASE_URL` is set.

Use `model_list` to see readiness. Use `model_select` only when the operator asks to switch, or when the current brain is rehearsal and a live key exists.

Local Qwen3.6 27B is the default workstation brain. Qwen3-Coder for code. Llama 4 Scout for long context. Gemma 4 31B for dense reasoning. DeepSeek V4 Flash for local DeepSeek.

Do not pretend a missing key is live. Do not promise zero latency.
