---
tags: [research, receipts, video, tiktok]
captured: 2026-08-17
topic: Honeycove weekly AI roundup vs Dillon OS stack
---

# 2026-08-17 — Honeycove Seedance roundup receipts

Input: https://www.tiktok.com/t/ZP8WfYYwp/ ("a couple really good ones…
The Sea Dance 2.5 one is awesome").

## Receipts

- Short link `https://www.tiktok.com/t/ZP8WfYYwp/` resolved 2026-08-17 to
  `https://www.tiktok.com/@ai.honeycove/video/7658018638837992717`
  (AI Honeycove weekly AI roundup, ~91s). ASR names six items, #2 as
  "C Dance" / Seedance 2.5.
- ByteDance Seed launch (2026-07-31):
  https://seed.bytedance.com/en/blog/one-take-creation-flexible-referencing-introducing-seedance-2-5
  — 30s one-take + multi-round extension; up to 30 images + 10 videos +
  10 audio refs in one pass; timestamp-level edit; clay-render camera
  control. Rolling out on Jimeng AI and Doubao Pro. BytePlus ModelArk API
  "coming soon" on that post. Homepage:
  https://seed.bytedance.com/en/seedance2_5
- Higgsfield marketing page https://higgsfield.ai/seedance/2.5 headlines
  "native 4K" / "native 1080p" and "50 references." Third-party catalog
  pull dated 2026-08-07
  (https://aivideosensei.com/guides/seedance-2-5-higgsfield-settings):
  model id `seedance_2_5`; modes `t2v`, `omni_reference`, `video_edit`,
  `video_extension`; duration 4–30s; live resolution enum **480p or
  720p**; `generate_audio` defaults true; no `start_image`/`end_image`
  on 2.5. This session: Higgsfield MCP `needsAuth` — not connected.
- This vault already names Higgsfield for "AI Video Outreach"
  (`02_Campaigns/AI Site Builder Outreach Engine/Slack Evidence Log.md`,
  Mac Frederick 2026-07-09).
- Krea 2: https://www.krea.ai/krea-2 (published 2026-05-12) and
  https://www.krea.ai/krea-2-open-source — moodboards + style refs;
  open weights `krea/Krea-2-Raw` and `krea/Krea-2-Turbo` (12B DiT,
  Turbo is 8-step distilled). Hosted API is paid.
- Mistral OCR 4: https://mistral.ai/news/ocr-4/ and
  https://docs.mistral.ai/models/ocr-4-0 (`mistral-ocr-4-0`, GA
  2026-06-23) — bounding boxes, block types, confidence; 170 languages;
  API listed at $4 / 1k pages (batch $2; Document AI $5). Self-host
  container is an enterprise path, not a free local default.
- Qwen-AgentWorld: https://github.com/QwenLM/Qwen-AgentWorld and
  https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B — language world
  model over 7 domains (MCP, Search, Terminal, SWE, Android, Web, OS).
  Vendor bench is AgentWorldBench, not a drop-in coding-model swap.
- DeepReinforce Ornith 1.0 and OpenAI GPT-5.6 Soul/Terra/Luna appear in
  the TikTok ranking only. No official install path in this repo.

## Skeptic

- "Sea Dance" is Seedance. Treat the TikTok ranking as untrusted hype.
- ByteDance did not publish a resolution. Higgsfield's site says 4K;
  the shipped Higgsfield enum is 480p/720p. Live ceiling = 720p until
  ByteDance or a live API says otherwise.
- "50 multimodal refs" is marketing math. Official Seed split is
  30 + 10 + 10.
- Jimeng / Doubao Pro are China-facing official UIs, not a confirmed
  US cloud-agent path. Do not `cli-hub install jimeng` from a catalog
  caption.
- Krea "2K in ~2s" is roundup talk. Official Turbo claim is 8-step
  distillation, not a timed 2K SLA. Do not download 12B weights here.
- Mistral OCR 4 is real and useful for FDD/client PDFs. It is paid.
  No key ⇒ no calls.
- AgentWorld "beats GPT-5.4 / Opus 4.8 on AgentWarBench" is TikTok
  wording. The project's own bench is AgentWorldBench. Watch-only.
- Ornith / GPT-5.6 are not stack installs. Do not swap the coding model.

## Survivors

- Institute `/seedance` as the production-adjacent video skill: draft
  30s one-take / 9:16 ads and outreach clips; Higgsfield `seedance_2_5`
  only after operator auth + spend approval; never claim 4K.
- Institute `/krea-2` as the thin-harvest atmosphere-still skill.
  Harvest photos win. Label generated. No weight download.
- Institute `/mistral-ocr` as a key-gated PDF reader for franchise /
  client docs. Stop without `MISTRAL_API_KEY`. No spend.
- Watch-only: Qwen-AgentWorld, Ornith 1.0, GPT-5.6 Soul/Terra/Luna.
