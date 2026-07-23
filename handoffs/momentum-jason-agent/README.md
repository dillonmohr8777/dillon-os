# Momentum 360 — Jason's HubSpot agent: EOM status

Prepared: 2026-07-23 · Source ask: **Jason Fallon DM, 2026-07-22 12:56 PM** (`handoffs/marketing-chief-intake-2026-07-22.md`, Intake 2)
Portal in question: **Momentum 360 HubSpot `50612503`** (`app.hubspot.com`) — Jason Fallon (VP Sales, jason@momentumvirtualtours.com), Sean Boyle (Managing Partner, sean@needmomentum.com).

Jason asked, by EOM: **classify each of his three agenda items as _built / tested / blocked / approval-required_, with current evidence.** This file is that classification.

> ## ⚠️ Evidence scope — read first
> This report is assembled from what is captured in **GitHub (`dillon-os`)**. The Momentum agent's build state lives in **HubSpot portal `50612503`**, which **this workspace cannot reach** (the connected HubSpot is Align HCM `242825734`, a different portal). So "current evidence" below is what exists in the vault; anything requiring the live portal is marked **`VERIFY IN 50612503`** rather than asserted. No item is claimed "tested" without evidence.

---

## Summary

| # | Item | Classification | Evidence in GitHub | Needs |
|---|------|:---:|:---:|---|
| 1 | Chatbot | **Approval-required** (ready to build; proven template exists) | Agenda only | Confirm target + approve build in portal |
| 2 | CallRail after-hours + SMS | **Blocked → Approval-required** | Agenda only | Explicit approval to activate SMS / touch routing / spend |
| 3 | Internal agent workflows & setups | **Approval-required** (needs scoping) | Reusable agent assets in vault | Jason/Sean to name the target workflows |

**Headline for Jason:** none of the three has build/test evidence committed to the shared repo yet. All three are scoped and safe to advance, but each crosses a boundary Jason himself set (spend, SMS activation, phone routing, automated email, external sends) — so each needs an explicit go-ahead before anything goes live. Item 1 can move fastest because a working pattern already exists.

---

## Item 1 — Chatbot · **Approval-required**

**What it is:** a customer-facing HubSpot chatbot for Momentum 360 (portal `50612503`), analogous to the one built for Align HCM.

**Current evidence:** none in the repo — no Momentum chatbot spec, guidelines, or test log is committed. `VERIFY IN 50612503` whether a draft chatbot/chatflow already exists in the portal.

**Why this can move fastest:** a proven, reusable pattern already exists in `claude-skills-repo/skills/alignhcm-customer-agent/` — identity + guardrails + a paste-ready guidelines payload + a 22-prompt acceptance suite + a launch-readiness gate. Adapting it to Momentum is a known path, not a from-scratch build.

**Path to done (design-only until approved):**
1. Confirm the chatbot's job and the **approved public Momentum pages** it may answer from (services, about, contact). *(Needs Jason/Sean input.)*
2. Draft Momentum identity + opening + the same brand/safety guardrails (no invented pricing/timelines/guarantees; no private data; vendor-agnostic; human-handoff path).
3. Configure in portal `50612503`, publish to the **internal tester only** (no live channel).
4. Run the acceptance suite; fix knowledge retrieval + greeting; capture evidence.
5. **Separate approval** to attach a live website channel.

**Boundary:** do not attach a live channel or send anything to real visitors without Jason's explicit approval.

## Item 2 — CallRail after-hours + SMS · **Blocked → Approval-required**

**What it is:** after-hours call handling in CallRail plus an SMS setup for Momentum.

**Current evidence:** none in the repo. `VERIFY IN 50612503` / CallRail account: current phone routing, business-hours schedule, existing SMS enablement, and opt-out (STOP/HELP) handling.

**Why it's blocked:** Jason's own boundaries gate every activating action here — *"Do not activate SMS, change phone routing, incur spend, or send messages without explicit approval,"* and *"preserve exact account ownership, opt-out behavior, rollback, and test evidence."* SMS also carries compliance weight (consent + opt-out). So this is correctly **held** until approved, and cannot be truthfully marked built/tested.

**Path to done (nothing activated until approved):**
1. Document current CallRail routing + hours + number ownership as the rollback baseline (evidence). *(Needs CallRail access.)*
2. Draft the after-hours flow + SMS auto-reply copy with explicit opt-out language — as a **proposal**, unsent.
3. Confirm carrier/A2P registration and any spend implications.
4. **Approval gate:** Jason signs off → activate in a reversible way → capture test evidence (test number, timestamps) → keep a rollback note.

**Boundary:** no SMS activation, no routing change, no spend, no test sends without Jason's explicit approval.

## Item 3 — Internal agent workflows & setups · **Approval-required (needs scoping)**

**What it is:** internal (non-customer-facing) agent/automation workflows for Momentum.

**Current evidence:** the *ask* is broad and not yet scoped to named workflows. Reusable internal-agent assets already exist in this vault (`11_Agents/`, the Marketing Chief orchestrator/queue pattern referenced in the intake, and the reporting/pulse/brief skills) — these are candidates to adapt, but there is no committed Momentum-specific workflow build.

**Path to done:**
1. Get Jason/Sean to name the 2–3 concrete workflows they mean (e.g., lead routing, review request, reporting digest). *(Needs input — this is the real blocker.)*
2. For each: map trigger → steps → owner → approval gates; reuse the existing routing/dedup/approval-gate pattern from the Marketing Chief intake.
3. Build in a reversible/testable way; capture evidence; hold any external send/publish/spend for approval.

**Boundary:** do not alter automated emails without explicit approval.

---

## What I need to close this out

- **Read access to Momentum portal `50612503`** (and CallRail) — or screenshots/exports — to replace every `VERIFY IN 50612503` with real evidence.
- **Jason/Sean to name the Item-3 workflows.**
- **Explicit approvals** on the gated actions (chatbot live channel; SMS/routing/spend).

Draft reply to Jason (not sent): [`draft-reply-to-jason.md`](draft-reply-to-jason.md).
