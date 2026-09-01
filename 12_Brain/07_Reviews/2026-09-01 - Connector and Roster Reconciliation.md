---
note_type: reconciliation_review
status: active
created: 2026-09-01
updated: 2026-09-01
owner: Dillon Mohr
review_cadence: ad-hoc
verification_status: live-verified
summary: Three of six repositories are public, including mohr-vault with personal contact data in a tracked note. A live connector probe and Slack and Calendar sweep on 2026-09-01 found six usable claude.ai connectors, scheduled wrappers running today while several semantic checkpoints remain stale, and three active client routes still missing from the canonical registry.
source_refs:
  - "[[System/tool-access-catalog]]"
  - "[[System/operating-status]]"
  - "[[12_Brain/09_Ops/Health]]"
  - "12_Brain/state/connector-health.json"
  - "Slack #puttery, 2026-08-27 to 2026-08-31 (channel C0BT1P1PGJF)"
  - "Slack #nexla, 2026-08-18 to 2026-08-31 (channel C0BRY1H1L9W)"
  - "Slack #deborah-mara, 2026-08-18 to 2026-08-24 (channel C05UM2X3FQS)"
  - "Slack #capsule-and-tonic, 2026-08-24 to 2026-08-31 (channel C04MB3ZQ7FT)"
  - "Slack #everyday-life-insurance, 2026-08-20 to 2026-08-25 (channel C051QQL8UNS)"
  - "Slack #onsite-construction, 2026-08-24 to 2026-08-27 (channel C087GM7SEJF)"
  - "Google Calendar primary, events 2026-09-01 to 2026-09-08"
  - "client-operations-canonical registry/clients.json (26 records) and queue/work-items.json revision 430"
  - "client-operations-canonical claude/repo-analysis-1bien2-local commits 7bee8d8 and b41a027; Puttery VERIFICATION_2026-09-01.md"
tags:
  - brain
  - review
  - connectors
  - roster
  - reconciliation
---

# 2026-09-01 - Connector and Roster Reconciliation

The operating system is receiving scheduled triggers, but several semantic outputs stopped advancing in August. Three active Slack client routes remain absent from the registry the predictor routes against; Puttery and Nexla are now registered.

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

## Scheduled wrappers run; semantic outputs are stale

Windows Task Scheduler was verified again on 2026-09-01 at 18:38 ET. The Claude daily driver, Agent Memory sync, Gmail bridge, and Slack bridge all ran that day with result `0`. Their successful wrappers do not prove that downstream checkpoints or useful outputs advanced. The Prospect Radar Next 20 wrapper last ran at 05:20 ET with result `1` and needs separate diagnosis.

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

At 2026-09-01 22:42Z, the HUD's Loop Health panel reported 32 loops tracked: 2 fresh, 17 dead, and 13 never recorded. Read those counts as stale outputs and missing receipts, not proof that every wrapper is stopped.

## Roster drift

Slack channels with client activity in the last 14 days, compared with the canonical registry (26 records) and the vault's `01_Clients/` folders.

| Slack channel | Registry | Vault folder | What the channel shows | Action |
|---------------|----------|--------------|------------------------|--------|
| #puttery | active as `puttery-nyc` | missing | Channel opened 2026-08-27. Quote sent 2026-08-27, payment before 2026-09-01. Dillon is delivering a branded dashboard plus reservation attribution in a two-week build; August progress report posted 2026-08-31. Access packet still open: Tock API and webhook, GA4 and GTM, Google Ads and Meta, CMS. Integration kickoff call 2026-09-01 15:00 ET. | Keep the existing access-packet work item blocked on verified access and controlled booking validation. |
| #nexla | active as `nexla` | missing | Onboarded 2026-08-20. Dillon is Account Manager, Sean is Operations Manager. Google Ads management; August report posted 2026-08-31 with spend, clicks, and CPC. Next is confirming the primary conversion and valid-lead criteria. | Verify the existing route's conversion definition and current evidence before automatic work. |
| #deborah-mara | missing | missing | New quote signed 2026-08-18: Meta lead ads with landing pages, Google search campaign, ChatGPT ads test, site maintenance. Beth is AM, Sean and Muhammad build. New site targeted live 2026-09-01. Dillon invited to the internal "new ads" call 2026-09-02 15:00 ET. | Register as `deborah-mara`, tier standard, with Dillon's role confirmed at the 2026-09-02 call. |
| #capsule-and-tonic | missing | present | Beth is AM. Google Ads bidding and location change on 2026-08-18 lifted weekly conversions from 1 to 5 at a lower cost per conversion. September GBP calendar drafted. | Register as `capsule-tonic`. Confirm whether Dillon owns the ads lane. |
| #everyday-life-insurance | missing | present | Bella and Tiffany run the SEO lane; paid-link comparison and on-page approvals pending with the client. | Register as `everyday-life-insurance`. Dillon's role appears to be advisory; confirm. |
| #onsite-construction | present as `onsite-concrete-landscape` | present | Dillon runs Google Ads; weekly report posted 2026-08-24. Grace asked on 2026-08-27 for lead tracking so conversions can be matched to real leads. | Add the channel name to the registry record. Open a lead-tracking work item; this is a reversible local build. |
| #green-slate-masonry | missing | missing | No messages in 14 days. | Leave unregistered; historical only. |
| #gmbs-reinstatement | not a client | none | Momentum's own suspension-recovery lead product; raw lead submissions arrive by Zapier. | Never mirror this channel into the vault. It carries direct identifiers. |

Puttery and Nexla were added to the canonical registry before this review was reconciled. Deborah Mara, Capsule & Tonic, and Everyday Life Insurance remain the three missing routes; Onsite remains registered without its observed Slack channel alias.

## Why the predictor is empty

`Get-NextActions.ps1` refuses automatic work unless the client route is exact and active in the registry, routing was verified within 14 days, and evidence is current. The earlier revision-423 snapshot found every open item failing freshness or approval gates. Revision 430 now includes Puttery and Nexla, but the ranker still needs a fresh canonical run before its present eligibility count can be stated.

## Proposed registry patch

Puttery and Nexla are already active in the desktop canonical registry. The remaining proposal is for the canonical writer to add Deborah Mara, Capsule & Tonic, and Everyday Life Insurance, then add `onsite-construction` to the existing Onsite route. Validate with `Test-ClientRegistry.ps1`; keep unknown contacts, domains, roles, and access mappings empty or explicitly unverified.

```json
[
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

Local follow-up on the desktop, 2026-09-01 21:35Z to 22:42Z (branch `claude/repo-analysis-1bien2-local`):

- 503 triage through the redacted credential wrapper: no credential answers 403 with an empty body; a random wrong credential answers 503 with the same 9,102-byte Cloudflare origin-error response shape the stored credential gets on three five-minute probes, with no `Retry-After`. This strongly indicates a failure upstream of credential validation. The stored credential is neither validated nor rejected; the next step is the vendor question in the existing Resy API Integrations thread, still a draft.
- Relay defects fixed before deploy: the webhook header now matches the receiver's `PutteryWebhookAuth` contract; the drain client posts each stored body to the receiver instead of writing an unread inbox; acknowledged blobs keep only a PII-free dedupe marker; both Netlify Functions use strong Blobs consistency; and only permanent payload errors (`400`, `413`, `415`, `422`) are dead-lettered while authentication, routing, rate-limit, server, and connection failures remain pending.
- Verified: relay suite 17/17 including the real drain script against a loopback fake; receiver suite 13/13; both Netlify adapters import with `@netlify/blobs` 11.0.2; production dependency audit reports 0 vulnerabilities; both PowerShell scripts parse in Windows PowerShell 5.1. The relay now fails closed without a valid venue configuration, hashes shared-secret comparisons to fixed length, uses opaque queue keys and acknowledgements, and avoids raw reservation IDs in drain and receiver logs. The desktop canonical checkout remained read only.
- Git state: the Claude worker pushed branch commit `7bee8d8` before its session limit surfaced. Hardening commits `b41a027` and `6e3a86a`, plus the current-main merge, remain local and have not been pushed. No deploy, new vendor message, credential rotation, repository visibility change, or canonical queue or registry write was performed.

## Next actions, ranked

1. Apply the three remaining registry additions on the desktop, create their `CLIENT.md` files, and add the Onsite channel alias. Reversible, local.
2. Reconcile the existing Puttery and Nexla work items with current evidence, then draft the Onsite lead-tracking item. Nothing sends.
3. Re-verify routing and evidence on the two automatic-tier items that fail only on freshness: Fagan lead reconciliation `wi-20260715-0002` and Tags 2 Go access mapping `wi-20260807-0001`.
4. Diagnose why semantic checkpoints remain stale even though today's daily-driver and bridge wrappers returned `0`; separately inspect the Next 20 task's result `1`.
5. Enable the Netlify and WordPress.com connectors in the chat, and install HubSpot and Vercel. Account changes; Dillon does these.
6. Re-run the Composio connector pass so Search Console and Google Ads observations are fresh again.

## Not done here

- No canonical queue or registry write. The desktop is the sole canonical writer.
- No Slack or email sent, no PR closed or merged.
- The earlier short vendor email was sent at 16:02 ET. A richer redacted follow-up is verified in the same Gmail thread as an unsent draft; no additional email was sent.
