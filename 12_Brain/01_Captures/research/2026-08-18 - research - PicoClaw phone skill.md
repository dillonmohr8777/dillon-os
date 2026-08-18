---
tags: [raw, research, picoclaw, android, local-llm]
captured: 2026-08-18
method: "TikTok oEmbed + curl redirect, sipeed/picoclaw README + android-termux.md + GitHub Releases v0.3.1"
agent: cloud (cursor/qwen38-64gb-ram-d550)
note_type: capture
status: compiled
created: 2026-08-18
updated: 2026-08-18
source_refs:
  - https://www.tiktok.com/t/ZP8WqymUW/
  - https://www.tiktok.com/@user358804322/video/7674274025966750989
  - https://www.tiktok.com/oembed?url=https://www.tiktok.com/@user358804322/video/7674274025966750989
  - https://github.com/sipeed/picoclaw
  - https://github.com/sipeed/picoclaw/releases/tag/v0.3.1
  - https://raw.githubusercontent.com/sipeed/picoclaw/main/docs/guides/android-termux.md
  - https://raw.githubusercontent.com/sipeed/picoclaw/main/docs/guides/hardware-compatibility.md
  - https://picoclaw.io/download
---

# Raw receipts — PicoClaw phone install from TikTok ZP8WqymUW, 2026-08-18

Question from Dillon: find the open-source skill for my own phone. Short link `https://www.tiktok.com/t/ZP8WqymUW/`.

## Receipt 1 — video identity

- Claim: short link 301s to `@user358804322` video `7674274025966750989`.
- Evidence: `curl -sI -L` Location `https://www.tiktok.com/@user358804322/video/7674274025966750989?_r=1&_t=ZP-98zWK3iNTGY` (2026-08-18).
- Claim: title is "China's $10 AI Agent Runs on RAM Smaller Than Your Phone's Cache #ChinaTech #AIAgent #OpenSource #PicoClaw #fyp #viral". Author display name Beauty / `@user358804322`.
- Evidence: TikTok oEmbed JSON `title`, `author_name`, `embed_product_id` 7674274025966750989 (2026-08-18).
- Skeptic: SURVIVES.

## Receipt 2 — the thing in the video is PicoClaw, not a ClawHub skill

- Claim: official project is Sipeed **PicoClaw**, MIT, Go, independent (not a fork of OpenClaw). Repo `https://github.com/sipeed/picoclaw`. Homepage `https://picoclaw.io`.
- Claim: core footprint marketed as <10MB RAM / $10 hardware; README notes recent builds may use 10–20MB.
- Evidence: GitHub README fetched 2026-08-18 (~29.9k stars).
- Skeptic: SURVIVES. Do not treat this as Qwen3.8-27B on the phone. The harness is tiny; the model is an API (or a pointed-at local server). Official hardware list: "Network: Required (for LLM API calls)."

## Receipt 3 — official Android / phone paths

- Claim: Android APK path is [picoclaw.io/download](https://picoclaw.io/download/). README: "Download the APK from picoclaw.io/download and install directly. No Termux required!"
- Claim: GitHub Releases also ships `picoclaw-android-universal.zip` (v0.3.1, 19.5 MB, published 2026-07-03). Latest tag this pass: **v0.3.1**.
- Claim: Termux path is official `docs/guides/android-termux.md`: ARM64 (`uname -m` = `aarch64`), Termux from GitHub Releases or F-Droid, then `picoclaw_Linux_arm64.tar.gz` + `termux-chroot ./picoclaw onboard`.
- Claim: hardware list says any ARM64 Android phone (2015+) with 1GB+ RAM via Termux + proot.
- Evidence: README Android section; https://github.com/sipeed/picoclaw/releases/tag/v0.3.1 ; android-termux.md and hardware-compatibility.md raw (2026-08-18).
- Skeptic: SURVIVES. This cloud agent cannot sideload onto Dillon's handset. iOS App Store is **not** in the official matrix; Darwin_arm64 is macOS.

## Receipt 4 — "skills" are extras after PicoClaw is installed

- Claim: PicoClaw loads `SKILL.md` files. Install extras with `picoclaw skills search "…"` and `picoclaw skills install <skill-name>` (ClawHub).
- Evidence: README Skills section (2026-08-18).
- Skeptic: SURVIVES. The TikTok ask is the agent itself, not a named ClawHub skill called "phone."

## Receipt 5 — stay on official sources

- Claim: README caution: only official sites are **picoclaw.io** and **sipeed.com**. No official crypto. Many `.ai/.org/.com/.net` clones. Early software; do not treat as production-hardened before v1.0.
- Evidence: README Security Notice (2026-08-18).
- Skeptic: SURVIVES.

## Killed / not used

- OpenClaw `paired` Bluetooth SMS skill (different product; uses your number, not this video).
- MobileClaw / ClawMobile (OpenClaw-on-phone ports, not the #PicoClaw TikTok).
- Running `qwen3.8:27b` on the phone.
- Inventing Dillon's phone OS (Android vs iPhone unrecorded in this vault).
- Putting APKs or zips into Git.
