---
tags: [raw, research, picoclaw, immohrtal, agents]
captured: 2026-08-18
method: "Operator asked for a Claude upgrade prompt, vault knowledge, and a ten-brain roster"
agent: cloud (cursor/immohrtal-claw-d550)
note_type: capture
status: compiled
created: 2026-08-18
updated: 2026-08-18
source_refs:
  - "[[12_Brain/05_Projects/IMMOHRTAL CLAW]]"
  - immohrtal-claw/CLAUDE-UPGRADE-PROMPT.md
  - immohrtal-claw/src/models.js
---

# Raw receipts — IMMOHRTAL CLAW ten brains and Claude prompt, 2026-08-18

Dillon: give Claude a prompt to make CLAW a lot better with a real knowledge base. Point at Opus 5 via Align HCM, then Grok 4.6. Configure top 5 local open-weight models and top 5 cloud (Claude, OpenAI, Grok, Composer 2.5, plus one outside that family). Full access, more skills. He also asked for no latency and no mistakes.

## Receipt

- Knowledge base: vault allowlist via `kb_search` / `kb_read`. Not a dump of the whole vault.
- Cloud fifth family: Google Gemini 2.5 Pro. Composer 2.5 has no public API.
- Local five: Qwen3.6 27B, Gemma 4 31B, Qwen3-Coder, Llama 4 Scout, DeepSeek V4 Flash. Giant 1T open weights stay API-class.
- Paste prompt: `immohrtal-claw/CLAUDE-UPGRADE-PROMPT.md`
- Zero latency and zero mistakes were refused as claims. Fast path + sourced tools instead.
- Exec, send, publish, spend still gated.

## Compile targets

- Project: [[12_Brain/05_Projects/IMMOHRTAL CLAW]]
