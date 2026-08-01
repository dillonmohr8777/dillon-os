---
tags: [project]
status: active
updated: 2026-08-01
due: 2026-08-08
source: "[[handoffs/marketing-chief-intake-2026-07-22]]"
owner: Dillon Mohr
area: marketing-chief
---

# Marketing Chief Week Ops

**Summary:** evidence-backed execution board for the Jason/Sean EOM agenda,
Marketing Chief intake, and Tier-0 Dillon OS automations for the week of
2026-08-01.

## Goal

Classify each EOM deliverable as built / tested / blocked / approval-required,
keep VA Claims as the top unblock, run safe automations, and leave only exact
human gates for Tier-2 actions.

## Jason / Sean EOM agenda

| # | Deliverable | Classification | Evidence | Next action |
|---|---|---|---|---|
| 1 | Chatbot | Built, blocked on live finish | July 23 HubSpot/credits ask; July 30 validation item #3 (greeting / service / contact-capture test) | Jason HubSpot login session + credit confirmation, then public-site test |
| 2 | CallRail after-hours + SMS | Built + partially tested; Voice Assist off | July 30 `#calls` verified summary; Mia autoresponses verified; daily 9:00 AM ET summary installed; after-hours controlled test requested of Sean | Confirm Sean's after-hours test results; keep Voice Assist and new SMS routes approval-gated |
| 3 | Internal Agent workflows | Built (guide); rollout open | Account Manager AI Workflow Guide + walkthrough in `#ai-tech-news`; Melissa guidelines/Loom still open | Convert guide into role cards; book Melissa training slot |
| 4 | Reinstated-case alerts | Approval-required / blocked | Jason group-DM ask 2026-07-30 09:32 ET still unanswered in-thread; validation item #5 needs Jason portal permissions | Draft reply ready; finish ticket/workflow permissions, then test Sean+Jason notify |

## Highest-priority unblock

- `wi-20260717-0011` VA Claims — blocked until authorized access to
  `vaclaims-dev/vace-platform`. Local Phase 2 UI package was reported ready
  (45 assertions). No Vercel team available from prior desktop connector.

## Other open loops this week

1. [[12_Brain/09_Ops/Netlify Credits Suspension 2026-07-30|Netlify Credits Suspension]] — wait for 2026-08-06 reset or approve top-up.
2. [[01_Clients/Replenish/Google Ads Billing Block 2026-07-30|Replenish Google Ads Billing Block]] — Mia must complete account-side payment.
3. [[00_Inbox/slack/2026-07-30-melissa-guidelines-training-prompt|Melissa guidelines / Loom]] — verify status and meeting slot.
4. Slack AI reintegration — Codex Slack connector still needs interactive OAuth reconnection on the sole-writer desktop ([[handoffs/windows-6gb-slack-codex-reauth-2026-07-22]]).
5. Google Ads On-Site Pool number swap stale ≥5 days as of 2026-07-30 — investigate, no Voice Assist purchase without approval.

## Automation control surface (executed 2026-08-01)

| Automation | Result |
|---|---|
| `frontmatter-validate` | ok — 38/38 client notes complete |
| `site-health-sentinel --live` | fail — book site missing `/api/dossier-leads`; IMMOHRTAL missing tracking hints; fixture broken-form intentionally fails |
| `queue-status` | registry readable; outreach/site-factory still gated or external-dependent |
| LandingFolio MCP | sandbox-only until operator mints `LANDINGFOLIO_TOKEN` |

Cloudflare quick tunnel for this cloud-agent HUD session (ephemeral):
`https://rap-integrated-shots-protect.trycloudflare.com` → local
`http://127.0.0.1:4242`.

## Next actions

- [ ] Send or approve the drafted Jason reinstated-case reply (Tier 2).
- [ ] Collect Sean after-hours CallRail test results.
- [ ] Run chatbot public-site greeting / service / contact-capture test after HubSpot access.
- [ ] Inventory Netlify-suspended mapped sites before 2026-08-06.
- [ ] Keep VA Claims as P0 unblock on authorized repo access.
- [ ] Sole-writer host: reconnect Codex Slack OAuth, then ingest this board into the canonical Marketing Chief queue.

## Links

- Operator entity: [[12_Brain/entities/Marketing Chief Operator|Marketing Chief Operator]]
- Brief: [[Daily-Briefs/marketing-chief-week-ops-2026-08-01|Week Ops Brief]]
- Draft reply: [[Daily-Briefs/drafts/2026-08-01-jason-reinstated-case-reply|Jason reinstated-case reply]]
- Handoff: [[handoffs/marketing-chief-intake-2026-07-22]]
- Comm map: [[12_Brain/10_Maps/Communication Intelligence Map|Communication Intelligence Map]]
