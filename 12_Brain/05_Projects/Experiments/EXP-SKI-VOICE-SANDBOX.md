---
note_type: experiment
status: proposed
created: 2026-07-30
updated: 2026-08-15
owner: Dillon Mohr
experiment_id: EXP-SKI-VOICE-SANDBOX
decision: sandbox-test
verification_status: partial
human_gate: required
risk: low-medium
source_refs:
  - "https://heyski.io/"
  - "https://www.producthunt.com/products/ski"
  - "[[12_Brain/01_Captures/2026-08-15 - Chase AI Obsidian command center]]"
tags:
  - brain
  - experiment
  - voice
  - coding-agent
---

# Codex local voice command layer sandbox

The voice layer is queued for evaluation only. SKI remains one possible
reference, not the architecture owner. Nothing is installed, connected,
authorized, or permitted to join a meeting.

## Hypothesis

A Codex-owned local voice layer may reduce planning, retrieval, and review
friction without exposing code, client context, or audio to an external service.

## Proposed routing model

1. **Transcribe locally:** evaluate Faster Whisper or an equivalently auditable
   local speech-to-text route.
2. **Route through Codex policy:** classify the request into a verified local
   skill, a precomputed-vault answer, or a bounded Codex task. No Claude process,
   configuration, prompt file, or provider-specific command belongs in this
   path.
3. **Speak locally:** evaluate Kokoro or an equivalently auditable local
   text-to-speech route after the response passes the same evidence and approval
   rules as typed output.

Voice changes the input and output modality. It does not change routing,
permissions, approval tiers, or completion evidence.

## Acceptance contract

1. Review source, maintainer identity, license, release artifacts, network
   behavior, microphone permissions, global hotkey scope, update mechanism, and
   overlap with native Codex voice.
2. Review Faster Whisper, Kokoro, and any router dependency independently. No
   video recommendation is treated as a security review.
3. Install only inside an isolated disposable Windows sandbox after human
   approval.
4. Complete one ten-minute, non-client session covering all three routes: local
   skill, precomputed answer, and bounded Codex work.
5. Verify transcript accuracy of at least 90%, correct route selection, no
   unauthorized side effect, and zero unexpected network egress.
6. Use a different reviewer to inspect the session recording, transcript,
   permissions, network log, route evidence, and resulting artifact.

## Stop conditions

- unsigned or opaque binary
- unclear audio retention
- unexpected egress
- broad filesystem or meeting access
- automatic execution without a confirmation boundary
- any route that bypasses Codex or creates a parallel command center

## Rollback

Uninstall the sandbox copy, remove local configuration, and preserve only the redacted
evaluation record.
