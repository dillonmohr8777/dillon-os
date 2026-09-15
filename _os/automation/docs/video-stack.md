# Video stack — OpenRouter gateway + local director + Telegram front door

A private, cheap alternative to an all-in-one video subscription. One API key
(OpenRouter), one local model (the director), and a Telegram bot as the front
door.

```
Telegram  →  gateway  →  local director model  →  router  →  OpenRouter video API
                                                      ↘
                                                       local HTML/CSS renderer ($0)
                                                              ↘
                                                            ffmpeg → master + cuts → Telegram
```

## The one idea that makes this cheap

Most scenes never reach a paid model.

Title cards, kinetic type, logo stings, lower thirds, charts, UI mocks, stick
figures and end cards are deterministic motion graphics. They are rendered
locally by headless Chromium at 24fps for the cost of electricity, and — unlike a
diffusion model — they spell the client's name correctly every time.

Only shots that genuinely need generative motion are billed. On the worked
example in `fixtures/video/saas-explainer.json`, a 30-second client explainer
comes to **$0.28**: five of seven scenes render locally, two are generated.

## Setup

### 1. OpenRouter key

```powershell
setx OPENROUTER_API_KEY "sk-or-v1-..."
```

Never commit it. Nothing in this stack reads a key from a file.

### 2. Local director model

The director writes scripts, shot lists and captions. It runs locally and costs
nothing. With Ollama:

```powershell
ollama serve
ollama pull qwen3.8:27b
```

Defaults to `http://localhost:11434/v1` with `qwen3.8:27b`. Override:

```powershell
setx VIDEO_DIRECTOR_BASE_URL "http://localhost:11434/v1"
setx VIDEO_DIRECTOR_MODEL    "qwen3.8:27b"
```

To use a hosted director instead, point `VIDEO_DIRECTOR_BASE_URL` at
`https://openrouter.ai/api/v1` and set `VIDEO_DIRECTOR_MODEL` to any OpenRouter
text model (for example `deepseek/deepseek-v4-pro-0813`). That bills per token;
the local default does not.

### 3. ffmpeg

A **full** build is required — h264 encoder, mp4 muxer, concat demuxer.

```powershell
winget install Gyan.FFmpeg
```

Beware: Playwright ships a stripped ffmpeg (VP8/webm only) that answers
`ffmpeg -version` happily and then cannot mux an MP4. `node video-telegram.js`
→ `/status` probes for the real capabilities and says so. Set `FFMPEG_PATH` if
the right binary is not first on `PATH`.

### 4. Chromium

Used for local scene rendering. Chrome is found automatically on Windows; set
`VIDEO_CHROMIUM_PATH` to override.

### 5. Telegram bot

1. Message [@BotFather](https://t.me/BotFather) → `/newbot` → copy the token.
2. `setx TELEGRAM_BOT_TOKEN "123456789:AA..."`
3. Start the gateway, message the bot anything, and it replies with the chat id.
4. `setx TELEGRAM_ALLOWED_CHAT_IDS "<your chat id>"`
5. Restart the gateway.

**The allowlist is a spend control, not a nicety.** A bot token is a bearer
credential; anyone who has it can message the bot. Only allowlisted chats can
plan or render. With an empty allowlist the bot answers read-only commands and
refuses every spend path.

```powershell
node _os\automation\bin\video-telegram.js
```

## Using it

| Command | Cost | What it does |
|---|---|---|
| `/saas <brief>` | free | 30s client-tier explainer, planned and priced |
| `/draft <brief>` | free | cheapest possible pass, planned and priced |
| `/plan <brief>` | free | standard tier, planned and priced |
| `/render <id>` | **spends** | executes a plan and returns the MP4s |
| `/jobs` | free | plans awaiting approval |
| `/models` | free | cheapest model per tier right now |
| `/budget` | free | today's spend, caps, estimate accuracy |
| `/status` | free | config health |

Every brief stops at a priced plan. Nothing bills until you send `/render <id>`.
That is the vault's approval boundary, and it also means a mistyped message
cannot start a paid render.

```
/saas Bridge Signal 30-second clean 2D explainer
→ PLAN vid-20260907T035941-cftpe
  01. logo_sting   2s — local $0
  ...
  5 local (free) + 2 generated
  Estimated: $0.28
  Approve with:  /render vid-20260907T035941-cftpe
```

### From the command line

```bash
node _os/automation/bin/video-plan.js "Bridge Signal 30s explainer" --tier standard --out plan.json
node _os/automation/bin/video-render.js --plan plan.json --confirm
node _os/automation/bin/video-models.js --cheapest 720p 16:9 8
node _os/automation/bin/video-models.js --refresh
```

## Tiers

Editorial, in `config/video-routing.json`. Price and capability come from the
live API; quality judgement does not, so tier membership is a list you edit as
you review real output.

| Tier | For | Cheapest route (6s, 16:9) |
|---|---|---|
| `draft` | iteration, never shipped | Seedance 1.5 Pro 480p — ~$0.07 |
| `standard` | client SaaS and social | Seedance 1.5 Pro 720p — ~$0.16 |
| `branded` | on-screen text, logos, motion transfer | MiniMax H3 Max 768p — ~$0.48 |
| `premium` | hero shots only | Veo 3.1 Fast 1080p — ~$0.72 |

Re-check with `node _os/automation/bin/video-models.js` — it prices against the
current catalog, not this table.

## Pricing, and why estimates are labelled

OpenRouter prices video in five different units. Per-second models (Veo, Wan,
Kling, MiniMax) are quoted exactly and marked `listed`. Seedance is priced per
*video token*, so cost is quadratic in resolution and linear in fps — those are
marked `estimated`.

The token formula used is `tokens = width × height × fps × duration / 1024`. It
reproduces ByteDance's published $0.023/sec for Seedance 1.5 Pro at 480p to three
decimals, which is why it is trusted rather than guessed. It is still an
estimate: OpenRouter reports the true charge as `usage.cost` on the finished job,
every charge is written to the ledger, and after three billed jobs the observed
median rate supersedes the derived one. `/budget` shows the drift.

**Resolution is the biggest lever, and it is invisible.** The same Veo 3.1 Lite
shot is $0.03/sec at 720p without audio and $0.08/sec at 1080p with audio. On
Seedance, 720p costs ~4.5× what 480p does. Draft at 480p.

## Budget controls

Three caps in `config/video-routing.json`, all enforced before submission and
re-checked at approval time:

```json
"budget": { "per_shot_usd": 1.5, "per_job_usd": 12.0, "daily_usd": 40.0 }
```

The daily cap is enforced against **recorded spend**, so a render that crashed
after billing still counts. Ledger: `_os/automation/state/video-ledger.jsonl`
(append-only, regenerable, safe to delete — deleting it resets today's total and
discards learned rates).

## What runs where

| Piece | Where | Cost |
|---|---|---|
| Script, shot list, captions | local model | free |
| Title cards, charts, UI, stick figures | local Chromium | free |
| Generative motion | OpenRouter | per second |
| Assembly, captions, aspect cuts | local ffmpeg | free |

OpenRouter is a router, not a runtime: Veo, Seedance and Sora execute on remote
infrastructure and cannot be run locally through it, whatever the local hardware.
Wan and MiniMax H3 have open weights that can be run locally, but that is a
function of GPU VRAM, not system RAM, and is a separate setup from this stack.

## Files

```
config/video-models.json     live catalog snapshot (refresh with --refresh)
config/video-routing.json    tiers, budgets, master and derivative sizes
lib/video/pricing.js         SKU resolution and cost estimation
lib/video/registry.js        capability filtering, cheapest-first ranking
lib/video/router.js          scene → local or a specific model
lib/video/storyboard.js      the director/renderer contract and validator
lib/video/director.js        local model → validated storyboard, with repair
lib/video/openrouter.js      submit / poll / download
lib/video/local-render.js    HTML+CSS scenes → PNG frames
lib/video/assemble.js        ffmpeg: frames → clips → master → cuts
lib/video/ledger.js          spend ledger, budget gate, learned rates
lib/video/pipeline.js        plan() and execute()
bin/video-telegram.js        the gateway
bin/video-plan.js            plan from the CLI
bin/video-render.js          render from the CLI
bin/video-models.js          catalog inspection and refresh
tests/video-stack.test.js    29 tests
```

## Environment

| Variable | Required | Default |
|---|---|---|
| `OPENROUTER_API_KEY` | to render | — |
| `TELEGRAM_BOT_TOKEN` | for the gateway | — |
| `TELEGRAM_ALLOWED_CHAT_IDS` | to spend from chat | empty (spend disabled) |
| `VIDEO_DIRECTOR_BASE_URL` | no | `http://localhost:11434/v1` |
| `VIDEO_DIRECTOR_MODEL` | no | `qwen3.8:27b` |
| `FFMPEG_PATH` | no | first `ffmpeg` on `PATH` |
| `VIDEO_CHROMIUM_PATH` | no | auto-detected |
| `VIDEO_OUTPUT_ROOT` | no | `_os/automation/state/video-jobs` |

## Tests

```bash
node --test _os/automation/tests/video-stack.test.js
```
