---
tags: [handoff, marketing-chief, access]
created: 2026-07-24
mode: access probe only — no credentials requested, pasted, logged, or stored
---

# Marketing Chief dashboard — Cursor access probe

## Canonical dashboard (corrected)

**Canonical Marketing Chief LLM dashboard:**  
`https://dillon-marketing-chief.dillonmohr8777.chatgpt.site`

This is **not** the Vercel AI model-gateway preview (`_os/ai-model-gateway` / PR #205). The chatgpt.site app is the operator queue + client intelligence surface, private to Dillon’s OpenAI account.

## Cursor cloud agent result (2026-07-24)

| Check | Result |
|---|---|
| URL opened | Exact link above |
| HTTP | **401** |
| Page title | **Sign in required** |
| Auth wall | OpenAI / ChatGPT sign-in (Cloudflare front) |
| Authenticated read | **No** — this agent cannot sign into Dillon’s OpenAI account |
| Bypass token / session | **Not requested, not used, not stored** |

**Explicit:** the protected link **blocks** this Cursor cloud agent. No operator queue or client intelligence content was readable.

## Collaboration while blocked

Use the shared `dillon-os` repo/vault until Codex prepares a private source/data handoff:

| Artifact | Path / PR | Role |
|---|---|---|
| Weekend + open-loops (current) | [PR #206](https://github.com/dillonmohr8777/dillon-os/pull/206) · `Daily-Briefs/open-loops-slack-scan-2026-07-24.md` · `Daily-Briefs/weekend-plan-2026-07-24.md` | Cursor working surface |
| Marketing Chief intakes (existing) | `handoffs/marketing-chief-intake-2026-07-22.md` | Codex / prior intake |
| Model gateway (separate) | PR #205 · `_os/ai-model-gateway` | Inference façade only — not the Marketing Chief dashboard |

**Codex:** when ready, drop a redacted/private handoff into `handoffs/` (or an agreed vault path) with queue/state the agent is allowed to see — no site bypass tokens in Git or Slack.
---
