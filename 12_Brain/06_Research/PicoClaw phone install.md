---
note_type: research
status: verified
created: 2026-08-18
updated: 2026-08-18
owner: Dillon Mohr
question: What is the open-source phone skill in TikTok ZP8WqymUW, and how do I put it on my own phone?
verification_status: verified
confidence: 0.9
expires: 2026-11-16
review_on: 2026-09-18
source_refs:
  - "[[12_Brain/01_Captures/research/2026-08-18 - research - PicoClaw phone skill]]"
  - https://www.tiktok.com/t/ZP8WqymUW/
  - https://www.tiktok.com/@user358804322/video/7674274025966750989
  - https://github.com/sipeed/picoclaw
  - https://github.com/sipeed/picoclaw/releases/tag/v0.3.1
  - https://github.com/sipeed/picoclaw/blob/main/docs/guides/android-termux.md
  - https://picoclaw.io/download
tags:
  - brain
  - research
  - picoclaw
  - android
  - local-llm
---

# PicoClaw phone install

**Summary:** The TikTok is Sipeed **PicoClaw**, a tiny MIT Go agent for Android. Get the APK from picoclaw.io or the Termux ARM64 binary from GitHub. It is not Qwen-on-phone and not an iPhone app.

## Conclusion

This is the open-source thing in the video. Put it on an **Android** phone. Official source is [sipeed/picoclaw](https://github.com/sipeed/picoclaw) (MIT). Latest GitHub release this pass: **v0.3.1** (2026-07-03). This agent cannot install it onto your handset; the two official phone paths are below.

It is an agent **harness** (~10–20MB RAM). The brain still needs an LLM API key, or a URL to a local model. It will not load `qwen3.8:27b` on the phone.

## Get it on the phone (Android ARM64)

**Path A — APK, no Termux.** Download from the only official site: [picoclaw.io/download](https://picoclaw.io/download/). GitHub also ships `picoclaw-android-universal.zip` on the [v0.3.1 release](https://github.com/sipeed/picoclaw/releases/tag/v0.3.1). Install, allow unknown sources if Android asks, tap Start Service, open `http://127.0.0.1:18800` for the Web UI.

**Path B — Termux CLI** (older / locked-down phones). Termux from [GitHub Releases](https://github.com/termux/termux-app/releases) or F-Droid, not a random Play clone.

```bash
pkg update
pkg install -y wget tar proot
mkdir -p ~/picoclaw && cd ~/picoclaw
wget https://github.com/sipeed/picoclaw/releases/latest/download/picoclaw_Linux_arm64.tar.gz
tar xzf picoclaw_Linux_arm64.tar.gz
chmod +x ./picoclaw
termux-chroot ./picoclaw onboard
```

Confirm `uname -m` is `aarch64`. Then `termux-chroot ./picoclaw agent -m "Hello from Termux"`. Long-running: `termux-chroot ./picoclaw gateway`. Turn off battery optimization for Termux or Android will kill it.

Extra ClawHub skills (after the agent is running, not the TikTok itself):

```bash
picoclaw skills search "web scraping"
picoclaw skills install <skill-name>
```

## Do not

- Use clone sites (`.org`, `.ai`, random `.com`). Official: **picoclaw.io** and **sipeed.com**. No official crypto.
- Expect an iPhone App Store build. Darwin_arm64 in Releases is macOS.
- Confuse this with OpenClaw `paired` (Bluetooth SMS on your number) or with local Qwen 27B.
- Put API keys in this vault.

## Verification

TikTok identity, official repo, v0.3.1 Android zip + Linux arm64 tarball, and Termux guide survived 2026-08-18. Killed: installing onto Dillon's phone from here; inventing phone OS; treating PicoClaw as on-device 27B weights.

Expires 2026-11-16. Re-check the GitHub latest tag if the APK name changes.

## Links

- [[12_Brain/01_Captures/research/2026-08-18 - research - PicoClaw phone skill]]
- [[12_Brain/06_Research/Qwen3.8-27B local RAM fit]]
