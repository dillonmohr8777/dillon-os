---
note_type: checkpoint
status: active
created: 2026-09-18
owner: Dillon Mohr (Gordon synthesis + execution plan)
---

# Workflow Rethink — Implementation Checklist

**Objective:** Move from finish-and-file rot to systematic approval → deploy → archive execution.

**Timeline:** Start Monday 2026-09-18. Full adoption by 2026-09-25.

---

## IMMEDIATE (Monday 09:00 - 12:00)

- [ ] Read `System/LANE-DISPATCH.md` (15 min)
- [ ] Review current `System/approval-queue.md` for items ready to brief (10 min)
- [ ] Schedule 30-min call with Mac Frederick (AI Division decision blocker) — email + calendar invite (5 min)
- [ ] Identify which off-device backup solution: OneDrive, B2, S3, or other (5 min, decision needed)

**Owner:** Dillon  
**Gate:** Read the new LANE-DISPATCH.md before Codex runs first briefs

---

## FIRST WEEK (Mon 2026-09-18 to Fri 2026-09-22)

### Decision Briefs (Lane 2 / Codex)
- [ ] Generate first daily decision briefs (08:00 slot)
  - [ ] Omega search-term negatives brief (ready to decide)
  - [ ] Momentum films acceptance brief (23 items, 0 decisions)
  - [ ] Weekly report send decision brief (10 staged, week verify needed)
  - [ ] Nexla conversion fix brief (diagnosis complete, deploy decision)
  - [ ] Credential rotation brief (5 items, rotation paths ready)
  
**Owner:** Codex (marketing-chief agent)  
**Cadence:** Daily 08:00  
**Output:** Approve/reject by 17:00 same day or default by 08:00 next day

### Client Delivery (Lane 1 / Marketing Chief)
- [ ] Execute all Monday-approved decisions (10:00 slot)
  - [ ] Apply Omega negatives (if approved)
  - [ ] Deploy Nexla conversion fix (if approved)
  - [ ] Send/hold weekly reports (per decision)
  - [ ] Draft Bar Crawl churn follow-up (if approved)

**Owner:** Marketing Chief + Sol  
**Cadence:** 10:00 daily (batch execute approved items)  
**Gate:** Check approval-queue.md before executing

### Audits (Lane 3 / Cursor)
- [ ] Run first weekly client audits (Monday 10:00)
  - [ ] Omega account health (campaign status, permissions, spend rate)
  - [ ] Revive Systems account health (LSA status, access state)
  - [ ] Onsite Concrete account health (conversion setup, billing)
  - [ ] Nexla account health (post-fix verification if deployed)

**Owner:** Cursor  
**Cadence:** Weekly Monday 10:00, plus on-demand when Lane 1 escalates  
**Output:** Audit report linked in approval-queue.md

### Registry Reconciliation (Lane 2 / Codex)
- [ ] Run full registry scan and reconciliation (Monday 09:00)
  - [ ] Detect five new clients (look-alive, capsule-and-tonic, etc.)
  - [ ] Populate nine missing Slack channels
  - [ ] Reconcile NKCDC / Fagan status contradictions
  - [ ] Update lastEvidenceAt for all active clients

**Owner:** Codex  
**Cadence:** Weekly Monday 09:00  
**Output:** Approval-queue item for each correction (Dillon approves registry write)

### Credential Rotation
- [ ] Rotate WordPress (deborah-mara) + Anthropic + GoDaddy + Google (momentumlocalseo)
  - [ ] Delete Slack messages with plaintext creds (5 messages)
  - [ ] Verify no synced transcripts contain new secrets
  - [ ] Set rotated creds as Windows user env vars (never paste in chat)

**Owner:** Lane 1 (executing decision) + Lane 3 (auditing)  
**Gate:** Dillon approval in brief  
**Timeline:** Complete by Wed 2026-09-20

### Off-Device Backup Setup
- [ ] Name backup destination (Dillon decision from Monday brief)
- [ ] Set up automated sync for 575 films + 14.8 GB untracked media
- [ ] Mirror 56 orphan git repos to GitHub
- [ ] First backup completed by Fri 2026-09-22

**Owner:** Lane 2 or Lane 4 (infrastructure)  
**Timeline:** Complete by Fri 2026-09-22  
**Verification:** Check backup restored sample file successfully

---

## SECOND WEEK (Mon 2026-09-25 to Fri 2026-09-29)

### Metrics Baseline (Success Check #1)
- [ ] Count unsent client emails (should be ≤ 2, was 29)
- [ ] Count unretrieved outputs (should be ≤ 2, was 23+ films)
- [ ] Count open approval-queue items > 24 hrs (should be 0)
- [ ] Registry sync completeness (should be 100%)
- [ ] Client Slack channels populated (should be 100%)

**Owner:** Codex (automated report)  
**Cadence:** Every Friday 15:00  
**Target by 2026-09-29:** All metrics at "healthy" baseline

### Continued Daily Execution
- [ ] Decision briefs generated 08:00 daily (Mon-Fri)
- [ ] Approved items executed 10:00 daily
- [ ] Approval-queue emptied by 17:00 daily
- [ ] No item sits in queue > 24 hrs without escalation

**Owner:** Lane 2 + Lane 1  
**Cadence:** Daily  
**Verification:** approval-queue.md timestamp audit

### AI Division Decisions (If Mac Frederick Call Happened)
- [ ] Brief D01 charter decision (is AI division under Momentum?)
- [ ] Brief D04 pricing decision ($1.5K + $750/mo confirm?)
- [ ] Brief D07 support commitment decision
- [ ] Brief D10 outbound decision (has outbound started?)
- [ ] Brief D18 spend decision (what's authorized?)

**Owner:** Lane 2 (Codex) + Lane 4 (Astra for deeper context if needed)  
**Gate:** Mac Frederick call calendar confirmation  
**Output:** Five decision briefs (Dillon approves, executes, archives)

---

## BY MONTH-END (2026-10-18) — Success Metrics

| Metric | Current | Target | Owner |
|--------|---------|--------|-------|
| Unsent client emails (aged) | 29 | 0 | Lane 1 |
| Unretrieved outputs (films, reports, audits) | 23+ | 0 | Lane 1 |
| Open approval-queue items > 24 hrs | ~40 | 0 | Lane 2 |
| Registry current (lastEvidenceAt verified) | ~50% | 100% | Lane 2 |
| Clients with Slack routes | 50% | 100% | Lane 2 |
| Conversion defects remediated (days to fix) | >14 | <2 | Lane 3 |
| Client churn signals caught (hours) | 72+ | <24 | Lane 1 |
| Credential leaks in chat | 5+ | 0 | Lane 3 |
| Off-device media backup up-to-date | None | Daily sync | Infra |
| Git repos with no remote | 56 | 0 | Infra |

**Baseline check:** Friday 2026-09-22 15:00 (after first week)  
**Progress check:** Friday 2026-09-29 15:00 (after second week)  
**Final check:** Friday 2026-10-18 15:00 (success validation)

---

## Model Routing During Transition

**This week, use this router:**

```
Routine daily work:
  → Luna medium (Codex, registry, approvals)
  
Client-facing work:
  → Sol medium (drafting) 
  → GPT-5.5 xhigh only if blocking

Account audits:
  → Cursor high (defect diagnosis)
  → Astra xhigh only if unresolved

Momentum platform / films / brand:
  → Astra high (when explicitly named)
  → Video editing = Astra high (standing decision)

Question: What model should I use?
  Answer: Check LANE-DISPATCH.md model-routing decision tree
```

**No change to MASTER-ORCHESTRATOR.md.** Lane Dispatch is an ADD, not a replacement.

---

## Blocker Resolution (Pre-Requisites)

### ✅ Before Monday 09:00
- [ ] Dillon reads LANE-DISPATCH.md (confirms understanding)
- [ ] Off-device backup destination identified (Dillon decision)
- [ ] Mac Frederick call scheduled (AI Division D01-D20 blocker)

### ⚠️ Unblocking Items (Dillon Decisions Needed This Week)
- [ ] Omega negatives: approve apply or hold?
- [ ] Films: accept/reject 23 renders?
- [ ] Weekly reports: send or hold Sep 7-13 batch?
- [ ] Credential rotation: confirm rotation paths?
- [ ] Backup destination: OneDrive / B2 / S3 / other?
- [ ] AI Division: can we schedule Mac on [specific date]?

**If these decisions are not made by Fri 17:00, items auto-archive with "pending user decision" status** (they do not rot in queue longer).

---

## What Each Lane Delivers (Weekly Report Format)

### Lane 1 Report (Client Delivery)
```
Weekly: [Monday] [Client Count] executed [N] approved decisions
├─ Sent: [N] client emails (list clients)
├─ Deployed: [N] deliverables (list types)
├─ Escalated: [N] blockers to Lane 3 (list)
├─ Churn signals: [N] detected (list)
└─ Next: [Monday next week deliverables]
```

### Lane 2 Report (Operations)
```
Weekly: [Monday] Decision briefs [N] generated, [X] approved, [Y] held
├─ Registry updates: [N] clients, [N] fields populated
├─ Automations: [N] healthy, [N] paused, [N] fixed
├─ Escalations: [N] to Lane 1, [N] to Lane 3
└─ Next: [Registry reconciliation items for next week]
```

### Lane 3 Report (Audits)
```
Weekly: [Monday] Audits [N] completed, [N] defects found, [N] fixes proposed
├─ Audited: [client list]
├─ Defects: [N] high, [N] medium, [N] low priority
├─ Fixes proposed: [N] cost $X, risk [low/med/high]
└─ Next: [Follow-up audits for clients with fixes deployed]
```

### Lane 4 Report (Innovation)
```
Weekly: [Project-driven, no weekly cadence unless work active]
├─ In progress: [project name] branch [feature/...]
├─ Ready for review: [deliverable] link [URL]
├─ Awaiting decision: [scope/deployment/approval gate]
└─ Next: [Merge/test/deploy milestone]
```

---

## Rollback Plan (If Needed)

**If Lane Dispatch is not helping by 2026-09-25:**
1. Archive LANE-DISPATCH.md (move to System/archive/)
2. Keep MASTER-ORCHESTRATOR.md (it's still correct)
3. Go back to pre-lane agent model (status quo)
4. Dillon + Gordon analyze what didn't work, iterate

**Fallback is low-risk:** Lanes are an organizational pattern on top of existing model routing. Removing lanes ≠ removing agents.

---

## Success Signals (You'll Know It's Working When)

✅ Dillon's inbox has fewer approval decisions to make (they're batched in daily briefs)  
✅ Client emails get sent the day they're drafted (not archived as drafts)  
✅ Rendered films get approved/rejected within 48 hrs (not sitting for 7 days)  
✅ Conversion defects get fixed same-week (not months later)  
✅ Agents stop asking "which agent should this go to?" (LANE-DISPATCH.md is the answer)  
✅ Approval-queue.md stays short (qs < 20 items) and fresh (no items > 24 hrs old)  
✅ Registry stays current (Monday reconciliation catches all changes)  
✅ Client Slack channels are populated (no invisible clients)

---

## Next Step

**Right now (before Monday):**
1. Dillon reads `System/LANE-DISPATCH.md`
2. Dillon decides: off-device backup destination
3. Dillon schedules: Mac Frederick call (AI Division gate)

**Monday 09:00:**
1. Codex generates first decision briefs
2. Dillon approves/rejects/asks questions
3. Lane 1 executes approved items at 10:00

---

Last updated: 2026-09-18 (Gordon synthesis)  
Next checkpoint: 2026-09-22 15:00 (first week metrics)
