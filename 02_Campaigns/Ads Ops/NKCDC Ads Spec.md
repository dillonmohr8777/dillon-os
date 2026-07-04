---
tags: [ads-ops, client-spec]
source: "[[01_Clients/NKCDC]]"
updated: 2026-07-04
---

# NKCDC — Ads Spec

Philadelphia nonprofit. Google Ads **100-209-6937** + Meta in scope. Single
offer: **Free Business Tax Prep**. Contact: Anthony Miller (amiller@nkcdc.org).

## Reality: this is an unblock lane, not an optimization lane
Campaigns are **built and approved** on the M360 side but launch has been
blocked since ~2026-04-15 on NKCDC shipping their landing page
(`businesstaxprep.fshtechnologies.org/intake/free-tax-prep?ref=…`).
**Preserve the `ref=` param verbatim** — it's their attribution.

## Cycle actions
1. Check LP status each cycle (page-side check works from remote: is the
   intake URL live yet?). The moment it's live → launch checklist.
2. Chase: Mac runs point on NKCDC follow-up — nudge through him if stale
   another cycle.
3. Pre-launch: bind conversion action to intake submit (or `ref=` arrival if
   form is off-domain), verify tag, then enable paused campaigns.

## Voice rules
"Free / no catch / community trust" framing. Never salesy. Audience: small
business owners in NKCDC's service area who qualify.

## Preflight 2026-07-04
PMax paused; Search learning at $15/day. July 1 keyword cleanup + BIRT/NPT
expansion awaits Dillon's approval. Source:
[[raw/2026-07-04 - preflight-readback]].
