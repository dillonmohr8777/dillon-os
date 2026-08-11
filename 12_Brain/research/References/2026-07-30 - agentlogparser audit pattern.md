---
note_type: research
status: reference
created: 2026-07-30
updated: 2026-07-30
owner: Dillon Mohr
verification_status: partial
source_refs:
  - "https://github.com/sumeshi/agentlogparser-rs"
tags:
  - brain
  - research
  - agent-audit
  - reference
---

# agentlogparser audit pattern

`agentlogparser-rs` is saved as a reference, not installed.

## Pattern worth reusing

- Convert Codex and Claude Code session artifacts into bounded CSV, JSON, or JSONL
  timelines.
- Preserve tool, file, command, and event ordering for maker/checker review.
- Use a schema validator before accepting parsed evidence.
- Redact secrets and client data before any timeline enters a repository.
- Treat the parser as an evidence adapter, never as proof that the underlying action
  was correct.

## Dillon OS fit

The useful integration target is the workflow evaluator: attach a redacted timeline
hash to maker evidence, then let an independent checker compare it with artifact
hashes, the recorded demo, and acceptance tests.

## Gate before adoption

Source review, fixture-only parsing, output-schema tests, secret-redaction tests,
large-log cost measurement, and overlap review with existing Codex run records.
