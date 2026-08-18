# IMMOHRTAL CLAW architecture

Mapped from PicoClaw (Sipeed, MIT) without copying the Go tree. The product is
a personal agent. The IMMOHRTAL website supplies visual tokens only.

## PicoClaw loop we kept

Inbound message → AgentLoop `runTurn` → ContextBuilder (SOUL / AGENT / USER /
MEMORY / HEARTBEAT / TOOLS / skills) → LLM → recursive tools → session persist
→ traces.

| PicoClaw | IMMOHRTAL CLAW |
|---|---|
| `AgentLoop` / `runTurn` | `src/agent-loop.js` |
| `ContextBuilder` | `src/context-builder.js` |
| `read_file` `write_file` `list_dir` `append_file` `edit_file` `exec` | `src/tools.js` (`exec` staged-off) |
| `web_search` `web_fetch` | `src/net.js` (private hosts blocked) |
| `cron` | `src/cron.js` |
| `spawn` / `message` | `src/spawn.js` |
| `HEARTBEAT.md` | workspace file + optional interval in `server.js` |
| `SKILL.md` loader | `src/skills-loader.js` |
| Gateway + WebUI | `src/gateway.js` + `web/` |
| `/v1` OpenAI-compat | `POST /v1/chat/completions` |

## What we added

- 128k context, 24 tool iterations, 8 GiB disk memory
- Gate-code cookie auth for a phone tunnel
- PWA (Add to Home Screen)
- Website visual system on paper, not a dark booth skin
- Ten-brain catalog (5 local open-weight + 5 cloud) and vault knowledge tools
- ChatGPT / Custom GPT stays later

## Safety

- Filesystem tools cannot leave `workspace/` or `data/notes/`
- `web_fetch` refuses localhost and private IPs
- `exec` is staged-off
- Tunnel requires `CLAW_GATE_TOKEN`
- No send / deploy / spend paths
