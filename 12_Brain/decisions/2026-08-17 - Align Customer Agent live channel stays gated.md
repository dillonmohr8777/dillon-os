---
tags: [decision]
decided: 2026-08-17
status: active
supersedes:
source: "[[02_FullTimeJob/AlignHCM/Customer-Agent/Align-HCM-Customer-Agent-Readiness-Report]]"
updated: 2026-08-17
expires: 2026-11-17
---

# Align Customer Agent live channel stays gated

**Decision:** Do not assign Align HCM's HubSpot Customer Agent to a public
channel until Preview retests of G0, case 49, and case 52 all pass on the
published prompt. An explicit "deploy" request authorizes the gated Claude in
Chrome prompt, not an ungated live switch from a cloud agent.

**Why:** The August 10 audit left IDENTITY (HARD) truncated and case 52 still
failing (service-delivery claims before identity). alignhcm.com still has no
chat widget. HubSpot has no Customer Agent deploy API. Flipping the channel
from this environment would either be impossible or would ship a known High
fail to visitors.

**Implications:**

- Live assignment is a desktop Claude in Chrome run against portal 242825734
  using `handoffs/align-customer-agent-deploy-prompt-2026-08-17.md`.
- First coverage, when gates pass, is 10% on live chat only.
- Knowledge Core SmartCare copy must follow the live page (Stabilize, Optimize,
  Optimize Plus, plus managed payroll / HRIS / WFM), not the old four-name
  ladder or the workbook's Advisory / Managed / Strategic spec.

**Not chosen:** enabling website chat from Cursor Cloud, Composio HubSpot CRM
tools, or 100% coverage on first publish.
