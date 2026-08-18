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

Point at a real model later:

```bash
OPENAI_BASE_URL=http://127.0.0.1:11434/v1
OPENAI_MODEL=qwen3.8:27b
OPENAI_API_KEY=ollama
```

## ChatGPT

Later. Custom GPT / ChatGPT apps host the auth and public URL. `openapi.yaml`
is the draft. Do not register a GPT in this pass.
