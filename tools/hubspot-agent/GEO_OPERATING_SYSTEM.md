# GEO Operating System — Align HCM

> **Status:** Reconstructed baseline (2026-07-08). The original lived on the local
> Codex machine and was not in any synced repo. This version is rebuilt from the
> `Next Codex 64GB Orchestrator Handoff` (Lane G / Workflow 6). Reconcile against
> your local copy and overwrite where the local one is more current.

## Purpose

Run Align HCM growth work: AEO/GEO content, HubSpot CMS blog scheduling,
authority/backlink work, and capability briefs. AEO/GEO is treated as **stronger
SEO plus extractability**, not a hack.

## Content principles

- Lead with a **direct 40-60 word answer** early in the post.
- Use **question-style H2s**, short paragraphs, tables, FAQs, comparison matrices,
  and proof blocks.
- **Do not** use unsupported AI-traffic or citation statistics.
- Structure for extractability: a machine should be able to lift a clean answer
  from the first screen.

## Scheduling discipline

- **Schedule complete content now. Leave missing-asset posts unscheduled.**
- A post is schedulable only when its copy **and** every required asset (video,
  images, URLs) exist. If an asset is missing, keep it a DRAFT and log the blocker.
- Align social calendar upload is **monthly**, currently intended for the 1st of
  each month unless the rule changes.
- Publishing is **approval-gated**: draft first, Dillon approves the send. The
  `hubspot_agent.py` script enforces this with dry-run-by-default.

## Known blockers (from 2026-07-08 handoff — verify against live before acting)

- **July 21 — SmartCare:** no video asset yet. Do not schedule until the video exists.
- **July 15 / July 27 / July 31 — Maher:** missing required content / URLs / assets.

## Execution flow

1. Read this file before giving any generic AEO/GEO advice.
2. Draft content to the structure above; store as a content JSON (see
   `content/example-post.json`).
3. `create-post` as a DRAFT (dry-run first, then `--confirm`).
4. Confirm assets are complete for each post.
5. `schedule-post` / `schedule-batch` only the complete ones.
6. Leave blocked posts as drafts and record the blocker.
7. Read back scheduled state (`list-posts --state SCHEDULED`) and report.

## Capability split (2026-07-08)

- **Blog create / schedule / publish:** this token-route script.
- **CRM, campaign + content analytics, landing pages:** the Claude HubSpot connector.
