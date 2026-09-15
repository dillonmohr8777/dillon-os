---
note_type: decision
status: proposed
owner: Dillon Mohr
created: 2026-09-03
updated: 2026-09-03
decided_at: 2026-09-03
review_on: 2026-09-17
verification_status: verified
source_refs:
  - "[[12_Brain/01_Captures/2026-09-03 - Slack request - channel access to automations for Pritzker channel]]"
  - "https://momentum3d.slack.com/archives/D0AS0CRGW4C/p1788463625991679?thread_ts=1788458230.216309&cid=D0AS0CRGW4C"
  - "[[12_Brain/04_Decisions/2026-08-15 - Use Slack as intake and Codex as execution]]"
  - "[[12_Brain/09_Ops/Dillon OS capability index]]"
  - "01_Clients/Pritzker Law Group/overview.md"
tags:
  - decision
  - slack
  - pritzker
  - access
  - automations
  - approval-boundary
---

# Channel access to Dillon OS automations for the Pritzker channel

**Status: proposed.** Draft-only. Nothing has been posted to Slack, no access
has been granted, and no automation has been changed.

## Request

Verbatim, from Dillon in Slack:

> everyone in the #C0BB04ZFZ26 must have access to all of these automations and what not

`#C0BB04ZFZ26` is the **Pritzker Law Group** client channel in
`momentum3d.slack.com`. "These automations and what not" = the Dillon OS
automations and skills. The ask is to give that channel's members access to the
OS automations/skills.

## Current reality

- **Single operator.** Dillon OS is a single-operator vault. There is **no
  RBAC, no per-user identity layer, and no per-user access control** anywhere in
  the system. "Access" today means whoever can reach the vault/repo can find and
  invoke everything; there is nothing to grant to a subset of people.
- **Slack is read-only intake.** Per
  [[12_Brain/04_Decisions/2026-08-15 - Use Slack as intake and Codex as execution]]
  (still `proposed`), Slack is an authenticated event/evidence source, not a
  runtime that executes work. The slack-intake skill is read-and-draft only and
  never posts.
- **Codex is the sole orchestrator.** The Marketing Chief (Codex) remains
  Dillon's sole user-facing orchestrator and canonical queue writer. External
  sending, publishing, spend, and account changes stay approval-gated.
- **C0BB04ZFZ26 is a client channel, not a served channel.** It is not in the
  slack-intake priority-channel list (`#360marketing`, `#momentumsites`,
  `#web-dev-hosting-dns`, `#content-media`, `#kimberly-james-bridal`). It
  currently appears only as an evidence source link for Pritzker Law Group.
- **The Pritzker-specific skills are not here.** The five `pritzker-*` skills
  live on unmerged **PR #361**; they are not on this branch and are not
  available.

## Why this is not a toggle

Letting channel members "trigger automations" means other people — including a
Momentum 360 client's channel and, per the Pritzker overview, a decision-maker
flagged **very anti-AI** — driving the OS through Slack. That:

- crosses the approval boundary (external/consequential actions must stay
  gated),
- contradicts the sole-orchestrator model (Codex/Dillon is the only user-facing
  runtime), and
- would require an identity/RBAC layer that does not exist.

There is also a client-relationship risk specific to this channel: surfacing an
AI-automations menu into the Pritzker channel is sensitive given the anti-AI
decision-maker. It must remain Dillon's explicit decision and must never be
auto-posted.

## Options

### Option A — Documented capability index + gated distribution (recommended)

Ship the internal capability index
([[12_Brain/09_Ops/Dillon OS capability index]]). Here "access" =
**discoverability**: anyone with vault/repo access can find and invoke every
skill and automation, and there is now one scannable reference for all of them.
If/when Dillon wants team members to see it, distribution is a separate,
approval-gated Tier-2 action; and for the Pritzker channel specifically it stays
Dillon's explicit call given the anti-AI context.

- **Tradeoff:** Lowest risk. Honors the current single-operator architecture and
  the approval boundary. Does not literally give non-Dillon users a run button —
  it makes the capability set legible. This is the correct reading of "everyone
  has access" in a system with no access-control layer.

### Option B — Add C0BB04ZFZ26 to slack-intake served channels

Add the Pritzker channel to the slack-intake priority-channel list so anyone in
the channel can **file** a request that gets triaged into the vault inbox.
Execution still runs through Dillon/Codex and stays gated.

- **Tradeoff:** Medium. Requires editing the served-channel list in
  `.claude/skills/slack-intake/SKILL.md`. It means ingesting a client channel's
  traffic into the vault inbox, which is a real intake/privacy expansion and, for
  an anti-AI client, needs deliberate handling. Gives "access" only in the sense
  of "can submit a request," not "can run automations."

### Option C — True multi-user self-serve automation access

Build an identity/RBAC layer and make Slack a runtime for non-Dillon users so
channel members can actually invoke automations themselves.

- **Tradeoff:** Large. Directly contradicts
  [[12_Brain/04_Decisions/2026-08-15 - Use Slack as intake and Codex as execution]]
  and the approval boundary. Must not proceed until that decision is resolved.
  Not recommended now.

## Recommendation

Adopt **Option A now** (optionally **A + B** if Dillon wants the Pritzker channel
to be able to file requests into intake). **Option C is blocked** pending
resolution of the 2026-08-15 decision.

## What's blocked / needs Dillon

- Pick an option (A, A+B, or defer). No option runs on its own.
- Option B requires editing the slack-intake served-channel list — a deliberate
  intake expansion, not done here.
- If any Slack post to the Pritzker channel is wanted (e.g. sharing the menu),
  that is a separate **Tier-2 approval** and must weigh the anti-AI
  decision-maker sensitivity. Nothing is posted by this note.
