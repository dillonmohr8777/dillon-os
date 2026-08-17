---
tags: [project]
status: active
updated: 2026-08-17
due: 2026-08-18
source: "[[12_Brain/raw/2026-08-17 - jason-hubspot-attribution]]"
---

# HubSpot Attribution Repair

**Summary:** Restore Momentum 360 HubSpot channel reporting after the Christian-to-Alexandra ads-manager switch so organic GMB landing-page leads and Google PMax leads stop sharing the same 32 contacts.

## Goal

Finish line a judge can verify from git plus this note:

1. `11_Agents/HubSpot Agent.md` exists and Master Agent routes CRM attribution to it.
2. `/hubspot-ops` exists.
3. Diagnosis names `GMB_LP_Organic` (size 32, Used In 0) overlapping `Google P-max Suspensions` (size 32, Used In 2).
4. Routing map states `#360leads` still fires with a blank Source field, and organic has no segment-based workflow.
5. Draft Slack replies sit in `00_Inbox/slack/2026-08-17-jason-hubspot-attribution.md` and were not posted.
6. `node _os/automation/bin/hubspot-attribution-repair.js --dry-run` runs fail-closed without a token.
7. `12_Brain/INDEX.md` lists every new wiki page.
8. `node --test _os/test/brain-hud.test.js _os/test/public-safety.test.js _os/test/hubspot-agent.test.js` passes.

Live HubSpot `--apply` stays operator-gated until Composio HubSpot (alias Jason Fallon) is ACTIVE or `HUBSPOT_TOKEN` is in the environment.

## Diagnosis (2026-08-17)

- Ads manager switch: Christian Tippens to Alexandra Rojas, existing three campaigns.
- Jason's circled pair is the overlap: organic LP vs PMax Suspensions, both size 32.
- Jason's X pair (`Google P-max-3-reviews`, `META Reviews`) is stale/low volume, not the routing path for this ask.
- `GMB_LP_Organic` Used In 0: organic has no Slack/email/workflow from that segment.
- `Google P-max Suspensions` Used In 2: paid still has two HubSpot consumers.
- New contacts still hit `#360leads` today. They are not joining Christian's June segments.
- Public LP `fixmygooglelisting.com` uses HubSpot tracking portal 50612503 and CF7 form 804 with no hidden UTM/`gclid` fields. Paid and organic share that form, so original-source cookies collide.

## Next actions

- [x] File Slack intake and source capture
- [x] Stand up HubSpot Agent + `/hubspot-ops`
- [x] Ship fail-closed repair CLI
- [ ] Activate HubSpot token in this cloud session
- [ ] `--apply` segment filters, then confirm sizes diverge
- [ ] Map `#360leads` Source to `hs_analytics_source`
- [ ] Add UTM/`gclid` hidden fields on CF7 804 (WordPress, separate login)
- [ ] Send drafted Slack replies after Dillon approval

## Links

- Decisions: [[12_Brain/decisions/2026-08-17 - HubSpot Agent owns M360 attribution]]
- Clients: [[01_Clients/Client Index]]
- Concepts: [[12_Brain/concepts/HubSpot Channel Attribution]]
- Agent: [[11_Agents/HubSpot Agent]]
