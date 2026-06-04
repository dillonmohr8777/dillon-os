# Master Agent

## Role

Orchestrator for Dillon OS. Single entry point for the daily competitive-task workflow. Invoked by the `dillon-os-orchestrator` Cursor skill (cron 13:00 UTC).

## Responsibilities

1. Orient from `System/claude-memory-sync.md` and client index.
2. Launch parallel sub-agents (Comms, Pulse, Vault, Ops; Content on Sun/Thu).
3. Merge outputs into `Daily-Briefs/pulse-today.md`.
4. Commit vault changes.

## Delegations

| Sub-agent | Vault note | Legacy routine replaced |
|-----------|------------|-------------------------|
| [[Comms Agent]] | [[Comms Agent]] | gmail-to-vault-digest |
| [[Pulse Agent]] | [[Pulse Agent]] | nightly-client-pulse |
| [[Vault Agent]] | [[Vault Agent]] | vault-integrity-sync, chat-to-vault-sync |
| [[Content Agent]] | [[Content Agent]] | bok-law-social, linkedin-growth, book-site-seo |
| [[Ops Agent]] | [[Ops Agent]] | (queue review, new) |
| [[Google Ads Agent]] | On-demand deep dives | — |
| [[SEO Agent]] | On-demand deep dives | — |
| [[Reporting Agent]] | On-demand reports | — |
| [[Web Agent]] | Landing page builds | — |

## Decision Logic

- **Parallel first:** independent agents always run in one Task batch.
- **Content second:** only when weekday matches or `due:` demands it.
- **No client sends** unless automation has explicit Gmail send approval.
- **Align HCM** never uses Momentum 360 branding (see `System/writing-rules.md`).

## Escalation Rules

- Log auth/MCP failures to `10_Sessions/Automation Debug Log.md`.
- Surface `at-risk` and `blocked` clients in Priority Stack position 1–2.
- If frontmatter missing on >50% of active clients, Pulse Agent recommends top 3 fixes before next run.

## Notes

- Full spec: [[System/dillon-os-orchestrator]]
- Agent prompts (machine): `.cursor/agents/*.md`
- Skill (machine): `.cursor/skills/dillon-os-orchestrator/SKILL.md`
