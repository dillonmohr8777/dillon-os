---
note_type: reference
status: active
created: 2026-09-18
owner: Dillon Mohr (Gordon synthesis)
source_refs:
  - "approval-queue.md (20+ items analyzed)"
  - "agent-vault and client-operations registry"
  - "MASTER-ORCHESTRATOR.md (model routing ladder)"
verification_status: operational-2026-09-18
---

# Agent Lane Dispatch — Momentum + Client Execution

This file routes work to the right agent lane. Use it with MASTER-ORCHESTRATOR.md (model selection) and the daily approval-queue (execution gate).

## Four Permanent Lanes

### Lane 1: Client Delivery
**Owner:** Marketing Chief + Sol (writing) + Client agents  
**Lives:** `client-operations/clients/<client>/deliverables/`  
**Cadence:** Per-client request; batch daily at 10:00

**Owns:**
- Draft client emails (verified brand, exact recipients)
- Build/deploy/test client deliverables (sites, landing pages, reports)
- Track client response time; detect churn signals
- Escalate blockers to Lane 2 (access needed) or Lane 3 (account health)

**Authority:**
- Send client emails if copyedited and approved (within exact approval scope)
- Publish approved deliverables
- Pause work on client request (log and escalate)

**Model routing:**
- Sol medium for drafting client comms and site copy
- GPT-5.5 xhigh only if refactoring complex build logic
- Do not select Astra for routine client work

**Handoff signals:**
- "I need access to [client account]" → escalate to Lane 2
- "Account shows a billing block / conversion defect" → escalate to Lane 3
- "Client email drafted, needs approval" → route to approval-queue.md

---

### Lane 2: Operations & Registry
**Owner:** Codex (existing)  
**Lives:** `System/approval-queue.md`, `registry/clients.json`, `automations/`  
**Cadence:** Daily 08:00 (decision briefs) and 17:00 (gate enforcement); weekly 09:00 (registry reconciliation)

**Owns:**
- Registry updates (client status, contacts, Slack channels, access routes)
- Approval queue (detecting ready-to-decide items, generating briefs, escalating to Dillon)
- Automation health (weekly-reports, weekly-immohrtal-seo-analytics, cadence tasks)
- Detect stale or contradictory client data

**Authority:**
- Update registry after Dillon approval
- Gate all outbound client sends (reads approval-queue before Lane 1 executes)
- Own approval-queue state machine (mark complete, archive, rework)
- Escalate unresolved access contradictions to Lane 3

**Model routing:**
- Luna medium for all routine registry/queue work
- No escalation to GPT-5.5 or Astra; this is a deterministic, data-driven lane

**Handoff signals:**
- "Registry: five new clients need routing" → create approval-queue item
- "Client status contradicts email evidence" → create approval-queue item with reconciliation proposal
- "Automation failed to run" → diagnose and propose fix in approval-queue item

---

### Lane 3: Audit & Remediation
**Owner:** Cursor (new dedicated auditor) + Astra (complex causation only)  
**Lives:** `12_Brain/07_Reviews/` (audit findings), `client-operations/clients/<client>/audits/`  
**Cadence:** Weekly audits (Mondays) + on-demand when Lane 1 escalates

**Owns:**
- Weekly account audits (conversion tracking, billing status, campaign health)
- Diagnose defects (why a campaign served 0 impressions, conversion multi-counting, tracking gaps)
- Propose remediation (with evidence, cost impact, and risk assessment)
- Detect and flag credential leaks; propose rotation strategy

**Authority:**
- Propose fixes; execute only if approved in decision brief
- Read any client account (readonly)
- Create evidence captures (screenshots, API reads, comparative analysis)

**Model routing:**
- Cursor high for diagnosis and remediation proposals
- Astra xhigh only when causation remains unresolved after Cursor work
- GPT-5.5 xhigh for implementation variants (API scripts, bulk operations)

**Handoff signals:**
- "This conversion fired but it shouldn't" → diagnose + propose fix + cost impact
- "Client account has a billing flag but we don't know why" → API read + diagnosis
- "Five credentials are in Slack; here's the rotation strategy" → move to approval-queue for decision
- "Campaign ended but it should still be running" → diagnose (date?, budget?, permission?, policy?)

---

### Lane 4: Product & Innovation
**Owner:** Astra (when explicitly named) + Grok (when system design is needed)  
**Lives:** `_os/`, `System/`, `{agent-vault,client-operations}/` (new feature branches)  
**Cadence:** Project-driven; no daily cadence (decision: which projects?)

**Owns:**
- Momentum platform (agent routing, skill composition, multi-tenancy, billing)
- Client agent design (new agent types, capability matrix, deployment patterns)
- Video editing, animation, brand asset creation
- Prospect Radar V2 refinement
- White-label features

**Authority:**
- Build in isolated branches; merge only after Lane 1 + Lane 3 review
- Create new automations (propose, get approval, then implement)
- Refactor core infrastructure

**Model routing:**
- Astra high for design, reasoning, and complex builds
- Astra xhigh for video, animation, and creative problem-solving
- GPT-5.5 xhigh for implementation, testing, and production hardening
- Grok for system design and multi-step orchestration

**Handoff signals:**
- "New client agent skill needed" → design → propose to Lane 1 for scope
- "Momentum console needs X feature" → design in branch → code review before merge
- "BOK Sunburst 23 films rendered; which ones ship?" → creative decision to Dillon via approval-queue

---

## Daily Execution Pattern

### 08:00 Eastern — Decision Brief Generation (Lane 2 + Lane 3)
```
Codex reads approval-queue.md:
  ├─ Scan for items with:
  │  ├─ Evidence complete
  │  ├─ Ready-to-decide status
  │  └─ Older than 24 hours
  │
  ├─ For each item, Codex generates a 1-page decision brief:
  │  ├─ What decision is needed?
  │  ├─ What evidence backs this?
  │  ├─ What's the cost/risk of each option?
  │  ├─ What's the default if Dillon doesn't respond?
  │  └─ Link to detailed source
  │
  └─ Send brief to Dillon (Slack #ceo-inbox or SMS if urgent)
```

Example brief:
```
DECISION: Omega search-term negatives (9 terms, $388 spend at risk)

EVIDENCE:
  • 2026-09-09 audit found timberline-landscaping, rocky-top-resources, pioneer-sand-gravel, etc.
  • These are competitor + supplier brands, not customer searches
  • 49 clicks / $388.14 last week with 0 conversions

OPTIONS:
  1. Apply negatives today → reduce waste immediately (estimated +5% ROI on Omega)
  2. Wait for next audit cycle → continue learning from competitor traffic
  3. Apply selectively → test retention of competitor-adjacent terms

COST: Zero (it's an optimization, not spend)
RISK: Low (negatives are easily reverted)

RESPOND: Y (apply #1) / N (hold) / CUSTOM
BRIEF: 2026-09-18/approvals/omega-negatives.md
```

### 10:00 Eastern — Lane 1 Execution (Client Delivery)
```
Lane 1 (Marketing Chief + Sol + Client agents):
  ├─ Read today's approved-decisions from Lane 2
  ├─ Fetch client deliverable briefs from client-operations registry
  ├─ Execute each approved item:
  │  ├─ Draft client emails (verified brand + recipients)
  │  ├─ Build/test/deploy deliverables
  │  ├─ Send if approved
  │  └─ Log outcome + timestamp
  │
  └─ Escalate blockers back to Lane 2/3 if needed
```

### 17:00 Eastern — Queue Hygiene & Close (Lane 2)
```
Codex reads approval-queue.md:
  ├─ Scan for items with no Dillon response by 17:00
  │  ├─ Routine items (< $100 impact) → set default and execute
  │  ├─ High-impact items (> $1000 impact) → escalate to SMS/call
  │  └─ Anything blocking client delivery → escalate immediately
  │
  └─ Archive completed items to approval-queue-archive.md
```

### Monday 09:00 — Registry Reconciliation (Lane 2)
```
Codex runs full registry scan:
  ├─ Detect status contradictions (registry vs email/Slack evidence)
  ├─ Populate missing fields (Slack channels, contacts, access refs)
  ├─ Flag stale clients (no evidence > 60 days)
  ├─ Create approval-queue items for any correction needed
  │  ├─ "Registry: 5 new clients, add scope and routes"
  │  ├─ "Registry: 9 clients missing Slack channels"
  │  ├─ "Registry: NKCDC/Fagan status reconciliation"
  │  └─ "Registry: sync updated registry to agent-vault"
  │
  └─ Broadcast updated registry to all agents
```

---

## Lane Handoff Examples

### Example 1: Client Churn Signal
```
Lane 1 (Client Delivery):
  "Bar Crawl hasn't responded to check-in email in 4 days.
   Last response was 2026-09-17 pausing work request. Should we follow up?"
  
  → escalate to Lane 2 (Codex) with:
     ├─ Client ID: bar-crawl-usa
     ├─ Evidence: last_evidence_at = 2026-09-17, response_pending = 4 days
     ├─ Signal: possible churn
     └─ Question: follow-up strategy?

Lane 2 (Operations):
  "Codex, check the registry. This is a churn signal. Let me create an
   approval-queue item with recovery options. Dillon will decide next cycle."
  
  → Create approval-queue item:
     ├─ Item: "Bar Crawl USA / churn signal — pause request 2026-09-17, no response"
     ├─ Evidence: daily-briefs/2026-09-19.md shows user request to consider pausing
     ├─ Options:
     │  1. Follow up with recovery email
     │  2. Pause work as requested
     │  3. Schedule retention call
     ├─ Risk: high (churn risk)
     └─ Gate: Dillon decision required
```

### Example 2: Account Defect
```
Lane 3 (Audit & Remediation):
  "Omega campaign search terms: $388 waste on competitor brands.
   Proposal: apply 9 negatives. Cost: zero. Time to value: same-day ROI improvement."
  
  → escalate to Lane 2 (Codex) with:
     ├─ Audit: 2026-09-09 search-term audit
     ├─ Defect: competitor/supplier brands not filtered
     ├─ Fix: apply 9 negatives (timberline, rocky-top, pioneer-sand-gravel, etc.)
     ├─ Cost: zero (optimization, not spend)
     ├─ Risk: low (easily reverted)
     ├─ Evidence: 49 clicks / $388.14 / 0 conversions
     └─ Decision needed: Y/N?

Lane 2 (Operations):
  "Create approval-queue item with brief. Dillon will approve or hold."
  
  → Create approval-queue item:
     ├─ Item: "Omega / conversion tracking: 9 search-term negatives, $388 waste"
     ├─ Options: Y (apply today) / N (hold) / CUSTOM
     ├─ Gate: Dillon decision
     └─ Timeline: execute same-day once approved
```

### Example 3: New Client Agent
```
Lane 4 (Product & Innovation):
  "Astra designs a new prospect-qualification agent for Momentum.
   Scope: score website quality, route to ads vs rebuild vs SEO."
  
  → Build in branch: feature/prospect-qualification-agent
  → Create design doc in _os/
  → Link to agent-vault for cross-agent review
  
  → escalate to Lane 1 (Client Delivery) + Lane 3 (Audit) for scope review:
     ├─ Lane 1: "Is this useful for our current clients?"
     ├─ Lane 3: "Does this introduce any account-health blindspots?"
     └─ Both: "Ready to ship or needs refinement?"

Lane 1 + Lane 3:
  "Review branch + design. Propose: ship in sandbox first, test on prospects,
   then enable for live client routing."
  
  → escalate to Lane 2 + Dillon for approval:
     ├─ Item: "Prospect qualification agent / design review + deployment plan"
     ├─ Gate: Dillon decision (scope, deployment phasing)
```

---

## Model Routing Decision Tree

```
START: New work item

Is this registry/approval/queue work?
  YES → Luna medium (Lane 2 owns it)
  NO  → continue

Is this client-facing (email, site build, report)?
  YES → Sol medium for drafting (Lane 1 owns it)
  NO  → continue

Is this account audit / defect diagnosis?
  YES → Cursor high (Lane 3 owns it)
  NO  → continue

Is this video editing, animation, or brand creation?
  YES → Astra high (Lane 4 owns it)
  NO  → continue

Is this Momentum platform / agent infrastructure / complex refactor?
  YES → Is Dillon explicitly asking for Astra? 
         YES → Astra high (Lane 4)
         NO  → GPT-5.5 xhigh (Lane 4)
  NO  → continue

Is this an unresolved diagnostic (Cursor tried, still stuck)?
  YES → Astra xhigh (Lane 4)
  NO  → Luna medium (default safe choice)
```

---

## Rules for All Lanes

1. **No unsent client emails.** If drafted, it goes to approval-queue with "ready to send" signal.
2. **No unretrieved outputs.** If an agent renders a film, runs a report, or diagnoses a defect, it gets filed and linked.
3. **No registry conflicts.** Weekly Monday 09:00 reconciliation is the sync point; agents read-after-write for consistency.
4. **No duplicate research.** If Lane 1 finds a defect, it escalates to Lane 3 for diagnosis, not diagnose-again.
5. **No model escalation without evidence.** Use Luna → Sol/Cursor → GPT-5.5 → Astra. Skip steps only if needed.
6. **No decision delays.** If an item is ready to decide, it goes to approval-queue; if Dillon doesn't respond by 17:00, default or escalate.

---

## What Changes Monday 2026-09-18

1. Create this file (Lane Dispatch — you're reading it)
2. Codex creates first decision briefs for existing approval-queue items
3. Dillon approves/rejects briefed decisions
4. Lane 1 starts executing approved items (with approval-queue gate check)
5. Lane 3 starts weekly audits (Monday 09:00)
6. Registry reconciliation starts (Codex, Monday 09:00)

---

## Success Metric (30 Days)

By **2026-10-18**:
- Zero unsent client emails (all staged drafts either sent or archived)
- Zero unretrieved outputs (films, reports, audits all filed + linked)
- Zero finish-and-file artifacts (approval-queue processes all ready-to-decide items within 24 hrs)
- Registry 100% current (all clients have routes, Slack channels, contacts, last-evidence-at verified)
- Client churn signals caught within 24 hrs (Bar Crawl follow-up, etc.)
- Conversion defects remediated within 48 hrs of detection (Omega, Revive, Nexla)

---

## Appendix: Current Open Items by Lane

### Lane 1: Client Delivery
- [ ] Bar Crawl USA / respond to pause request (churn signal)
- [ ] KJB / four items missing from report (recover from Gmail thread)
- [ ] Kimberly James Bridal / Google Ads landing page QA
- [ ] Ten weekly client reports / send decision (Sep 7-13 week)
- [ ] GT Clinic / access request (SiteGround, DNS, Search Console, GA4)

### Lane 2: Operations & Registry
- [ ] Five new clients need registry entry (look-alive, capsule-and-tonic, etc.)
- [ ] Nine clients missing Slack channels (populate from active channels)
- [ ] NKCDC / status change (active → ended, per Dillon 2026-09-14)
- [ ] Fagan Painting / status reconciliation (ended vs active, per evidence)
- [ ] Momentum AI Division / D01-D20 decision briefs (ready after Mac Frederick call)

### Lane 3: Audit & Remediation
- [ ] Omega / search terms and landing page defects (diagnosis + fix proposal)
- [ ] Revive Systems / LSA background check contradiction (diagnosis + client message)
- [ ] Onsite Concrete / nine primary conversions (reduce to 1, then instrument page)
- [ ] Nexla / spam conversion firing (deploy fix + retest, $365/week burn)
- [ ] Five credential leaks in Slack (rotate + delete + audit gate set)
- [ ] Automated immohrtal-seo-analytics / standing deploy authority review

### Lane 4: Product & Innovation
- [ ] Momentum AI films (23 rendered; 10 sector + 10 concept + 3 motion; none approved/rejected)
- [ ] BOK Sunburst images (4 paid; accept/reject decision)
- [ ] Momentum design system / brand identity audit
- [ ] Prospect Radar V2 / scope + deployment plan
- [ ] Agent infrastructure / Frontier synthesis enablement (decision: when?)

---

Last updated: 2026-09-18  
Next review: 2026-09-25 (after first full week of lane execution)
