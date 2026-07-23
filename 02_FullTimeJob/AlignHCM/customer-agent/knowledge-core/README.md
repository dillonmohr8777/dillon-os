---
employer: Align HCM
type: agent knowledge source (design pass)
subject: Align HCM Customer Agent (HubSpot)
portal: 242825734
updated: 2026-07-23
scope: verified public content only — no CRM, pricing, or private data
tags: [align-hcm, customer-agent, hubspot, knowledge-core, smartcare]
---

# Align HCM Customer Agent — Knowledge Core

A 9-page, retrieval-friendly source of truth for the HubSpot Customer Agent:
current services, SmartCare, supported platforms, grounded answers, and
safe-answer boundaries. Public, source-backed content only.

## Design system
Built in the **Won Deal Attribution** design system (not the buyer-guide style):
navy + orange with **blue** as the secondary data color, **no red**. Align logo
in a white card on the cover, giant hero stat, numbered section headers
(`01 ORIENTATION`), KPI cards with status chips, service-line cards, SmartCare
level tiles, and cream/blue callouts. Poppins (display) + DM Sans (body), embedded.

## Files
- `Align-HCM-Customer-Agent-Knowledge-Core.pdf` — deliverable (US Letter, 9 pages).
- `Align-HCM-Customer-Agent-Knowledge-Core.html` — self-contained source; re-renders to PDF with no build step.

## Contents
Cover · 01 Orientation (how to use + what Align does) · 02 Service capabilities
(10 service lines, 2 pages) · 03 SmartCare (4 levels + no-migration / no-co-employment
/ no-lock-in) · 04 Platforms & discovery · 05 Grounded answers (8 Q&A) · 06 Answer
boundaries (do-not / escalate / **Brand & partner safety, vendor-agnostic**) ·
07 Human handoff · 08 Authoritative public sources.

## Source of record
Content mirrors `handoffs/align-hcm-customer-agent/align-hcm-customer-agent-knowledge-core.html`
(dillon-os branch `agent/align-customer-agent-handoff`, commit `44fa5df`). The
knowledge-core HTML was unchanged across `895ddb4..44fa5df`. The vendor-agnostic
partner-safety rules on the boundaries page reflect the final
`customer-agent-final-guidelines.txt` (the 2,306-char partner-safe payload).
All source URLs are the real links from the knowledge-core file; nothing fabricated.
Design pass only — does not alter the live agent.

## Re-rendering
Open the HTML in Chrome and Print → Save as PDF (US Letter, margins none, background
graphics on), or render headlessly with Chromium (`print_background=True`,
`prefer_css_page_size=True`).
