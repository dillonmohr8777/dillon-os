---
name: competitive-task-orchestrator
description: One umbrella daily loop — parallel lane agents for Gmail, Slack, vault pulse, Codex sessions, domain/ads/SEO, and content; consolidates seven legacy crons into a single approval board and competitive-task-today brief.
---

# Competitive Task Orchestrator

**One automation. Seven parallel scouts. One board.**

This is Dillon OS's umbrella workflow. It replaces the fragmented morning loop,
client pulse, Gmail digest, vault sync, content routines, and SEO sweep crons.
Full spec: `11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md`. Master
routing: `11_Agents/Master Agent.md`.

## When to run

- **Cursor Automation cron:** `0 13 * * *` (daily, 1 PM UTC / 8–9 AM ET)
- **On demand:** when Dillon says "run the competitive task loop"

## Hard rules

1. **Read and draft only.** Never send Gmail, Slack, deploy, or spend.
2. **Parallel first.** Spawn all Tier-0 lane agents concurrently; run
   `memory-consolidator` only after they finish.
3. **Vault is source of truth.** If Gmail or Slack MCP is unavailable, use vault
   mirrors (`00_Inbox/slack/`, `Daily-Briefs/`, client overviews) and note the gap.
4. **One push.** Produce exactly one daily brief:
   `Daily-Briefs/competitive-task-today.md`.
5. **Evidence.** Write run artifacts under
   `automation-runs/competitive-task-orchestrator/YYYY-MM-DD/`.

## Phase 0 — deterministic preflight (shell, not agents)

```bash
node _os/automation/bin/frontmatter-validate.js
node _os/automation/bin/site-health.js --dry-run
node _os/automation/bin/command-loop.js plan
```

## Phase 1 — parallel lane agents

Spawn these subagents **in parallel** using the Task tool. Each agent reads its
definition in `.cursor/agents/<lane>.md` and follows the mapped skill.

| Lane | Agent | Skill fallback |
|------|-------|----------------|
| gmail-intel | `.cursor/agents/gmail-intel.md` | `.claude/skills/inbox-brief/SKILL.md` |
| slack-intel | `.cursor/agents/slack-intel.md` | `.claude/skills/slack-intake/SKILL.md` |
| vault-pulse | `.cursor/agents/vault-pulse.md` | `.claude/skills/client-pulse/SKILL.md` |
| codex-session-sync | `.cursor/agents/codex-session-sync.md` | `.claude/skills/session-mine/SKILL.md` |
| domain-ads-seo | `.cursor/agents/domain-ads-seo.md` | `.claude/skills/site-grade/SKILL.md` |
| content-routines | `.cursor/agents/content-routines.md` | `.claude/skills/content-scan/SKILL.md` |

Each lane writes its output file(s) and a short JSON summary to the run folder.

## Phase 2 — memory consolidator (sequential)

After all lane agents complete, spawn **one** `memory-consolidator` agent
(`.cursor/agents/memory-consolidator.md`). It:

1. Reads every lane summary from the run folder.
2. Runs `node _os/automation/bin/command-loop.js board`.
3. Writes `Daily-Briefs/competitive-task-today.md` (under 60 lines).
4. Updates `Dashboard.md` `## Today` with the top 3 P0/P1 items.
5. Runs `node _os/automation/bin/command-loop.js finalize --status ok|warn`.

## competitive-task-today.md shape

```markdown
# Competitive Task — YYYY-MM-DD

## The one thing
<single highest-leverage action>

## P0 today
- ...

## Boss / Slack open loops
- ...

## Client pulse
- moving / watch / stalled counts + top 3

## Infrastructure
- frontmatter, site-health, radar, gates

## Deliberately not doing
- ...

## Connector gaps
- what MCPs were unavailable
```

## Approval tiers

- **Tier 0:** all lane scouts + this brief (unattended).
- **Tier 1:** reversible ads/web tweaks — batch on 64GB machine after one approval.
- **Tier 2:** sends, posts, deploys, billing — prepared only.

## Legacy automations this replaces

Disable these separate Cursor crons after three consecutive green runs:

- morning-loop-slack-am-pulse
- nightly-client-pulse
- gmail-to-vault-digest
- vault-integrity-sync
- chat-to-vault-sync
- bok-law-social-content
- linkedin-growth-engine
- book-site-seo-sweep

## Commit + PR

Commit to `cursor/competitive-task-YYYY-MM-DD` and open a PR titled
`Competitive task YYYY-MM-DD` so Dillon can review from his phone.
