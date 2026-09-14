---
tags: [research, agents, anthropic, billing]
created: 2026-09-14
status: measured
spend: 11 cents of a 429 cent balance
---

# Managed Agents, measured

Four sessions run against Dillon's own API credits on 2026-09-14. **Total spend:
11 cents.** Every figure below is measured, not quoted from documentation.

## The headline

**The budget cap does not bound total spend. It bounds new work.**

Phase 2b set `max_list_cost` to **1 cent** and gave the session a single
essay-writing task. It spent **5 cents**: five times the cap, with
`stop_reason: null` and **no `budget_reached` event anywhere in the event
stream**. The overrun was silent.

What the cap *did* do is refuse the next turn. A second user message was accepted
into the session and never processed: the event log shows `user.message: 2`
against `span.model_request_start: 1`. The session went idle and stayed there.

So the accurate description is a **pre-request gate**, exactly as the
documentation says, but the practical consequence is the part that matters and is
easy to miss: **the enforcement granularity is one turn, and one turn can cost
arbitrarily more than the cap.** The cap cannot be used to promise a hard ceiling.

### What that means for the business

The reason to consider Managed Agents at all was a **client-billable agent with a
guaranteed dollar ceiling**. On this evidence that promise cannot be made. What
can be promised is "it stops accepting new work past X, and may overrun by up to
one turn." For a long Opus turn, one turn is not a rounding error.

This does not disqualify the platform. It disqualifies the **pricing story** that
was the reason to reach for it, and that was worth 11 cents to find out before a
client did.

## Phase 1 - the pipe works, and a real trap

| | Result |
|---|---|
| Agent create, session create, sandbox exec, real tool calls | **pass** |
| Cost | **3 cents**, 8.4 seconds active |
| Sandbox | `Linux vm 6.18.44-fc-v24` - a Firecracker microVM |
| File written | `/mnt/session/outputs/smoke.txt`, 119 bytes, verified by a real `wc -c` |

**The trap, and it cost a cent to learn.** The first attempt created the agent
with no tools (version 1), added the toolset afterwards (making version 2), then
opened the session pinned to `version: 1`. The session therefore had **no tools**
and the model **invented plausible tool output rather than saying it could not
run anything**: a fabricated timestamp of `2025-05-22T18:47:03Z` and a fabricated
kernel string `sandbox-host 5.15.0-generic`. Zero `agent.tool_use` events.

Adding tools to an agent bumps its version. **A session pinned to an older
version silently loses them.** The failure mode is not an error; it is confident
fiction. Always check the event stream for `agent.tool_use` before believing any
result that claims to have run something.

## Outputs do not come back on their own

Writing to `/mnt/session/outputs/` does **not** surface a file through the API.
Verified after a successful write: `/v1/sessions/{id}/artifacts` returns 404,
`/v1/sessions/{id}/resources` returns empty, and `/v1/files` returns empty.

Retrieval must be explicit - have the agent return contents in its message, or
push to the Files API. Any design that assumes "write to outputs and collect it
later" will collect nothing.

## Shapes that differ from the obvious guess

- Agent create rejects `max_tokens` outright: `unknown field "max_tokens"`.
- The hosted sandbox toolset is `{"type": "agent_toolset_20260401"}`. `"bash"` is
  not a valid tool type.
- Sessions are `POST /v1/sessions`, not `/v1/agents/sessions`.
- `environment_id` is **required**. An environment must be created first via
  `POST /v1/environments`.
- Budget amounts are **minor units as a string**: `{"amount":"50","currency":"USD"}`
  is fifty cents.
- Messages go to `POST /v1/sessions/{id}/events` as a `user.message` event.

## Session ledger

| Session | Cap | Spent | Outcome |
|---|---|---|---|
| `sesn_01P8wvKyKtEVwXG1UN78qWKX` | 50c | **1c** | no tools, fabricated output |
| `sesn_01Jr28u9G83jmHVwzRpLTdX2` | 50c | **3c** | real execution, real file |
| `sesn_01S8qMU6W3eJ83mouCvrGUjV` | 15c | **2c** | agent quit early, cap untested |
| `sesn_017JDmG4JFapLbYXnzT7ub4z` | **1c** | **5c** | **overran 5x, next turn refused** |

Agent `agent_01SKQzvHy9vws7ofEzHB87ee`, environment
`env_01VKzXQqDVsfohc5JTGzuCa7` (cloud, networking `limited`, no allowed hosts, no
package managers, no MCP).

## Verdict

**Internal work stays on the Max subscription.** Nothing measured here beats a
scheduled Claude Code session for work that runs on a machine Dillon owns, and
the subscription costs nothing at the margin.

**The one thing it genuinely offers** is running when no machine of Dillon's is
awake. That still stands and still matters, given 14 unclean power-offs in 30
days on this desktop.

**The client-billable hard-cap story does not stand**, and that was the reason to
pay for it. Revisit if Anthropic tightens enforcement to bound total spend rather
than only the next request.

The remaining balance is roughly 418 cents. The API key used was pasted into a
chat transcript and **must be rotated**.
