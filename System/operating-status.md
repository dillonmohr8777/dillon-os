---
tags: [system, operating-status]
last_updated: 2026-09-14
callsign: D.I.L.L.O.N.
operator: Dillon Mohr
goal_label: ACTIVE CLIENTS
goal_current: 14
goal_target: 100
source_of_truth: C:\Users\dillo\repos\dillon-os
---

# Operating Status

## Verified 2026-09-14 — refreshed by the approval-queue closing pass

Everything in this block was measured on disk or in Task Scheduler on
2026-09-14. Nothing here is recalled.

- **Client registry:** the canonical registry at
  `client-operations/registry/clients.json` holds **24** records, 22 `active`
  and 2 `inactive` (zen-spa-tropicana, ami-cleaning). Two records are known
  stale and cannot be fixed here -- the registry is single-writer and
  Marketing Chief owns it: `align-hcm` still reads `active` though the
  engagement ended 2026-09-02, and `nkcdc` still reads `active` though Dillon
  stated directly on 2026-09-14 that it is not a current client.
- **Registries still disagree.** 24 canonical, 7 in
  `_os/reporting/client-registry.json`, 27 on branch
  `registry/add-nexla-puttery-mara-20260909`. Until that reconciles, the
  canonical 24 win. `gt-clinic`, `nexla`, `deborah-mara` and
  `immohrtal-marketing` have deliverable folders but do NOT resolve against
  the canonical 24.
- **Cadence layer IS scheduled.** Four Task Scheduler entries exist:
  `Cadence-daily`, `Cadence-weekly`, `Cadence-monthly`, `Cadence-sweep-heartbeat`,
  all `Ready`. **But only the heartbeat has ever fired.** The other three report
  `LastRunTime 11/30/1999`, the Windows never-run sentinel, with next runs
  2026-09-15 09:05, 2026-09-21 09:20 and 2026-10-01 09:35. Registered is not
  the same as running; treat the first real daily fire as unproven until
  2026-09-15 09:05 passes and the ledger shows it.
- **Run ledger is live:** `_os/automation/cadence/run-ledger.jsonl` last wrote
  2026-09-14T19:01:38Z, daily-sweep ok, `cadence-absent=0`.
- **AI division:** all 20 decisions D01-D20 in
  `client-operations/clients/momentum-360/deliverables/2026-09-05-ai-division-launch-kit/pending-decisions.json`
  still read `state: open`. The gate meeting did not happen -- Dillon confirmed
  2026-09-14 it was his birthday. D01 and D10 block all outbound; D18 blocks
  client-facing paid generation.
- **Open PR:** dillon-os #339 on `cursor/immohrtal-standing-canary-3c2e`, state
  OPEN. The cadence layer and daily-sweep commits are already on origin.


The vault was reconciled on 2026-07-12 against current work from the rolling three-week window. The April-era client roster is superseded.

## Active roster

- Paid media and growth: Kimberly James Bridal, Omega Landscaping & Concrete, On-Site Concrete & Landscape, Shadow Heating & Cooling, Replenish, Capsule & Tonic.
- Fagan Painting: **not active.** Dillon, 2026-09-09: "fagan im not rly doing anymore but u can always use him as reference". Retained as the reference implementation for conversion match-back, not as a client. Do not report on it, scale it, or send it a proposal.
- Web, SEO, product, and delivery: Bar Crawl USA, Revive Systems, Hope Wellness Center, Pro Fence & Deck, Everyday Life Insurance, VA Claims, Bridge Software Development.
- Align HCM: **ended.** No longer Dillon's employer. Excluded from the roster and from income assumptions.

## Current reporting truth

- Confirmed blue-dashboard accounts: Kimberly James Bridal, Omega, Onsite, and Shadow.
- Replenish is the leading fifth account and must remain separate from Fresh Blends.
- NKCDC is paused pending a new contract and excluded from the active roster.
- Fresh Blends is paused and excluded from the active-ad cycle.

## Verified separation risks — 2026-07-19

- Fresh Blends has meetings on the 2026-07-20 calendar, but no current contract evidence was found. Calendar presence alone does not reactivate it or merge it with Replenish.
- Replenish has current live evidence (getreplenish.com GA4 traffic and a store-specific Miami 56 direction-action email) and remains the active 7-Eleven reporting lane.
- Align HCM GitHub repository `align-hcm-august-2026-content` contains an unrelated open draft Coinbase paper-trading PR #8. Do not merge it; migration to a dedicated repository and closure are approval-gated.

## Employment status — 2026-09-02

**Dillon no longer works at Align HCM.** Confirmed by Dillon directly on 2026-09-02.

Supporting evidence: on 2026-08-28 he stated in Slack that a full-time role ended the prior week
"bc of the market / labor conditions in Canada," that they "wanted to bring me back but idk if they
will," and that Momentum plus freelance work is the current income base. That message does not name
the employer, so the exact end date and whether a return is still open are not established. The
termination itself is confirmed; the details are not.

He also reported an interview that week for a fully remote marketing-operations role, referred by a
former colleague.

Consequences now in force:

- Align HCM is not a current employer, not a client, and not an income source. Any note or routine
  treating it as active is stale.
- `02_FullTimeJob/AlignHCM/overview.md` is retained as historical record only.
- Momentum 360 plus direct and 1099 clients are the income base.
- The remote full-time job search is a live priority, not a background want.

Source: Dillon, 2026-09-02. Slack DM 2026-08-28,
[permalink](https://momentum3d.slack.com/archives/D0B6F3J423F/p1787931980299889).

## Operating rules

- Keep one canonical client record per active name.
- Refresh the roster weekly using current Slack, Gmail, Ads, project, and delivery evidence.
- Do not revive a removed name from historical notes without current evidence.
- No send, publish, deploy, campaign mutation, spend change, or client-account change without explicit approval.
