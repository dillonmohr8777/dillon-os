---
name: podcast-intake-loop
description: Always-on landing-page intake/booking agent for the Pritzker Law Group podcast sponsor page — drafts the intake conversation spec plus a Speko voice-agent and/or ManyChat flow AS DRAFTS ONLY, QAs them, and queues a go-live approval. Use when building or revising the page's contact-capture bot (e.g. "/podcast-intake-loop draft the booking flow"). No legal advice in the bot; nothing deploys without approval.
---

# podcast-intake-loop

Design the intake/booking agent that captures a contact on the Pritzker sponsor
landing page and routes it to the firm — as drafts only. See `pritzker-ops` for
the operating model and the six gating confirmations. Client truth:
`01_Clients/Pritzker Law Group/overview.md` and the
`Client Intelligence Overlay.md`.

## Inputs

- The confirmed conversion goal and form destination (from the six confirmations
  — until both land, the flow stays a draft with the destination marked TO CONFIRM).
- `01_Clients/Pritzker Law Group/voice-profile.md` for the bot's tone.
- The landing-page plan: `12_Brain/05_Projects/2026-09-03 - Pritzker Law Group podcast sponsor landing page SEO-AEO-GEO plan.md`.

## Steps

1. **Draft the intake conversation spec.** Define the turns: greet in the firm's
   voice → capture name, contact, and reason for reaching out → route to the firm.
   The bot NEVER gives legal advice and NEVER implies an attorney-client
   relationship; it preserves the firm disclaimer verbatim. Fact-safe only.
2. **Draft the automation config (drafts only).** Write a Speko voice-agent
   SessionConfig draft and/or a ManyChat flow spec as files/notes. You may
   reference the Speko MCP tools (`mcp__Speko__*`, e.g. `agents.config_structure_get`,
   `migration.session_config_build`, `docs.search`) to shape the draft, but do
   NOT call `agents.create`, `agents.deploy`, `sessions.create`, or any tool that
   stands up a live agent, phone number, or call.
3. **QA.** Check every turn for: no legal advice, disclaimer preserved, no
   invented facts, fact-safe capture only, destination marked TO CONFIRM if the
   six confirmations are not all in.
4. **Queue go-live.** Append an approval-queue item to `System/approval-queue.md`
   under `## Current client actions` naming the deployment + live-agent stand-up,
   then stop.

## Boundaries

- Never deploy the landing page or stand up a live Speko/ManyChat agent, phone
  number, or session without approval. Drafts only.
- No legal advice in the bot; preserve the firm disclaimer; never imply an
  attorney-client relationship.
- Fact-safe: no invented guests, episodes, dates, platforms, or benefits.
- Approval boundary: draft locally, append to `System/approval-queue.md`, stop.
