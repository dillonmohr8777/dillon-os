---
note_type: decision
status: accepted
owner: Dillon Mohr
created: 2026-08-26
updated: 2026-08-26
decided_at: 2026-08-26
review_on: 2026-09-09
source_refs:
  - 00_Inbox/Agent-Proposals/Grok/2026-08-26-developer-cursor-access-canary.md
  - Daily-Briefs/plan-2026-08-26.md
  - System/operating-status.md
  - System/approval-queue.md
  - C:/Users/dillo/.grok/agents/developer.md
tags:
  - decision
  - cursor
  - grok-bot
  - marketing-chief
  - immohrtal
---

# Cursor private worker is the Immohrtal execution plane

## Decision

The live Cursor agent on `DESKTOP-4AHKEC4` is the execution plane for the Immohrtal seven-agent stack. The Grok Bot Developer bot connects to that agent. It does not spawn a second coding VM.

Standing auto-run covers clone, fetch, pull, local edits, tests, feature-branch commits, draft PRs, ordinary Gmail, ordinary Google Ads pause/enable/budget, Slack/Drive/Calendar reads, and local agent work.

Still gated: MFA, CAPTCHA, passkeys, payments, account deletes, production deploys, force-push, merge to main, exposing local ports, pasting secrets, and writing `client-operations/queue/work-items.json`.

## Agent homes

All seven names exist in Claude and Grok copies. Codex has the six original tomls plus `reliability-scout.toml`. Canonical vault: `C:\Users\dillo\repos\dillon-os`. Clones: `C:\Users\dillo\repos`.

## Rationale

Grok Bot cloud VMs cannot see loopback MCP. Local Cursor already has GitHub `dillonmohr8777` with `repo` scope, the Codex projects, and the connectors. One execution plane avoids a second queue.
