---
note_type: decision
status: active
created: 2026-08-19
updated: 2026-08-19
owner: Dillon Mohr
decision_date: 2026-08-19
review_on: 2026-09-19
verification_status: verified
source_refs:
  - "[[12_Brain/01_Captures/2026-08-19 - Operator asked to decide lineage PRs and boards]]"
  - "[[GROK-HANDOFF-DILLON-OS]]"
tags:
  - brain
  - decision
  - github
  - pr-backlog
---

# Open PR close policy

**Decision:** 124 open PRs. Most drafts die. Ten ready PRs are not a merge
queue. Command Center on `main` already superseded the daily umbrella family.

Counted 2026-08-19 via `gh pr list`: 124 open, 114 draft, 10 ready.
Closed the 24 competitive-task drafts plus `#279` and `#280` in this session.

## Die (superseded / contradicts current operating decisions)

Close these. Do not merge.

- **All competitive-task / Command Center umbrella drafts** (24): `#183`
  `#187` `#201` `#211` `#215` `#220` `#223` `#230` `#244` `#253` `#254` `#255`
  `#259` `#260` `#263` `#267` `#269` `#271` `#275` `#276` `#285` `#291` `#305`
  `#310`. Newest is still a duplicate of work already on `main`.
- `#280` 15-agent fleet — contradicts the seven `.claude/agents/` roster and
  the four-agent CMO lane.
- `#279` phl-w33 Netlify deploy of 25 sites — deploy is approval-gated and
  this would overlay a hub without a pinned non-client site.

## Keep (do not merge until a named review)

- `#324` this CMO-lane goal branch.
- `#323` `_cmo/` runtime (okara teardown). Merge blocked until
  `CMO_ROUTING_PROFILE` defaults to `balanced` and the roster is four earning
  agents. See [[12_Brain/04_Decisions/2026-08-19 - Default CMO profile is balanced]].
- `#322` web escalation ladder (already related to `main` work; rebase don't
  duplicate).
- `#319` radar already-built inventory (landed in spirit on `main` as
  `37d3ca09`; confirm then close if duplicate).
- `#205` Vercel AI gateway — security/billing review still required.
- `#208` Marketing Chief dashboard access — permission review still required.
- `#273` `#274` brain/intelligence-plane — rebase against numbered `12_Brain`
  taxonomy before any merge.
- Current-week craft: `#320` BOK packet, `#321` IMMOHRTAL CLAW, `#318`
  Variant harvest (research only), `#315` radar slot images, `#311` HubSpot
  attribution, `#308` GBP API-only.

## Die later (draft evidence, close after the keep-list is stable)

Align video/PDF/customer-agent stacks, older site-health watchdogs, PAPERBOUND,
Hope Wellness film, duplicate homepage packs (`#242` `#278` `#281` `#283`
`#284` `#287` `#293` `#300`), MCP catalog piles (`#303`–`#307` `#304` `#314`
`#316`), and pre-August Command Center leftovers. Newest artifact in each
family wins; the rest close. Do not merge them one by one.

**Why:** The open-PR queue is operating debt. Duplicate umbrella runs do not
accumulate value. Merging homepage packs would create a third factory.

**Implications:** No new daily umbrella PR. New work branches from `main`.
Closing a draft is not losing the git branch.
