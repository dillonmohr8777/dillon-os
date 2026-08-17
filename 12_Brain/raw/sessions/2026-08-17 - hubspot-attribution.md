# 2026-08-17 — HubSpot attribution agent

- Decision: HubSpot Agent owns Momentum 360 CRM attribution (segments, original source, `#360leads` Source mapping). Google Ads Agent does not.
- Fact: Jason's circled segments `GMB_LP_Organic` and `Google P-max Suspensions` both size 32. Organic Used In 0.
- Fact: Ads manager switch was Christian to Alexandra, not an MCC swap by Dillon.
- Fact: `#360leads` still posts new HubSpot contacts with a blank Source field.
- Fact: `fixmygooglelisting.com` CF7 form 804 has HubSpot tracking and no hidden UTM/`gclid` fields.
- Pattern: Shared landing-page URL filters mix paid and organic when original source is sticky Paid Search.
- Blocker: Composio HubSpot alias Jason Fallon was initiated, not ACTIVE, in this cloud session. `--apply` stayed fail-closed.
