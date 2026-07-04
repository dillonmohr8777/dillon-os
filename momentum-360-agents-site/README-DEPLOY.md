# Momentum 360 Agents — Landing Page + Live RAG Agents

Redesign of https://momentum-360-agents.netlify.app in the design system of
https://momentum-360-landing.netlify.app — now with a **real RAG backend**: both "Ask"
forms answer live, grounded in Momentum 360's playbooks, routed to the best of the
19 specialist agents.

## How it works

```
kb/*.md ──(build: scripts/build-kb.mjs + OpenAI embeddings)──▶ kb-index.json
                                                                    │
browser ── POST /api/ask ──▶ netlify/functions/ask.mjs ────────────┤
                              1. embed the question                 │
                              2. cosine top-6 playbook chunks ◀─────┘
                              3. route to best of 19 agent personas
                              4. chat completion grounded in context
                              5. return {answer, agent, sources}
```

- `kb/` — the knowledge base: 9 playbook docs + `agents.json` (19 agent personas/routes)
- `scripts/build-kb.mjs` — runs at deploy time on Netlify; chunks + embeds the KB
- `netlify/functions/ask.mjs` — the RAG endpoint at `/api/ask` (rate-limited, 250-word plain-English answers)
- `public/` — the site (self-contained index.html, logo, badges)

## Netlify setup (one time)

1. **Connect the repo**: Netlify → Add new site → Import an existing project → GitHub →
   `dillonmohr8777/dillon-os` (or link the existing momentum-360-agents site to the repo).
   - **Base directory:** `momentum-360-agents-site`
   - Build command and publish directory are read from `netlify.toml` automatically
     (`node scripts/build-kb.mjs` → publish `public`).
   - **Branch:** `main` after the PR merges (or `claude/agentic-netlify-redesign-7y2s40` to preview).
2. **Environment variables** (Site configuration → Environment variables):

   | Key | Value | Required |
   |---|---|---|
   | `OPENAI_API_KEY` | your OpenAI API key | **yes** — build fails without it |
   | `OPENAI_MODEL` | chat model (default `gpt-5.5`) | no |
   | `OPENAI_FALLBACK_MODEL` | used if the main model 404s (default `gpt-4o`) | no |
   | `EMBED_MODEL` | embedding model (default `text-embedding-3-small`) | no |
   | `LEAD_WEBHOOK_URL` | Zapier/Make/CRM webhook; every question with contact info is forwarded | no |

3. **Deploy.** The build embeds the knowledge base (pennies per build), the function serves answers.

## Updating the knowledge base

Edit or add markdown files in `kb/` and push — the next deploy re-chunks and re-embeds
automatically. To add/rename agents, edit `kb/agents.json` (name, squad, `route` = routing
description, `persona` = system-prompt role).

## Costs & guardrails

- Embeddings: fractions of a cent per build; one embed call per question.
- Chat: one completion per question, capped at 700 tokens out, 6 context chunks in.
- Per-IP rate limit: 10 questions/minute (best-effort). Input capped at 1,200 chars.
- The model is instructed to answer only marketing/business-growth questions, never to
  invent prices or client stats, and to hand off crew jobs to (215) 607-6482.
