---
note_type: project
status: active
created: 2026-09-07
updated: 2026-09-07T23:20:00Z
owner: Dillon Mohr
area: Momentum 360 / Jason Fallon HubSpot (portal 50612503)
priority: high
outcome: The Momentum 360 AI & lead-response daily health report reads READY (not DEGRADED) for three consecutive days, with the HubSpot browser session current, conversations.read granted, and CallRail account 671942387 membership restored — or each blocker is explicitly declined with a reason.
next_action: Message Jason (drafted, queued in System/approval-queue.md) to get the three blockers unblocked, then re-run `.\agent\Invoke-JasonHubSpotAgent.ps1 daily-health` (or the `Jason HubSpot Live Audit` GitHub Action) to confirm READY.
review_on: 2026-09-08
source_refs:
  - "[[01_Clients/Momentum 360/overview]]"
  - "slack:C0B2N20A0SW:1787317734.255549"
  - "slack:C0B2N20A0SW:1788268277.341379"
  - "slack:C06CL0R09A4:1788275752.416679"
  - "jason-fallon-hubspot-agent:evidence/LIVE_READINESS_2026-07-23.md"
  - "jason-fallon-hubspot-agent:commit:80b7c20"
tags: [brain, project, momentum360, hubspot, jason-fallon, reliability]
---

# Restore Momentum 360 HubSpot health

## Why this exists

The automated "Morning Momentum 360 AI & lead-response update" posted to Slack
(`#360marketing` and group DM `C0B2N20A0SW`) reported **Agent status: DEGRADED**
every single day from **2026-08-21 through 2026-09-01** (12 straight reports,
IDs M360-DAILY-2026-08-21 through -09-01). No daily report has appeared since
Sept 1 — 6 days of silence as of 2026-09-07 — which is itself unverified: either
the scheduled runner stopped firing, or it is posting somewhere unmonitored.
That silence is an open question, not a resolved one.

## Root causes (unchanged across all 12 degraded reports)

1. **`HUBSPOT_BROWSER_SESSION` blocked** —
   `blocked-session-expired-google-password-human-handoff`. Jason's (or
   whoever's) Google-authenticated HubSpot browser session expired, and only a
   human with the login can re-authenticate it. This is why Dillon said on
   2026-09-01, "I gotta login to his account, I know that" — the browser-based
   checks (live Customer Agent state, chatflow 96377499, contact-capture
   permissions, Help Desk handoff owner) cannot be verified without it.
2. **Missing `conversations.read` scope** on the valid portal 50612503 private
   app — Conversations channels/threads endpoints return HTTP 403. Separate
   defect from #1; needs a HubSpot admin (Jason or whoever owns the private
   app) to add the scope.
3. **CallRail account 671942387 (Momentum Digital LLC) direct access blocked**
   — `blocked-no-membership-after-authorized-google-consent-account-671942387-routes-to-not-found`.
   CallRail telemetry is only visible via the Slack event mirror, not directly.

Despite the DEGRADED label, the read-only portal token still returns aggregate
CRM data (contacts/tasks/CallRail-ingestion counts) every day — Dillon's own
assessment on 2026-09-01 was "it's a little bit dramatic because I still have
the portal token to give you the majority of the info." So this is a real,
sustained defect (12+ days), but not a total outage: qualification, live
Customer Agent behavior, Conversations, and owner-routing proof are what's
actually blind, not raw lead counts.

## Separate, already-resolved incident (for context, not part of this goal)

On 2026-08-17, Jason flagged leads "unsynced" after switching Google Ads
managers — organic landing-page leads were miscategorized as ad-campaign leads.
Dillon and Nick fixed the segment filters and UTM fields same day
(`#360marketing`, thread `1786986784.428959`). That thread is closed; it is
evidence of the account's fragility, not an open item.

## Live verification - 2026-09-07 23:13 UTC

Ran the repo's `Jason HubSpot Live Audit` GitHub Action (`all`) directly
against portal 50612503 using the protected read-only token — no login
required, nothing sent to Jason. Confirms the account is still live and
functioning, just still degraded for the same reason:

- **Status: still `degraded`.** Same single cause as every prior report:
  `conversations` optional probe fails with `HubSpot 403 MISSING_SCOPES`.
  The browser-session block that was in every Slack report through Sep 1
  isn't part of this token-based check (that only affects browser-UI
  verification, not the API), so this run can't confirm whether that part
  is still broken — only Jason logging in resolves that question.
- **No data loss.** Object totals grew normally since the 2026-07-23
  baseline: contacts 14,262 → 14,977, companies 6,730 → 6,913, deals 1,574 →
  1,690, calls 2,948 → 3,521. Today's window (Sep 6-7) shows 8 new contacts,
  4 new companies, 17 updated contacts.
- **New/worse symptom:** the CallRail date-window aggregate calls (calls,
  meetings, tasks, CallRail ingestion counts) now fail with `HubSpot 400:
  There was a problem with the request` instead of returning counts. Prior
  Slack reports (through Sep 1) got CallRail ingestion counts fine via this
  same code path — this is a regression worth a closer look, separate from
  the known conversations-scope and browser-session issues.
- Attribution audit: 14,977 contacts audited, 22.54% deterministic channel
  mapping coverage (up slightly from 19.29% on 2026-07-23), 11,601 still
  "Needs Review." Qualification, revenue attribution, and spend/ROI remain
  explicitly blocked pending business-definition approval — unchanged.

## Next actions

- [ ] Send Jason the drafted message (queued in `System/approval-queue.md`)
      asking him to: (a) log into HubSpot once to refresh the browser session,
      (b) confirm who owns/can edit the portal 50612503 private app so
      `conversations.read` can be added, (c) restore Momentum Digital LLC
      CallRail account 671942387 membership.
- [ ] Confirm whether the daily health runner is still scheduled — the report
      has been silent since 2026-09-01. Check the Windows scheduled task /
      Cursor cron that posts `M360-DAILY-*`, or re-run
      `npm run health` / the `Jason HubSpot Live Audit` GitHub Action manually.
- [ ] Once Jason acts, re-verify with `verify-ready` / `daily-health` and
      confirm three consecutive READY days before closing this project.
- [ ] Investigate the new CallRail date-window HTTP 400 (found in the
      2026-09-07 live audit) separately from the three known blockers — it's
      a regression from the counts that worked through Sep 1.

## Completion boundary

This project does not authorize any HubSpot write, login, password reset, or
CallRail account change on Dillon's behalf — those require Jason's own
credentials and action per `jason-fallon-hubspot-agent/CLAUDE.md`'s
account-isolation rule. This tracks getting Jason to unblock them and
confirming the fix, not doing it for him.
