---
note_type: activation-account-audit
status: read_only_verified_with_access_gaps
created: 2026-08-25
updated: 2026-08-25
owner: Codex Marketing Chief
workflow: IMMOHRTAL-DAILY-20260825
step: ACTIVATE-ACCOUNT-AUDIT-01
external_actions: 0
privacy: redacted
source_refs:
  - "[[05_Offers/IMMOHRTAL/BOOKING-AND-OUTREACH-ACTIVATION]]"
  - "[[06_Revenue/IMMOHRTAL/lead-intelligence/GMAIL-DRAFT-READBACK-2026-08-25]]"
tags:
  - immohrtal
  - access-continuity
  - gmail
  - google-calendar
  - zoho
  - activation
---

# IMMOHRTAL Activation Account Audit

Current blocker disposition: [[05_Offers/IMMOHRTAL/ACTIVATION-BLOCKER-CLEARANCE-2026-08-25]].
This audit remains the source evidence for the earlier account state.

Related: [[05_Offers/IMMOHRTAL/BOOKING-AND-OUTREACH-ACTIVATION]];
[[06_Revenue/IMMOHRTAL/lead-intelligence/GMAIL-DRAFT-READBACK-2026-08-25]]

**As of:** 2026-08-25 17:38 ET
**Mode:** read only
**External actions:** zero sends, drafts, events, invitations, account changes, sender changes, DNS changes, or booking pages

This audit stores only redacted fingerprints and opaque evidence locators. It contains no raw email address, recipient address, postal address, message body, password, token, cookie, or one time code.

## Executive result

- The connected Gmail and Google Calendar tools are live and resolve to the same personal Google account, recorded here as `google-account:fpr:7ea0edc7`.
- Five current IMMOHRTAL drafts still use that Google account as `From` and one distinct IMMOHRTAL business mailbox as `Reply-To`. All five remain `DRAFT`.
- Current Gmail evidence verifies that the IMMOHRTAL business mailbox is a live Zoho mailbox capable of emitting authenticated mail. Its launch test passed SPF, DKIM, and DMARC. This does not prove that Gmail is authorized to use it as a send as alias.
- The connected Google account can see two calendars. The primary calendar is owner writable. The secondary calendar is reader only and cannot be the destination for an IMMOHRTAL appointment schedule.
- The current callable catalog exposes 15 Google Calendar tools for profiles, calendar lists, availability, events, invitations, labels, colors, and event changes. It exposes zero tools for creating, editing, publishing, or deleting an appointment schedule or booking page.
- The postal locator is still completely unresolved. Sender identity and calendar destination can now be approved by safe locators without typing either email address into chat.

## Safe identity map

Fingerprints are redaction locators for this audit, not credentials and not public contact details.

| Safe locator | Verified role | Current state |
|---|---|---|
| `google-account:fpr:7ea0edc7` | Connected Gmail identity and connected Google Calendar identity | Live in both connectors; same account proven by profile equality |
| `immohrtal-zoho-mailbox:fpr:704cd641` | IMMOHRTAL business mailbox; current draft `Reply-To`; launch-test sender | Live sender observed; authenticated delivery passed; no Access Broker system record |
| `google-calendar:primary:fpr:7ea0edc7` | Primary calendar for the connected Google account | Visible; `owner`; eligible destination after approval |
| `google-calendar:secondary:fpr:c0cc38f5` | Secondary visible calendar | Visible; `reader`; not eligible as the appointment schedule destination |

## Access Broker health

Registry checked: `C:\Users\dillo\AppData\Local\Codex\AccessBroker\registry.json`

### Registry wide status

- The file exists, parses as JSON, uses schema version 1, and contains 14 client records and 83 system records.
- A bounded safe-object and duplicate-ID scan checked 1,580 nodes. It found no forbidden secret-bearing field name, no likely credential value, no duplicate client ID, and no duplicate system ID.
- Registry-wide validation is degraded because seven existing records use `secret_ref` schemes outside the packaged allowlist: `wincred://`, `hermes-env://`, `env://`, or `session://`.
- The packaged `validate` action did not return within 70 seconds and was stopped. It made no registry change. The bounded scan above was used for this audit.
- The relevant Gmail and Google Calendar records both use allowed opaque `oauth://` references. Their local record shape is safe even though the registry as a whole is degraded.

### Exact Google records

| Access Broker record | Service and endpoint | Environment | Auth method | Recorded capability | Registry state | Live read-only evidence |
|---|---|---|---|---|---|---|
| `dillon-operations/google-workspace-gmail` | Gmail at `https://mail.google.com/` | Production | Provider OAuth | Authentication checks, account metadata, `gmail.message.read` | Last verified 2026-08-25 18:09 UTC; account identifier not stored | `get_profile`, `list_drafts`, and message metadata reads succeeded |
| `dillon-operations/google-workspace-calendar` | Google Calendar at `https://calendar.google.com/` | Production | Provider OAuth | Authentication checks and account metadata | No registry verification timestamp; account identifier not stored | `get_profile` and `list_calendars` succeeded |
| `dillon-operations/google-accounts-immohrtal-browser` | Google Accounts at `https://accounts.google.com/` | Production | Browser OAuth | Session checks and account metadata | Account identifier and verification timestamp absent | Does not prove a Gmail send as alias or a specific booking-page account |

The Gmail registry record authorizes message reads, not sending or sender configuration. Callable write tools existing in the connector catalog do not override that Access Broker boundary.

### Zoho gap

- No Zoho or Zoho Mail system record exists anywhere in Access Broker.
- Therefore the exact Zoho endpoint, auth method, allowed capability, access state, and opaque credential reference are unverified and unavailable for automation.
- No Zoho login surface was opened. No consent, password, MFA, passkey, CAPTCHA, recovery, or account-setting flow was attempted.

## Gmail sender audit

### Connected identity

- Gmail `get_profile` succeeded for `google-account:fpr:7ea0edc7` on the `gmail.com` domain class.
- Google Calendar `get_profile` returned the same redacted account fingerprint.
- The supplied browser route `/mail/u/2/` is a session-relative browser slot. This audit did not treat that slot number as account proof and did not open a login surface.

### Five IMMOHRTAL drafts

Direct metadata reads of the five newest current IMMOHRTAL drafts found the same result in every record:

- Label state: `DRAFT`; no `SENT` label.
- `From`: `google-account:fpr:7ea0edc7`.
- `Reply-To`: `immohrtal-zoho-mailbox:fpr:704cd641`.
- One recipient, one subject, no raw recipient or subject stored in this audit.
- Distinct `From` count: 1.
- Distinct `Reply-To` count: 1.

The callable Gmail catalog has no read-only send-as settings or alias-list method. Current alias membership is therefore `UNVERIFIED`, not false.

### Business mailbox evidence

- Opaque Gmail thread `1a03a4a26d16fadb` is a Zoho Accounts notice confirming that the IMMOHRTAL business-domain mailbox was added to Dillon's Zoho account. No code was consumed and no link was followed.
- Opaque Gmail thread `1a03aa981047f549` contains one received launch-test message from `immohrtal-zoho-mailbox:fpr:704cd641` to `google-account:fpr:7ea0edc7`.
- The launch-test `From` and `Return-Path` resolve to the same IMMOHRTAL mailbox fingerprint.
- Gmail authentication headers report `spf=pass`, `dkim=pass`, and `dmarc=pass` for that test.
- This proves a live authenticated Zoho business-mailbox path. It does not prove Gmail send-as configuration, Gmail alias verification, monitored unsubscribe intake, or a callable Zoho automation path.

### Sender candidates and exact truth

| Candidate | Identity verified | Able to emit mail | Connected automation access | Gmail send-as proof | Approval state |
|---|---:|---:|---:|---:|---|
| Connected personal Google mailbox | Yes | Existing draft path only; no send was tested in this audit | Read-only authority in Access Broker | Native profile, not an alias question | Not approved as IMMOHRTAL outbound `From` |
| Verified IMMOHRTAL Zoho mailbox | Yes | Yes; authenticated launch test received | No Access Broker record and no callable Zoho tool | Unverified | Not approved as outbound `From` |

## Google Calendar audit

### Account and calendars

- The Calendar connector is live for `google-account:fpr:7ea0edc7`, the same identity used by Gmail.
- `list_calendars` returned two entries and no continuation token.
- `google-calendar:primary:fpr:7ea0edc7` is marked `primary=true` with access role `owner`.
- `google-calendar:secondary:fpr:c0cc38f5` is marked `primary=false` with access role `reader`.
- The primary owner calendar is the only currently visible destination that can support an IMMOHRTAL appointment schedule. This identifies the calendar; it does not authorize configuration.

### Booking-page capability

- Calendar tools found: 15.
- Appointment-schedule or booking-page creation tools found: 0.
- Ordinary event creation is available in the callable catalog but was not used and is not equivalent to creating an appointment schedule.
- A booking page still requires the approved Google account in Google Calendar desktop web, followed by plan-entitlement, public-profile, availability, conflict-calendar, privacy, and controlled self-booking verification.

## What the read-only audit reduced

| Original input | Now known | Still required from Dillon |
|---|---|---|
| Business postal locator | Nothing safe or current was found | Secure approved business mailbox locator remains mandatory |
| Exact `From` | The exact IMMOHRTAL Zoho mailbox is identified by safe locator and has a passing authenticated launch test | Explicitly approve that verified mailbox as the outbound identity; automation access must then be registered and proven separately |
| Exact Google account and calendar | The connected Google identity and its primary owner calendar are exactly resolved by safe locators | Approve the connected primary owner calendar and approve or change the proposed defaults |

## Smallest remaining approval

Dillon can now approve the resolved identities without putting an email address in chat:

```text
POSTAL LOCATOR: [approved registered business mailbox secure locator]
FROM: APPROVE VERIFIED IMMOHRTAL ZOHO MAILBOX
CALENDAR: APPROVE CONNECTED GOOGLE PRIMARY OWNER CALENDAR | DEFAULTS: APPROVE
```

`DEFAULTS: APPROVE` has the meaning defined in [[05_Offers/IMMOHRTAL/BOOKING-AND-OUTREACH-ACTIVATION]]. These lines approve configuration and preview preparation only. They do not approve a send, event, invitation, booking page publication, internal delivery test, DNS change, sender-alias change, or prospect booking.

## Remaining operational gates after approval

1. Register the exact Zoho service route in Access Broker with its account locator, endpoint, environment, auth method, allowed capabilities, access state, opaque secret reference, and verification time. Do not store a raw credential.
2. Choose and verify one delivery implementation: a direct Zoho mailbox path, or a separately proven Gmail send-as path. The current evidence does not authorize either implementation.
3. Run a separately approved internal header test from the chosen delivery path and verify the expected `From`, `Return-Path`, SPF, DKIM, and DMARC result.
4. Configure the appointment schedule through Google Calendar desktop web because the current connector cannot create it.
5. Read back the public identity, plan entitlement, calendar destination, conflict calendars, schedule rules, privacy notice, and controlled self-booking result before sharing the URL.
6. Present the exact final five-recipient preview for a separate send approval. Any edit after approval requires a new preview unless Dillon explicitly approves the edit.

## Read-only receipt

- Access Broker modified: no.
- Gmail account or settings modified: no.
- Gmail message or draft created, edited, sent, labeled, archived, or deleted: no.
- Zoho account opened or modified: no.
- DNS inspected or modified: no.
- Calendar event, invitation, schedule, or booking page created or modified: no.
- Raw recipient, email, postal, message-body, or credential data persisted: no.
