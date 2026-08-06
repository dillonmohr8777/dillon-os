---
employer: Align HCM
type: internal readiness report
subject: Align HCM Customer Agent (HubSpot)
portal: 242825734
evidence_date: 2026-07-23
decision: Launch Hold — safe by design, not ready for a live channel
tags: [align-hcm, customer-agent, hubspot, readiness, smartcare]
---

# Align HCM Customer Agent — Readiness Report

A 10-page, evidence-based readiness review of the HubSpot customer agent, captured
in a live internal-tester session (portal 242825734, July 23 2026). Organized as
**DEFINE → TRAIN → DEPLOY**, it documents identity, guardrails, knowledge
retrieval, human-handoff, and the launch-readiness gates.

**Decision: Launch Hold.** Safe by design (every safety/abuse probe fails closed),
but it cannot yet retrieve and link core public Align content. Fix knowledge
retrieval and the duplicate greeting before activation.

## Files
- `Align-HCM-Customer-Agent-Readiness-Report.pdf` — the shareable deliverable (US Letter, 10 pages).
- `Align-HCM-Customer-Agent-Readiness-Report.html` — self-contained source (Poppins + DM Sans embedded); re-renders to PDF with no build step.

## Design system
Built on the same Align HCM template as the buyer-guide collateral, tokens from
`../../brand-guidelines.md`:
- **Palette** — navy `#0A2540`, cream `#FAFAF7`, orange `#F05A28` / `#E8832A`, coral `#FF5C4F`, red `#D0261C`, blue `#1E5BA8`, teal `#2BB5A0`.
- **Type** — Poppins (display) + DM Sans (body).
- **Report components** — KPI stat cards, PASS / FAIL / PENDING status badges, phase banners, evidence table, gate checklist, and a decision banner.
All tokens live in one `:root` block at the top of the HTML.

## Contents
Cover · Snapshot (KPIs + what's working / what blocks) · Define: Identity & agent
image · Define: Capability boundary · Train: Stress-test results · Train: Eight
observed probes · Train: Knowledge-source health · Train: Human-handoff · Deploy:
Launch-readiness gates · Deploy: Exact path to ready + Final assessment.

## Source of record
Content mirrors the customer-agent readiness evidence (Codex branch
`ahcm/align-customer-agent-report`). Figures, prompts, and verdicts are reproduced
as captured; nothing was fabricated. This document is a design pass only and does
not alter the live agent.

## Re-rendering
Open the HTML in Chrome and Print → Save as PDF (US Letter, margins none, background
graphics on), or render headlessly with Chromium (`print_background=True`,
`prefer_css_page_size=True`).
