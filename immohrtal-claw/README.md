# IMMOHRTAL CLAW

PicoClaw-class agent harness for the IMMOHRTAL booth. Same loop. More memory.
More tools. A real app. **Local stage only — do not publish yet.**

PicoClaw (Sipeed, MIT) is the architecture source:
[github.com/sipeed/picoclaw](https://github.com/sipeed/picoclaw). This is not a
Go port of their binary. It is a Node rewrite of the harness with the 10MB RAM
ceiling taken off, branded for Dance With The Delusional.

## What you get

- Night-booth web app at `http://127.0.0.1:4800`
- Gateway + AgentLoop + ContextBuilder + ToolRegistry + SKILL.md skills
- Disk memory that can grow to **8 GiB** (configurable), not 10MB RAM
- 128k-token context budget
- OpenAI-compatible `/v1/chat/completions` for a later Custom GPT action
- Booth rehearsal provider so the app runs with **no API key**

## Run (stage)

```bash
cd immohrtal-claw
node server.js
```

Open http://127.0.0.1:4800

Tests:

```bash
cd immohrtal-claw
node --test tests/harness.test.js
```

Point at a real model later (still local until you approve publish):

```bash
# example — do not commit the values
OPENAI_BASE_URL=http://127.0.0.1:11434/v1
OPENAI_MODEL=qwen3.8:27b
OPENAI_API_KEY=ollama
```

Copy `.env.example` to `.env` on the machine that runs it. `.env` is gitignored.

## Publish (blocked)

ChatGPT Custom GPT / public host / App Store / Play Store stay **approval-gated**.
The OpenAPI draft is `openapi.yaml`. Do not register a GPT or tunnel this port
until Dillon says so.

## Layout

See `ARCHITECTURE.md` for the PicoClaw → CLAW map.
