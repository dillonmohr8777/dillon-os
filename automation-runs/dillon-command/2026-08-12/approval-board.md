# Approval board — 2026-08-12

Generated: 2026-08-12T13:19:00.276Z

## Vault signals

- Inbox unprocessed: **5**
- Slack new requests: **4**
- Clients moving (48h): **0**
- Clients stalled: **0**
- Dashboard open tasks: **3**

## Ranked items

1. **[Tier 0]** 4 new Slack request(s) need review
   - Lane: `comms` · Urgency: high
   - Action: Read 00_Inbox/slack/ notes; draft replies in vault only

2. **[Tier 0]** 5 inbox note(s) unprocessed
   - Lane: `comms` · Urgency: medium
   - Action: Run /inbox-brief or file away per verdict

3. **[Tier 0]** Morning report not written today
   - Lane: `command` · Urgency: high
   - Action: Command lane runs /am-report after scouts complete

4. **[Tier 1]** Tier-1 batch placeholder
   - Lane: `ads` · Urgency: low
   - Action: After scout synthesis: one approval executes reversible ads tweaks across clients

5. **[Tier 2]** Outbound queue
   - Lane: `command` · Urgency: low
   - Action: Gmail send, Slack post, deploy, mail — prepared only, never auto-executed

## Parallel lanes

- **comms** (Comms intake) — agent `comms-scout`
- **clients** (Client pulse) — agent `client-scout`
- **intelligence** (Intelligence bridge) — agent `intel-scout`
- **websites** (Website health) — agent `web-scout`
- **outreach** (Outreach queue) — agent `outreach-scout`
- **ads** (Paid media) — agent `ads-scout`
- **reporting** (Reporting delivery) — agent `report-scout`
- **command** (Command synthesis) — agent `commander` · runs last

## Agent dispatch (parallel scouts)

### comms

Lane comms (Comms intake) for 2026-08-12. Run: /slack-intake, /inbox-brief. Requires MCP: slack. Tier 0 only — read, analyze, draft, file. Never send, post, deploy, or spend. Return the worker contract JSON from 11_Agents/Next Codex 64GB Orchestrator Handoff 2026-07-08.md.

### clients

Lane clients (Client pulse) for 2026-08-12. Run: /client-pulse. Tier 0 only — read, analyze, draft, file. Never send, post, deploy, or spend. Return the worker contract JSON from 11_Agents/Next Codex 64GB Orchestrator Handoff 2026-07-08.md.

### intelligence

Lane intelligence (Intelligence bridge) for 2026-08-12. Run: /research-sweep. Tier 0 only — read, analyze, draft, file. Never send, post, deploy, or spend. Return the worker contract JSON from 11_Agents/Next Codex 64GB Orchestrator Handoff 2026-07-08.md.

### websites

Lane websites (Website health) for 2026-08-12. Run: /site-grade, /ux-audit. Tier 0 only — read, analyze, draft, file. Never send, post, deploy, or spend. Return the worker contract JSON from 11_Agents/Next Codex 64GB Orchestrator Handoff 2026-07-08.md.

### outreach

Lane outreach (Outreach queue) for 2026-08-12. Run: /site-factory, /site-batch. Tier 0 only — read, analyze, draft, file. Never send, post, deploy, or spend. Return the worker contract JSON from 11_Agents/Next Codex 64GB Orchestrator Handoff 2026-07-08.md.

### ads

Lane ads (Paid media) for 2026-08-12. Run: /metrics-pull. Tier 0 only — read, analyze, draft, file. Never send, post, deploy, or spend. Return the worker contract JSON from 11_Agents/Next Codex 64GB Orchestrator Handoff 2026-07-08.md.

### reporting

Lane reporting (Reporting delivery) for 2026-08-12. Run: /client-report. Tier 0 only — read, analyze, draft, file. Never send, post, deploy, or spend. Return the worker contract JSON from 11_Agents/Next Codex 64GB Orchestrator Handoff 2026-07-08.md.


## One push rule

Dillon gets exactly one notification per cycle — this board plus the AM report.
Tier 0 runs unattended. Tier 1 batches under one approval. Tier 2 stays gated.
