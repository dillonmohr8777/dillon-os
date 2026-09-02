---
note_type: ops
status: active
created: 2026-09-02
updated: 2026-09-02
owner: Dillon Mohr
verification_status: partial
review_on: 2026-10-01
source_refs:
  - "[[12_Brain/09_Ops/Connector Map]]"
  - "[[12_Brain/04_Decisions/2026-09-01 - Fable 5.1 routing and effort defaults]]"
tags:
  - brain
  - ops
  - agents
  - roster
---

# Agent Roster

**Summary:** 13 agents, one per lane, Command through Voice, all live today as
`.claude/agents/*.md` files. `verification_status` on this note stays `partial`
because the newest three skills this same round adds —
[[.claude/skills/ad-teardown|ad-teardown]], [[.claude/skills/aeo-report|aeo-report]],
[[.claude/skills/client-status|client-status]] — postdate seo-aeo-analyst,
client-success, video-director, radar-operator, deploy-engineer, and
voice-agent-builder, so none of those agent files has run its own skill yet to
confirm the wiring in the table below. Model tiers follow
[[12_Brain/04_Decisions/2026-09-01 - Fable 5.1 routing and effort defaults|the 2026-09-01 routing decision]]:
opus stays pinned to exactly three agents, everything else is sonnet or haiku.

## Roster

| Agent | Lane | Model | Connectors it needs | Skills it runs | Evidence file |
|---|---|---|---|---|---|
| marketing-chief | Command | opus | None direct — routes to each lane's connectors; Composio present for cross-lane execution but Windows-box only (Connector Map §3) | `plan-today`, `am-report`, `inbox-brief` — orchestrates and routes all lane work | `.claude/agents/marketing-chief.md` |
| web-product-builder | C frontend | opus | Claude Browser (local only; Playwright substitutes remotely); Composio (Windows box only) | `site-factory`, `mirror-and-improve`, `ui-design`, `frontend-build` | `.claude/agents/web-product-builder.md` |
| qa-critic | QA | opus | Claude Browser (local only; Playwright fallback per [[12_Brain/protocols/Connector Preflight|Connector Preflight]] §5) | `ux-audit`, `frontend-build`; Playwright fallback when Claude Browser is unreachable | `.claude/agents/qa-critic.md` |
| brain-curator | Brain | sonnet | None required (vault-internal); WebSearch/WebFetch for source capture | `brain-capture`, `brain-compile`, `vault-compile`, `wiki-lint` | `.claude/agents/brain-curator.md` |
| reliability-scout | Ops | haiku | None required (vault + automation registry internal) | `automation-ops` | `.claude/agents/reliability-scout.md` |
| growth-content | Content | sonnet | Claude Browser (local only; Playwright fallback remote); WebSearch | `content-scan` | `.claude/agents/growth-content.md` |
| paid-media-analyst | Paid | sonnet | Abency + AdWhispr Ads + Motion Creative Analytics | `client-report` | `.claude/agents/paid-media-analyst.md` |
| seo-aeo-analyst | SEO/AEO | sonnet | OpenRush + Abency | `aeo-report` (new this round; not yet run by this agent) | `.claude/agents/seo-aeo-analyst.md` |
| client-success | Accounts | sonnet | Slack + Gmail + Google Calendar + Composio HubSpot (read only) | `client-status` (new this round; not yet run by this agent) | `.claude/agents/client-success.md` |
| video-director | A films | sonnet | [[12_Brain/02_Entities/Higgsfield MCP|Higgsfield MCP]] + HyperFrames by HeyGen + Motion Creative Analytics + vidIQ | `scroll-hero`, `ad-teardown` (new this round; not yet run by this agent) | `.claude/agents/video-director.md` |
| radar-operator | B prospects | sonnet | [[12_Brain/02_Entities/Cloudflare D1 Radar|Cloudflare D1]] + OpenRush + [[12_Brain/02_Entities/Vibe Prospecting|Vibe Prospecting]]; read-only Vercel for build-queue status | `site-grade`, `franchise-list`, `site-batch` | `.claude/agents/radar-operator.md` |
| deploy-engineer | Deploy | sonnet | Vercel + Cloudflare Developer Platform | None dedicated yet — takes an approved build from web-product-builder/qa-critic to production | `.claude/agents/deploy-engineer.md` |
| voice-agent-builder | Voice | sonnet | Speko | None dedicated yet | `.claude/agents/voice-agent-builder.md` |

## Routing rules

- Fable 5.1 at medium effort is the lead seat — Dillon's own interactive
  session, never a subagent's.
- Sonnet is the subagent default (`CLAUDE_CODE_SUBAGENT_MODEL`): every worker
  lane above runs here unless the table says otherwise.
- Haiku is for scouts and mechanical reads only — reliability-scout, and the
  read-only steps inside `client-status`.
- opus stays pinned to exactly three agents — marketing-chief,
  web-product-builder, qa-critic — nowhere else.

## Handoffs

1. radar-operator → web-product-builder → qa-critic → deploy-engineer:
   prospect found and graded, site built, QA'd, then shipped.
2. video-director → web-product-builder: hero loops and ad teardowns land as
   assets and briefs a build in progress can use.
3. client-success → marketing-chief: per-client status and blockers roll up
   into the daily/weekly triage board.

## What still runs only on the Windows box

Per [[12_Brain/09_Ops/Connector Map]] §3–4, none of these have a cloud-session
path yet:

- Composio-dependent HubSpot writes (portal writes, property updates)
- CallRail (after-hours routing verification)
- HighLevel (Revive publish)
- Bitwarden gates (VA Claims WP, Google password gates) — credentials never
  enter an agent surface, cloud or local, regardless of this list
- `wrangler` deploy (Cloudflare Worker publish for the D1 radar backend)

## Links

- [[12_Brain/09_Ops/Connector Map|Connector Map]]
- [[12_Brain/protocols/Connector Preflight|Connector Preflight]]
- [[12_Brain/04_Decisions/2026-09-01 - Fable 5.1 routing and effort defaults|Fable 5.1 routing and effort defaults]]
