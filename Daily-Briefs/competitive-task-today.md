# Competitive Task — 2026-09-02

Umbrella run: Phase 1 lanes synthesized from today's vault briefs + inbox (vault-fallback for live Gmail/Slack).

## Coverage

| Lane | Status | Notes |
|------|--------|-------|
| Inbox intel | ok | 23 inbox notes triaged in morning brief; 4 M360 Slack asks still open |
| Gmail | vault-fallback | No live MCP; urgent-replies refreshed from vault + inbox-brief |
| Slack | vault-fallback | 4 overdue M360 threads in `System/slack-action-queue.md` |
| Vault pulse | ok | 40/40 clients stalled on `last_touched`; Cindy May `due` 1 day overdue |
| Session sync | ok | Session Index sparse; daily-driver receipts through 2026-08-18 in inbox |
| Ads/SEO | ok | Queues read; Bar Crawl disapprovals still in approval-queue |
| Automation health | yellow | Umbrella restored today; legacy routine-health was April-era |
| Content routines | skipped | Wednesday — not Sun/Thu |

## P0 Stack

1. **Jack Lesser / With Not For call — 10:00 AM today** (hard calendar). Prep from sent Puttery drafts + approval-queue. *(may be complete if call already happened at 1 PM run time)*
2. **Cindy May Christmas — `due: 2026-09-01`, 1 day overdue.** Only real active deadline in client set; blocked on video/newsletter/photo/Shopify deps per overview.
3. **Momentum 360 Slack quartet — ~5 weeks unanswered.** Jason/Sean bot alerts, Jenny brand direction, Melissa Loom/meeting, Sean CallRail status. Draft replies → approval-queue before send.
4. **40-client stall pattern — not one fix.** Tags 2 Go freshest stall (26d) with blown `due: 2026-08-08`; pick 3–5 high-value touches per plan, not a full sweep.
5. **BOK weekly content kit — prep only, window 2026-09-08–10.** 96% recurrence; locate source packet before drafting (predicted-work brief).

## Urgent Replies

See `System/urgent-replies.md` (refreshed 2026-09-02). Morning inbox pass confirmed Puttery drafts **sent**; M360 Slack items remain the live comms debt.

## Stalled Clients (headline)

All 40 clients show `last_touched` > 26 days. This is a vault hygiene signal, not proof every account is dead — filesystem mtimes on this checkout are uniform (git artifact). **Touch priority subset today:** Cindy May, Tags 2 Go, Momentum 360 (comms), BOK (prep).

## Automation Health

- **This automation** is now the canonical afternoon umbrella (replaces 7 legacy Cursor crons + morning-loop duplication).
- **Keep on Windows:** daily-communications-brain (7 AM ingest), Claude daily driver (bounded routines), Prospect Radar (5:20 AM), obsidian-guard-dog (8:30 AM).
- **Canonical client-operations queue:** unreachable from cloud — predictions and pulse carry blind-spot flags.
- **Claude daily driver:** recent inbox receipts show mostly `noop` cycles; budget ceiling hit 2026-08-18.

## Content / SEO Due Today

Skipped (not Sunday or Thursday).

## Tomorrow Prep

- Carry M360 Slack drafts into morning block if not sent today.
- BOK: fingerprint weekly PDF packet before 2026-09-08 window.
- Goal-count reconciliation: OS Config `goal_current: 14` vs Client Index `23` — flag for brain-review.
- Disable duplicate Cursor automations once three green umbrella runs confirm coverage.

## Approval Gates (do not auto-execute)

Credential rotations (Resy, git-exposed secret), client account changes, and all items in `System/approval-queue.md` remain Tier 2.
