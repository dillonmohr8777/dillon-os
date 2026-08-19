---
note_type: project
status: active
created: 2026-08-19
updated: 2026-08-19
owner: Dillon Mohr
area: paid media
priority: high
client: Nexla
outcome: Dillon has working write access on Nexla Google Ads account 791-780-2207 and can start the three-month lead campaign.
next_action: Phone — Accept the starred unread Google Ads Read-only invite for CID 791-780-2207. Computer — sign into Momentum Ads Manager 743-802-1996 and send a manager-link to that CID. Operator task and 7:30pm ET calendar block are on Dillon's Google account. Do not send the Jayashree draft until ready. Dillon owns the Admin passkey.
review_on: 2026-08-20
source_refs:
  - "[[12_Brain/01_Captures/2026-08-19 - Nexla Google Ads Admin invite]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Nexla Google Ads read-only and manager path]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Momentum Ads Manager MCC identity]]"
  - "gmail://thread/1a01b517fdc49369"
  - "gmail://draft/r-2283645929976401799"
tags:
  - brain
  - project
  - paid-media
  - google-ads
  - nexla
  - onboarding
---

# Nexla Google Ads onboarding

Nexla is a new Momentum 360 Google Ads engagement. Access is the blocker.
Do not add Nexla to the canonical 14-client roster until the client-operations
registry includes the route.

Google Ads has no Meta Business Manager. Two different grants exist:

| Tab | What it is | Who starts it |
|---|---|---|
| Users | Email invite: Admin / Standard / Read-only | Client adds the email |
| Managers | MCC manager-link | The manager account sends; client accepts |

Jayashree’s Admin user-invite hit a passkey wall (1–2 days to attach). She
sent read-only instead. The screenshot she called BM is Managers: Coralie
Wood, Octabrain, and Select are already linked that way. Dillon handles the
passkey himself. Do not wait on her Admin invite.

The manager-link must come from **Momentum Ads Manager** (`743-802-1996`),
the same MCC that linked Kimberly James Bridal and Replenish on 2026-04-10.
Do not send it from the Hermes Agent MCC (`703-867-3437`).

## Access path that is in motion

1. Accept the unread Google Ads invitation (Read-only, CID `791-780-2207`,
   account name Nexla) from Dillon’s own Ads session. Do not open the
   accept link from a cloud VM.
2. Read-only is enough to review and pull reports. It is not enough to
   build or change campaigns.
3. On a computer, sign into Google Ads as the Momentum Ads Manager operator
   (the same Google identity that sent the 2026-04-10 client manager-links).
   Switch to Momentum Ads Manager `743-802-1996`. Open sub-account
   management → link existing account → enter `791-780-2207` → send.
4. Jayashree accepts the pending manager under Admin → Access and security →
   Managers. She stays owner. It will show as Momentum Ads Manager, same
   pattern as Coralie / Octabrain / Select.
5. The Jayashree reply is drafted in Gmail (`r-2283645929976401799`) on
   thread `1a01b517fdc49369` and is **not sent**. Send it from the phone
   when ready. Do not use Gmail `update_draft` on this reply — it unthreads.

## Live check 2026-08-19T21:48Z

Verified from this session, not inferred:

- Gmail invite `1a01bc7a1248dcc5` still has UNREAD, STARRED, INBOX.
- Jayashree reply is draft `r-2283645929976401799` on thread
  `1a01b517fdc49369`, labels DRAFT only. Onboarding thread last message is
  still Jayashree `1a01bc9aa38c81a0`. Nothing new sent.
- Accept-probe: GAQL on CID `7917802207` returns `USER_PERMISSION_DENIED`.
  After a direct Users-tab accept that query would succeed without
  `login-customer-id`. The invite is not in effect.
- `GOOGLEADS_LIST_SUB_ACCOUNTS` on Momentum Ads Manager `7438021996` still
  `USER_PERMISSION_DENIED` (needs `login-customer-id`; not forwarded).
  `listAccessibleCustomers` is separately 429 until about 2026-08-20T10:42Z.
  Waiting on that quota does not unblock Accept or the MCC-link.
- This VM's Chrome profile has no signed-in Google account. `ads.google.com`
  is a sign-in wall. Playwright MCP Bridge timed out. No password or
  passkey was entered. The invite accept link was not opened.

The remaining work is on Dillon's signed-in Google Ads sessions: Accept the
Read-only invite on the phone, then send the MCC manager-link from Momentum
Ads Manager on a computer.

Operator reminders on Dillon's Google account (no mail sent to Jayashree):

- Google Task `cGQ2ZW01dXBuUUZTVTJrUw` on My Tasks, due 2026-08-19,
  status needsAction.
- Calendar event `tloc8bg3f1uqrcahfcakqkif88`, 7:30–7:45pm America/New_York,
  no guests, no email notifications.

Draft text:

> Hi Jayashree,
>
> Read-only is enough to get started. I'll accept that invite and begin reviewing the account.
>
> I'll handle the Admin passkey on my side — no need to wait on that. What you're seeing as Business Manager is a linked manager account — the Managers tab in your screenshot (Coralie Wood, Octabrain, Select). That's how the current agency got in: they sent a request from their manager account, and you approved it. There isn't a + button on that tab because the request has to come from our side.
>
> I'll send that same manager request from Momentum Ads Manager. When it shows up under Admin → Access and security → Managers, just accept it. You stay the owner.
>
> Thanks,
> Dillon

## Finish line

- [ ] Read-only invite accepted
- [ ] Live read of CID `791-780-2207` confirmed
- [ ] MCC manager-link sent from Momentum Ads Manager `743-802-1996`
- [ ] Jayashree accepted the manager-link
- [ ] Write access confirmed
- [ ] Canonical client record created only after registry confirmation
