# Tools

PicoClaw-class tool surface for IMMOHRTAL CLAW.

- `list_dir` `read_file` `write_file` `append_file` `edit_file` — workspace / notes
- `memory_search` `memory_write` `memory_stats` — durable disk memory
- `memory_compile` — collapse the day raw entries into a deduplicated tape
- `kb_search` `kb_open` `kb_read` — Dillon OS vault knowledge base (allowlisted markdown)
- `brief_write` — write a report into vault `Daily-Briefs/`, local file only
- `second_opinion` — have a different model family check a consequential claim
- `skill_list` `skill_read` — SKILL.md modules
- `model_list` `model_select` — ten configured brains
- `session_recall` — prior turns
- `web_search` `web_fetch` — public web, SSRF-blocked
- `cron` — reminders and recurring jobs
- `spawn` — background subagent
- `message` — leave a note for the operator from a spawn
- `exec` — staged-off

## Retrieval order

1. The operator front door is already in your context. Read it before searching.
2. `kb_search` — BM25 with title, heading, and recency boosts. Generated maps are
   excluded unless you pass `include_generated`. Narrow with `note_type`.
3. `kb_open` — the smallest sourced excerpt for your question, with a
   `path:line` citation. This is the default way to read.
4. `kb_read` — the whole note. Only when an excerpt genuinely is not enough.

Cite `path:line` for every vault claim. No citation means you do not assert it.

## Write boundaries

- `write_file` / `append_file` / `edit_file` stay inside the CLAW workspace and
  `data/notes`. They cannot reach the vault.
- `brief_write` is the only path into the vault, and only into `Daily-Briefs/`.
  It refuses paths, subdirectories, empty bodies, and silent overwrites.
- Writing a file is not delivering it. Nothing here sends, publishes, deploys,
  or spends. Those stay approval-gated and are not wired into CLAW.

## Checking yourself

Run `second_opinion` before a consequential answer: spend, a client change,
anything outward-facing, or any claim you would not want to be wrong about.
It routes to a different model family. If no second family is ready it says so
rather than letting one model agree with itself. Surface any contradiction it
raises; do not quietly drop it.

## Memory rules

- `memory_write` refuses anything that looks like a credential. Store a pointer
  (`the xAI key is in immohrtal-claw/.env`), never the value.
- Pin operator preferences. Pinned memory rides in every prompt, so keep it short.
- Run `memory_compile` at the end of a working session.
