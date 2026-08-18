---
name: client-pulse
description: Read one client folder and report status, risk, and next action. One client per run.
---

# Client pulse

A short, sourced read on exactly one client.

## When to use

Dillon names a client and wants to know where it stands.

## Tools

`kb_search` with the client name, then `kb_open` on hits under
`01_Clients/<name>/` only.

## How

1. Confirm the exact client folder name first. If two could match, ask.
2. Read only `01_Clients/<name>/`. Cross-client comparison is a different job.
3. Report: current state, last verified date, open risk, next safe action.
4. Every claim carries `path:line`. No citation means you do not assert it.
5. Prefer the most recent `updated:` note when two disagree, and say they disagree.

## Stop conditions

- One client per run. If asked for several, do them one at a time and say so.
- If the folder does not exist, say so. Do not substitute a similarly named client.
- Numbers older than the note `updated:` date are historical, not current. Label them.

## Approval boundary

Read and report only. No writes into `01_Clients/`. No sends, no platform
changes, no spend, no publishing. Client data never crosses into another
client report.
