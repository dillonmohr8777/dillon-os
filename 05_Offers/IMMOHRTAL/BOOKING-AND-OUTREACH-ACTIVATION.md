---
note_type: activation-runbook
status: ready_for_human_inputs
created: 2026-08-25
updated: 2026-08-25
owner: Codex Marketing Chief
workflow: IMMOHRTAL-DAILY-20260825
step: ACTIVATE-01
source_refs:
  - "[[05_Offers/IMMOHRTAL/OUTREACH-AND-BOOKING-STANDARD]]"
  - "[[05_Offers/IMMOHRTAL/PUBLIC-MONTHLY-SERVICE-MENU]]"
  - "[[06_Revenue/IMMOHRTAL/lead-intelligence/GMAIL-DRAFT-READBACK-2026-08-25]]"
review_due: 2026-09-01
tags:
  - immohrtal
  - outreach
  - booking
  - activation
---

# IMMOHRTAL Booking and Outreach Activation

Related: [[05_Offers/IMMOHRTAL/OUTREACH-AND-BOOKING-STANDARD]];
[[05_Offers/IMMOHRTAL/PUBLIC-MONTHLY-SERVICE-MENU]];
[[06_Revenue/IMMOHRTAL/SEPTEMBER-2-CLIENT-PLAN]]

**Activation state:** blocked on three small human inputs. No send, schedule, event, invitation, or account change is authorized by this document.

This is operational guidance based on current federal and platform sources, not a legal conclusion. It covers the federal CAN SPAM baseline. State, sector, contract, and recipient location rules may add requirements.

## Current verified facts

- Five Gmail drafts exist. Direct readback found the `DRAFT` label on all five and no `SENT` label. Zero messages and zero calendar events were created.
- The current drafts use an authenticated personal Gmail account in `From` and the verified IMMOHRTAL business address in `Reply-To`. The exact outbound sender is not approved.
- The drafts have no approved commercial disclosure, valid business postal footer, or operational opt out notice. They must remain held.
- No dedicated IMMOHRTAL booking page was found. The Calendly page found in business email belongs to Momentum 360 and cannot be reused.
- Dillon controls the primary Google Calendar account, but the exact account, destination calendar, entitlement, and booking rules have not been approved for IMMOHRTAL.
- The public monthly service menu and its seven prices are approved. It does not authorize claims, discounts, terms, setup fees, guarantees, or a sent proposal.
- Current callable catalog inspection on 2026-08-25 found 15 Google Calendar tools for calendars, availability, ordinary events, and invitations. It found zero tools that create, edit, publish, or delete an appointment schedule or booking page. A normal calendar event is not an appointment schedule.

## Gates that must pass

### Federal commercial email baseline

Treat every first touch as a commercial message. The FTC says CAN SPAM applies to business to business email and is not limited to bulk sends.

1. `From`, `To`, `Reply-To`, routing information, and the initiating business identity are accurate.
2. The subject accurately describes the message and is not deceptive.
3. The message clearly identifies itself as an advertisement or solicitation. This runbook uses the conservative default below.
4. The footer contains a valid physical postal address for IMMOHRTAL. The FTC says this may be a current street address, a USPS registered post office box, or a private mailbox registered with a qualifying commercial mail receiving agency.
5. A clear opt out method is visible and functioning. It must accept requests for at least 30 days after the message, require no fee or extra personal data, and require no more than a reply or one web page.
6. An opt out is suppressed immediately in the local workflow and no later than 10 business days under the federal rule. A suppressed address is not transferred except to a provider used to honor the request.
7. IMMOHRTAL remains responsible for compliance even if another tool or worker sends on its behalf.

Authoritative sources: [FTC CAN SPAM compliance guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business), [15 U.S.C. 7704 current text](https://uscode.house.gov/view.xhtml?edition=prelim&hl=false&num=0&req=granuleid%3AUSC-prelim-title15-section7704), and [FTC CAN SPAM Rule](https://www.ftc.gov/legal-library/browse/rules/can-spam-rule).

### IMMOHRTAL operating policy

1. Resolve the exact company, person, public address source, current observation, and relationship before sending.
2. Exclude client, employer, job search, vendor, purchased, inferred, and suppressed contacts unless a current source explicitly authorizes this use.
3. Recheck suppression, prior touch, recipient, subject, links, signature, footer, and sender immediately before each send.
4. Rendered outreach copy contains no hyphen, en dash, em dash, or dash style punctuation.
5. No unsupported familiarity, result, urgency, referral, guarantee, or conversion claim appears.
6. Dillon approves the exact recipient, subject, and final body after all edits. Approval of this runbook is not send approval.
7. A positive reply is not booking consent. A meeting becomes booked only after the prospect chooses a slot or explicitly accepts a proposed time and the resulting event is read back.

### Gmail delivery gate

Before a custom IMMOHRTAL `From` address is used, verify the account is authorized to send as that address and inspect a separately approved internal test message. The full headers must show the expected authenticated sender and no spoofing. For messages delivered to personal Gmail accounts, Google currently requires all senders to use SPF or DKIM, TLS, valid DNS, RFC 5322 formatting, and low spam rates. Google adds DMARC, aligned `From`, and one click unsubscribe requirements at roughly 5,000 messages per day to personal Gmail accounts. There is no evidence that this five message batch is a bulk sender, but the business domain should still use SPF, DKIM, and DMARC before scale.

Source: [Gmail email sender guidelines](https://support.google.com/mail/answer/81126?hl=en) and [Gmail sender guidelines FAQ](https://support.google.com/mail/answer/14229414?hl=en).

## Recommended defaults, not activated

### Outreach footer

Replace the placeholder through the approved private address workflow before any send.

```text
Advertisement from IMMOHRTAL Marketing Solutions.

To stop receiving marketing email from IMMOHRTAL, reply unsubscribe.

[Approved IMMOHRTAL business postal address]
```

The monitored sender or `Reply-To` inbox owns unsubscribe intake. Any message containing the placeholder remains blocked.

### First consultation schedule

| Setting | Recommended default |
|---|---|
| Public title | IMMOHRTAL Marketing Strategy Call |
| Duration | 30 minutes |
| Time zone | America/New_York |
| Weekly availability | Tuesday through Thursday, 10:00 AM to 3:00 PM |
| Minimum notice | 24 hours |
| Maximum advance window | 21 days |
| Buffer | 15 minutes between appointments |
| Daily cap | 3 bookings |
| Location | Google Meet |
| Destination | Approved IMMOHRTAL calendar |
| Conflict checks | Primary calendar plus every approved calendar that represents Dillon's real availability |
| Guest permissions | Guests cannot invite others |
| Required form fields | First name, last name, email, company, and website |
| Optional prompt | What would make this call useful? |
| Privacy notice | IMMOHRTAL uses these details only to schedule and prepare for this consultation. Do not include confidential information. |
| Verification | Require email verification when the account plan supports it |
| Reminder | One reminder 24 hours before when the account plan supports it |

Google says appointment schedules can define duration, availability, scheduling windows, date exceptions, buffers, daily caps, meeting method, form fields, confirmations, and reminders. Features vary by account plan. A personal Google account or Workspace Business Starter can create one booking page, while email verification, multiple schedules, multiple calendar checks, secondary calendar schedules, and other premium controls depend on plan. The booking page is public to anyone with the link and shows the account name and profile photo, so public identity and branding must be checked before sharing it.

Official documentation: [create an appointment schedule](https://support.google.com/calendar/answer/10729749?hl=en), [compare premium features](https://support.google.com/calendar/answer/16287038?hl=en), and [share or embed a booking page](https://support.google.com/calendar/answer/10733297?hl=en-GB).

## Same day activation sequence

1. **Dillon supplies the three inputs below.** This approves configuration and preview preparation only.
2. **Operations and Finance Controller verifies the postal route and disclosure.** Do not copy a private residential address into this note, chat, logs, or public evidence. Store only the approved business address through the existing private workflow, then inject it into the email footer at execution time.
3. **Revenue Pipeline Manager verifies the sender.** Confirm the exact `From`, monitored reply path, send as permission, and SPF, DKIM, and DMARC state. Run one separately approved internal delivery test and read the full headers.
4. **Revenue Pipeline Manager prepares the five final previews.** Add the disclosure, opt out, and postal footer; keep all existing routing and evidence checks; recheck every contact against the suppression ledger. No send occurs.
5. **Independent Quality and Risk Auditor signs the preview receipt.** Record exact recipient, subject, final body hash, links, source freshness, footer presence, sender, suppression result, and the no dash copy check.
6. **Dillon gives exact batch send approval.** Any edit after approval requires a new preview unless Dillon explicitly approves the edited text.
7. **Operator creates the appointment schedule in Google Calendar desktop web.** Use the exact approved account and calendar. The current connector cannot perform this step. Verify plan entitlement before relying on premium controls.
8. **Delivery and Client Success Lead tests the booking path.** With separate approval for the test, complete one controlled self booking, read back the event and invitation routing, verify Google Meet, conflict protection, confirmation, mobile display, cancellation, and slot restoration.
9. **Auditor verifies the public page.** Confirm the correct business name and image, exact availability and time zone, limited data collection, privacy notice, working cancellation, and no private calendar details.
10. **Only then add the verified booking URL to outreach.** The recipient may self book. No bot creates an event from a passive reply, and no event is created without booking consent.
11. **After exact send approval, execute and read back each delivery.** Record `SENT`, absence of `DRAFT`, immutable message ID, recipient, timestamp, and suppression state. A send error stops the batch instead of rerouting it.

## Shutdown and rollback

### Outreach

- **Before send:** pause the workflow and leave the messages as drafts. A changed recipient, sender, subject, body, link, footer, or source invalidates approval.
- **On opt out, complaint, bounce, or identity concern:** suppress immediately, stop every queued follow up, and retain only the minimum audit evidence.
- **On authentication or routing failure:** stop the batch. Do not switch accounts, senders, domains, or recipient addresses by inference.
- **After an incorrect send:** email recall is not a dependable rollback. Stop follow ups, preserve the receipt, and prepare any correction for separate approval.

### Booking

- **Reversible pause:** edit availability so no future slots are offered, then verify the public page has no bookable times. Hiding the schedule on the calendar is not a shutdown because the booking page can remain active.
- **Hard shutdown:** delete the appointment schedule and verify every shared booking link no longer works. Google states that deleting a schedule does not remove existing booked appointments.
- **Existing bookings:** audit them separately. Canceling a booked appointment sends a cancellation email and makes the slot available again, so each cancellation requires the applicable approval and readback.
- **Failure owner:** Delivery and Client Success Lead owns same day triage; the Independent Quality and Risk Auditor confirms closure.

Source: [Google Calendar cancellation and schedule deletion behavior](https://support.google.com/calendar/answer/10737245?co=GENIE.Platform%3DDesktop&hl=en).

## Activation evidence checklist

- [ ] Approved business postal route is privately resolved and the real footer contains no placeholder.
- [ ] Exact `From` and monitored reply path are approved.
- [ ] Internal authentication test proves the expected sender and domain alignment.
- [ ] Advertisement disclosure and working opt out are visible in all five final previews.
- [ ] Suppression and prior touch checks are current for every recipient.
- [ ] Preview receipt includes recipient, subject, body hash, links, source freshness, and exact approval.
- [ ] Calendar account, destination calendar, plan, and public profile identity are verified.
- [ ] Booking page shows the approved rules, privacy notice, and no private calendar details.
- [ ] Test booking proves event creation, organizer, attendee, Google Meet, conflict checks, confirmation, cancellation, and slot restoration.
- [ ] Booking URL is read back before insertion into any outreach.
- [ ] Every actual send has a message readback receipt. Every booking has an event readback receipt.
- [ ] Shutdown owner can pause availability, delete the schedule, suppress outreach, and verify closure.

## Smallest exact input request

Dillon can unblock configuration by replying with these three lines:

```text
POSTAL LOCATOR: [approved registered business mailbox record or secure locator, not a private address in chat]
FROM: [exact outbound email address]
CALENDAR: [exact Google account and destination calendar] | DEFAULTS: APPROVE or [availability changes]
```

`DEFAULTS: APPROVE` accepts the recommended consultation settings, disclosure, opt out wording, and privacy notice for configuration. It does not approve sending the five drafts or creating a prospect invitation. Those remain exact action approvals after readback.
