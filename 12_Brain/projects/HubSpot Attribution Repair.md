---
tags: [project]
status: active
updated: 2026-08-17
due: 2026-08-18
source: "[[12_Brain/raw/2026-08-17 - jason-hubspot-attribution]]"
---

# HubSpot Attribution Repair

**Summary:** Restore Momentum 360 HubSpot channel reporting after the Christian-to-Alexandra ads-manager switch so organic GMB landing-page leads and Google PMax leads stop sharing the same contacts.

## Goal

Finish line a judge can verify from git plus this note:

1. `11_Agents/HubSpot Agent.md` exists and Master Agent routes CRM attribution to it.
2. `/hubspot-ops` exists.
3. Diagnosis names `GMB_LP_Organic` overlapping `Google P-max Suspensions`.
4. Routing map states `#360leads` still fires with a blank Source field, and organic had no segment-based workflow.
5. Draft Slack replies sit in `00_Inbox/slack/2026-08-17-jason-hubspot-attribution.md` and were not posted.
6. `node _os/automation/bin/hubspot-attribution-repair.js --dry-run` runs fail-closed without a token.
7. `12_Brain/INDEX.md` lists every new wiki page.
8. `node --test _os/test/brain-hud.test.js _os/test/public-safety.test.js _os/test/hubspot-agent.test.js` passes.
9. Live `--apply` on portal 50612503: organic 32→7, PMax 32→23, overlap 19→0.

## Live apply (2026-08-17)

Portal verified 50612503. Filters merged onto Christian's existing trees (URL/form kept).

| Segment | List ID | Before | After | Change |
|---|---:|---:|---:|---|
| GMB_LP_Organic | 302 | 32 | 7 | exclude Paid Search / Paid Social |
| Google P-max Suspensions | 298 | 32 | 23 | require Paid Search; ads name CONTAINS PMax / Max_GMB instead of GMB |
| Overlap | — | 19 | 0 | split complete |
| GMBs Phone Calls | 297 | 7 | 7 | untouched |

PMax no longer swallows Call Only campaigns whose names contain `GMB`. Those stay on `GMBs Phone Calls`.

`#360leads` `Source =` is the CallRail property `source` ("where the tracking number was advertised"), not Original Traffic Source. Website form leads will stay blank there until Slack notification mapping uses `hs_analytics_source`. That write is still open.

WordPress CF7 804 still has no hidden UTM/`gclid` fields.

## Diagnosis (2026-08-17)

- Ads manager switch: Christian Tippens to Alexandra Rojas, existing three campaigns.
- Circled pair was the overlap: organic LP vs PMax Suspensions, both size 32, 19 shared contacts.
- `GMB_LP_Organic` Used In 0: organic has no Slack/email/workflow from that segment.
- `Google P-max Suspensions` Used In 2: paid still has two HubSpot consumers.
- Public LP `fixmygooglelisting.com` uses HubSpot tracking portal 50612503 and CF7 form 804 with no hidden UTM/`gclid` fields.

## Next actions

- [x] File Slack intake and source capture
- [x] Stand up HubSpot Agent + `/hubspot-ops`
- [x] Ship fail-closed repair CLI
- [x] Apply segment filters on portal 50612503
- [x] Confirm sizes diverge and overlap is 0
- [ ] Map `#360leads` Source to `hs_analytics_source` in the Slack notification
- [ ] Add UTM/`gclid` hidden fields on CF7 804 (WordPress, separate login)
- [ ] Send drafted Slack replies after Dillon approval

## Links

- Decisions: [[12_Brain/decisions/2026-08-17 - HubSpot Agent owns M360 attribution]]
- Clients: [[01_Clients/Client Index]]
- Concepts: [[12_Brain/concepts/HubSpot Channel Attribution]]
- Agent: [[11_Agents/HubSpot Agent]]
