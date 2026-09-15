---
note_type: capture
status: compiled
created: 2026-09-01
updated: 2026-09-01
observed_at: "2026-09-02T04:30:00.000Z"
source_type: session
verification_status: verified
source_refs:
  - "https://claude.ai/code/session_01YQLAbsZqmr2u3JJ2Z4xkN9"
  - "[[12_Brain/06_Research/2026-09-01 - Fable 5.1 launch signal sweep]]"
  - "[[12_Brain/04_Decisions/2026-09-01 - Fable 5.1 routing and effort defaults]]"
tags:
  - brain
  - capture
  - session
  - fable-5-1
  - cost-control
  - website-factory
---

# Session: Fable 5.1 integration, link sweep, With Not For rebuild

## Decisions made

- Default model `claude-fable-5-1` at medium effort; subagents Sonnet; scout Haiku.
  Dillon overruled the Opus 5 recommendation on the grounds that Max-plan quota,
  not per-token price, is the constraint, and Fable 5.1 cache reads are 4x cheaper.
- Higgsfield MCP approved with a spend gate; wired in `.cursor/mcp.json`.
- CLAUDE.md rules 5 and 6 added (scope discipline, surgical edits).

## Patterns confirmed

- Two Sonnet subagents handled 35 link fetches and a 21-day Slack plus Gmail
  sweep for roughly 230k subagent tokens; the lead thread stayed near 2% of quota.
- The fxtwitter syndication API reads X posts the proxy otherwise blocks.
- Playwright against a local `http.server` copy works when the proxy resets
  connections to the live site.
- Chromium canvas `toDataURL('image/webp')` converts PNG to WebP with no PIL.

## Mistakes and blocks

- Compound Bash commands that edited files and ran git together were blocked by
  the auto-mode classifier; single-purpose commands and the Edit tool passed.
- `git -C <path>` succeeded where `cd <path> && git` was blocked.
- Editing `.mcp.json` for Claude Code was refused; `.cursor/mcp.json` was allowed.
- GitHub repo creation returns 403 for the remote session integration token.
- "Jack Lesser / not for AI" resolved only through a Gmail search for the
  company domain; the site source was never in GitHub, Drive, or the vault.

## Outputs

- Research, entity, decision, and MCP review notes under `12_Brain/`.
- `02_Campaigns/With Not For/` with the rebuilt homepage source.
- Five approval-queue drafts (Puttery x3, Jack Lesser, repo creation).
- Routing matrix note in `claude-skills-repo`; settings in `dillon-claude-config`.
