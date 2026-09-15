---
note_type: protocol
status: active
updated: 2026-08-11
tags:
  - brain
  - agents
  - protocol
---

# Agent Protocol

## Read

1. Open `INDEX.md`.
2. Read current operating and approval status.
3. Search for the named client, project, person, or concept.
4. Follow source links until the claim is supported.
5. Distinguish current evidence from memory and historical notes.

## Think

- Prefer a small verified context set over a vault-wide dump.
- For broad synthesis, split reading by domain and reconcile the results.
- Surface contradictions instead of smoothing them over.
- Treat missing evidence as missing; do not estimate it into existence.

## Write

- Add captures; do not rewrite capture history.
- Update canonical notes instead of creating duplicates.
- Put finite outcomes in Projects, choices in Decisions, reusable lessons in
  Concepts, and durable corrections or preferences in Memory.
- Add `source_refs`, update dates, and a review or expiry date when facts can
  drift.
- Keep clients in `01_Clients/` and approvals in
  `System/approval-queue.md`.

## Route models

- Let the Marketing Chief select the exact task lane and live-ready route from
  the canonical routing policy. Do not infer availability from an installed
  CLI, catalog entry, or saved profile.
- Use separate collector, maker, checker, compiler, and observer roles. For
  consequential work, the checker must be a different model family from the
  maker and must inspect the actual artifact or live result.
- Pass the minimum exact context. Public or free routes never receive secrets,
  raw private communications, sensitive client evidence, or cross-client
  context.
- Treat every model response as evidence or a proposal until source verification
  and canonical compilation are complete.
- Interactive media generators remain human-gated. They cannot authorize
  delivery, publishing, deployment, spend, or an account change.

## Two-output rule

When a session creates durable knowledge, finish with:

1. the requested deliverable; and
2. the smallest useful vault update.

Do not create memory for routine chatter, temporary debugging output, or
secrets.

## Verification

After adding, moving, or renaming notes, run
`System/scripts/Update-SecondBrainMaps.ps1` before the structural and health
checks below.

Run `System/scripts/Test-SecondBrain.ps1`. A substantive weekly review also
runs `Update-SecondBrainHealth.ps1` and links its findings from the review.

## Close

Record:

- what changed;
- evidence used and freshness;
- decisions made;
- unresolved contradictions or human gates;
- the next safe action.

External delivery and consequential changes remain separately approval-gated.

## OpenAI Agents API (optional harness)

For long-running coding/research agents that need a managed Codex session/sandbox, prefer the skill `.agents/skills/openai-agents-api/SKILL.md` and dry-run wrapper `System/scripts/Invoke-OpenAIAgentsSession.ps1`. Do not use it for CEO chat, Hermes cron, OmniRoute routing, Marketing Chief canonical writes, or any send/post/publish/spend without an exact Dillon yes. Concept note: `12_Brain/03_Concepts/OpenAI Agents API.md`.
