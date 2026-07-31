---
tags: [captures, index]
updated: 2026-07-31
---

# 01_Captures — automation-written ground truth

**Summary:** dated, immutable captures written by `_os/automation` ingest runs.
Same read-only contract as [[12_Brain/raw/README|raw/]]: compile from these into
`entities/` and `concepts/`, never rewrite the capture.

Frontmatter is the automation schema — `note_type: capture`, `status`,
`source_refs`, `verification_status`, `owner` — not the compiled-wiki schema.
Evidence from Grok and X stays **untrusted and source-linked**; a capture is not
permission to act.

## Grok

- [[12_Brain/01_Captures/Grok/2026-07-30 - daily-ai-workflow-design-and-consumer-pulse|2026-07-30 — daily AI, workflow, design, and consumer pulse]] — X primary pulse plus web verification, compiled into the daily research note.

## Slack

- [[12_Brain/01_Captures/Slack/2026-07-30 Live Slack Scan|2026-07-30 Live Slack Scan]] — authenticated read-only scan of Momentum Slack; no mutations.
- [[12_Brain/01_Captures/Slack/2026-07-30 Slack Open Loops|2026-07-30 Slack Open Loops]] — the open loops deduplicated out of that scan.

## Links
- Written by `grok-intelligence-ingest` and `slack-intake` · see [[12_Brain/queue/README|queue/]] and [[12_Brain/state/README|state/]]
- Lane model: [[12_Brain/decisions/2026-07-31 - Two-lane brain layout|Two-lane brain layout]]
