# IMMOHRTAL CLAW architecture

Mapped from PicoClaw (Sipeed, MIT, 2026) without copying the Go tree.

## PicoClaw loop we kept

Inbound message → AgentLoop `runTurn` → ContextBuilder (SOUL / AGENT / USER /
MEMORY / daily notes / skill summary) → LLM pipeline → recursive tool
execution → session persist → turn-end trace.

PicoClaw names (from their public docs and `pkg/agent`):

| PicoClaw | IMMOHRTAL CLAW |
|---|---|
| `AgentLoop` / `runTurn` | `src/agent-loop.js` |
| `ContextBuilder` | `src/context-builder.js` |
| `ToolRegistry` (`read_file`, `write_file`, `list_dir`, `append_file`, `edit_file`, `exec`) | `src/tools.js` plus `memory_*`, `skill_*`, `session_recall`, `album_catalog`. `exec` stays staged-off |
| `SessionStore` (`sessions/`) | `src/session-store.js` → `data/sessions/` |
| `MEMORY.md` + `memory/YYYYMM/YYYYMMDD.md` | same, plus `data/long-term.jsonl` |
| `SKILL.md` loader | `src/skills-loader.js` |
| Message bus | `src/bus.js` |
| Gateway (channels + WebUI) | `src/gateway.js` + `web/` |
| `/v1` OpenAI-compat | `POST /v1/chat/completions` |

## What we added on purpose

PicoClaw's product constraint is **tiny RAM**. CLAW inverts that:

- Default context **128000** tokens (env `CLAW_CONTEXT_TOKENS`)
- Tool loop ceiling **16** (env `CLAW_MAX_TOOL_ITERS`)
- Long-term JSONL ceiling **8 GiB** (env `CLAW_MEMORY_MAX_BYTES`)
- Search scans the last 32MB of that tape plus MEMORY.md and today
- Night-booth UI in IMMOHRTAL tokens (ink, signal, Anton, HUD)
- Album bible as a first-class tool
- Publish flag hard-coded `blocked` on `/api/health`

## Safety

- Filesystem tools cannot leave `workspace/` or `data/notes/`
- Shell `exec` is not wired even if `CLAW_ALLOW_EXEC=1`
- No send / deploy / spend paths
- `noindex` on the web app
- Secrets stay in gitignored `.env`

## ChatGPT later

`openapi.yaml` is the draft action surface for a Custom GPT. Staging is
localhost. A public GPT would need an approved tunnel or host. That is a
separate approval, not this build.
