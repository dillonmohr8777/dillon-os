---
name: reputation-engine
description: Monitor reviews, Google Business Profile, and brand mentions for Pritzker Law Group, draft fact-safe responses in the firm's authentic voice, run maker/checker, and queue for approval before any posting. Use when watching or responding to Pritzker reviews/GBP/mentions (e.g. "/reputation-engine draft a reply to this new review"). Never posts or contacts anyone live without approval; no legal advice.
---

# reputation-engine

Watch the firm's reputation surfaces and draft firm-voiced responses, gated
behind approval by the client's **final approval owner (role TO CONFIRM — client
evidence says "final approval owner", not necessarily an attorney)**. See
`pritzker-ops` for the operating model and the gating confirmations. Client
truth: `01_Clients/Pritzker Law Group/`. GBP existence and ownership are TO
CONFIRM — do not assume a profile exists or that the firm controls it.

Operating model in one line: authentic firm voice + human approval + high craft,
not concealment — see `12_Brain/03_Concepts/Anti-AI Client Operating Model.md`.

## Inputs

- The review / GBP item / brand mention (supplied; cite it in `source_refs`).
- `01_Clients/Pritzker Law Group/voice-profile.md` for tone.
- **Blocking input — the firm's disclaimer text.** It is NOT yet captured
  anywhere in the vault. It must be obtained verbatim from the firm and recorded
  in `01_Clients/Pritzker Law Group/voice-profile.md` before any asset publishes.
  If it is absent, STOP and flag. Do not invent, paraphrase, or approximate it.
- Signal sources: reuse the radar/site-grade signals (`site-grade`, the Cloudflare
  D1 Radar entity) and the measurement concept notes:
  `12_Brain/03_Concepts/AI Visibility Measurement.md`,
  `12_Brain/03_Concepts/Entity Authority and Citation Readiness.md`,
  `12_Brain/03_Concepts/Local Search and Maps Site Parity.md`.

## Steps

1. **Monitor.** Collect new reviews, GBP activity, and brand mentions read-only.
   Track branded-search and citation signals via the measurement notes above.
2. **Draft the response** in the firm's authentic voice (from the voice profile).
   Fact-safe, no legal advice, disclaimer preserved verbatim, never implying an
   attorney-client relationship. Thank / acknowledge; route substantive matters
   to the firm offline.
3. **Maker/checker.** Run the independent gate with distinct maker and checker
   identities. The manifest must satisfy
   `12_Brain/schemas/workflow-evaluation.json` (required: `workflow_id`, `task`,
   `maker_id`, `checker_id`, `artifact_paths`, `acceptance_tests`, `rollback`;
   `maker_id` and `checker_id` must differ). Each subcommand takes flags — they
   error without them:

   ```
   node _os/automation/bin/workflow-gate.js start --from <manifest.json>
   node _os/automation/bin/workflow-gate.js maker --run <RUN-ID> --evidence <maker-evidence.json>
   node _os/automation/bin/workflow-gate.js check --run <RUN-ID> --evidence <checker-evidence.json>
   node _os/automation/bin/workflow-gate.js gate --run <RUN-ID>
   ```

   `start` prints the generated `run_id`; pass it to every later subcommand.
   Maker evidence is `{ "maker_id", "summary", "artifact_paths"?, "command_results"? }`.
   Checker evidence is `{ "checker_id", "verdict": "pass"|"fail", "summary", "test_results"? }`
   — `checker_id` must equal the manifest's `checker_id` and must not equal
   `maker_id`. The checker verifies voice match, fact-safety, and that no legal
   advice is given. Full operator reference: `_os/automation/docs/OPERATOR.md`.

4. **Queue for approval.** **When a concrete draft exists**, append the
   posting/contact action to `System/approval-queue.md` under
   `## Current client actions` (approval required before any post or outreach).
   Do not append hypothetical future gates in advance. Stop.

## Boundaries

- Never post a review response, GBP reply, or contact anyone live without
  approval. Drafts only.
- **Confidentiality gate.** Routing firm or client content through any
  third-party vendor — a monitoring service, a review platform integration,
  Speko, ManyChat, or anything similar — is a **client confidentiality and
  data-processing decision requiring explicit client consent**, not a
  configuration choice. For a law firm it may also carry
  professional-responsibility implications the firm must assess. Obtain and
  record consent before any firm content leaves the vault. Monitoring stays
  read-only; never upload firm or client material to a vendor.
- No legal advice; preserve the firm disclaimer verbatim (blocked until it is
  captured); never imply an attorney-client relationship.
- Fact-safe: no invented outcomes, testimonials, awards, benefits, metrics, or
  search volumes. Unknown ⇒ mark TO CONFIRM.
- Do not assume a GBP exists or is firm-controlled — confirm first.
- Approval boundary: draft locally, append to `System/approval-queue.md` when an
  artifact is ready, stop.
