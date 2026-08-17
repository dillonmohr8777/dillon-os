---
note_type: sop
status: active
created: 2026-07-30
updated: 2026-08-01
owner: Dillon Mohr
area: knowledge-management
automation_id: daily-communications-brain
verification_status: verified
source_refs:
  - "gmail:account:primary-authorized-mailbox"
  - "slack:workspace:T066HGS7N"
  - "12_Brain/schemas/daily-communication-run.json"
  - "_os/automation/workflows/daily-communications-brain.json"
tags: [brain, sop, gmail, slack, ingestion, knowledge-graph]
---

# Communication Intelligence Ingestion

## Purpose

Turn Gmail and Slack activity into source-linked operational memory without copying noise, credentials, payment data, one-time codes, or mixed-client context into the vault.

## Production contract

The daily job is `daily-communications-brain`. It is a read-only collector and
local compiler. It may read authorized Gmail and Slack sources and write
curated evidence into this vault. It may not send, post, react, label, archive,
publish, spend, change an account, or treat a communication as approval.

The workflow definition is
`_os/automation/workflows/daily-communications-brain.json`. The normalized run
contract is `12_Brain/schemas/daily-communication-run.json`. The deterministic
ingester is:

```powershell
node _os/automation/bin/communication-ingest.js --from <communication-run.json>
```

## Daily flow

1. Read the last successful checkpoints from
   `12_Brain/state/daily-communications-brain.json`.
2. Verify the exact Gmail account and Slack workspace before reading messages.
3. Search from the checkpoint with a 36-hour overlap. Discover metadata and
   snippets first; hydrate only the threads that may contain durable work.
4. Keep decisions, commitments, deliverables, deadlines, blockers, meetings,
   metrics, client changes, follow-ups, and reusable process knowledge.
5. Route each item through
   `C:\Users\dillo\Documents\Codex\projects\client-operations\registry\clients.json`.
   If the route is ambiguous, hold the item in unresolved review and do not
   update client truth.
6. For Slack-derived canonical work, give an authorized Cursor collaborator the
   exact client route, bounded source window, and read-only evidence contract
   when that collaborator is available. Require redacted channel and timestamp
   locators. Cursor may not post, mutate the vault queue, or broaden access.
   The native Slack connector remains the evidence source of record.
7. Write one curated run envelope under
   `_os/automation/incoming/communications/`, then validate and ingest it.
8. The ingester creates an immutable capture, a daily communication review,
   dedupe state, and safe compile queue entries. It rejects raw bodies, unsafe
   paths, apparent secret values, and cross-client write targets.
9. Update existing canonical client, project, decision, research, SOP, or
   approval notes only when the source supports a durable change. Add dated
   `source_refs` and evidence freshness.
10. Refresh maps and coverage, run the full automation and brain test suites,
    refresh health, and verify Obsidian Sync before claiming completion.

## Selection rule

Keep an item only when it changes what Dillon should know, decide, do, verify,
or remember. Routine acknowledgements, social chatter, newsletters, duplicate
watchdog digests, automated alerts without a durable state change, and messages
already reflected in canonical notes are counted as exclusions, not copied.

## Required evidence

1. Source type and exact thread or permalink.
2. Source timestamp and freshness.
3. Verified ask, decision, or blocker.
4. Material uncertainty.
5. Next safe action.
6. One exact client, full-time, venture, operations, or unresolved route.
7. A stable dedupe key based on Gmail message or thread ID, or Slack channel and
   timestamp.
8. Intended canonical write targets.

## Hard exclusions

1. Passwords, API keys, cookies, session tokens, MFA, recovery codes, and payment-card data.
2. Raw newsletter or notification dumps.
3. Unverified claims copied from an automated summary.
4. Cross-client notes or write targets.
5. Raw email or Slack archives.
6. Any external send, post, reaction, label, archive, billing action, publish,
   or account change during ingestion.

## Failure handling

1. If one connector fails, preserve only that connector's checkpoint, compile
   the other source, and mark the run degraded.
2. If both connectors fail, write no source-derived updates and notify Dillon.
3. Never advance a checkpoint after a schema, routing, secret, or health-check
   failure.
4. Retry a transient connector error once. Stop on account mismatch, MFA,
   CAPTCHA, passkey, recovery, consent, or any other human-only gate.
5. A retry must reuse the same evidence window and dedupe state.

## Current connector state

1. Gmail read access was live-verified on 2026-08-01 for
   `dillonmohr8777@gmail.com`.
2. Slack read access was live-verified on 2026-08-01 for Momentum Digital Agency
   workspace `T066HGS7N`.
3. The native Gmail and Slack connectors are the default collection lane.
4. Direct Slack execution through Composio remains blocked by Enhanced
   Controls. Do not disable that security control.
5. Cursor may assist with bounded read-only Slack retrieval only when its exact
   existing authorization is available. It may not post, react, mark, edit,
   delete, invite, or write the canonical queue.

## Maps

1. [[Communication Intelligence Map]]
2. [[2026-07-30 Slack Open Loops]]
3. [[2026-07-30 Live Slack Scan]]
4. [[12_Brain/Bases/Daily Communication Intelligence.base|Daily Communication Intelligence]]
