---
note_type: activation-blocker-clearance
status: partial_clearance_human_gates_remain
created: 2026-08-25
updated: 2026-08-25
owner: Codex Marketing Chief
workflow: IMMOHRTAL-DAILY-20260825
step: ACTIVATE-BLOCKER-CLEARANCE-02
external_actions: 0
privacy: redacted
source_refs:
  - "[[05_Offers/IMMOHRTAL/ACTIVATION-ACCOUNT-AUDIT-2026-08-25]]"
  - "[[05_Offers/IMMOHRTAL/BOOKING-AND-OUTREACH-ACTIVATION]]"
  - "[[05_Offers/IMMOHRTAL/BUSINESS-FOUNDATION-CHECKLIST]]"
tags:
  - immohrtal
  - activation
  - access-continuity
  - zoho
  - google-calendar
  - can-spam
---

# IMMOHRTAL Activation Blocker Clearance

Related: [[05_Offers/IMMOHRTAL/ACTIVATION-ACCOUNT-AUDIT-2026-08-25]];
[[05_Offers/IMMOHRTAL/BOOKING-AND-OUTREACH-ACTIVATION]];
[[05_Offers/IMMOHRTAL/BUSINESS-FOUNDATION-CHECKLIST]]

**Observed:** 2026-08-25 18:12 ET

**Mode:** read only external verification plus local evidence packaging

**External actions in this clearance step:** zero

This receipt contains no raw postal address, mailbox value, email address, recipient, message body, password, token, cookie, recovery code, or one time code. Account and mailbox identities use the redacted fingerprints established in the prior account audit.

## Outcome

Every reversible local check in scope is complete. The exact Google identity and primary owner calendar are live. A personal Google Account is eligible for one appointment-schedule booking page. The verified IMMOHRTAL Zoho mailbox still has authenticated SPF, DKIM, and DMARC evidence. A complete local booking configuration is ready below.

Three boundaries cannot be cleared by local work:

1. No current, approved IMMOHRTAL business postal route exists in the authorized local, Gmail, or Drive evidence checked. A person must select or approve a compliant business mailbox and provide only its secure locator.
2. No exact opaque Zoho credential or OAuth locator exists in Access Broker, and the canonical `register-system` action cannot record all required account and access-state fields. Registering a guessed reference would create false access state, so the registry was not changed.
3. Google makes a saved booking page public. There is no private saved preview state. The connected account has a public name and profile photo, and the current public name does not exactly match `IMMOHRTAL Marketing Solutions`. Saving the schedule or changing the Google profile is an external account action that requires an exact decision.

No prospect outreach or booking action is unblocked by this receipt alone.

## Blocker matrix

| ID | Blocker | Current state | What is now proven | Remaining authority or evidence |
|---|---|---|---|---|
| B01 | Connected Google identity | `CLEARED_READ_ONLY` | Gmail, Calendar, and Drive are live and resolve to the same personal Google identity, `google-account:fpr:7ea0edc7`. | None for read-only account selection. |
| B02 | Calendar destination | `CLEARED_READ_ONLY` | One visible calendar is `primary=true` and `owner`; the other is `reader`. `google-calendar:primary:fpr:7ea0edc7` is the only eligible current destination. | Explicit approval is still required before configuration. |
| B03 | Core appointment-schedule eligibility | `CLEARED_READ_ONLY` | Official Google documentation says a personal Google Account can create one booking page. | Premium features are not proven and are excluded from the baseline configuration. |
| B04 | Local booking configuration | `CLEARED_LOCAL` | Title, duration, time zone, availability, notice, window, buffer, cap, location, form fields, and privacy text are fully specified below. | The settings have not been entered into Google Calendar. |
| B05 | Private booking-page preview | `NOT_AVAILABLE` | Google states that a booking page is always public. Saving the schedule is the publication boundary. | Approve the observed Google public identity or approve a separate account/profile solution before Save. |
| B06 | Booking page configured | `NOT_CONFIGURED` | Exact desktop-web steps and destination are known. Current connector catalog has 15 Calendar tools and zero appointment-schedule tools. | Use the approved account in the Codex in-app browser and stop before Save unless exact Save approval is present. |
| B07 | Booking page published | `NOT_PUBLISHED` | No IMMOHRTAL strategy-call schedule, Calendar notification, or booking URL was found. | Exact public Save approval after identity and settings readback. |
| B08 | Booking path tested | `NOT_TESTED` | The controlled test protocol is defined. | Separate approval for one self booking, which creates an event and notifications, followed by cancellation and slot-restoration verification. |
| B09 | IMMOHRTAL Zoho mailbox identity | `CLEARED_READ_ONLY` | `immohrtal-zoho-mailbox:fpr:704cd641` is a live business mailbox. The prior internal launch message passed SPF, DKIM, and DMARC. | This does not prove callable automation access or approve it as outbound `From`. |
| B10 | Zoho Access Broker registration | `BLOCKED_MISSING_LOCATOR` | Exact service and endpoint can be identified as Zoho Mail at `https://mail.zoho.com/`, production. No Zoho connector, system record, or exact opaque vault locator exists. | An authorized password-manager or provider OAuth workflow must create or surface the exact opaque locator. The registration workflow also needs account-locator and access-state support. |
| B11 | Outbound delivery implementation | `BLOCKED_HUMAN_AUTHORITY` | Direct Zoho and Gmail send-as are the two possible routes; neither is proven callable. | Approve one route, register it, run a separately approved internal header test, and verify the monitored reply and unsubscribe path. |
| B12 | CAN SPAM postal footer | `BLOCKED_HUMAN_INPUT` | Targeted local, Gmail, and Drive checks found no qualifying current IMMOHRTAL postal route. No raw address was retained. | Select or approve a compliant street address, USPS registered box, or qualifying CMRA mailbox and provide only its secure locator. |
| B13 | Five final outreach previews | `BLOCKED_DEPENDENCY` | Existing drafts remain separate from this clearance step. | Postal route, approved sender implementation, footer, opt out, suppression recheck, exact previews, and exact send approval. |

## Access Broker result

Registry: `C:\Users\dillo\AppData\Local\Codex\AccessBroker\registry.json`

### Bounded safe validation

| Check | Result |
|---|---:|
| JSON parses | Yes |
| Schema version | 1 |
| Clients | 14 |
| Systems | 83 |
| Nodes scanned | 1,506 |
| Duplicate client IDs | 0 |
| Duplicate system IDs | 0 |
| Forbidden secret-bearing field names | 0 |
| Likely secret values | 0 |
| Embedded URL credentials | 0 |
| Zoho system records | 0 |
| Unsupported legacy `secret_ref` schemes | 7 |

Registry fingerprint before and after this clearance: `sha256:0153b6aef6c30a8f3affd870cc2848a615106e89de139a5ff98ca4259c9239c0`.

The packaged `validate` action was allowed to run for more than 75 seconds, returned no result, and was stopped. The prior audit observed the same behavior. Its implementation recursively examines scalar PowerShell objects and does not provide a bounded validation result for this registry. The seven existing unsupported schemes are `env`, `wincred`, `session`, and `hermes-env`. They predate this work and were not edited.

### Why no Zoho record was added

The canonical `register-system` workflow requires a nonempty approved `secret_ref` and validates the entire registry before writing. It accepts service, endpoint, environment, auth method, secret reference, allowed capabilities, and verification time. It does not accept an account locator or access state. Current evidence provides neither an exact Zoho auth method nor an observed opaque Zoho secret reference.

The sanitized Bitwarden bridge reported version `1.3.0`, the pinned CLI version `2026.6.0`, bootstrap credential present, vault locked, and no human action currently required. The bridge can resolve only a preexisting exact `bw://item/<guid>` locator. Access Broker contains six Bitwarden item locators, none mapped to Zoho. No raw vault value or vault search result was exposed.

Adding a fabricated `oauth://` or `bw://` reference would falsely claim a connection. The registry therefore remains unchanged.

### Safe candidate record, not registered

| Field | Safe value or state |
|---|---|
| Client | `dillon-operations` |
| System ID | `zoho-mail-immohrtal` |
| Service | `zoho-mail` |
| Account locator | `immohrtal-zoho-mailbox:fpr:704cd641` |
| Endpoint | `https://mail.zoho.com/` |
| Environment | `production` |
| Auth method | `MISSING_CURRENT_EVIDENCE` |
| Opaque secret reference | `MISSING_EXACT_LOCATOR` |
| Proposed initial capability | authentication presence, login, session reuse, and account metadata only |
| Access state | `LIVE_MAILBOX_EVIDENCE_ONLY_NOT_AUTOMATION_CONNECTED` |
| Verification time | unset until least-privilege account access succeeds |

Mail read or send capability must not be added by inference. Send remains an exact action approval after configuration and preview readback.

## Postal-locator evidence check

### Local evidence

The current [[05_Offers/IMMOHRTAL/BUSINESS-FOUNDATION-CHECKLIST]] explicitly records that no approved business mailing address or registered-agent evidence was found. A bounded current-worktree search found only the activation documents, readiness documents, and held outreach artifacts that repeat this missing-input state. It found no separate registration receipt or mailbox agreement.

Search fingerprint: `sha256:5bff99938b37fd34cfb70c79277dad2758522309b6349f176dc14a7146024344`.

### Google Drive evidence

- The Drive profile matched the same live Google identity used by Gmail and Calendar.
- Three native IMMOHRTAL documents were read. They contained zero candidate street addresses, zero post-office-box values, and zero registered-agent, CMRA, or virtual-mailbox evidence.
- Two additional native documents surfaced by Mohr-related searches contained no IMMOHRTAL or Mohr Media brand evidence and no candidate postal value.
- No Drive result established a current registered business mailbox, active mailbox agreement, Form 1583, registered-agent agreement, or approved public contact format for IMMOHRTAL.

Search fingerprint: `sha256:e2381e56cbb330844abe9bd44e82100489f74e7057c2a2936ccc02a11f0b2415`.

### Gmail evidence

- Twenty-two messages returned by the bounded `IMMOHRTAL` plus address query were read privately and reduced to counts. None contained a candidate street address, post-office-box value, mailbox-registration evidence, or approved postal locator.
- Searches found zero USPS Form 1583 messages, zero known virtual-mailbox-provider account messages, and zero Articles of Organization messages tied to IMMOHRTAL.
- One virtual-mailbox phrase match and one registered-agent phrase match were unrelated to an active IMMOHRTAL service and supplied no qualifying postal value.
- Six business-formation phrase matches belonged to drafts, third-party discussions, or another business context. They were excluded and their contents were not persisted.

Search fingerprint: `sha256:f1b9835057f345e452f243a32ba46d010bd821daa9eca15039a0b7f14d0f8c96`.

**Truth state:** `NOT_FOUND_IN_AUTHORIZED_EVIDENCE`. This is not proof that Dillon has no usable address. It is proof that no current, approved, IMMOHRTAL-specific secure locator could be established from the authorized evidence checked.

## Google Calendar configuration and publication path

### Verified account facts

- Gmail, Calendar, and Drive profiles match.
- Account class is personal `gmail.com`.
- One primary calendar is owner writable.
- The only secondary calendar is reader only.
- The profile has a public name and profile photo.
- The public profile name does not exactly equal `IMMOHRTAL Marketing Solutions`.
- The connector exposes no booking-page or appointment-schedule operation.

Official Google documentation currently states that a personal Google Account can create one booking page. It also states that creation requires a computer browser and that the booking page is always public to anyone with the link, including the account name and profile photo.

### Locally ready baseline

| Setting | Ready value |
|---|---|
| Public title | IMMOHRTAL Marketing Strategy Call |
| Duration | 30 minutes |
| Time zone | America/New_York |
| Availability | Tuesday through Thursday, 10:00 AM to 3:00 PM |
| Minimum notice | 24 hours |
| Maximum advance window | 21 days |
| Buffer | 15 minutes |
| Daily cap | 3 bookings |
| Location | Google Meet |
| Destination | `google-calendar:primary:fpr:7ea0edc7` |
| Conflict checks | Primary calendar only until premium multi-calendar entitlement is observed |
| Guest permissions | Guests cannot invite others |
| Required fields | First name, last name, email, company, website |
| Optional prompt | What would make this call useful? |
| Privacy notice | IMMOHRTAL uses these details only to schedule and prepare for this consultation. Do not include confidential information. |
| Email verification | Off unless the live editor proves entitlement |
| Automatic reminder | Off unless the live editor proves entitlement |

### Exact supported path

1. Open `https://calendar.google.com/` in the Codex in-app browser using `google-account:fpr:7ea0edc7`.
2. Confirm the selected destination is `google-calendar:primary:fpr:7ea0edc7` and the public account name and photo are acceptable.
3. Select `Create`, then `Appointment schedule`.
4. Enter the baseline schedule settings and select `Next`.
5. Enter Google Meet, the description, booking form, and privacy notice.
6. Stop before `Save` and return an exact settings and public-identity readback.
7. After separate `BOOKING PAGE: APPROVE SAVE`, select `Save`. This is both configuration persistence and public-page creation.
8. Under `Booking pages`, copy the single-page link and read it back. Copying or distributing the URL is a separate sharing step, but the page is already public after Save.
9. After separate controlled-test approval, book one self appointment, read back the event, Google Meet, organizer, attendee, time zone, and notifications, then cancel it and verify slot restoration.
10. Only after the test passes may the verified URL enter an outreach preview. It still requires exact message approval before any send.

### State model

| State | Current value | Evidence required to advance |
|---|---|---|
| Local configuration specified | `YES` | This receipt and its JSON companion |
| Editor populated | `NO` | In-app-browser settings readback before Save |
| Private persisted preview | `UNAVAILABLE` | Google provides no private saved booking page |
| Saved and public | `NO` | Exact Save approval and public-page readback |
| URL observed | `NO` | Provider-returned link after Save |
| Controlled booking tested | `NO` | Event and notification readback plus cancellation and slot restoration |
| Enabled in outreach | `NO` | Verified URL plus exact final outreach approval |

Official sources:

- [Create an appointment schedule](https://support.google.com/calendar/answer/10729749?hl=en)
- [Compare appointment-schedule premium features](https://support.google.com/calendar/answer/16287038?hl=en)
- [Share an appointment schedule](https://support.google.com/calendar/answer/10733297?hl=en-GB)
- [Check availability across calendars](https://support.google.com/calendar/answer/16287054?hl=en)
- [Zoho Mail login instructions](https://www.zoho.com/mail/help/login-to-zoho.html)

## Smallest remaining human inputs

These three lines clear only the input-selection gates:

```text
POSTAL LOCATOR: [approved registered business mailbox secure locator]
FROM: APPROVE VERIFIED IMMOHRTAL ZOHO MAILBOX
CALENDAR: APPROVE CONNECTED GOOGLE PRIMARY OWNER CALENDAR | DEFAULTS: APPROVE
```

After the exact Calendar public identity and settings are shown, saving still requires:

```text
BOOKING PAGE: APPROVE SAVE
```

These approvals do not approve prospect sends, an internal sender test, a Google profile change, DNS changes, a controlled booking, or event cancellation. Each receives its own exact preview and readback.

## Verification

- JSON companion parses successfully and reports six remaining human or provider gates.
- Privacy scan found zero raw email addresses, zero candidate street addresses, zero state-plus-postal-code pairs, zero numbered post-office-box values, and zero likely secret values.
- Both artifacts contain zero en dash or em dash characters.
- Registry SHA-256 after artifact creation matches the before fingerprint exactly.
- `System/scripts/Test-SecondBrain.ps1` found no warning or error against either clearance artifact. The repository-wide test still returns its pre-existing `graph_fragmented` error: 117 components, 85.6 percent largest-component coverage, and 116 orphans.

## Zero-action receipt

- Access Broker registry changed: no.
- Access Broker hash before and after: identical.
- Password manager item read, created, edited, or revealed: no.
- Gmail message or draft created, edited, sent, labeled, archived, or deleted: no.
- Zoho login or account page opened: no.
- Mailbox, alias, domain, or DNS setting changed: no.
- Calendar event, invitation, schedule, or booking page created or changed: no.
- Raw postal value persisted: no.
- Raw credential or secret persisted: no.
- Prospect outreach enabled: no.
