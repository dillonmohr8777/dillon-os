# Momentum 360 — Jason's HubSpot agent: status

Prepared: 2026-07-23 · Source ask: **Jason Fallon DM, 2026-07-22 12:56 PM** (`handoffs/marketing-chief-intake-2026-07-22.md`, Intake 2)
Portal: **Momentum 360 HubSpot `50612503`** — Jason Fallon (VP Sales, jason@momentumvirtualtours.com), Sean Boyle (Managing Partner, sean@needmomentum.com).

Jason asked, by EOM: **classify each of his three agenda items as _built / tested / blocked / approval-required_, with current evidence.** This file is that classification, current as of the 2026-07-23 "fixed and live" milestone.

> ## ✅ Update 2026-07-23 — read/reporting layer fixed and live (reported by Dillon)
> A dedicated private repo now holds the agent: **`dillonmohr8777/jason-fallon-hubspot-agent`** (latest commit `8a32d70`). That repo is **outside this session's scope**, so the facts below are recorded **as reported by Dillon**, not independently verified from here.
> - **Portal `50612503` verified.** Read/reporting readiness gate **passed, zero required failures**. **Tests 6/6.**
> - **Included:** Slack research, both reporting PDFs, reporting DOCX, Customer Agent requirements, CallRail rules, attribution model.
> - Global **`jason_hubspot`** agent now routes to the repaired launcher. Native HubSpot connector **quarantined** (it's still bound to Align portal `242825734`, not Momentum's).
> - **Live inventory (`50612503`):** 14,262 contacts · 6,730 companies · 1,574 deals · 2,948 calls · 212 meetings · 2,680 tasks · 9 owners · 14 forms · 5 pipelines.
> - **Account-level blockers remaining:** missing HubSpot **Conversations scope** and **`automation-access`**. Until those are granted, the **Customer Agent (chatbot) and any workflow mutations stay blocked**. **CRM reporting and aggregate attribution are ready now.**

---

## Summary (revised with the 2026-07-23 evidence)

| # | Item | Classification | Evidence | Gate to next state |
|---|------|:---:|---|---|
| 1 | Chatbot (Customer Agent) | **Blocked** | Requirements captured in the agent repo; read side verified | Grant HubSpot **Conversations scope** + `automation-access`, then build to tester |
| 2 | CallRail after-hours + SMS | **Blocked → approval-required** | CallRail rules + attribution model captured | `automation-access` **and** explicit approval to activate SMS / touch routing / spend |
| 3 | Internal agent workflows | **Split: reporting Built/Tested; mutations Blocked** | Read/reporting layer passed 6/6, live-verified | `automation-access` for any write/automation; name the target workflows |

**Headline for Jason:** the read-and-report half is done and verified against the live portal (6/6). The write-and-activate half — the chatbot, SMS/CallRail activation, and any workflow that mutates data — is blocked on two HubSpot permission scopes (**Conversations** + **automation-access**) that must be added at the account level. Nothing there can be truthfully called "built" until those scopes exist. CRM reporting and aggregate attribution can be delivered now.

---

## Item 1 — Chatbot (Customer Agent) · **Blocked**

- **Status:** requirements are captured in `jason-fallon-hubspot-agent`. The agent can **read** Momentum's CRM (verified), but the customer-facing chatbot needs the **HubSpot Conversations scope** to exist and `automation-access` to act. Both are missing → build/activation blocked.
- **Path to done:** add the two scopes → build identity + guardrails + acceptance suite (the Align customer-agent pattern is the template) → publish to the **internal tester only** → run the suite → **separate approval** before any live channel.
- **Boundary:** no live channel, no visitor-facing sends without explicit approval.

## Item 2 — CallRail after-hours + SMS · **Blocked → approval-required**

- **Status:** CallRail rules and the attribution model are captured. Activation is gated twice over — by the missing `automation-access` scope **and** by Jason's own boundaries (no SMS activation, no phone-routing change, no spend, no sends without approval).
- **Path to done:** document current routing/hours as the rollback baseline → draft the after-hours flow + SMS copy **with opt-out** (unsent) → confirm A2P/carrier + spend → **Jason approves** → activate reversibly → capture test evidence + rollback note.
- **Boundary:** nothing activated, routed, spent, or sent without explicit approval.

## Item 3 — Internal agent workflows · **reporting Built/Tested; mutations Blocked**

- **Status:** the **reporting/attribution** layer is built and passed 6/6 against the live portal — **ready to deliver now**. Anything that **writes** or **automates** (enrolls records, changes properties, triggers sends) is blocked on `automation-access`.
- **Path to done:** deliver the reporting/attribution outputs now (the PDFs/DOCX already produced) → for mutations, add `automation-access`, have Jason/Sean name the 2–3 target workflows, then build with approval gates on any send/spend.
- **Boundary:** do not alter automated emails without explicit approval.

---

## What's needed to unblock the rest

1. **HubSpot Conversations scope** (portal `50612503`) → unblocks the Customer Agent / chatbot.
2. **HubSpot `automation-access`** (portal `50612503`) → unblocks CallRail/SMS activation and workflow mutations.
3. **Jason/Sean** to name the Item-3 workflows and approve the gated actions (SMS/routing/spend, chatbot live channel).

**Ready to deliver now (no new scopes):** CRM reporting + aggregate attribution.

Draft reply to Jason (not sent): [`draft-reply-to-jason.md`](draft-reply-to-jason.md).

> Note: this doc lives in `dillon-os` as the vault-side handoff record. The working agent is in the private `jason-fallon-hubspot-agent` repo (commit `8a32d70`), which this session isn't scoped to — figures above are per Dillon's report, not re-verified here.
