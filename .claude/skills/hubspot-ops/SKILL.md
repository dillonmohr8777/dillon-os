---
name: hubspot-ops
description: Diagnose and repair Momentum 360 HubSpot attribution for Google Ads vs website forms. Use when Jason, Sean, or Dillon ask about HubSpot sources, segments, lead routing, or ads-manager switch fallout.
---

# HubSpot Ops

Turn a HubSpot attribution ask into a source-linked diagnosis, a dry-run repair plan, and (only with a live token) applied segment filters and workflows. Draft Slack replies in the vault. Post only when Dillon says send or fix all.

## When to run

Jason Fallon, Sean, Alexandra, or `#360marketing` asks why HubSpot channels, Google Ads campaigns, or website forms are mis-attributing leads.

## Steps

1. Read `11_Agents/HubSpot Agent.md` and `12_Brain/projects/HubSpot Attribution Repair.md`.
2. Pull the live Slack asks (permalinks, screenshots, segment names). File `00_Inbox/slack/YYYY-MM-DD-<slug>.md` if missing.
3. Map Active Contact segments: name, size, Used In, creator, last edited. Flag any two segments with the same size.
4. Check routing: `#360leads` Source field, `#gmbs-reinstatement` Zapier, email/workflow Used In.
5. Inspect the public landing-page HTML for HubSpot tracking and hidden UTM/`gclid` fields. Do not log in to WordPress unless Dillon provides a session.
6. Run `node _os/automation/bin/hubspot-attribution-repair.js --dry-run`. Token env keys: `JASON_HUBSPOT_PRIVATE_APP_TOKEN`, `HUBSPOT_TOKEN`. If unset, stop after the dry-run report. Do not invent portal writes.
7. With an active Jason/Momentum token and Dillon's apply instruction, rerun with `--apply --confirm-apply`. Add `--workflows` to create the Source-copy and organic-notify flows. The CLI verifies portal 50612503. Record before/after sizes and workflow IDs in the project note (no contact rows).
8. Draft Slack replies in the inbox note. Post only when Dillon says send or fix all.

## Target filters (Momentum 360 GMB)

- `GMB_LP_Organic`: first URL or form is the GMB landing page, AND original source is not Paid Search, AND `gclid` / `utm_medium=cpc` are empty.
- `Google P-max Suspensions`: Paid Search or campaign/UTM contains the live PMax name, AND original source is Paid Search.
- Do not use landing-page URL alone. Paid and organic share `fixmygooglelisting.com` form 804.

## Hard rules

- Tracked wiki files stay aggregate. No lead emails, phones, or names.
- HubSpot writes are Tier 2. Dry-run is the default.
- Subagents inherit Grok 4.6. Do not hand this lane to another model family.
