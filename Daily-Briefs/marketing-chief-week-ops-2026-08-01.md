---
note_type: brief
status: active
created: 2026-08-01
updated: 2026-08-01
owner: Dillon Mohr
tags: [brain, brief, marketing-chief, automations, momentum360]
source_refs:
  - "[[handoffs/marketing-chief-intake-2026-07-22]]"
  - "slack:workspace:T066HGS7N"
---

# Marketing Chief Week Ops Brief — 2026-08-01

## Verdict

Took over from vault + live Slack evidence. Jason/Sean EOM items are mostly
built; the week is validation, permissions, and approval gates — not greenfield
build. Canonical Marketing Chief queue remains on the sole-writer host; this
checkout owns Dillon OS automation registry/queue and compiled evidence.

## Control surfaces live now

1. HUD: `http://127.0.0.1:4242`
2. Cloudflare quick tunnel (ephemeral for this cloud run):
   `https://rap-integrated-shots-protect.trycloudflare.com`
3. Automations: `node _os/automation/bin/queue-status.js`
4. Operator guide: `_os/automation/docs/OPERATOR.md`

## EOM classification (Jason / Sean)

1. **Chatbot — built / blocked.** Knowledge base and HubSpot finish path already
   requested from Jason (2026-07-23). Still needs login session, Customer Agent
   credits, and a public-site greeting / service / contact-capture test.
2. **CallRail after-hours + SMS — built / partially tested.** July 30 verified:
   10 calls (3 connected / 5 unanswered / 2 abandoned), Mia autoresponses
   working, HubSpot ingested 15 CallRail records with contacts but 0% owner
   assignment. Daily 9:00 AM ET Slack summary installed. Sean was asked for two
   controlled after-hours unanswered calls. Paid Voice Assist stays off unless
   explicitly approved.
3. **Internal Agent workflows — built / rollout open.** Account Manager AI
   Workflow Guide + walkthrough published. Melissa guidelines/Loom meeting still
   open.
4. **Reinstated-case automation — approval-required.** Jason's 2026-07-30 ask is
   still unanswered in-thread. Draft reply is ready under
   `Daily-Briefs/drafts/`. Needs Jason portal permissions before a live notify
   test.

## P0 / blockers outside EOM

1. VA Claims `wi-20260717-0011` — no authorized `vaclaims-dev/vace-platform` access.
2. Netlify credits suspension — wait until 2026-08-06 or approve top-up.
3. Replenish Google Ads billing — Mia must complete payment screen.
4. Codex Slack OAuth on sole-writer desktop — still needs interactive reconnect
   for the Slack-to-AI command path.

## Automations executed this session

- `frontmatter-validate` → ok (38/38)
- `site-health-sentinel --live` → fail on book `/api/dossier-leads`; IMMOHRTAL
  tracking warn; Mohr Media pass
- No Slack posts, emails, deploys, SMS changes, or spend

## Exact approvals still needed from Dillon

1. Send the Jason reinstated-case draft.
2. Any CallRail Voice Assist purchase or new SMS/phone-routing change.
3. Netlify credit top-up (vs wait for Aug 6).
4. VA Claims repo / Vercel access grant.
5. LandingFolio token mint if design-reference MCP should leave sandbox-only.
