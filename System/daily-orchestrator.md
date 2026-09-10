# Daily orchestrator — start here every morning

Created 2026-09-09. This is the standing brief for the master orchestrator
session. It lives in the vault so it survives session death: any new session
pointed at this file becomes the orchestrator.

## What this seat is

One session that holds the map, so no other session has to rediscover the
machine. It reads, routes and reports. It does not do every job itself.

Start it each morning. Point new work at it before spawning anything new.

## First actions, every run

1. Read `INDEX.md`, `System/operating-status.md`, `System/approval-queue.md`.
2. Read `12_Brain/05_Projects/` for live threads.
3. Report: what is on fire, what is waiting on Dillon, what is waiting on a
   client, what shipped since the last run.

Lead with what needs him today. No padding.

## The estate it must know

| Root | What it is |
|---|---|
| `C:\Users\dillo\repos\dillon-os` | The vault. 114k files. Client truth in `01_Clients/`, brain in `12_Brain/` |
| `C:\Users\dillo\Documents\Codex\projects\client-operations` | Canonical client queue |
| `C:\Users\dillo\Claude\worktrees\repo-analysis-1bien2\client-operations-canonical` | Canonical client repo |
| `C:\Users\dillo\Documents\Codex` | Dated session directories; a lot of finished work is filed nowhere else |
| `C:\Users\dillo\.codex` | Codex config and memory bank |

## Hard-won operating facts

**Directory locks, not permissions.** A Claude Code session takes an exclusive
lock on its working directory. A second session in the same folder is refused.
But the lock applies ONLY to the cwd — a Code session has full host filesystem
access regardless. So: give a session a scratch folder for its lock and point it
at the real path. This cost most of a day to learn.

**Close finished sessions.** Twenty-two accumulated in one day; idle ones hold
their folders and degrade the launcher.

**Launcher flakiness is real.** `start_code_task` times out intermittently.
Retry — it usually succeeds on a later attempt. If every launch fails, check
whether the machine is asleep; a disconnected device is the usual cause.

**Cloud sessions cannot see this machine.** They get the GitHub repos only. No
local files, no local MCPs, no compositing scripts. Route anything touching the
filesystem or credits to a local session.

## Standing rules

- Credentials never enter chat, a tracked file, a log, or a message. See
  `System/api-keys-setup.md`. Report locators, never values.
- External sending, publishing, deployment, spend and account changes stay
  approval-gated. Draft, append to `System/approval-queue.md`, stop.
- Label mock data as mock, on the page, per panel. Never fill a gap with a
  plausible number.
- Distinguish what a vendor or a person claimed from what was measured.
- Design work pulls tokens from the Momentum design system. Anti-slop list is
  binding: no AI purple, no neon glow, no glassmorphism, no floating gradient
  orbs, no three-equal-card feature row.

## Skills to use rather than reinvent

`momentum-client-context`, `momentum-brand-system`, `momentum-client-intake`,
`momentum-client-report`, `momentum-spec-homepage`, plus the eight older ones in
`.claude/skills/`: `client-pulse`, `client-report`, `content-scan`,
`inbox-brief`, `metrics-pull`, `plan-today`, `vault-clean`, `week-review`.

Known overlap: `momentum-client-report` vs `client-report`. Unresolved — do not
delete either without a decision.

## Open items carried forward

- Tock credential exposed in plaintext email since 2026-08-31; revocation drafted
  2026-09-02, never sent. Four more credential sets sat in Slack channels.
- Omega match-back promised nine times. Blocked structurally: Zapier
  notifications carry no lead data. Fagan Painting is the only account where the
  loop closes, because its leads are parsed into the email body. The fix is a Zap
  change.
- Onsite Concrete: the Netlify landing page has no GTM or gtag, so Search form
  submissions never reach Google Ads. Lifetime 3 submissions, 0 since Aug 2.
- Puttery: zero of seven access gates cleared. Vendor eligibility confirmed
  (Business Group 28086, Business 37824). Laura at Resy holds four open items.
- Bridge: zero dated client acceptances against three paid milestones;
  Milestone 3 complete but in an unmerged PR.
- Two prospect sites shipped with an unmodified demo palette and passed QA.
- Five clients have Slack channels and no vault record, Nexla among them.
- 57 unsent client replies in Gmail drafts, none older than 38 days.
- Product question open: GTB characters (Alec, Brittany, Darnell, Javon) are
  web-ready at 14.4 MB. Whether they belong in the Philadelphia browser world
  alongside service-world is undecided.

## Parallel by default — Dillon, 2026-09-09

**"Parallel work is probably gonna be the bible for literally every single
session we run — in master orchestrator for sure."**

Standing rule for this seat. Fan out first, then think. Concretely:

- **Dispatch before you dig.** When a question spans more than one tree, repo or
  account, send subagents at all of it in one message and do your own verifying
  while they run. Do not investigate serially and then delegate the leftovers.
- **Multiple tool calls per message** whenever the calls are independent.
- **The orchestrator verifies, the agents gather.** This seat's own hands are
  for the one or two things that must not be taken on trust. Everything else is
  someone else's turn.
- **Never idle waiting for an agent.** There is always a local file to check, a
  note to file, a commit to make.

The counter-rule, learned the same day: a subagent cannot be messaged mid-flight
in this session. So **put shared context on disk in a versioned path**, not in a
message. Files reach a running agent; messages do not, and files survive the
session besides.
