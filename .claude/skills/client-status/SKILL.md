---
name: client-status
description: Pull a fast per-client status draft from Slack, Gmail, and the canonical work-item queue (last 7 days) into a 12-line brief per client. Use for a status check-in, before a client call, or when asked "where do we stand with <client>" or "give me status on everyone."
---

# Client Status

A cheap, wide status sweep: three read surfaces per client, one fixed-shape
draft. It never sends anything — drafting is the whole job.

## When to use

Client slug, or `all` for every client with an open row in the canonical
queue. Before a call, a Monday check-in, or a status roundup. Not a
replacement for `client-pulse` (vault-only movement sweep) — this is the one
that also reads Slack and Gmail live.

## Inputs

- Client slug, matching its `01_Clients/<Client>/` folder and `clientId` in
  the canonical queue — or the literal string `all`.

## Steps

1. **Preflight.** Per [[12_Brain/protocols/Connector Preflight]]: Slack and
   Gmail are both read surfaces here. Missing either drops that client to
   `degraded` in the draft — say so instead of guessing.
2. **Slack.** Search the client's channel (or the closest `#client`-shaped
   channel/DM) for the last 7 days.
3. **Gmail.** `search_threads` on `from:<client-domain>` and
   `to:<client-domain>` for the last 7 days.
4. **Canonical queue.** Read
   `/home/user/client-operations-canonical/queue/work-items.json`, filter
   `workItems[]` by `clientId`, pull `status`, `nextAction`,
   `priority.level`, and `owner` for its open rows.
5. **Draft.** One 12-line block per client to
   `Daily-Briefs/client-status-<date>.md`: shipped, in progress,
   blocked-on-client, blocked-on-us, next 7 days. A bucket can run empty —
   never pad it with an invented item.
6. **Queue, don't send.** If the draft implies a send (a client email, a Slack
   reply), append that as its own line to `System/approval-queue.md`. Draft
   only — nothing goes out from this skill.

## Cost

Haiku runs steps 2–4 — three mechanical reads, no synthesis. Sonnet writes
step 5 (the 12-line draft needs judgment on blocked-on-us vs
blocked-on-client) and reviews step 6. A subagent for this skill returns a
summary capped at 100 words per client, or 400 words total for `all`.

## Approval gates

- Never sends — not Slack, not Gmail, not anything else. Read and draft only.
- Any send implied by the draft goes to `System/approval-queue.md`, one line
  per action, and stops there.
- The canonical queue is read-only from here; a client-status run never edits
  a work item.

## Output paths

- `Daily-Briefs/client-status-<date>.md` — one file per run, one 12-line block
  per client.

## References

[[12_Brain/protocols/Connector Preflight]] · [[.claude/skills/client-pulse|client-pulse]] · [[.claude/skills/am-report|am-report]] · `System/approval-queue.md`
