---
note_type: sop
status: active
created: 2026-07-30
updated: 2026-07-30
owner: Dillon Mohr
area: knowledge-management
source_refs:
  - "gmail:account:primary-authorized-mailbox"
  - "slack:workspace:T066HGS7N"
tags: [brain, sop, gmail, slack, ingestion, knowledge-graph]
---

# Communication Intelligence Ingestion

## Purpose

Turn Gmail and Slack activity into source-linked operational memory without copying noise, credentials, payment data, one-time codes, or mixed-client context into the vault.

## Daily flow

1. Discover recent Gmail metadata and Slack messages read-only.
2. Rank for decisions, deliverables, deadlines, client changes, blockers, meetings, and reusable process knowledge.
3. Hydrate only the selected source thread.
4. Route by exact client through the canonical client registry.
5. Create or update one canonical note per permalink or Gmail thread ID.
6. Link the note to a client, project, decision, meeting, SOP, or ops record.
7. Deduplicate repeated alerts and watchdog digests.
8. Run graph health and source-link checks.
9. Keep all sends, posts, billing actions, and account changes behind their normal gates.

## Required evidence

1. Source type and exact thread or permalink.
2. Source timestamp and freshness.
3. Verified ask, decision, or blocker.
4. Material uncertainty.
5. Next safe action.
6. Client or full-time route.

## Hard exclusions

1. Passwords, API keys, cookies, session tokens, MFA, recovery codes, and payment-card data.
2. Raw newsletter or notification dumps.
3. Unverified claims copied from an automated summary.
4. Cross-client notes.
5. Any external send or post during ingestion.

## Current connector state

1. Gmail read access is active for the primary authorized mailbox.
2. Slack is connected to Momentum Digital Agency.
3. Direct Slack execution through Composio is blocked by Enhanced Controls in this client. Do not disable the security control.
4. The approved background browser lane is verified for read-only Slack search. It must not post, react, mark, edit, or delete during ingestion.

## Maps

1. [[Communication Intelligence Map]]
2. [[2026-07-30 Slack Open Loops]]
3. [[2026-07-30 Live Slack Scan]]
