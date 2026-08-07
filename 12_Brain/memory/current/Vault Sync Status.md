---
tags: [memory, current]
updated: 2026-08-07
as_of: 2026-08-07
source: "Operator screenshots + statement in Claude session, 2026-08-07; git ls-remote verification"
---

# Vault Sync Status

**Believed state:** The desktop Obsidian vault (also named `dillon-os`) is
**ahead of this GitHub repo** and has been since roughly mid-April 2026. Git's
default branch is current with itself (remote HEAD matches, verified
2026-08-07), but the desktop vault never pushed its later work. Until they are
reconciled, treat client statuses, due dates, and campaign state in this repo
as **April-era snapshots**, not live truth. For current client truth, prefer
`client-operations-canonical` (rebuilt 2026-08-07 from live email/Slack).

## Known desktop-only content (from operator screenshots, 2026-08-07)

- `05_Book/` and `08_Transcripts/` folders (not in git).
- `02_Campaigns/`: AI Site Builder Outreach Engine, IMMOHRTAL, Facebook Ads
  Budget Shift Log, Facebook Ads Creative Requests, Facebook Ads Hook Library,
  Facebook Ads Optimization Queue, Facebook Ads Testing Queue, Facebook Ads
  Weekly Review, Google Ads Optimization Queue, Landing Page Build Queue,
  Search Terms Review Queue.
- `03_Content/`: Blog Opportunities, Conversion Ad Copy Ideas, Facebook Ads
  Offer Angles, Lead Form Ad Copy Ideas, Retargeting Ad Ideas, SEO Keyword
  Targets.
- `05_Offers/`: **Mohr Media Business Plan** (the brand that succeeded the
  defunct [[01_Clients/Buzz Bull|Buzz Bull]]; see
  [[12_Brain/decisions/2026-08-07 - Buzz Bull Marketing Systems is defunct|decision]]).
- Graph hubs named "05 Knowledge and Memory" and "06 Work Sessions and
  Reviews" that do not match this repo's `10_Sessions`/`12_Brain` scheme.

## mohr-vault checked (2026-08-07)

`mohr-vault` is **not** the current vault. Inspected via read clone: it is the
Facebook-Ads-era vault plus an Orgo MCP server, and its own `GROK-HANDOFF.md`
(2026-08-06) declares it "historical/supporting … not the current canonical
client queue," explicitly outranked by Dillon OS `12_Brain/` and
`client-operations-canonical`. Its `05_Offers/` is empty, it has no IMMOHRTAL,
no 05_Book, no Mohr Media Business Plan, and its client tree still carries a
Buzz Bull folder. It does hold recoverable work in ~10 open draft PRs (Zen Spa
research + Squarespace build, Morning Orchestrator, Orgo MCP connection
doctor, Fresh Blends weekly presentation automation, Momentum 360 video).

## Resolution path

1. **The desktop vault is the only complete copy of current state.** Push it
   to a branch of this repo (not main), then run the public-safety scan and a
   PII sweep (especially transcripts) before merging.
2. Until reconciled, agents should not act on April-era due dates or
   `next_action` fields without operator confirmation.
3. Mine mohr-vault's draft PRs by destination project when relevant; never
   bulk-merge its historical content into canonical systems.
