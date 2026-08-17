---
tags: [research, receipts, mcp, cli]
captured: 2026-08-17
topic: CLI-Anything skill vs Dillon OS MCP/API blockers
---

# 2026-08-17 — CLI-Anything skill receipts

Input: https://www.tiktok.com/t/ZP8Wf8ddD/ ("institute this skill; see if it
fixes MCP or API blockers").

## Receipts

- Short link `https://www.tiktok.com/t/ZP8Wf8ddD/` 301s to
  `https://www.tiktok.com/@chase_ai_/video/7673634732797644046` (Chase AI,
  caption "cli anything", 37s, ASR captions fetched 2026-08-17).
- ASR: connect Claude Code to other apps via MCPs and CLIs; if the app has no
  CLI, use CLI-Anything; GitHub repo from the LightRAG / RAG-Anything makers;
  used for GIMP, Blender, Audacity, Inkscape, n8n, Mailchimp.
- Repo: https://github.com/HKUDS/CLI-Anything — Apache-2.0, ~47k stars on
  2026-08-17, live hub https://clianything.cc, catalog
  https://reeceyang.sgp1.cdn.digitaloceanspaces.com/SKILL.md.
- Meta-skill `cli-hub-meta-skill/SKILL.md` tells agents to
  `pip install cli-anything-hub` then `cli-hub install <name>`. Each install is
  a separate pip package. Catalog includes Exa, Obsidian (Local REST API),
  n8n, Mailchimp, VE Twini (X), plus official Obsidian CLI (1.12.7+).
- This session: GitHub MCP auth failed, `gh` worked; Exa MCP hit its free-tier
  rate limit; X MCP failed live tool discovery; TikTok WebFetch 403, curl
  resolved the short link.
- Vault history: LandingFolio sandbox-only (token + Inspector);
  Exa rate limit on 2026-08-14 franchise research; Slack
  `oauth_refresh_token_rejected` / Composio write block; mohr-vault Obsidian
  MCP dead (bad path, placeholder key); Google Ads / GA4 / Meta / Calendar
  MCPs never connected.

## Skeptic

- "Any software" is marketing. The catalog is finite; GUI harnesses need the
  desktop app; API harnesses still need keys.
- CLI-Anything does not mint `LANDINGFOLIO_TOKEN`, repair Slack OAuth, or
  invent Google Ads access.
- VE Twini is GraphQL + browser automation — reject as an X MCP substitute.
- Official `gh` already fixes the GitHub MCP failure; do not wrap GitHub.
- Obsidian harness needs a running desktop + Local REST API. Cloud agents
  already have the vault via git, so mohr-vault is obsolete rather than
  "fixed" by CLI-Anything.
- Exa harness = same API, different transport. Own key changes quota; it does
  not remove the secret.

## Survivors

- Institute a vault-native `/cli-anything` skill that prefers official CLIs
  and the CLI-Hub catalog over a new MCP, and that never auto-installs.
- GitHub MCP auth failures → `gh`.
- MCP context bloat → call one CLI instead of loading a full tool list.
- Exa rate limit → partial, operator key required.
- LandingFolio, Slack OAuth, ads-platform MCPs, Calendar token, X MCP → not
  CLI-shaped gaps.
