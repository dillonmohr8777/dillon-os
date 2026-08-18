---
tags: [decision]
decided: 2026-08-17
status: active
supersedes:
source: "[[12_Brain/raw/2026-08-17 - jason-hubspot-attribution]]"
updated: 2026-08-17
---

# HubSpot Agent owns Momentum 360 CRM attribution

**Decision:** Route Jason Fallon's HubSpot source, segment, form, and lead-routing work through [[11_Agents/HubSpot Agent]] and `/hubspot-ops`, not the Google Ads Agent and not the website Customer Agent.

**Why:** The 2026-08-17 incident is CRM membership and original-source mapping after an ads-manager people-switch, not a bid change. Google Ads Agent stops when tracking is broken. Customer Agent is the on-site chatbot.

**Implications:**

- Master Agent gains a HubSpot lane.
- Live filter edits stay Tier 2 behind an active HubSpot token.
- `#360leads` Source blanks and overlapping segment sizes are HubSpot-lane escalation triggers.
