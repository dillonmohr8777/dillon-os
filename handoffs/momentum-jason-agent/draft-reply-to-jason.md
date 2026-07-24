# DRAFT reply to Jason — NOT SENT

Status: draft only. Do not send without Dillon's review. No message has been sent to Jason, Sean, or anyone else.
Context: EOM status on chatbot / CallRail-SMS / internal workflows (Jason's 2026-07-22 DM), updated to the 2026-07-23 "fixed and live" milestone.

---

Hey Jason — EOM status on the three:

**Good news first:** the read + reporting side is done and verified against our live HubSpot (portal 50612503) — it passed the readiness gate with zero required failures, 6 of 6 tests green. **CRM reporting and aggregate attribution are ready to hand you now** (reporting PDFs + DOCX and the attribution model are built).

The other half needs two HubSpot permissions turned on before I can go further — **Conversations** and **automation access**:

**1. Chatbot — blocked on the Conversations scope.** Requirements are done and the build pattern is ready; I just can't stand it up until that scope is added. Once it's on, I'll publish to an internal tester first — nothing live to visitors without your OK.

**2. CallRail after-hours + SMS — blocked + holding for approval.** Rules and the attribution model are captured. I'm not activating SMS, changing routing, or spending until (a) automation access is on and (b) you sign off. I'll bring you the after-hours flow + SMS copy (with opt-out) to approve first.

**3. Internal workflows — reporting is ready; automations are blocked.** Anything that just reports, I can deliver now. Anything that writes/automates needs the automation-access scope — and I'll need you to name the top 2–3 workflows you want.

**Ask:** can you add the **Conversations** and **automation-access** scopes on portal 50612503? That unblocks the chatbot and the workflow automations. Reporting/attribution I can send over as-is.

— Dillon

---

_Boundaries respected in this draft: no automated-email changes, no SMS activation, no phone-routing changes, no spend, no sends. It only reports status and requests scopes/approvals._
