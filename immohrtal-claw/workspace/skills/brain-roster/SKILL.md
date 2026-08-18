---
name: brain-roster
description: Ten-brain roster. Sol, Grok, Opus, Gemini, Composer, and the five local Ollama tags with exact near-miss aliases.
---

# Brain roster

Ten brains. Five local. Five cloud. The picker is the source of truth.

## When to use

Dillon asks which model is live, why a brain is not ready, whether Sol or Grok
can run, or which Ollama tag is actually installed.

## Tools

`model_list` for readiness. `model_select` only when he asks to switch, or when
the current brain is rehearsal and a live key or pulled tag exists. Probe is a
UI action (`Probe live brains`); do not invent a live probe from chat.

## How

1. Name the current brain from the live-brain line in context.
2. For a not-ready cloud brain, name the missing env: Opus needs
   `ANTHROPIC_API_KEY`, Sol needs `OPENAI_API_KEY`, Grok needs `XAI_API_KEY`,
   Gemini needs `GEMINI_API_KEY`, Composer needs `CLAW_COMPOSER_BASE_URL`.
3. For a not-ready local brain, name the exact `ollama pull` tag. Exact aliases
   that are allowed: `gemma4:26b` for Gemma 4 31B, `qwen3-coder:30b` for
   Qwen3-Coder. Prefixes are not aliases. `gemma4:31b-cloud` is not
   `gemma4:31b`. `qwen3.5:27b-q4_K_M` is not Qwen3.6.
4. Do not call a cloud brain live because the catalog lists it. Ready means a
   key is present and, after probe, the provider answered.

## Stop conditions

- Do not invent API keys or paste them.
- Do not download a 1T-class weight.
- Do not claim Opus, Sol, or Grok ran if this box has no key.

## Approval boundary

Local picker and `.env` only. No spend, no new vendor account, no Custom GPT.
