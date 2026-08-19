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
next_action: On the phone, open the starred unread Google Ads invite and Accept for CID 791-780-2207. Then from a signed-in computer, send the Momentum MCC manager-link. Do not send the Jayashree draft until ready. Dillon owns the Admin passkey.
review_on: 2026-08-20
source_refs:
  - "[[12_Brain/01_Captures/2026-08-19 - Nexla Google Ads Admin invite]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Nexla Google Ads read-only and manager path]]"
  - "gmail://thread/1a01b517fdc49369"
  - "gmail://draft/r-4096301657939887568"
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

## Access path that is in motion

1. Accept the unread Google Ads invitation (Read-only, CID `791-780-2207`,
   account name Nexla) from Dillon’s own Ads session. Do not open the
   accept link from a cloud VM.
2. Read-only is enough to review and pull reports. It is not enough to
   build or change campaigns.
3. From Momentum’s Google Ads manager account, send a manager-link request
   to customer ID `791-780-2207`. Same method Coralie / Octabrain / Select
   used. There is no + on the client Managers tab.
4. Jayashree accepts the pending manager under Admin → Access and security →
   Managers. She stays owner.
5. The Jayashree reply is drafted in Gmail (`r-4096301657939887568`) and is
   **not sent**. Send it from the phone when ready.

## Live check 2026-08-19T21:33Z

Verified from this session, not inferred:

- Gmail invite `1a01bc7a1248dcc5` still has UNREAD. Starred so it is easy to tap.
- Gmail draft `r-4096301657939887568` still on thread `1a01b517fdc49369`. Nothing new sent to Jayashree.
- Connected Google Ads identity does not yet include CID `791-780-2207`.
- Google Ads API basic-access quota is exhausted (~13 hours). MCC link cannot be sent via API from here.
- This VM's browser hits a Google sign-in wall at ads.google.com. No password or passkey was entered.

The remaining work is on Dillon's signed-in Google Ads session: Accept the Read-only invite, then send the MCC manager-link.

Draft text:

> Hi Jayashree,
>
> Read-only is enough to get started. I'll accept that invite and begin reviewing the account.
>
> I'll handle the Admin passkey on my side — no need to wait on that. What you're seeing as Business Manager is a linked manager account — the Managers tab in your screenshot (Coralie Wood, Octabrain, Select). That's how the current agency got in: they sent a request from their manager account, and you approved it. There isn't a + button on that tab because the request has to come from our side.
>
> I'll send that same manager request from our account. When it shows up under Admin → Access and security → Managers, just accept it. You stay the owner.
>
> Thanks,
> Dillon

## Finish line

- [ ] Read-only invite accepted
- [ ] Live read of CID `791-780-2207` confirmed
- [ ] MCC manager-link sent from Momentum
- [ ] Jayashree accepted the manager-link
- [ ] Write access confirmed
- [ ] Canonical client record created only after registry confirmation
