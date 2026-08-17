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
4. Routing map states `#360leads` still fires from Zapier, and organic now has a HubSpot email/in-app workflow.
5. Slack replies sit in `00_Inbox/slack/2026-08-17-jason-hubspot-attribution.md`.
6. `node _os/automation/bin/hubspot-attribution-repair.js --dry-run` runs fail-closed without a token.
7. `12_Brain/INDEX.md` lists every new wiki page.
8. `node --test _os/test/brain-hud.test.js _os/test/public-safety.test.js _os/test/hubspot-agent.test.js` passes.
9. Live `--apply` on portal 50612503: organic 32→7, PMax 32→23, overlap 19→0.
10. Live `--workflows --apply`: Source-copy flow `1868243574` and organic-notify flow `1868243571` enabled.

## Live apply (2026-08-17)

Portal verified 50612503. Filters merged onto Christian's existing trees (URL/form kept).

| Segment | List ID | Before | After | Change |
|---|---:|---:|---:|---|
| GMB_LP_Organic | 302 | 32 | 7 | exclude Paid Search / Paid Social |
| Google P-max Suspensions | 298 | 32 | 23 | require Paid Search; ads name CONTAINS PMax / Max_GMB instead of GMB |
| Overlap | — | 19 | 0 | split complete |
| GMBs Phone Calls | 297 | 7 | 7 | untouched |

PMax no longer swallows Call Only campaigns whose names contain `GMB`. Those stay on `GMBs Phone Calls`.

### Workflows (same day)

| Workflow | ID | Trigger | Action |
|---|---|---|---|
| Copy Original Traffic Source into empty Source | 1868243574 | Contact created AND Source is unknown | Wait 5 min, copy `hs_analytics_source` → `source` |
| GMB_LP_Organic - Internal Email + In-app | 1868243571 | Joins list 302 | Email + in-app to Jason and Sean (future members only) |

`#360leads` `Source =` is still Zapier zap `332246329` reading CallRail `source` at contact-create time. The HubSpot copy fills the CRM field five minutes later. Slack can still print a blank Source line until that zap maps `hs_analytics_source`. Duplicate `#360leads` posts also come from zaps `369135469` (PMax reinstatement) and `368432826` (Meta Reviews). No Zapier login in this session.

WordPress CF7 804 still has no hidden UTM/`gclid` fields. Public LP loads HubSpot `50612503.js` and GTM `GTM-WHKR99SC`. No WordPress or GTM write access.

## Diagnosis (2026-08-17)

- Ads manager switch: Christian Tippens to Alexandra Rojas, existing three campaigns.
- Circled pair was the overlap: organic LP vs PMax Suspensions, both size 32, 19 shared contacts.
- `GMB_LP_Organic` Used In 0 before the new list-302 workflow.
- Public LP `fixmygooglelisting.com` uses HubSpot tracking portal 50612503 and CF7 form 804 with no hidden UTM/`gclid` fields.

## Next actions

- [x] File Slack intake and source capture
- [x] Stand up HubSpot Agent + `/hubspot-ops`
- [x] Ship fail-closed repair CLI
- [x] Apply segment filters on portal 50612503
- [x] Confirm sizes diverge and overlap is 0
- [x] HubSpot-side Source fill from Original Traffic Source (empty CallRail Source only)
- [x] Organic list-302 email + in-app routing
- [ ] Remap Zapier zap `332246329` Source field to `hs_analytics_source` (needs Zapier login)
- [ ] Pause duplicate zaps `369135469` / `368432826` if they double-post the same contact
- [ ] Add UTM/`gclid` hidden fields on CF7 804 or a GTM tag on `GTM-WHKR99SC` (WordPress/GTM login)
- [x] Send Slack replies after Dillon said fix all

## Links

- Decisions: [[12_Brain/decisions/2026-08-17 - HubSpot Agent owns M360 attribution]]
- Clients: [[01_Clients/Client Index]]
- Concepts: [[12_Brain/concepts/HubSpot Channel Attribution]]
- Agent: [[11_Agents/HubSpot Agent]]
