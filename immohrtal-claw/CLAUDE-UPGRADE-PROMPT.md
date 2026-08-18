# CLAUDE UPGRADE PROMPT — IMMOHRTAL CLAW

Paste this into Claude (Opus 5 via the Align HCM subscription). Work the
repo. Do not publish. Do not put secrets in git.

---

You are upgrading IMMOHRTAL CLAW in the private `dillon-os` vault.

## What this product is

IMMOHRTAL CLAW is a PicoClaw-class **personal agent**. Dillon named it
IMMOHRTAL CLAW because it sounds like a weapon. It is **not** a music
product, not the IMMOHRTAL album, not SESSION 001, not a booth, not lyrics.

Visual system: copy the IMMOHRTAL **website** (paper `#f7f9fb`, gunmetal
chrome, signal `#1f9eff`, green `#17a86b`, Anton / Instrument Serif /
Space Grotesk / IBM Plex Mono, grain, chrome pills, claw mark). Do not
copy album content.

Code lives in `immohrtal-claw/`. PicoClaw loop: inbound → AgentLoop →
ContextBuilder (SOUL/AGENT/USER/MEMORY/HEARTBEAT/TOOLS/skills) → LLM →
recursive tools → session persist → traces.

## What already landed (do not regress)

- Paper/chrome UI, claw logo, gate cookie, PWA, Cloudflare tunnel (operator-approved for phone play)
- Tools: files (sandboxed), memory, skills, web_search/fetch (SSRF-blocked), cron, spawn, kb_search/kb_read, model_list/model_select
- Ten-brain catalog in `src/models.js` (5 local open-weight + 5 cloud)
- Vault knowledge allowlist in `src/knowledge.js` (never `12_Brain/private/`, never `.env`)
- `exec` staged-off. No send / publish / deploy / spend from CLAW
- ChatGPT / Custom GPT hosting is **later**

## The ten brains (keep this roster unless a newer public flagship ships)

Local, Ollama-first, actually runnable on a workstation — not 1T-class cluster toys:

1. `qwen3.6-27b` — Qwen3.6 27B (Apache 2.0 default local)
2. `gemma4-31b` — Gemma 4 31B
3. `qwen3-coder` — Qwen3-Coder-Next
4. `llama4-scout` — Llama 4 Scout (long context)
5. `deepseek-v4-flash` — DeepSeek V4 Flash (V4 Pro is server-class)

Cloud:

1. `claude-opus-5` — Anthropic Messages API. Align HCM subscription. **First live cloud brain.** Env: `ANTHROPIC_API_KEY` or `CLAW_ANTHROPIC_API_KEY`. Model id `claude-opus-5`.
2. `gpt-5.6-sol` — OpenAI flagship Sol. `OPENAI_API_KEY`. Model `gpt-5.6-sol`.
3. `grok-4.6` — xAI. **Second live cloud brain.** `XAI_API_KEY`. Base `https://api.x.ai/v1`. Model `grok-4.6`.
4. `composer-2.5` — Cursor Composer 2.5. **No public API.** Only ready if `CLAW_COMPOSER_BASE_URL` is set. Do not fake it.
5. `gemini-2.5-pro` — Google. This is the fifth cloud family (not Anthropic, OpenAI, xAI, or Cursor). `GEMINI_API_KEY`. Override model with `CLAW_GEMINI_MODEL` if Gemini 3.x Pro is the live flagship.

Giant open weights (Kimi K2.6/K3, DeepSeek V4 Pro, GLM-5.2) are better as APIs. Do not pretend they fit in Ollama on a 64GB box.

## Honest limits (Dillon asked for unmitigated / no latency / no mistakes)

You cannot ship zero latency or zero mistakes. Anyone who claims that is lying.

Ship instead:

- Fast path: streaming tokens, prompt cache on Opus 5, local Qwen for cheap loops
- Correctness path: `kb_search` → `kb_read` → cite; `web_search` → `web_fetch` → cite; never invent vault facts
- Operator-owned tools inside the sandbox: more PicoClaw skills, more memory, vault RAG
- Fail loud when a key or Ollama tag is missing. No silent rehearsal fallback on a live pick
- Keep approval gates for send/publish/spend/exec. "Unmitigated" means Dillon's agent on Dillon's box with Dillon's vault — not a jailbreak and not a production shell

## Make it a lot better — this is your job

Work in this order. Stay on the current CLAW branch. Do not dump this onto unrelated PRs.

1. **Knowledge quality.** `kb_search` is token overlap. Upgrade it: title-boost, heading-boost, recency from frontmatter `updated:`, skip generated maps unless asked, hybrid BM25, optional local embeddings later via Ollama. Keep the allowlist. Add `kb_open` that returns the smallest sourced excerpt, not a 80k dump.
2. **Always-on front door.** Every turn should be able to see a short compiled brief from `INDEX.md`, `System/operating-status.md`, `System/approval-queue.md` (titles only), and `12_Brain/05_Projects/IMMOHRTAL CLAW.md` without swallowing the vault.
3. **Live brain wiring on Dillon's Windows box.** Do not commit keys. Document + verify:
   - Align HCM Anthropic → Opus 5
   - then Grok 4.6
   - Ollama pulls from `immohrtal-claw/scripts/pull-local-models.sh`
   Probe `/api/tags` and `/v1/models`. Show ready/not-ready in the Harness picker with the actual blocker.
4. **Streaming.** Opus, OpenAI, Grok, Gemini, and Ollama should stream into the paper UI, not wait for the full turn. Keep tool events.
5. **More skills, PicoClaw-class.** Add real SKILL.md modules Dillon will use: inbox triage (draft only), client pulse (read `01_Clients/<name>` only), GBP/content drafts, report-builder that writes into `Daily-Briefs/` locally, calendar read if a key exists, browser only if a local CDP URL is set. Each skill: name, when to use, tools, stop conditions, approval boundary.
6. **Checker pass.** For consequential answers, spawn a second-brain check: different model family if two keys exist (Opus makes, Grok or Gemini checks). Surface contradictions.
7. **Memory.** Pin operator preferences. Compile daily tape. Do not pin secrets.
8. **Tests.** Extend `tests/harness.test.js`: catalog still 10, Gemini still the fifth cloud family, kb allowlist, no music copy, exec still off, gate still required when token set, model_select unknown id throws.
9. **UI.** Paper/chrome only. Brain picker already exists — make ready/not-ready obvious, show the live model in the chrome status, keep the claw mark. No album.
10. **Closeout.** Update `12_Brain/05_Projects/IMMOHRTAL CLAW.md`. Add a capture under `12_Brain/01_Captures/` if you learned something durable. Run `node --test tests/harness.test.js` and the vault public-safety tests. Do not commit `.env`, `data/**`, or `System/scripts/Test-SecondBrain.ps1` wrap artifacts.

## Files to read first

- `immohrtal-claw/ARCHITECTURE.md`
- `immohrtal-claw/src/models.js`
- `immohrtal-claw/src/knowledge.js`
- `immohrtal-claw/src/providers.js`
- `immohrtal-claw/src/tools.js`
- `immohrtal-claw/workspace/SOUL.md` + `AGENT.md` + `TOOLS.md`
- `12_Brain/09_Ops/AGENT_PROTOCOL.md`
- `12_Brain/05_Projects/IMMOHRTAL CLAW.md`

## Stop conditions

- Do not register a Custom GPT
- Do not enable `exec`
- Do not read or write `12_Brain/private/`
- Do not contact anyone externally
- Do not spend Align HCM quota past a smoke test without Dillon saying so

When you finish a slice, say what is live, what is still rehearsal, and the single next command Dillon should run on his box.
