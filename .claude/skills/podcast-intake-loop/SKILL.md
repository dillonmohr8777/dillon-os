---
name: podcast-intake-loop
description: Contact-capture intake flow for the Pritzker Law Group podcast sponsor landing page — drafts a plain capture form plus a ManyChat flow spec AS DRAFTS ONLY, QAs them, and queues a go-live approval when a concrete artifact is ready. An AI voice agent (Speko) is an explicitly optional path requiring client consent. Use when building or revising the page's contact capture (e.g. "/podcast-intake-loop draft the booking flow"). No legal advice in the flow; nothing deploys without approval.
---

# podcast-intake-loop

Design the contact-capture flow on the Pritzker sponsor landing page and route
it to the firm — as drafts only. See `pritzker-ops` for the operating model and
the gating confirmations. Client truth:
`01_Clients/Pritzker Law Group/overview.md` and the
`Client Intelligence Overlay.md`.

Operating model in one line: authentic firm voice + human approval + high craft,
not concealment — see `12_Brain/03_Concepts/Anti-AI Client Operating Model.md`.

## Inputs

- The confirmed conversion goal and form destination (from the gating
  confirmations — until both land, the flow stays a draft with the destination
  marked TO CONFIRM).
- `01_Clients/Pritzker Law Group/voice-profile.md` for the flow's tone.
- **Blocking input — the firm's disclaimer text.** It is NOT yet captured
  anywhere in the vault. It must be obtained verbatim from the firm and recorded
  in `01_Clients/Pritzker Law Group/voice-profile.md` before any asset publishes.
  If it is absent, STOP and flag. Do not invent, paraphrase, or approximate it.
- The landing-page plan: `12_Brain/05_Projects/2026-09-03 - Pritzker Law Group podcast sponsor landing page SEO-AEO-GEO plan.md`.

## Steps

### 1. Draft the intake conversation spec

Define the turns: greet in the firm's voice → capture name, contact, and reason
for reaching out → route to the firm. The flow NEVER gives legal advice and
NEVER implies an attorney-client relationship; it preserves the firm disclaimer
verbatim. Fact-safe only.

### 2. PRIMARY path — plain capture form + ManyChat

This is the default and the one to draft first:

- **A plain, non-AI-forward contact capture form** on the landing page: name,
  contact, reason for reaching out, the firm disclaimer, one CTA to the confirmed
  destination. No AI branding, no chat persona, no "assistant".
- **A ManyChat flow spec** as a draft note. ManyChat is the only
  client-evidenced tool in this lane — `01_Clients/Pritzker Law Group/overview.md`
  records "Manychat implementation is targeted for Monday", and that note marks
  ManyChat completion as **unverified**. Treat ManyChat as targeted-but-unconfirmed.

### 3. OPTIONAL path — Speko voice agent (client-consent gated)

An always-on AI voice agent is **not** the default and **not** client-evidenced.
Speko appears nowhere in client evidence. Draft a Speko SessionConfig only if
BOTH hold:

- **(a) Explicit client consent** to an AI voice agent on this page has been
  obtained and recorded, and
- **(b)** the proposal is accompanied by this note: **proposing an AI voice agent
  to this reported-anti-AI decision-maker is a known relationship risk flagged by
  review.** An always-on AI voice agent is the single artifact this decision-maker
  is most likely to reject. Raise it as a risk; never slip it in as a config choice.

Without both, do not draft a Speko config at all.

### 4. QA

Check every turn for: no legal advice, disclaimer present and verbatim (or the
run halted because it is not captured yet), no invented facts, fact-safe capture
only, destination marked TO CONFIRM if the gating confirmations are not all in,
and no AI-forward framing on the primary path.

### 5. Queue go-live

**When a concrete artifact exists**, append an approval-queue item to
`System/approval-queue.md` under `## Current client actions` naming the
deployment and any live-agent stand-up, then stop. Do not append hypothetical
future gates in advance — the gate is already tracked by `status: "pending-gate"`
in `12_Brain/registry/automations.json`.

## Boundaries

### Vendor tool allow-list

Only **read/inspect** tools are permitted. Everything not on this list is
forbidden:

- `mcp__Speko__docs_search`
- `mcp__Speko__capabilities_describe`
- `mcp__Speko__capabilities_search`
- `mcp__Speko__agents_config_structure_get`
- `mcp__Speko__models_list`
- `mcp__Speko__voices_list`

Everything else is forbidden, including but not limited to `agents_create`,
`agents_deploy`, `agents_update`, `sessions_create`, `sessions_phone_create`,
`phone_numbers_create`, `agents_test_call`, `api_keys_create`, and
`migration_session_config_build` (it takes a config payload — shape drafts by
hand instead).

**Explicitly forbidden: `knowledge_bases.documents.create`** — and any upload,
sync, or transfer of firm or client material to a third-party vendor by any
route.

### Confidentiality gate

Routing firm or client content through Speko, ManyChat, or any third-party
vendor is a **client confidentiality and data-processing decision requiring
explicit client consent** — it is not a configuration choice an agent makes. For
a law firm this may also carry professional-responsibility implications the firm
must assess. Obtain and record consent before any firm content reaches a vendor.

### Standing boundaries

- Never deploy the landing page or stand up a live Speko/ManyChat agent, phone
  number, or session without approval. Drafts only.
- No legal advice in the flow; preserve the firm disclaimer verbatim (blocked
  until it is captured); never imply an attorney-client relationship.
- Fact-safe: no invented guests, episodes, dates, platforms, benefits, metrics,
  or search volumes. Unknown ⇒ mark TO CONFIRM.
- Approval boundary: draft locally, append to `System/approval-queue.md` when an
  artifact is ready, stop.
