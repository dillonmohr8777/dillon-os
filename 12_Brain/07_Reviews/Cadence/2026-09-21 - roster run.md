---
note_type: review
status: active
date: 2026-09-21
updated: 2026-09-21
tags:
  - cadence
  - agents
  - momentum
source_refs:
  - 12_Brain/registry/automations.json
  - _os/automation/bin/run-roster.js
  - _os/automation/runs.jsonl
---

# Roster run, 2026-09-21

**6 ran, 0 failed, 2 reporting bad news, 54 skipped.** Free tier only: no model quota spent.

## Ran

| Agent | Exit | ms | Result |
|---|---|---|---|
| frontmatter-validate | 0 | 131 | ok |
| frontmatter-repair | 0 | 120 | ok |
| site-health-sentinel | 0 | 108 | ok |
| agent-craft-brief | 0 | 122 | ok |
| connector-health | 2 | 101 | ran, reporting bad news |
| daily-sweep | 2 | 15313 | ran, reporting bad news |

## Skipped, with reason

| Agent | Reason |
|---|---|
| discover-qualify | needs arguments |
| site-factory-batch | disabled |
| outreach-activate | disabled |
| indeed-hiring-adapter | needs arguments |
| grok-intelligence-ingest | needs arguments |
| xai-daily-search | needs arguments |
| experiment-queue | no command |
| dillon-dev-sandbox | needs arguments |
| maker-checker | needs arguments |
| mcp-acceptance-gate | needs arguments |
| context7-docs | needs arguments |
| landingfolio-design-reference | disabled |
| aeo-trust-gate | needs arguments |
| daily-communications-brain | needs arguments |
| daily-communications-brain-workflow-def | disabled |
| daily-morning-orchestrator-dry-board | disabled |
| obsidian-guard-dog | needs arguments |
| report-brain-ingest | needs arguments |
| browser-access | needs arguments |
| marketing-chief-twice-daily-brief | needs arguments |
| am-report | needs arguments |
| heartbeat | model backed, costs weekly quota |
| approval-queue-diff | model backed, costs weekly quota |
| unfiled-sweep | model backed, costs weekly quota |
| omega-search-terms | model backed, costs weekly quota |
| report-pairing-check | model backed, costs weekly quota |
| registry-reconciliation | model backed, costs weekly quota |
| credential-age | model backed, costs weekly quota |
| backup-risk | model backed, costs weekly quota |
| marketing-chief | subagent, runs inside a session |
| paid-media-analyst | subagent, runs inside a session |
| conversion-truth | subagent, runs inside a session |
| client-success-advisor | subagent, runs inside a session |
| client-conversion | subagent, runs inside a session |
| report-courier | subagent, runs inside a session |
| revenue-ops-analyst | subagent, runs inside a session |
| hubspot-tracker | subagent, runs inside a session |
| cross-reference | subagent, runs inside a session |
| email-outreach | subagent, runs inside a session |
| scout | subagent, runs inside a session |
| prospect-intelligence-scout | subagent, runs inside a session |
| content-producer | subagent, runs inside a session |
| creative-foundry | subagent, runs inside a session |
| growth-content | subagent, runs inside a session |
| web-product-builder | subagent, runs inside a session |
| qa-critic | subagent, runs inside a session |
| design-canvas | subagent, runs inside a session |
| leads-triage | model backed, costs weekly quota |
| run-roster | this runner; running it from itself recursed 2026-09-17 |
| ops-decision-packets | model backed, costs weekly quota |
| production-briefs | model backed, costs weekly quota |
| delivery-milestones | model backed, costs weekly quota |
| agent-verifier | model backed, costs weekly quota |
| revenue-exceptions | model backed, costs weekly quota |

## What this does not run

Model backed cadence jobs, subagents, anything with external actions, and
anything disabled. Those are deliberate: the first two cost weekly quota
and the third is approval gated. Run the cadence driver for those.
