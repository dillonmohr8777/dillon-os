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

## Resolution path

1. Candidate: the `mohr-vault` GitHub repo (pushed 2026-08-06) may already be
   the current vault; diff it against this repo once attached.
2. Otherwise: push the desktop vault to a branch of this repo and reconcile.
3. Until reconciled, agents should not act on April-era due dates or
   `next_action` fields without operator confirmation.
