# Dillon Command Center — Approval Board

Run: `CMD-20260821-1787317456892` · Date: 2026-08-21

> One umbrella cycle. Eight parallel lanes. Nothing sends, publishes, deploys, or spends without explicit approval.

## P0 stack

- **- [ ] 2026-07-12 -- [Bar Crawl USA] -- Approve clearance of 2 disapproved ads (Halloween/Fall Cocktail) and audit PMax for Presence Only + t** (ads — billing or disapproval risk)
- **Stabilize the bot and add case-status notifications** (comms — urgent slack loop)
- **Confirm NeedMomentum brand direction** (comms)
- **Close the guidelines prompt and Loom follow-up** (comms)
- **Verify CallRail activity and report what changed** (comms)
- **Touch stalled client: AMI Cleaning** (clients)
- **Touch stalled client: BOK Law Firm** (clients)
- **Touch stalled client: Bar Crawl USA** (clients)

## Lane receipts

### comms
- agent: chief-of-staff
- tasks: 4

### clients
- agent: marketing-chief
- tasks: 5

### intelligence
- agent: brain-curator
- tasks: 0

### outreach
- agent: growth-content
- tasks: 0

### ads
- agent: paid-media-analyst
- tasks: 5

### reporting
- agent: paid-media-analyst
- tasks: 0

### websites
- agent: web-product-builder
- tasks: 0

## Scoreboard

- Open approvals: **181**
- Open Slack loops: **4**
- Stalled clients: **24**
- Prospect rebuild queue: **207**

## Superseded automations

- handoffs/Morning Loop Scheduled Agent Setup.md
- separate slack-intake + am-report + client-pulse crons
- duplicate daily-orchestrator PR family

## Retained separate loops

- **claude-daily-driver** — 15m micro-loop for 54 routines — feeds command lane receipts, not replaced
- **prospect-radar-next20** — heavy site builder batch — outreach lane reads its state only
- **agent-memory-vault-sync** — hourly memory projection — intelligence lane reads freshness only
- **hermes-gateway-health** — infrastructure probe — reliability lane future; do not merge into command synthesis