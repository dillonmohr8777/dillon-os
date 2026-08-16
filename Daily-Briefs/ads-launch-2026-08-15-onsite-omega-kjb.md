---
type: ads-launch-brief
date: 2026-08-15
clients: [Onsite Concrete, Omega Landscaping, Kimberly James Bridal]
status: blocked-on-google-login
do_not_send: true
---

# Three-campaign launch — 2026-08-15

One-line: three Search CREATE packets are ready on existing tracked URLs; live apply is blocked because this Cloud Agent desktop cannot sign into Google Ads.

## What launched (agents, not the live UI)

Three campaign agents ran in parallel and wrote create-ready packets:

| Client | Packet | Final URL (existing, fetched 2026-08-15) |
|---|---|---|
| Onsite Concrete | `Daily-Briefs/ads-launch-packet-2026-08-15-onsite.md` | `https://onsite-gads-landing-page.netlify.app/` |
| Omega Landscaping | `Daily-Briefs/ads-launch-packet-2026-08-15-omega.md` | `https://omega-landscaping-landing-page.netlify.app/` |
| Kimberly James Bridal | `Daily-Briefs/ads-launch-packet-2026-08-15-kjb.md` | `https://www.kimberlyjamesbridal.com/bridal-appointment-request` |

Each packet is Search only, Presence-only geo, Maximize Clicks or Manual CPC, auto-tagging on, no invented UTM scheme, no Smart Bidding.

## Login evidence

Computer use opened Chrome on this machine and tried `ads.google.com` twice.

1. First pass: account chooser had the operator Gmail autofill. No saved password. Recovery / 2FA asked to confirm the phone ending in 33.
2. Second pass: Google refused the VM as an unrecognized device — "You can't sign in here right now." Current URL was the account-recovery identifier page. MCC and the three client accounts were not visible.

Composio Google Ads is connected but quota-exhausted (HTTP 429, retry on the order of hours). Campaign-create mutate tools are restricted in this environment even when quota returns. UI apply is the path.

## Shared rules (all three)

- Use the existing tracked URL. Do not invent a new landing page or UTM scheme.
- Do not add net-new spend on top of the current Google daily budget. Carve / support-slice only.
- Do not flip Smart Bidding. Omega has an Aug 17 Smart Bidding deadline email; that email is not permission to change this new campaign.
- Pending or unmatched conversion events are not bidding signal.
- Do not email any client from this brief.

## Client-specific holds

- **Onsite:** Search, not another PMax. Vacaville Presence. Ceiling from late-July weekly reads only.
- **Omega:** Supplier / wholesale negatives. Brand protected. Two unmatched conversion events stay unmatched until named inquiries exist.
- **Kimberly:** Meta stays primary. July 14 "cancel Google" is on file; the 2026-08-15 order overrides that for a small appointment-intent Search campaign to the existing request URL.

## Codex handoff

Paste-ready launch prompt (skills created + found + the three packets):

`Daily-Briefs/codex-three-campaign-launch-prompt-2026-08-15.md`

Run it on a machine that already has a trusted Google session. This Cloud Agent desktop cannot sign in.

## Next action

Sign into Google Ads from a device this account already trusts (or approve this Cloud Agent browser), then apply the three packets in-account. Do not send client email.
