# Codex Brief: get the full episode footage for the Align HCM clip factory

You are picking up from Claude Code (remote session). Everything you need to understand the finished style is in THIS folder.

## 1. Study the finished videos first

`deliverables/` in this folder contains the four shipped cuts. Pull them and watch:

- `Align HCM - Maher x Brent - ROI Is Earned - 64s.mp4` — the flagship: ink-reveal logo intro, sidebar story beats, two-up speaker box with orange ring, live speaker labels, Gelasio captions with orange active word, swipe transitions, CTA outro.
- `Align HCM Clip 1 - The Record Trap.mp4` — kinetic banner design (orange wipe between serif keywords).
- `Align HCM Clip 2 - Foundation to Skyscraper.mp4` — animated L1/L2/L3 floor-stack design.
- `Align HCM Clip 3 - Leverage the System.mp4` — swipe-in liquid-glass card design.

The reproducible pipeline (HTML motion graphics + Playwright renderer + ffmpeg assembly) is in `pipeline/`. Brand tokens: navy `#0E1A2B`, orange `#F47A25`, cream `#F7F4EE`, Gelasio (Georgia look) + Inter + Inter Tight.

## 2. Your job: capture the FULL episode and push it back

Source: Episode 87 of the HR.com podcast, "ROI Doesn't Just Happen: Why HCM Value Is Earned and Not Installed" — https://youtu.be/vOiiwLKa69M (23m43s).

The remote Claude session CANNOT download from YouTube (datacenter IP is bot-walled). You are on Dillon's machine with a clean IP and his logged-in browser, so you can. In order of preference:

### Option A (best): download the whole video
```
yt-dlp -f "bv*[height<=1080]+ba/b" --merge-output-format mp4 -o "full-episode.mp4" "https://youtu.be/vOiiwLKa69M"
```
Push it to `dillonmohr8777/align-hcm-maher-brent-chatcut` as `source/full-episode.mp4` via Git LFS (same as you did for the 2:08 master). Commit and push to main.

### Option B: screen-record the best scenes
If downloading fails, screen-record playback (same method as the 2:08 master: full-screen, highest resolution available, 60fps is fine, hide player controls, keep the two-up view clean). Record each range below with ~5 seconds of padding on both sides, name files `scene-XX.mp4`, and push them to the same repo under `source/scenes/` via LFS.

Best-scene map (from the full transcript):

| # | Episode time | Content |
|---|--------------|---------|
| 01 | 1:45 to 2:40 | Maher's "personal ROI" founder story: people unlocking abilities beyond their limits |
| 02 | 2:58 to 3:16 | Brent: organizations expect ROI to follow, but value doesn't materialize automatically |
| 03 | 3:42 to 4:30 | Layer one is auto-visible, and that's where most organizations stop |
| 04 | 4:28 to 5:08 | Layers two and three: effectiveness, strategic capability, intentionality |
| 05 | 5:12 to 6:05 | Managed vs leveraged; shift from system of record to system of intelligence |
| 06 | 10:00 to 11:05 | Data governance job number one; completion culture defined |
| 07 | 11:45 to 13:00 | Treat the platform like a product, not a utility; user adoption cycle |
| 08 | 12:55 to 13:45 | The cost of not doing it; the digital filing cabinet |
| 09 | 14:00 to 15:35 | Platform breadth is hard; outsourced administration makes orgs better |
| 10 | 15:55 to 17:00 | Line managers want to be heard; crowdsourcing a completion culture |
| 11 | 18:30 to 20:05 | Connected data: recruiting source to performance to retention; intervene early |
| 12 | 20:02 to 21:35 | HR metrics to business outcomes: revenue protection, cost of capital, liability exposure |
| 13 | 22:00 to 22:55 | Finding common ground with the CFO |

### Option C: audio fallback
The episode may also be on YouTube Music / podcast platforms as "Future of Payroll and Workforce Management insights by HR.com" Episode 87. If video capture is impossible, download the audio there (or Dillon downloads the podcast directly) and push it as `source/full-episode-audio.m4a`. Claude can still build kinetic-typography clips from audio + the existing design system.

## 3. Hand-off

After pushing, reply to Dillon that the footage is in the repo. The remote Claude session will pull it and batch-produce the remaining clips through the V3 design system.
