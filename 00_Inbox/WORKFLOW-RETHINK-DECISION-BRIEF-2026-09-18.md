---
note_type: decision_brief
status: ready_for_decision
created: 2026-09-18
owner: Codex (marketing-chief) + Gordon (synthesis)
target: Dillon Mohr
due: 2026-09-22
---

# Workflow Rethink — Quick Start Brief

**What:** Three-lane agent execution system (Client Delivery + Operations + Audit + Innovation) to replace finish-and-file rot with systematic approval → deploy → archive.

**Why:** 
- 29 unsent client emails aging in Gmail drafts
- 23 rendered films with zero accept/reject decisions
- 40+ items in approval-queue with no decision dates
- Agents finish work, don't know if/when to deploy

**How:** Four permanent agent lanes own execution end-to-end (no hand-offs = no delays).

---

## Decision #1: Adopt Lane Dispatch System?

**Option A (Recommended):** Adopt starting Monday 2026-09-18
- Lanes: Client Delivery (Lane 1), Operations (Lane 2), Audit (Lane 3), Innovation (Lane 4)
- Codex generates decision briefs 08:00 daily, Dillon approves by 17:00
- Lane 1 executes approved items 10:00 daily
- Registry reconciliation Monday 09:00
- **Cost:** 30 min read-in + 15 min/day decision review
- **Gain:** ≤24 hr approval lag, zero unsent client emails, churn detection < 24 hrs

**Option B:** Keep status quo (no lane system)
- Continue routing by explicit request
- Approval-queue remains backllog without decision dates
- Agents keep finishing → parking work
- **Cost:** Same 15 min/day problem-triage, no systematic improvement
- **Gain:** Zero change overhead

**Option C:** Hybrid (Lane 1 + 2 only, Lane 3/4 on-demand)
- Client Delivery + Operations lanes active
- Audit + Innovation stay as-needed
- Incremental adoption
- **Cost:** 15 min read-in, 10 min/day decision review (lighter)
- **Gain:** Email + report backlog cleared, approval-queue stays active

---

**MY RECOMMENDATION:** Option A (full adoption). It's the most complete and the lane structure reuses existing agent roles (Codex, Marketing Chief, Cursor, Astra). The 15 min/day is real but lighter than the current approval fatigue.

---

## Decision #2: Off-Device Backup Destination

**575 films (5.55 GB) + 14.8 GB untracked media need off-device copy today.**

**Options:**
1. **OneDrive** — Already running on this machine, 490 MB synced. Expand to include `repos/dillon-os` + `Documents/Codex/projects/`.
   - ✅ Built-in, no new service
   - ✅ Auto-sync
   - ❌ May hit OneDrive bandwidth limits
   - **Cost:** Free tier, but monitor quota

2. **Backblaze B2 + Rclone** — ~$6/month, 1 TB storage, unlimited uploads, automated sync
   - ✅ Reliable, documented restore
   - ✅ Scalable
   - ✅ Encrypted
   - ❌ One more service to maintain
   - **Cost:** $6/month + setup time

3. **AWS S3 + Rclone** — ~$15/month per TB, flexible
   - ✅ Scalable, enterprise-grade
   - ✅ Automated lifecycle policies (old backups auto-delete)
   - ❌ More expensive
   - **Cost:** $15-30/month depending on retention

4. **GitHub** (for repos only) + Backblaze (for media)
   - ✅ Repos already have remote (git push)
   - ✅ Separate tool per job (repos → GitHub, media → Backblaze)
   - ✅ Cheapest total ($6/mo + free GitHub)
   - ❌ Two services
   - **Cost:** $6/month + setup

---

**MY RECOMMENDATION:** Option 4 (GitHub for repos + Backblaze B2 for media).
- Repos belong in git anyway; mirror to GitHub takes 5 min per repo.
- Media backups are cheap on B2; setup automated Rclone sync nightly.
- **Total cost:** $6/month
- **Timeline:** Friday 2026-09-20 (both live)

---

## Decision #3: Mac Frederick Call (AI Division D01-D20 Gate)

**20 decisions are open and blocking all Momentum AI outbound. They need Mac's input on five items:**

- D01: Charter (is AI division under Momentum Digital with four lanes on site?)
- D04: Pricing ($1.5K setup + $750/mo, confirm?)
- D07: Support commitment (who covers weekends?)
- D10: Outbound (has outbound started; what's the reporting?)
- D18: Spend authorization (what's the approval ceiling?)

**Action:** Email Mac Frederick today (Wed 2026-09-18) with:
```
Subject: 30-min call — AI Division launch decisions (D01, D04, D07, D10, D18)

Hi Mac,

The AI division decisions from our Sept 5 launch kit are still open and blocking 
outbound activity. Can we schedule a 30-min call to get decisions on these five 
items?

D01: Charter (under Momentum Digital?)
D04: Pricing ($1.5K + $750/mo confirm?)
D07: Support commitment level
D10: Outbound launch status
D18: Spend authorization ceiling

Proposed times: [Mon 2026-09-23 / Tue 2026-09-24 / Wed 2026-09-25 10:00-11:00 ET]

Once we lock these, the team can start live outbound immediately.

— Dillon
```

**Timeline:** Send Wed 2026-09-18, call by Mon 2026-09-23 ideally.

---

## Decision #4: Credential Rotation (Five Leaks)

**Five plaintext credentials are in Slack/synced transcripts. They need immediate rotation:**

1. WordPress (deborah-mara) — posted by Muhammad 2026-09-11
2. Anthropic (sk-ant-*) — pasted in Claude Code 2026-09-14
3. GoDaddy (gd_pat_*) — pasted in Claude Code 2026-09-16
4. Google (momentumlocalseo@) — pasted in Claude Code 2026-09-17
5. Meta (implied, not yet verified in this session)

**Action:**
- Rotate each credential at its admin dashboard
- Delete Slack message (reduces human footprint, but transcript is already synced)
- Store rotated creds as Windows env vars (never paste in chat)
- Create audit gate: "No secrets pasted in chat after [date]"

**Timeline:** Friday 2026-09-20 completion.

**Cost:** 20 min + credential provider account access.

---

## Decision #5: Films — Accept/Reject 23 Renders

**Status:** 23 films rendered over weekend (2026-09-12), zero decisions made.

**Items:**
- 10 sector films (18s each)
- 10 concept films (18s each)
- 3 Momentum motion drafts
- Plus: one 30s master (NeedMomentumAILaunch30-review.mp4) with stale status

**Action needed:** Review each, mark accept/reject. Approved renders get:
- [ ] Verification (play actual file, check quality)
- [ ] Metadata (client, project, date, use case)
- [ ] Archival (if ship) or cleanup (if reject)
- [ ] Public alias decision (Netlify clay-films-* is currently live, unprotected, noindex)

**Timeline:** Batch review Wed 2026-09-18 (30 min), decisions by Thu 2026-09-19.

**Cost:** Decision time only; renders already done, no new generation cost.

---

## Decision #6: Weekly Client Reports (Sep 7-13)

**Status:** 10 staged Gmail drafts ready to send, but reports don't cover Sep 7-13 window.

**Action needed:**
- [ ] Verify: do live reports cover Sep 7-13? (currently say Sep 1-8)
- [ ] If no: rebuild reports for Sep 7-13 and redeploy
- [ ] If yes: send 10 drafts as-is

**Timeline:** Before sending, verify week coverage (5 min check).

**Cost:** Minimal if reports already built; 30 min rebuild if needed.

---

## Your Decision Summary (Check One)

**All decisions can be batched for one meeting/call:**

□ **YES — Adopt Lane Dispatch + approve Decisions #2-6 (30 min call Fri 2026-09-18 14:00)**

□ **NO — Hold on Lane Dispatch; proceed with [specific decisions only]**

□ **PARTIAL — Adopt Lanes, but hold on [specific decisions]**

□ **CUSTOM — [Your specific request]**

---

## If You Approve the Full Rethink:

**Monday 2026-09-18 first day of execution:**
1. Codex generates first decision briefs (08:00)
2. You approve/reject by 17:00
3. Lane 1 executes approved items (10:00 next day)
4. Registry reconciliation (Monday 09:00)
5. First metrics check (Fri 2026-09-22 15:00)

**Success baseline (by 2026-10-18):**
- ✅ Zero unsent client emails
- ✅ Zero unretrieved outputs
- ✅ Zero approval-queue items > 24 hrs old
- ✅ 100% client registry currency
- ✅ Churn signals caught < 24 hrs
- ✅ Conversion defects fixed < 48 hrs

---

## Files Created (Already in Vault)

1. `System/LANE-DISPATCH.md` — Full system design (15 KB)
2. `System/WORKFLOW-RETHINK-CHECKPOINT.md` — Implementation checklist (10 KB)
3. This brief — Quick start + decisions

**Read these in order:**
1. This brief (3 min)
2. WORKFLOW-RETHINK-CHECKPOINT.md (10 min)
3. LANE-DISPATCH.md (15 min total, skim for your lane)

---

## Recommendation

**GO.** The three-lane system reuses existing agents (Codex, Marketing Chief, Cursor, Astra) and adds one decision gate (daily 08:00 brief review). The 15 min/day is real, but it's less than the current approval fatigue and the gain is immediate (emails sent, defects fixed, churn caught).

Finish-and-file rot has cost you:
- Unsent client communication (churn risk)
- Delayed conversions fixes ($388/week Omega waste, $365/week Nexla spam)
- Undecided films (Momentum launch visual assets still pending)
- AI Division launch blocked (20 decisions, zero movement in 13 days)

Lanes fix it by making decision review a scheduled event, not a reactive surprise.

---

**Your call. What's the move?**

---

Last updated: 2026-09-18 (Gordon synthesis)  
Status: Awaiting Dillon decision
