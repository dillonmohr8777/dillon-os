# Competitive Task — 2026-08-23

## Coverage

- **Gmail:** fallback — MCP not connected; `COMMS-2026-08-17` shows `gmail: failed`. Refreshed `System/urgent-replies.md` from approval queue + July 30 intake.
- **Slack:** fallback — MCP not connected; `slack: failed` in comms ingest. Rebuilt `System/slack-action-queue.md` from `00_Inbox/slack/` captures (4 open Momentum threads from July 30).
- **Vault pulse:** 23 canonical routes (Aug 7 index); most `last_touched` missing or >7 days. NKCDC + Replenish touched 2026-08-01. Two registry reconciliation flags (Capsule & Tonic, Everyday Life Insurance).
- **Sessions:** 7 files in `10_Sessions/`; Rockbot codex-rollouts through 2026-08-12 inventoried. Session Index updated.
- **Ads/SEO:** Campaign optimization queues empty; P0s in approval queue (Replenish billing, Momentum gates, landing page build queue).
- **Content routines:** **done** — Sunday. Drafted `03_Content/Bok Law — week of 2026-08-24.md` and `03_Content/Align HCM — week of 2026-08-24.md`.

## P0 Stack

1. **Replenish billing block** — Confirm Mia completed Google Ads payment screen; verify ad delivery after account-side update. Engagement pause risk if billing stays unresolved. **Approval-gated** for any outreach to Mia.
2. **Momentum 360 Slack quartet (July 30, still open)** — Jenny brand direction, Sean CallRail status, Jason/Sean bot case-status alerts, Melissa guidelines training. All approval-gated; gather evidence before drafting exact replies.
3. **Client roster reconciliation** — 23 vs 14 active count contradiction; Capsule & Tonic and Everyday Life Insurance need disposition confirmation before portfolio reporting.
4. **KJB + Fagan + Shadow delivery lanes** — FAQ crop/QA, attribution repair, Meta visibility (see urgent-replies Immediate).
5. **Sunday content ship** — BOK and Align week-of-2026-08-24 drafts ready in `03_Content/`; route to Dorothy (BOK) and Align scheduling after review.

**Next tier:** Prospect radar 207-rebuild queue (background factory, not operator P0); gateway telemetry stale per Aug 17 brief.

## Urgent Replies

See [[System/urgent-replies]] and [[System/slack-action-queue]].

- **Replenish / Mia** — billing follow-up then delivery verification (approval-gated)
- **Jenny / NeedMomentum** — brand direction + timeline after Mac/Sean confirm (approval-gated)
- **Sean / CallRail** — activity evidence reply (approval-gated)
- **Jason + Sean / bot** — stability + case-status ETA (approval-gated)
- **Melissa** — guidelines training status + meeting slot (approval-gated)

## Stalled Clients (7+ days)

| Client | last_touched | Gap |
|--------|--------------|-----|
| Most active clients | missing or pre-Aug | No operational frontmatter pulse |
| NKCDC | 2026-08-01 | Launch / landing page status unknown in vault |
| Replenish | 2026-08-01 | Billing block active |
| BOK Law | 2026-08-01 | Content workflow OK; ship new week drafts |

**Data gaps:** Capsule & Tonic, Everyday Life Insurance — active in vault, no canonical registry match.

## Content / SEO Due Today

- **Sunday 2026-08-23** — content-routines executed: BOK + Align LinkedIn drafts for week of Aug 24.
- **Thursday** — book-site SEO sweep runs next (if `05_Book/seo-strategy.md` exists).
- Align `linkedin-calendar.md` still shows April–May 2026 — refresh when August drafts ship.

## Tomorrow Prep

1. **Monday 8/25** — Align thought-leadership post (script in week file); BOK Wed Wisdom ships 8/27.
2. Resolve top Momentum approval gates if Mac/Sean/CallRail evidence is available.
3. Connect **Gmail + Slack MCP** on orchestrator automation to exit vault-fallback mode.
4. Disable **7 legacy crons** in Cursor if still active (see [[System/competitive-task-definition]]).
5. Touch any account worked today — update `last_touched` on client overview.

## Umbrella note

This brief replaces seven separate operator crons. Background systems (daily driver, prospect radar, Grok intel) still run underneath — see [[System/routine-health]].
