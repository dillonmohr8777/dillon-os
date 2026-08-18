# IMMOHRTAL CLAW

PicoClaw-class personal agent. The name is IMMOHRTAL CLAW because it sounds
like a weapon. **It is not a music product.**

PicoClaw (Sipeed, MIT) is the architecture source:
[github.com/sipeed/picoclaw](https://github.com/sipeed/picoclaw). This is a
Node rewrite of the harness with the 10MB RAM ceiling taken off.

The visual system is copied from the IMMOHRTAL website: paper grain,
gunmetal chrome wordmark, signal/green opening bar, Anton / Instrument
Serif / Space Grotesk / IBM Plex Mono, glass nav, marquee, marking cards.
The claw mark is the logo. None of the album, session tags, or lyrics
come with it.

## Run

```bash
cd immohrtal-claw
node server.js
```

Open http://127.0.0.1:4800

Phone tunnel (operator-approved):

```bash
CLAW_TUNNEL=1 CLAW_GATE_TOKEN=your-code node server.js
# then cloudflared tunnel --url http://127.0.0.1:4800
```

On the phone: open the URL, enter the gate code, then Share → Add to Home Screen.

Tests:

```bash
cd immohrtal-claw
node --test tests/harness.test.js
```

## Brains

Harness picker has ten models. Keys stay in `.env` (gitignored).

Local (Ollama): Qwen3.6 27B, Gemma 4 31B, Qwen3-Coder, Llama 4 Scout, DeepSeek V4 Flash.

Cloud: Claude Opus 5 (Align HCM key first), GPT-5.6 Sol, Grok 4.6, Composer 2.5 (Cursor-only unless you set a gateway), Gemini 2.5 Pro (the fifth family).

```bash
cp .env.example .env
# paste ANTHROPIC_API_KEY from Align, then XAI_API_KEY
CLAW_MODEL=claude-opus-5 node server.js
```

Pull locals on the box:

```bash
bash scripts/pull-local-models.sh
```

## Claude upgrade prompt

Paste `CLAUDE-UPGRADE-PROMPT.md` into Opus 5 for the next quality pass
(streaming, better retrieval, more skills). Do not commit secrets.

Point at a real local model without the picker:

```bash
OPENAI_BASE_URL=http://127.0.0.1:11434/v1
OPENAI_MODEL=qwen3.6:27b
OPENAI_API_KEY=ollama
```

## ChatGPT

Later. Custom GPT / ChatGPT apps host the auth and public URL. `openapi.yaml`
is the draft. Do not register a GPT in this pass.
