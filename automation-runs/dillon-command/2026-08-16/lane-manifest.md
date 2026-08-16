# Dillon Command Center — lane manifest

Date: 2026-08-16
Contract: 11_Agents/64gb Morning Orchestrator Spec 2026-07-08.md

Run eight lanes in parallel. Each lane is Tier 0 (read/draft only).
Synthesize once all lanes finish, then open one PR.

## comms — Comms triage
Skills: `/slack-intake`, `/inbox-brief`

## clients — Client roster
Skills: `/client-pulse`
Deterministic: `node _os/automation/bin/frontmatter-validate.js`

## intelligence — Intelligence
Skills: `/research-sweep`

## websites — Site health
Deterministic: `node _os/automation/bin/site-health.js --dry-run`

## outreach — Outreach queue
Skills: `/site-grade`
Deterministic: `node _os/automation/bin/queue-status.js`

## ads — Paid media
Skills: `/metrics-pull`
Blocked without MCP: google-ads-mcp, meta-mcp, ga4-mcp

## reporting — Client reporting
Skills: `/client-report`
Blocked without MCP: google-ads-mcp

## command — Command synthesis
Skills: `/am-report`, `/plan-today`
Depends on: comms, clients, intelligence, websites, outreach
