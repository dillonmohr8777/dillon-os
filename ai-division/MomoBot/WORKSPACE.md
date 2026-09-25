---
title: Dillon's private workspace (dillon-workspace)
type: capture
tags: [ai-division, momobot, workspace]
source_refs:
  - "C:\\Users\\dillo\\Documents\\Codex\\2026-09-24\\dillons-workspace\\GOAL.md"
  - "C:\\Users\\dillo\\Documents\\Codex\\2026-09-24\\dillons-workspace\\deploy\\NEEDS-DILLON.md"
---

# Dillon's private workspace

Summary of `GOAL.md` and `deploy/NEEDS-DILLON.md` at
`C:\Users\dillo\Documents\Codex\2026-09-24\dillons-workspace\`. Part of
[[README|MomoBot]]; see [[EVIDENCE]] for the deploy/verification receipts.

## What it is

A separate, owner-only instance of the same DeerFlow fork — compose project
`dillon-workspace`, `127.0.0.1:2028` plus tailnet, its own volume and
secrets — built so the extra capabilities Dillon wants (host shell, personal
Gmail/Calendar/Drive, authenticated browser, Codex/Claude dispatch) are never
reachable from the client-facing MomoBot app.

## The 21-agent roster

Six departments — Command, Research, Marketing, Engineering, Web design,
Video, Client desk, Revenue, Knowledge — each with agents on routed model
lanes: Opus 5.5 orchestrates, GPT-6 Luna max handles private bulk reasoning,
Muse Spark 1.3 Contributor handles public-data volume only (no `file:read`
tool group, so it structurally cannot reach the private mounts), GPT-6 Sol
builds, Sonnet 5 handles client-facing writing. Full roster table:
`GOAL.md` § "The roster (21 agents, `fleet/templates/`)".

Seeded 2026-09-24 ~19:25 ET: 21 agents, 21 schedules (7 enabled — chief-of-
staff, delivery-auditor, reliability-scout, research-swarm, job-radar,
brain-curator, client-reporter — 14 paused for Dillon to enable
deliberately).

## Current state

- **Live**: `:2028` health-checked as part of the m4 promote sequence
  (`Start-DillonWorkspace.ps1 -WhatIfOnly` then `-Tailnet`), per the runbook
  at `C:\Users\dillo\.claude\plans\snappy-munching-heron.md`.
- **Desk on**: PR #15 (`feat(desk): owner-only Desk home behind
  private_workspace.enabled`) merged, defining `AppConfig.private_workspace`
  that gates the Desk home and the PAT route admissions in PR #14.
- **Agents not yet seeded onto live client instances**: the 21-agent roster
  runs only inside `dillon-workspace`; nothing has been promoted to MomoBot's
  client-facing catalog. Promotion is explicitly Phase 5 in `GOAL.md`, gated
  on per-client approval.

## Still gated on Dillon's own sign-in

Per `NEEDS-DILLON.md`: Gmail drafts, GA4/Search Console, Google Ads,
HubSpot, Slack, and Meta Ads all need Dillon to create the credential himself
(OAuth client, private-app token, service account, etc.) — nothing in the
build has read, copied, or printed a token. `agent-memory` MCP stays
host-side for now (its stdio transport reads Windows Credential Manager,
which has no path into the Linux gateway container).

## Standing limits (unchanged)

Drafts instead of sends; every claim labeled observed/inferred/unknown;
send, post, publish, spend, account changes, credentials/MFA, and
destructive actions stay approval-gated regardless of what capability is
added next.
