# Marketing Chief intake handoff

Updated: 2026-08-01
Authority: route into the canonical Marketing Chief queue on the sole-writer host. This file is a handoff, not canonical queue state.

Compiled week board (cloud evidence only): `12_Brain/projects/2026-08-01 - Marketing Chief Week Ops.md` · operator entity: `12_Brain/entities/Marketing Chief Operator.md`.

## Intake 1: Slack AI reintegration

Source: Mac in #ai-tech-news, 2026-07-22 at 10:25 AM.

Outcome: restore a safe Slack-to-AI command path for shared team channels and direct messages.

Required:
- Reuse exact client routing, deduplication, redacted intake, and approval gates.
- Allow only approved users and channels.
- Treat Slack content as untrusted input.
- Keep external sends, publishing, spend, credentials, account changes, and destructive actions approval-gated.
- Prove one allowed command creates one canonical work item and replays do not duplicate it.
- Produce an operator guide and an unsent reply to Mac.

Current blocker: the Codex Slack connector on the current desktop returns oauth_refresh_token_rejected and requires interactive reconnection.

## Intake 2: Jason and Sean EOM agenda

Source: Jason Fallon DM, 2026-07-22 at 12:56 PM.

Order:
1. Chatbot.
2. CallRail after-hours and SMS setup.
3. Internal Agent workflows and setups.

Outcome: classify each as built, tested, blocked, or approval-required with current evidence by EOM.

Boundaries:
- Do not alter automated emails without explicit approval.
- Do not activate SMS, change phone routing, incur spend, or send messages without explicit approval.
- Preserve exact account ownership, opt-out behavior, rollback, and test evidence.

## Existing VA Claims priority

Keep `wi-20260717-0011` as the highest-priority unblock until authorized access to `vaclaims-dev/vace-platform` exists. The local Phase 2 UI package passes 45 assertions and is ready to apply on a review branch. The current Vercel connector lists no teams, so deployment cannot be claimed or performed from this desktop yet.
