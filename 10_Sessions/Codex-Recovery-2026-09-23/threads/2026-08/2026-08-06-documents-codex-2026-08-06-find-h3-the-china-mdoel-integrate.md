---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-08-06T17:05:26
session_last: 2026-08-06T17:05:26
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-08-06\find-h3-the-china-mdoel-integrate"
tags: [codex-recovery, session, 202608]
---

# Documents\Codex\2026-08-06\find-h3-the-china-mdoel-integrate

**1 session(s)** · 2026-08-06 17:05 → 2026-08-06 17:05 · 42m agent-time (summed; sessions may overlap) · 4 MB transcript · 3/3 turns completed

## 1. 2026-08-06 17:05 · 42m · 3.7 MB

`019fd809-7686-7722-9250-0e7208a213ed` · turns 3/3

**Asked:**

> Find h3 the china mdoel integrate it into our stack for video generation spin an in app browser session

**Outcome reported:**

> MiniMax H3 is integrated into the workspace and the in-app browser session is open.
> 
> - Added official T2V, I2V, and reference-to-video workflows.
> - Added a Comfy Cloud API adapter for submitting, monitoring, and downloading generations.
> - Verification passed: syntax checks and 3/3 tests.
> - Routed generation through Comfy Cloud because this machine has Intel UHD 630 graphics and no CUDA-capable NVIDIA GPU.
> - H3 supports synchronized stereo audio, multimodal references, 24 fps, up to roughly 15 seconds, and advertised output up to 2K. [Official ComfyUI H3 guide](https://docs.comfy.org/tutorials/video/minimax/minimax-h3)
> 
> Start with [README.md](C:/Users/dillo/Documents/Codex/2026-08-06/find-h3-the-china-mdoel-integrate/README.md) and [SOURCES.md](C:/Users/dillo/Documents/Codex/2026-08-06/find-h3-the-china-mdoel-integrate/SOURCES.md).
> 
> The visible browser is waiting at Comfy Cloud sign-in. Sign in there and tell me when ready. Browser generation can then proceed immediately. Programmatic generation additionally requires Creator/Pro API access and a key stored securely outside the repository. [Comfy Cloud API requirements](https://docs.comfy.org/api-reference/cloud/overview)
> 
> No paid generation has been submitted yet, so the integration is tested and account-ready, but not generation-verified.
> 

> H3 itself doesn’t impose a monthly video count. Our limit is Comfy Cloud credits and active GPU runtime.
> 
> Each H3 generation can produce:
> 
> - Up to about 15 seconds
> - Up to 2K resolution at 24 fps
> - Text-to-video, image-to-video, or reference-to-video
> - Native synchronized dialogue, music, and sound effects
> - Up to 9 reference images, 3 reference videos, and 3 audio references [H3 documentation](https://docs.comfy.org/tutorials/video/minimax/minimax-h3)
> 
> ### Monthly capacity
> 
> | Plan | Monthly credits | Comfy’s advertised 5s videos* | API concurrency |
> |---|---:|---:|---:|
> | Standard | 4,200 | ~380 | 1 |
> | Creator | 7,400 | ~670 | 3 |
> | Pro | 21,100 | ~1,915 | 5 |
> 
> \*Those advertised numbers use lightweight Wan 2.2 settings—not H3. H3 will likely produce fewer because it is a heavier video-and-audio model. [Current Comfy pricing](https://comfy.org/cloud/pricing)
> 
> Cloud GPU use currently costs about 0.266 credits per second. That gives these practical H3 scenarios:
> 
> | Average H3 runtime | Standard | Creator | Pro |
> |---|---:|---:|---:|
> | 1 minute/run | ~263 clips | ~463 clips | ~1,322 clips |
> | 3 minutes/run | ~87 clips | ~154 clips | ~440 clips |
> | 5 minutes/run | ~52 clips | ~92 clips | ~264 clips |
> 
> The exact H3 number requires one real benchmark generation because resolution, duration, references, audio, steps, and upscaling materially affect runtime.
> 
> For finished content:
> 
> - 30-second video: at least 2 H3 clips
> - 60-second video: at least 4 H3 clips
> - 5-minute video: at least 20 H3 clips
> 
> We can queue up to 100 workflows. Top-up credits make the overall count effectively uncapped. Right now we have generated zero because Comfy sign-in is still the activation gate. Once signed in, I recommend one 5-second preview and one 15-second production test; then I can calculate our real cost per clip and monthly capacity precisely.

> Opened nine H3 showcase tabs in the in-app browser while preserving your Comfy survey tab:
> 
> - Three playable official H3 videos: T2V, first/last-frame video, and reference-to-video
> - MiniMax’s official H3 launch gallery
> - Hugging Face reproducible examples
> - Two current X demonstrations
> - Reddit audio-reference example
> - Krea’s six prompt examples
> 
> Official MiniMax use cases:
> 
> ![MiniMax H3 official use cases](C:/Users/dillo/.codex/visualizations/2026/08/06/019fd809-7686-7722-9250-0e7208a213ed/h3-official-use-cases.png)
> 
> Official X launch example:
> 
> ![MiniMax H3 official X example](C:/Users/dillo/.codex/visualizations/2026/08/06/019fd809-7686-7722-9250-0e7208a213ed/h3-x-official.png)
> 
> Community audio-reference generation:
> 
> ![MiniMax H3 Reddit audio reference](C:/Users/dillo/.codex/visualizations/2026/08/06/019fd809-7686-7722-9250-0e7208a213ed/h3-reddit-audio-reference.png)
> 
> Prompt and use-case gallery:
> 
> ![MiniMax H3 Krea examples](C:/Users/dillo/.codex/visualizations/2026/08/06/019fd809-7686-7722-9250-0e7208a213ed/h3-krea-prompts.png)
> 
> The strongest tabs are the three playable [official Hugging Face demos](https://huggingface.co/MiniMaxAI/MiniMax-H3) and [MiniMax’s official showcase](https://www.minimax.io/blog/minimax-h3).

**Files written (10):**

- `.env.example`
- `.gitignore`
- `README.md`
- `SOURCES.md`
- `config/minimax-h3.json`
- `package.json`
- `src/cli.mjs`
- `src/comfy-client.mjs`
- `test/comfy-client.test.mjs`
- `workflows/api/.gitkeep`

<sub>rollout: `C:\Users\dillo\.codex\archived_sessions\rollout-2026-08-06T13-05-26-019fd809-7686-7722-9250-0e7208a213ed.jsonl`</sub>
