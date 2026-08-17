---
tags: [project, align-hcm, customer-agent, hubspot]
status: launch-hold
updated: 2026-08-17
expires: 2026-11-17
source: "[[02_FullTimeJob/AlignHCM/Customer-Agent/README]]"
---

# Align HCM Customer Agent

**Summary:** HubSpot Customer Agent for alignhcm.com. Built and tested in
Preview. Not on a live channel. Cloud agents cannot click Deploy.

## Goal

Safe website chat on Align HCM's HubSpot portal that answers public services
and SmartCare questions, refuses product troubleshooting, and hands off to a
human when identity or account work is required.

## Current state

Last portal audit: 2026-08-10. Launch hold. Zero conversations. No channel.

Live-site checks on 2026-08-17:

- alignhcm.com is HubSpot CMS for this portal. Homepage is a contact form, not
  a chat widget.
- SmartCare public levels are Stabilize, Optimize, Optimize Plus, plus Managed
  Payroll / HRIS / WFM. Older vault and workbook ladders are wrong.
- Eleven individual case studies are public. Most were still unconnected as
  knowledge sources on Aug 10.

## Next actions

- [ ] Run `handoffs/align-customer-agent-truncation-fix-2026-08-10.md` on the
      Align machine if IDENTITY is still truncated.
- [ ] Paste `handoffs/align-customer-agent-deploy-prompt-2026-08-17.md` into
      Claude in Chrome. Deploy only if G0, case 49, and case 52 pass in Preview.
- [ ] First live coverage is 10% on live chat. Raise later.

## Why this is not a cloud deploy

HubSpot documents channel assignment as a UI path under Service > Customer
Agent > Deploy > Channels. The CRM connector has no Customer Agent object.
[[12_Brain/entities/Claude in Chrome|Claude in Chrome]] needs a signed-in
desktop session. This repository's cloud environment has neither.

## Links

- Working files: [[02_FullTimeJob/AlignHCM/Customer-Agent/README|Customer-Agent folder]]
- Deploy runbook: [[02_FullTimeJob/AlignHCM/Customer-Agent/DEPLOY|DEPLOY]]
- Decision: [[12_Brain/decisions/2026-08-17 - Align Customer Agent live channel stays gated|live channel stays gated]]
- Employer note: [[02_FullTimeJob/AlignHCM/overview|Align HCM overview]]
