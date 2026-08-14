---
note_type: project
status: blocked
created: 2026-08-14
updated: 2026-08-14
owner: Dillon Mohr
client: "[[01_Clients/Tags 2 Go|Tags 2 Go]]"
area: Google Ads policy
priority: urgent
outcome: Get Google to certify Tags 2 Go as an authorized provider so title and registration Search can run.
next_action: Wait for Google’s certification routing reply and for Contract Administration / DAS to say whether a public website field can be added. Do not email the client.
source_refs:
  - "gmail:thread:19ff221c45d90254"
  - "gmail:thread:19ffd746f33989f2"
  - "gmail:thread:19ffbf0a0b63dc84"
tags: [brain, project, tags-2-go, google-ads, government-documents, blocked]
---

# Google Ads Government Documents Block

Vehicle title and registration ads for Tags 2 Go stay off until Google applies a Government documents certificate. PennDOT title support is the wrong destination for that packet.

## Current state

The account is verified and billed. The remaining block is policy, not access. Google requires an authorized-provider certificate before ads can promote direct acquisition of registration, titles, plates, or driver-license products. The live site promotes those services, so an “out of scope” filing will fail.

Google’s form asks for a government webpage that **links to tags2go.pro**. PennDOT’s public agent PDFs list Tags 2 Go LLC by name and address and have **no website column**. Agent Support confirmed in writing that its inbox is for title and registration issues and does not know where Google Ads materials should go.

A general Google Ads support case is open with the authorization packet. That is not the same as the certification form. No form confirmation exists in Gmail.

The client declined notary/extra campaigns on 2026-08-14. Operator rule from 2026-08-14: **do not email the client** on this block. No client status mail. No reply on the Agent Support thread (the client is CC’d there).

Sent 2026-08-14, client not copied:
- Google Ads support, case `3-2595000042211`: PennDOT title support is a dead end; request manual authorized-provider certification off the directory PDF.
- PennDOT Contract Administration and DAS: request to add `tags2go.pro` to the public listing for agent 18005397, or name the unit that owns that directory.

Playbook: [[12_Brain/concepts/Google Ads Government Documents Certification]].

## Guardrails

1. Do not email the client on this block.
2. Do not launch extras campaigns the client refused.
3. Do not send more packets to PennDOT Agent Support, and do not reply on that thread.
4. Do not submit multiple certification requests for the same domain.
5. Do not copy passwords, DAS logins, or payment details into Git.
6. Keep the restricted Search campaign paused until the certificate is on the account.

## Next actions

1. [x] Google Ads support follow-up sent (2026-08-14). Client not copied.
2. [x] PennDOT Contract Administration + DAS website-listing request sent (2026-08-14). Client not copied.
3. [ ] If Google says the support case is not the certification queue, submit one `godos_certification` form. Do not double-file if they confirm the case is enough.
4. [ ] After Google’s written decision, appeal the disapproved assets or report the exact remaining gap.
5. [ ] After DAS / Contract Administration replies, use only that answer. Do not go back to Agent Support.

## Evidence

1. [Client thread](https://mail.google.com/mail/u/0/#all/19ff221c45d90254)
2. [PennDOT Agent Support thread](https://mail.google.com/mail/u/0/#all/19ffd746f33989f2)
3. [Google Ads case thread](https://mail.google.com/mail/u/0/#all/19ffbf0a0b63dc84)
4. [PennDOT agent directory PDF](https://docs.penndot.pa.gov/Public/DVSPubsForms/Agent%20Services%20for%20Web.pdf)
5. [Google certification form](https://support.google.com/adspolicy/contact/godos_certification)
