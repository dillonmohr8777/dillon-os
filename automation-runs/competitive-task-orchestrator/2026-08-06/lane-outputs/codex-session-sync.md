# Codex Session Sync — 2026-08-06

## Durable open loops from Codex

| Item | Source | Vault tracks? |
|---|---|---|
| Morning orchestrator 8-lane loop | `11_Agents/64gb Morning Orchestrator Spec` | Partially — now absorbed by competitive-task-orchestrator |
| 28 Codex automations to port | Top 15 Opp #12 | Registry has wave-1-2; Gmail/Slack live ingest still gated |
| Book form `/api/dossier-leads` dead | Top 15 Opp #1 | Yes — site-health fixture references it |
| Client reporting factory | Top 15 Opp #5 | `_os/reporting/build-report.js` exists; per-client fetchers missing |
| Netlify deploy token in cloud secrets | Automation Deep Analysis W2 | `automations.json` gate: pending-secret |
| Mac site-factory activate path | Pipeline Spec stage 7 | Partially — batch QA proven, mail vendor undecided |
| King Agent morning command / money run | King Agent OS entity | Patterns map to `/am-report`, `/plan-today` — now unified |

## Port candidates (high value, not yet daily)

1. Per-client metrics-pull → weekly revenue scorecard (Opp #9)
2. Grok/xAI daily intelligence bridge (`grok-intelligence-ingest` — implemented, needs schedule)
3. Reporting data fetchers for 8 M360 retainers + Align

## Connector health

- Hermes: Slack `invalid_auth` (historical)
- Codex Slack connector: `oauth_refresh_token_rejected`
- Gmail: vault says active for primary mailbox in Communication Intelligence SOP; MCP status unverified this run
- Obsidian MCP: dead config per Top 15 Opp #14

## Recommended vault backfill

1. Refresh `last_touched` on all `01_Clients/*/overview.md` from live Gmail/Slack pass
2. Close or update `00_Inbox/slack/` notes after boss replies drafted
3. Add `10_Sessions/Codex/` index row when session mining resumes
