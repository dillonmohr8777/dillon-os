---
note_type: decision
status: proposed
date: 2026-09-15
updated: 2026-09-15
tags:
  - decision
  - agents
  - slack
  - workmate
source_refs:
  - Slack #ai-tech-news 2026-09-15 09:44 EDT, Mac Frederick, cc Melissa Silber
  - client-operations/clients/momentum-360/deliverables/2026-09-12-dedicated-agents/Start-WorkmateOperator.ps1
  - .../org-modes/operator_bridge.py prompt_for(), read 2026-09-15
  - repos/momentum-slack-agent/RETIRED.md
  - Get-ScheduledTask Momentum360-WorkmateOperator, read 2026-09-15T14:5xZ
---

# Mac's FAQ bot is a second surface, not an opened Workmate

Mac asked in `#ai-tech-news` on 2026-09-15 for "some sort of internal FAQ Slack
channel that integrated with our info, processes, etc, so team members and new
hires can ask questions and find resources." Melissa seconded it and noted the
masterhub already lives in the AM channel.

## The relevant fact: we already have a Slack bot, and it is not this

Workmate (Slack app `A0C2K8ZU6AU`) is live. Verified 2026-09-15: the scheduled
task `Momentum360-WorkmateOperator` is in state `Running`, started 09:54:05 —
the same second `explorer.exe` started. It rides the Codex Pro plan at zero
paid API cost per message, which is exactly why `momentum-slack-agent` was
retired on 2026-09-14 in its favour.

**It cannot be opened to the team, and the reason is not effort.** Read
`operator_bridge.py::prompt_for()`: the system prompt opens "You are Dillon's
Marketing Chief operator, accessed through his verified private Workmate DM"
and closes "the bridge returns your final answer only to this exact owner DM."
It carries Dillon-level authority — it reads canonical client state, uses
installed skills and MCP tools, and is the only mode permitted to reconcile
canonical state. Pointing that at a public channel would hand every team member
and new hire an operator with Dillon's tool access and Dillon's client routing.

So the answer to Mac is not "flip Workmate to a channel." It is a **second,
deliberately weaker surface**.

## What the FAQ surface should be

- **Read-only.** No tool authority, no MCP, no canonical writes, no client
  account access. It answers from a curated corpus and nothing else.
- **Scoped corpus, not the vault.** Pointing it at `dillon-os` would leak client
  intelligence, revenue, and the job-search lane into a team channel. It needs
  its own reviewed folder of process docs, onboarding and the AM masterhub
  Melissa named.
- **Cites its source or says it does not know.** A confidently wrong answer to a
  new hire about a client process is worse than no bot.

## The blocker that applies to both

`Momentum360-WorkmateOperator` is registered `LogonType Interactive` — the same
defect as the cadence and job tasks
([[12_Brain/07_Reviews/2026-09-15 - Cadence tasks cannot run unattended]]). It
starts at Dillon's logon and dies with it. A team-facing FAQ bot that only
answers while one person is signed in to his desktop is not a team-facing FAQ
bot. `System/scripts/Repair-ScheduledTasks.ps1` should take this task too.

## Recommendation

Yes to the idea, no to the shortcut. Smallest honest first step: name the
corpus. Melissa's AM masterhub plus onboarding is a real starting set, and
"which folder is canonical" is a question a human has to answer before any of
this is worth building.

**Open question for Dillon and Mac:** which folder is the source of truth for
team process docs, and who owns keeping it current?
