---
note_type: reconciliation_review
status: active
created: 2026-09-01
updated: 2026-09-01
owner: Dillon Mohr
review_cadence: ad-hoc
verification_status: live-verified
summary: Three of six repositories are public, mohr-vault with a personal phone number in a tracked note. A live connector probe and a Slack and Calendar sweep on 2026-09-01 found six usable claude.ai connectors, an autonomous loop that has not run since 2026-08-19, and five active client routes missing from the canonical registry. The missing routes are why the next-action predictor has nothing automatic to hand out.
source_refs:
  - "[[System/tool-access-catalog]]"
  - "[[System/operating-status]]"
  - "[[12_Brain/09_Ops/Health]]"
  - "[[12_Brain/state/connector-health.json]]"
  - "Slack #puttery, 2026-08-27 to 2026-08-31 (channel C0BT1P1PGJF)"
  - "Slack #nexla, 2026-08-18 to 2026-08-31 (channel C0BRY1H1L9W)"
  - "Slack #deborah-mara, 2026-08-18 to 2026-08-24 (channel C05UM2X3FQS)"
  - "Slack #capsule-and-tonic, 2026-08-24 to 2026-08-31 (channel C04MB3ZQ7FT)"
  - "Slack #everyday-life-insurance, 2026-08-20 to 2026-08-25 (channel C051QQL8UNS)"
  - "Slack #onsite-construction, 2026-08-24 to 2026-08-27 (channel C087GM7SEJF)"
  - "Google Calendar primary, events 2026-09-01 to 2026-09-08"
  - "client-operations-canonical registry/clients.json (24 records) and queue/work-items.json revision 423"
  - "client-operations-canonical claude/repo-analysis-1bien2-local commits 7bee8d8 and b41a027; Puttery VERIFICATION_2026-09-01.md"
tags:
  - brain
  - review
  - connectors
  - roster
  - reconciliation
---

# 2026-09-01 - Connector and Roster Reconciliation

The operating system is starved, not broken: the loop stopped writing on 2026-08-19, and the five clients Slack is busiest about do not exist in the registry the predictor routes against.

## What was verified live

| Surface | Result | Evidence |
|---------|--------|----------|
| Slack | usable | 34 member channels listed; ten channels read for the last 14 days |
| Gmail | usable | thread search over three days returned about 200 threads, mostly automated notifications |
| Google Calendar | usable | 25 events over the next week on the primary calendar |
| Google Drive | usable | six most recent files listed, all touched 2026-09-01 |
| GitHub | usable | authenticated; 90 open PRs across five repositories counted |
| HyperFrames by HeyGen | usable | connected today, zero projects |
| Netlify, WordPress.com | installed, not enabled in chat | need a toggle in the chat connector settings |
| Remote-environment Netlify token | rejected (HTTP 401) | the GitHub Actions secret used by the radar deploy is separate and works |
| OpenAI key | empty variable | Codex CLI installs but cannot authenticate |

Composio-observed connectors from 2026-08-18 (Search Console, Google Ads, Meta, HubSpot, Analytics) are kept in the state file as history and read as expired until re-verified.

## The loop is not running

| Signal | Last wrote |
|--------|------------|
| Claude daily driver | 2026-08-19 |
| Claude loop checkpoint | 2026-08-13 |
| Daily communications brain | 2026-08-17 (last success 2026-08-09) |
| Connector health (Composio pass) | 2026-08-18 |
| Site health sentinel | 2026-07-29, dry run, errored |
| client-operations system health and intake sync | 2026-08-16, intake scanned zero items |
| client-operations training checkpoint | 2026-08-05 |
| Prospect radar (GitHub Actions) | 2026-09-01, green, 29 runs |

The radar is the only automation alive. The HUD now shows this as a Loop Health panel: 33 loops tracked, 2 fresh, 18 dead, 13 never recorded.

## Roster drift

Slack channels with client activity in the last 14 days, compared with the canonical registry (24 records) and the vault's `01_Clients/` folders.

| Slack channel | Registry | Vault folder | What the channel shows | Action |
|---------------|----------|--------------|------------------------|--------|
| #puttery | missing | missing | Channel opened 2026-08-27. Quote sent 2026-08-27, payment before 2026-09-01. Dillon is delivering a branded dashboard plus reservation attribution in a two-week build; August progress report posted 2026-08-31. Access packet still open: Tock API and webhook, GA4 and GTM, Google Ads and Meta, CMS. Integration kickoff call 2026-09-01 15:00 ET. | Register as `puttery-nyc` (the desktop already uses `clients/puttery-nyc`), tier critical. Open a work item for the access packet and the two-venue-day booking validation. |
| #nexla | missing | missing | Onboarded 2026-08-20. Dillon is Account Manager, Sean is Operations Manager. Google Ads management; August report posted 2026-08-31 with spend, clicks, and CPC. Next is confirming the primary conversion and valid-lead criteria. | Register as `nexla`, tier strategic. Open a work item for conversion definition. |
| #deborah-mara | missing | missing | New quote signed 2026-08-18: Meta lead ads with landing pages, Google search campaign, ChatGPT ads test, site maintenance. Beth is AM, Sean and Muhammad build. New site targeted live 2026-09-01. Dillon invited to the internal "new ads" call 2026-09-02 15:00 ET. | Register as `deborah-mara`, tier standard, with Dillon's role confirmed at the 2026-09-02 call. |
| #capsule-and-tonic | missing | present | Beth is AM. Google Ads bidding and location change on 2026-08-18 lifted weekly conversions from 1 to 5 at a lower cost per conversion. September GBP calendar drafted. | Register as `capsule-tonic`. Confirm whether Dillon owns the ads lane. |
| #everyday-life-insurance | missing | present | Bella and Tiffany run the SEO lane; paid-link comparison and on-page approvals pending with the client. | Register as `everyday-life-insurance`. Dillon's role appears to be advisory; confirm. |
| #onsite-construction | present as `onsite-concrete-landscape` | present | Dillon runs Google Ads; weekly report posted 2026-08-24. Grace asked on 2026-08-27 for lead tracking so conversions can be matched to real leads. | Add the channel name to the registry record. Open a lead-tracking work item; this is a reversible local build. |
| #green-slate-masonry | missing | missing | No messages in 14 days. | Leave unregistered; historical only. |
| #gmbs-reinstatement | not a client | none | Momentum's own suspension-recovery lead product; raw lead submissions arrive by Zapier. | Never mirror this channel into the vault. It carries direct identifiers. |

Two of the five missing routes, Puttery and Nexla, have Dillon as the named account manager. That is where the predictor's automatic lane should be busiest, and it cannot see either.

## Why the predictor is empty

`Get-NextActions.ps1` refuses automatic work unless the client route is exact and active in the registry, routing was verified within 14 days, and evidence is current. Of 16 open work items, all 16 fail the freshness gates and 14 are approval-gated anyway. No item is in a ready, triaged, or in-progress status. Intake last scanned on 2026-08-16 and found nothing. The ranker is behaving correctly on inputs that stopped arriving.

## Proposed registry patch

To be applied on the desktop by the canonical writer, then validated with `Test-ClientRegistry.ps1`. Each entry needs a matching `clients/<id>/CLIENT.md`. Email domains and contacts are left empty rather than guessed; map them through Access Broker.

```json
[
  {
    "id": "puttery-nyc",
    "displayName": "Puttery",
    "aliases": ["Puttery", "Puttery NYC", "puttery", "puttery-nyc"],
    "status": "active",
    "folder": "clients/puttery-nyc",
    "emailDomains": [],
    "contacts": [],
    "slackChannels": ["puttery"],
    "accessRefs": [],
    "accessMappingRequired": true,
    "accessMappingReason": "Tock API and reservation webhook, GA4 and GTM, Google Ads, Meta, and CMS access are requested but not yet granted.",
    "affiliationConstraints": [
      { "relation": "client-of", "organizationId": "momentum-360", "portfolioOwner": "momentum-360", "observedAt": "2026-08-27", "sourceLocator": "slack://channel/C0BT1P1PGJF", "confidence": 0.99 }
    ],
    "lastEvidenceAt": "2026-09-01",
    "evidence": ["exact Slack channel route", "quote sent 2026-08-27", "August progress report 2026-08-31", "integration kickoff call 2026-09-01"]
  },
  {
    "id": "nexla",
    "displayName": "Nexla",
    "aliases": ["nexla"],
    "status": "active",
    "folder": "clients/nexla",
    "emailDomains": [],
    "contacts": [],
    "slackChannels": ["nexla"],
    "accessRefs": [],
    "accessMappingRequired": true,
    "accessMappingReason": "Google Ads access was confirmed in Slack on 2026-08-20; map the exact account through Access Broker before any mutation.",
    "affiliationConstraints": [
      { "relation": "client-of", "organizationId": "momentum-360", "portfolioOwner": "momentum-360", "observedAt": "2026-08-20", "sourceLocator": "slack://channel/C0BRY1H1L9W", "confidence": 0.99 }
    ],
    "lastEvidenceAt": "2026-08-31",
    "evidence": ["exact Slack channel route", "onboarding notes 2026-08-20 naming Dillon as account manager", "August report 2026-08-31"]
  },
  {
    "id": "deborah-mara",
    "displayName": "Deborah Mara Real Estate",
    "aliases": ["Deb Mara", "Deborah Mara", "deborah-mara"],
    "status": "active",
    "folder": "clients/deborah-mara",
    "emailDomains": [],
    "contacts": [],
    "slackChannels": ["deborah-mara"],
    "accessRefs": [],
    "accessMappingRequired": true,
    "accessMappingReason": "Ads lane starts September 2026 under a new quote; Dillon's role and platform access are unconfirmed until the 2026-09-02 internal call.",
    "affiliationConstraints": [
      { "relation": "client-of", "organizationId": "momentum-360", "portfolioOwner": "momentum-360", "observedAt": "2026-08-18", "sourceLocator": "slack://channel/C05UM2X3FQS", "confidence": 0.95 }
    ],
    "lastEvidenceAt": "2026-08-24",
    "evidence": ["exact Slack channel route", "new quote signed 2026-08-18", "weekly update 2026-08-24", "calendar invite 2026-09-02"]
  },
  {
    "id": "capsule-tonic",
    "displayName": "Capsule & Tonic",
    "aliases": ["Capsule and Tonic", "capsule-and-tonic", "capsule-tonic"],
    "status": "active",
    "folder": "clients/capsule-tonic",
    "emailDomains": [],
    "contacts": [],
    "slackChannels": ["capsule-and-tonic"],
    "accessRefs": [],
    "accessMappingRequired": true,
    "accessMappingReason": "Google Ads and GBP are managed by the Momentum team; confirm whether Dillon holds the ads lane before mapping access.",
    "affiliationConstraints": [
      { "relation": "client-of", "organizationId": "momentum-360", "portfolioOwner": "momentum-360", "observedAt": "2026-08-24", "sourceLocator": "slack://channel/C04MB3ZQ7FT", "confidence": 0.95 }
    ],
    "lastEvidenceAt": "2026-08-31",
    "evidence": ["exact Slack channel route", "weekly performance updates 2026-08-24 and 2026-08-31", "vault folder 01_Clients/Capsule & Tonic"]
  },
  {
    "id": "everyday-life-insurance",
    "displayName": "Everyday Life Insurance",
    "aliases": ["Everyday Life", "everyday-life-insurance"],
    "status": "active",
    "folder": "clients/everyday-life-insurance",
    "emailDomains": [],
    "contacts": [],
    "slackChannels": ["everyday-life-insurance"],
    "accessRefs": [],
    "accessMappingRequired": false,
    "accessMappingReason": "SEO lane is run by other Momentum team members; Dillon's role is advisory until confirmed.",
    "affiliationConstraints": [
      { "relation": "client-of", "organizationId": "momentum-360", "portfolioOwner": "momentum-360", "observedAt": "2026-08-20", "sourceLocator": "slack://channel/C051QQL8UNS", "confidence": 0.9 }
    ],
    "lastEvidenceAt": "2026-08-25",
    "evidence": ["exact Slack channel route", "SEO lane messages 2026-08-20 to 2026-08-25", "vault folder 01_Clients/Everyday Life Insurance"]
  }
]
```

Also add `"onsite-construction"` to the `slackChannels` of `onsite-concrete-landscape`.

## Repository visibility

Checked through the GitHub API on 2026-09-01. Three of the six repositories are public.

| Repository | Visibility | Why it matters |
|------------|-----------|----------------|
| dillon-os | private | correct |
| client-operations-canonical | private | correct |
| dillon-claude-config | private | correct |
| mohr-vault | **public** | `vault/00_Memory_File.md` carries a personal phone number and email; `vault/01_Clients` and `11_Agents` hold historical client notes and the system prompt |
| claude-skills-repo | **public** | deliberately public for the credential-free Align marketplace install (commit 24e6c5f), but it also ships Hope Wellness client media under `vault/01_Clients` |
| bridge-software-frontend | **public** | a client's pre-launch product source and decision logs |

Recommended: flip mohr-vault to private now; it is historical and nothing installs from it. Decide separately whether claude-skills-repo stays public, and if so move the client media out. Confirm with Tori and Miraj whether Bridge should be public before launch.

## Puttery Tock integration

Codex reported on 2026-09-01: credentials protected in Windows Credential Manager and Access Broker; Puttery NYC bound to Business Group 28086 and Business ID 37824; receiver tests 13/13; protected end-to-end passed; a credentialed Tock API check at 20:31Z returned HTTP 503, so the credential is unvalidated; a durable public webhook host, vendor registration, a rotated credential, and a controlled real reservation are still required.

Unauthenticated probes at 20:50Z show the Tock host alive (docs 200, unknown paths 400), so the 503 is scoped, not global. The durable public host now exists as a deploy-ready Netlify relay with a drain client, on branch `claude/repo-analysis-1bien2` of client-operations-canonical under `clients/puttery-nyc/deliverables/2026-09-01-tock-reservation-webhook/public-relay/`, with the 503 triage protocol, vendor registration draft, rotation runbook, and controlled-test protocol in its `PRODUCTION_PLAN.md`. Deployment, the vendor request, and the rotation stay gated.

Local follow-up on the desktop, 2026-09-01 21:35Z to 21:48Z (branch `claude/repo-analysis-1bien2-local`):

- 503 triage through the redacted credential wrapper: no credential answers 403 with an empty body; a random wrong credential answers 503 with the same 9,102-byte Cloudflare origin-error response shape the stored credential gets on three five-minute probes, with no `Retry-After`. This strongly indicates a failure upstream of credential validation. The stored credential is neither validated nor rejected; the next step is the vendor question in the existing Resy API Integrations thread, still a draft.
- Relay defects fixed before deploy: the webhook header now matches the receiver's `PutteryWebhookAuth` contract; the drain client posts each stored body to the receiver instead of writing an unread inbox; acknowledged blobs keep only a PII-free dedupe marker; both Netlify Functions use strong Blobs consistency; and only permanent payload errors (`400`, `413`, `415`, `422`) are dead-lettered while authentication, routing, rate-limit, server, and connection failures remain pending.
- Verified: relay suite 16/16 including the real drain script against a loopback fake; receiver suite 13/13; both Netlify adapters import with `@netlify/blobs` 11.0.2; production dependency audit reports 0 vulnerabilities; both PowerShell scripts parse in Windows PowerShell 5.1. The canonical Puttery package was reconciled into the clean worktree and repaired there without touching the dirty desktop canonical checkout, whose existing `puttery-nyc` registry record and queue revision 430 were read only.
- Git state: the Claude worker pushed branch commit `7bee8d8` before its session limit surfaced. Final reviewed hardening commit `b41a027` is local only and has not been pushed. No deploy, vendor message, credential rotation, repository visibility change, or canonical queue or registry write was performed.

## Next actions, ranked

1. Apply the registry patch on the desktop and create the five `CLIENT.md` files. Reversible, local.
2. Open work items for Puttery access packet, Puttery booking validation, Nexla conversion definition, and Onsite lead tracking. Local drafts; nothing sends.
3. Re-verify routing and evidence on the two automatic-tier items that fail only on freshness: Fagan lead reconciliation `wi-20260715-0002` and Tags 2 Go access mapping `wi-20260807-0001`.
4. Restart the daily driver and the client-operations daily calibration; both stopped in August. Check the scheduled tasks on the desktop.
5. Enable the Netlify and WordPress.com connectors in the chat, and install HubSpot and Vercel. Account changes; Dillon does these.
6. Re-run the Composio connector pass so Search Console and Google Ads observations are fresh again.

## Not done here

- No canonical queue or registry write. The desktop is the sole canonical writer.
- No Slack or email sent, no PR closed or merged.
- Gmail evidence was not compiled into client notes; today's inbox is automated noise and needs a filtered pass.
