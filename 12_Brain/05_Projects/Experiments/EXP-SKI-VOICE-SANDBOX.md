---
note_type: experiment
status: proposed
created: 2026-07-30
updated: 2026-07-30
owner: Dillon Mohr
experiment_id: EXP-SKI-VOICE-SANDBOX
decision: sandbox-test
verification_status: partial
human_gate: required
risk: low-medium
source_refs:
  - "https://heyski.io/"
  - "https://www.producthunt.com/products/ski"
tags:
  - brain
  - experiment
  - voice
  - coding-agent
---

# SKI local voice companion sandbox

SKI is queued for evaluation only. It is not installed, connected, authorized, or
permitted to join a meeting.

## Hypothesis

A local voice layer may reduce planning, debugging, and review friction without
exposing code or audio to an external service.

## Acceptance contract

1. Review source, maintainer identity, license, release artifacts, network behavior,
   microphone permissions, update mechanism, and overlap with native Codex/Cursor voice.
2. Install only inside an isolated disposable Windows sandbox after human approval.
3. Complete one ten-minute component-refactor session with no client data.
4. Verify transcript accuracy of at least 90%, correct agent switching, and zero
   unexpected network egress.
5. Use a different reviewer to inspect the session recording, transcript, permissions,
   network log, and resulting code diff.

## Stop conditions

- unsigned or opaque binary
- unclear audio retention
- unexpected egress
- broad filesystem or meeting access
- automatic execution without a confirmation boundary

## Rollback

Uninstall the sandbox copy, remove local configuration, and preserve only the redacted
evaluation record.
