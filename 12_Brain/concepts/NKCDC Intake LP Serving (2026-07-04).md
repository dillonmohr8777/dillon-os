---
tags: [concept, ads-research]
source: "[[Daily-Briefs/ads-ops/action-packet-2026-07-04]]"
url: https://businesstaxprep.fshtechnologies.org/intake/free-tax-prep
date: 2026-07-04
expires: 2026-08-03
---

# NKCDC Intake LP Serving (2026-07-04)

**Summary:** the FSH Technologies intake page that has blocked NKCDC's ad
launch since ~2026-04-15 is now serving — the April block may have lifted;
verify the exact `ref=` URL live, then run the spec's pre-launch checklist.

## The finding

Verified 2026-07-04 during the Ads Ops verify pass: a fetch of the intake LP
(snapshot `nkcdc-lp.html`, fetched 2026-07-04 23:30, session scratchpad)
returned a rendering page. Snapshot details, preserved here because the
scratchpad is ephemeral:

- Next.js app serving the `/intake/[programSlug]` route
- `<title>Philadelphia Business Services</title>`
- Copy mentions free tax preparation matching — consistent with the spec's
  single offer (Free Business Tax Prep)

## What it changes

[[02_Campaigns/Ads Ops/NKCDC Ads Spec|NKCDC Ads Spec]] says launch has been
blocked on this LP since ~2026-04-15, and cycle action #1 is "check LP status
each cycle — the moment it's live → launch checklist." This finding moves
NKCDC from *chase-the-client* to *verify-and-launch*.

## Caveats (why this isn't launch authorization yet)

- The snapshot hit the base intake URL; the spec requires the exact URL
  **with the `ref=` param preserved verbatim** (it's NKCDC's attribution).
  Live-verify that exact URL in the Chrome session first.
- Enabling the paused campaigns on 100-209-6937 still waits on the
  re-run audit→verify chain (this cycle's verification never ran — see the
  action packet) and on binding + verifying the conversion action (intake
  submit, or `ref=` arrival if the form is off-domain).

## Links

- [[02_Campaigns/Ads Ops/NKCDC Ads Spec]] · [[01_Clients/NKCDC]] ·
  [[02_Campaigns/Ads Ops/Ads Ops Hub]]
