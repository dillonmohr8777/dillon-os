---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-09-19T15:49:09
session_last: 2026-09-19T15:49:09
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-09-19\i-need-you-to-analyze-everything"
open_flags: [unverified]
tags: [codex-recovery, session, 202609]
---

# Documents\Codex\2026-09-19\i-need-you-to-analyze-everything

**1 session(s)** · 2026-09-19 15:49 → 2026-09-19 15:49 · 2.4h agent-time (summed; sessions may overlap) · 3 MB transcript · 11/12 turns completed

> **Open flags:** `unverified`

## 1. 2026-09-19 15:49 · 2.4h · 3.1 MB

`01a0ba5b-70aa-7573-9276-270926f18393` · turns 11/12 · flags: unverified

**Asked:**

> I need you to analyze everything I do every day, and I had a conversation with ChatGPT last night. Obviously this is the coding model, but I want to know the best glasses that I can actually hook up to my AI models.

> Yes. For truly wireless AI glasses—no cable to your Mac mini—these are the ones worth looking at under your $700 cap.
> 
> Glasses	Price	HUD/display	Camera	Custom AI potential
> 1. Rokid Glasses	$699	✅ Dual-eye	✅ 12MP	Excellent
> 2. Brilliant Labs Halo	$399	✅ Color	Optical AI sensor	Excellent / open source
> 3. Mentra Live	$449	❌	✅ 12MP	Excellent / open-source OS
> 4. Solos AirGo V2	$299	❌	✅ 16MP	Excellent / SDK + multiple models
> 5. Even Realities G2	$599	✅ Dual-eye	❌	Very good / developer platform
> 6. Halliday G2	$599	✅ Dual-eye	❌	Moderate
> 7. Ray-Ban Meta Gen 2	$379+	❌	✅	Very good SDK
> 8. Oakley Meta HSTN	~$399+	❌	✅	Very good SDK
> 9. Rokid AI Glasses Style	$299	❌	✅ 12MP	Good
> 10. Meta Starfire Kylie	$399	❌	✅ 12MP	Limited currently
> 
> The three I think match what you’re actually after
> 
> 1. Rokid Glasses — $699
> 
> This is the closest match to “I want wireless glasses that actually put AI in front of my eyes.”

> Short and sweet. Just give me your pick.

**Outcome reported:**

> If you mean **ChatGPT, Claude and Codex**:
> 
> - You can install compatible Android apps on the **Beam Pro** because it has the Google Play Store.
> - The glasses display those apps, and you can use voice dictation through the microphones.
> - There is **no built-in Mac terminal or coding environment**.
> - To see your real Mac mini terminals, you must install a remote-desktop or SSH app on Beam Pro and configure the Mac mini.
> - Codex/Claude Code would still run on the Mac mini. The glasses are the screen; Beam Pro is the Android controller.
> - Reliable voice control of those Mac terminals would require a bridge we build.
> 
> XREAL officially promises Google Play apps, Wi‑Fi, Bluetooth keyboards/mice and a large virtual workspace. It does **not** promise a ready-made wireless Mac coding workstation. I inferred the remote-desktop setup from its Android/Google Play capabilities and overstated it as included. [XREAL Beam Pro details](https://www.xreal.com/beampro), [XREAL One details](https://us.shop.xreal.com/products/xreal-one)
> 
> **Bluntly:** it’s buildable, but not plug-and-play. If you expect to put them on and immediately operate Codex terminals by voice, don’t buy them yet.

> Yes—**XREAL One can show your actual Mac mini desktop like a wearable monitor**. You can see Codex, Claude, browsers, terminals and code editors exactly as you would on your current display, using a keyboard and mouse.
> 
> - **Reliable option:** USB‑C cable directly to the Mac mini.
> - **Wireless option:** Beam Pro plus a remote-desktop app over Wi‑Fi; usable for coding, but requires setup and may have latency.
> 
> So the bundle meets your bare minimum. The glasses display everything; they just don’t replace the keyboard/mouse or automatically provide voice control. [XREAL documents Mac desktop and spatial-monitor use](https://us.shop.xreal.com/products/xreal-one).

> Stopped all five Luna Max research threads to conserve usage.

> ## Consolidated answer
> 
> **My new pick for your exact requirements is the VITURE Luma Ultra + Pro Neckband.**
> 
> It is the closest thing under $1,000 to glasses you can walk around the house wearing, control without touching the Mac mini, watch private TV on, access AI apps through, and use to view your Mac desktop.
> 
> ### The setup
> 
> - **VITURE Luma Ultra glasses — $599**
> - **Pro Neckband 8GB/128GB — $249**
> - **Total: approximately $848 before tax**
> - Upgrading to the 12GB/256GB neckband brings the total to about **$927**.
> 
> The glasses provide a private **1920×1200-per-eye, 120Hz Micro-OLED display**, 52° field of view, 1500-nit claimed brightness, spatial audio, a microphone, front camera, depth cameras, 6DoF tracking and hand gestures. [VITURE Luma Ultra specifications](https://www.viture.com/product/viture-luma-ultra-xr-glasses)
> 
> The neckband supplies Android, Google Play, Wi-Fi 6E, Bluetooth, a microphone, four-plus hours of battery life and apps without being connected to the Mac. You can control it through:
> 
> - Hand gestures
> - Your phone as a trackpad or air mouse
> - Neckband buttons
> - A Bluetooth keyboard, mouse or controller
> 
> [VITURE Pro Neckband specifications](https://www.viture.com/product/viture-pro-neckband) and [control documentation](https://www.viture.com/academy/neckband/pro).
> 
> ### What it will actually do
> 
> **TV and movies:** Yes. Install Netflix, YouTube, Disney+, Plex and other Android apps directly on the neckband. The Mac does not need to be running.
> 
> **See your Mac mini desktop:** Yes, over your home network. The practical route is:
> 
> `Mac mini → Sunshine → home Wi-Fi → Moonlight on Neckband → glasses`
> 
> Sunshine officially supports macOS 14.2+, Apple hardware encoding and macOS screen capture. [Sunshine documentation](https://docs.lizardbyte.dev/projects/sunshine/latest/)
> 
> **See Codex, terminals and your coding apps:** Yes. You will be looking at the real Mac desktop—not a pretend glasses coding environment.
> 
> **Control the desktop:** Yes, with a Bluetooth keyboard and mouse. The phone remote can handle basic pointing, but it is not how I would seriously code.
> 
> **Speak prompts:** Partially out of the box. You can speak to ChatGPT, Claude and VITURE’s Vizard through the glasses/neckband microphone. However, speech will **not automatically control Codex Desktop or type into your Mac terminal**. That final feature needs a small voice-to-agent bridge installed on the Mac. It is buildable, but I do not want to misrepresent it as included.
> 
> You would **not download “ChatGPT Quad.”** Your AI apps can run on the Android neckband, while your real cod

> Opened four separate browser tabs in Codex:
> 
> - VITURE Luma Ultra
> - VITURE Pro Neckband
> - Meta Quest 3
> - XREAL One + Beam Pro bundle

> - [VITURE Luma Ultra](https://www.viture.com/product/viture-luma-ultra-xr-glasses)
> - [VITURE Pro Neckband](https://www.viture.com/product/viture-pro-neckband)
> - [Meta Quest 3](https://www.meta.com/quest/quest-3/)
> - [XREAL One + Beam Pro Bundle](https://us.shop.xreal.com/products/xreal-one-xreal-beam-pro-bundle)

<sub>rollout: `C:\Users\dillo\.codex\sessions\2026\09\19\rollout-2026-09-19T11-49-09-01a0ba5b-70aa-7573-9276-270926f18393.jsonl`</sub>
