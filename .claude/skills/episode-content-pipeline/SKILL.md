---
name: episode-content-pipeline
description: Turn a Love, Philadelphia podcast episode transcript into a Pritzker-relevant legal angle and draft a blog post, GBP post, and social caption in the firm's authentic voice, AEO/GEO-structured, then maker/checker and queue for the final approval owner. Use when a new episode transcript is ready (e.g. "/episode-content-pipeline <episode transcript>"). Voice comes from the real approved profile; no invented facts.
---

# episode-content-pipeline

Compile one episode transcript into fact-safe, firm-voiced content assets, gated
behind the client's **final approval owner (role TO CONFIRM — client evidence
says "final approval owner", not necessarily an attorney)**. See `pritzker-ops`
for the operating model and the gating confirmations. Client truth:
`01_Clients/Pritzker Law Group/`.

Operating model in one line: authentic firm voice + human approval + high craft,
not concealment — see `12_Brain/03_Concepts/Anti-AI Client Operating Model.md`.

## Inputs

- The episode transcript (supplied; treat as source, cite it in `source_refs`).
- `01_Clients/Pritzker Law Group/voice-profile.md` — the firm's authentic voice
  (must come from real approved firm writing; if empty, stop and flag).
- **Blocking input — the firm's disclaimer text.** It is NOT yet captured
  anywhere in the vault. It must be obtained verbatim from the firm and recorded
  in `01_Clients/Pritzker Law Group/voice-profile.md` before any asset publishes.
  If it is absent, STOP and flag. Do not invent, paraphrase, or approximate it.
- `System/writing-rules.md` for house style.
- Reuse `content-scan` (pipeline placement) and `brain-capture` (immutable receipt
  of the transcript).

## Steps

1. **Capture the transcript.** Route it through `brain-capture` so the source is
   an immutable receipt with a stable path to cite.
2. **Extract the legal angle.** Find the Pritzker-relevant, evidence-backed legal
   theme (tie only to confirmed firm practice areas from the overlay). No invented
   guests, episode facts, numbers, dates, or outcomes.
3. **Draft the assets in the firm's voice** (from the voice profile):
   - Blog post — AEO/GEO structured: answer-extractable H2 questions with the
     direct answer first, internal links to the firm's relevant practice pages
     (descriptive anchors), fact-safe FAQ schema only for Q&A actually on the page.
   - GBP post — short, fact-safe, firm-voiced.
   - Social caption — one platform-appropriate caption, disclaimer-safe.
4. **Maker/checker.** Run the independent gate with distinct maker and checker
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
   `maker_id`. The checker verifies voice match, fact-safety, disclaimer, and AEO
   structure. Full operator reference: `_os/automation/docs/OPERATOR.md`.

5. **Queue for sign-off.** **When a concrete artifact exists**, append the publish
   action to `System/approval-queue.md` under `## Current client actions` (final
   approval owner sign-off required), and surface it in the morning approval
   queue. Do not append hypothetical future gates in advance. Stop.

## Boundaries

- Final approval owner sign-off before any publish. Drafts only; nothing posts.
- No invented facts, guests, dates, episodes, numbers, metrics, or outcomes —
  fact-safe throughout. Unknown ⇒ mark TO CONFIRM.
- The voice profile must come from real, firm-approved writing, never fabricated.
  If `voice-profile.md` is still an empty template, stop and flag.
- The firm's disclaimer text is a blocking input, not a placeholder; it is not
  captured yet. Never imply an attorney-client relationship.
- Approval boundary: draft locally, append to `System/approval-queue.md` when an
  artifact is ready, stop.
