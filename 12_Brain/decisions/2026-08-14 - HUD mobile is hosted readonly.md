---
tags: [decision]
decided: 2026-08-14
status: active
supersedes:
source: "[[12_Brain/protocols/HUD Protocol]]"
updated: 2026-08-14
---

# 2026-08-14 — HUD mobile is a hosted read-only snapshot

**Decision:** Dillon OS on a phone is a hosted operator at
https://dillon-os-hud.netlify.app. Inbox captures, Today checks, and skill
queues write into Git. Claude `/api/run` stays on loopback.

**Why:** A screenshot of vitals is not an OS. The Command Deck still cannot
run on the public internet. Capture, checkboxes, and deep links can.

**Implications:**

- Add to Home Screen is the daily phone entry.
- Hosted writes need a fine-grained GitHub token stored on the phone (this repo, Contents read/write).
- `mail_ready` still cannot flip from the phone.
- `NETLIFY_AUTH_TOKEN` publishes the shell. GitHub Action `hud-mobile.yml` rebuilds it.
