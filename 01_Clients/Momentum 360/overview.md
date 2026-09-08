---
client: Momentum 360
client_id: momentum-360
role: Agency operations and product enablement
division: Momentum 360
status: active
last_touched: 2026-09-07
next_action: Get Jason to refresh the HubSpot browser session, grant conversations.read, and restore CallRail account 671942387 access — see [[12_Brain/05_Projects/2026-09-07 - Restore Momentum 360 HubSpot health]].
due: none
tags: [client, agency, hubspot, ai, reporting, operations]
---

# Momentum 360

Momentum 360 is the agency operating layer across sales, CRM, attribution,
reporting, AI enablement, client delivery, website systems, and new products. It
must coordinate the portfolio without replacing or blending the underlying
client truth.

- [[Client Intelligence Overlay]]

## Communication intelligence - 2026-08-01

- Customer-agent corrections are required: collect name and phone, add Jason to chat alerts, expose missed calls and texts for daily HubSpot review, remove incorrect free-estimate and generic shoot routes, use the contact page unless shoot intent is explicit, and ground answers in the approved question sheet. Convert these into deterministic tests before claiming completion. [Source](https://momentum3d.slack.com/archives/C0B2N20A0SW/p1785511870286619)
- A multi-bar prospect wants an AI attribution dashboard linking ads to ticket and reservation outcomes with lightweight reservation and point-of-sale integrations. A $2,500 price was proposed for speed, and Dillon committed to support a Monday 4:30 meeting. Scope, data ownership, security, acceptance tests, phases, and commercial approval remain open. [Source](https://momentum3d.slack.com/archives/C04HXSVN2CS/p1785527448627519)
- Rob committed to a Phase 1 website plan over the weekend; check for it next workday and convert it into owner-trigger-output-QA role cards. [Source](https://momentum3d.slack.com/archives/C1CFQBC79/p1785525137451239?thread_ts=1784812437.578939&cid=C1CFQBC79)
- The GMBS lane reported its first premium close at $750. Verify the payment and HubSpot deal before updating financial truth or beginning document intake. [Source](https://momentum3d.slack.com/archives/C08PB4N3L6L/p1785526167428929)
- A 28-second HeyGen snow-video preview exists; the free output is watermarked and final download requires a paid plan. Review first, and keep purchase and delivery approval-gated. [Source](gmail://message/19fbe5bf41663152)

## HubSpot health drift - 2026-09-07

The daily M360 AI & lead-response Slack report showed **Agent status:
DEGRADED** every day from 2026-08-21 through 2026-09-01 (12 straight reports),
then went silent (no report found 2026-09-02 through 2026-09-07). Root causes:
an expired HubSpot Google-password browser session (needs Jason to log back
in), a missing `conversations.read` scope on the portal 50612503 private app,
and blocked CallRail account 671942387 membership. Read-only aggregate data
(contact/task/CallRail counts) kept flowing throughout — Dillon's own
2026-09-01 read was "a little bit dramatic," not a full outage. Full writeup,
evidence, and next actions: [[12_Brain/05_Projects/2026-09-07 - Restore Momentum 360 HubSpot health]].
