---
note_type: project
status: blocked
created: 2026-08-14
updated: 2026-08-15
owner: Dillon Mohr
client: "[[01_Clients/Tags 2 Go|Tags 2 Go]]"
area: Google Ads policy
priority: urgent
outcome: Get Google to certify Tags 2 Go as an authorized provider so title and registration Search can run.
next_action: Operator taps webapproval for case 5-3361000041397 in the operator mailbox. Do not email the client. Do not CC the client. Do not ask PennDOT for a URL.
source_refs:
  - "gmail:thread:19ff221c45d90254"
  - "gmail:thread:19ffd746f33989f2"
  - "gmail:thread:19ffbf0a0b63dc84"
  - "gmail:thread:1a001d851cf3c721"
  - "gmail:thread:1a001e4518e9aea8"
  - "gmail:thread:1a001ec4ad1109eb"
  - "gmail:thread:1a001f6e1d5858ab"
  - "gmail:thread:1a003de0cabae88e"
tags: [brain, project, tags-2-go, google-ads, government-documents, blocked]
---

# Google Ads Government Documents Block

Vehicle title and registration ads for Tags 2 Go stay off until Google applies a Government documents certificate. PennDOT title support is the wrong destination for that packet.

## Current state

The account is verified and billed. The remaining block is policy, not access. Google requires an authorized-provider certificate before ads can promote direct acquisition of registration, titles, plates, or driver-license products. The live site promotes those services, so an “out of scope” filing will fail.

Google’s form asks for a government webpage that **links to tags2go.pro**. PennDOT’s public agent PDFs list Tags 2 Go LLC by name and address and have **no website column**. Agent Support confirmed in writing that its inbox is for title and registration issues and does not know where Google Ads materials should go.

A general Google Ads support case (`3-2595000042211`) already had the authorization packet. That is not the same as the certification form.

The official form was submitted 2026-08-14 as **authorized, non-government provider** for `tags2go.pro`, pointing at PennDOT’s Authorized Agents page. Google opened case `1-8585000041572`. PennDOT Contract Administration then confirmed in writing that DAS has no URL field and the public list is address and phone only. That written confirmation was forwarded to the certification case.

**2026-08-15:** Google denied the request. The email is the standard “does not meet eligibility” template. It tells us to resubmit the form and include the link to the page that shows eligibility. There is still no government page that hyperlinks the domain. The live unlock is a **manual review** of the government-managed partner directories that already name the agent.

Checked again 2026-08-15 on the live PDFs (run date 2026-08-07):

- [Agent Services for Web](https://docs.penndot.pa.gov/Public/DVSPubsForms/Agent%20Services%20for%20Web.pdf) lists `TAGS 2 GO LLC` at `6001 TORRESDALE AVE`, Philadelphia.
- [online_stations.pdf](https://docs.penndot.pa.gov/Public/DVSPubsForms/online_stations.pdf) lists the same legal name and street, plus the public shop phone.

Sent 2026-08-15, **client not copied** (ads-support only):

- Reply on case `1-8585000041572` with those unwrapped URLs and PennDOT’s written “no website field” quote.
- Form resubmitted with the pa.gov Authorized Agents URL. Google opened case `5-3361000041397` and emailed a webapproval link to the operator mailbox. Do not email the client. Do not CC the client on Google or PennDOT threads.

The client declined notary/extra campaigns on 2026-08-14. Operator rule from 2026-08-14: **do not email the client** on this block. No client status mail. No reply on the Agent Support thread (the client is CC’d there).

PennDOT answer (Contract Administration, Bureau of Support Services, 2026-08-14): DAS has no business-URL field; they do not advertise websites; the public agent list is address and phone only. That path is closed.

Playbook: [[12_Brain/concepts/Google Ads Government Documents Certification]].

## Guardrails

1. Do not email the client on this block.
2. Do not launch extras campaigns the client refused.
3. Do not send more packets to PennDOT Agent Support, and do not reply on that thread.
4. Do not file a third authorized-provider form for the same domain unless Google asks again.
5. Do not copy passwords, DAS logins, or payment details into Git.
6. Keep the restricted Search campaign paused until the certificate is on the account.
7. Do not ask PennDOT again to add a website field. Contract Administration already answered.
8. Do not file “out of scope” while the live homepage sells registration, titles, plates, or driver-license products.

## Next actions

1. [x] Google Ads support follow-up sent on case `3-2595000042211` (2026-08-14). Client not copied.
2. [x] PennDOT Contract Administration + DAS website-listing request sent (2026-08-14). Client not copied.
3. [x] One `godos_certification` form submitted (2026-08-14). Case `1-8585000041572`.
4. [x] DVS publications inbox asked to route to whoever publishes the public agent PDFs (2026-08-14). Client not copied.
5. [x] Operator reported Google webapproval complete for case `1-8585000041572`.
6. [x] PennDOT Contract Administration replied: no URL field, public list is address and phone only. Written confirmation forwarded to Google. Thank-you sent. Do not ask again.
7. [x] Google denied the first authorized-provider filing (2026-08-15).
8. [x] Denial reply sent on case `1-8585000041572` with the live pa.gov page and both directory PDFs (2026-08-15).
9. [x] Form resubmitted with the pa.gov Authorized Agents URL as the eligibility page (2026-08-15). New case `5-3361000041397`. Client not copied.
10. [ ] Operator taps the webapproval link in the Google email for case `5-3361000041397` (operator mailbox only; this cloud session cannot pass phone 2FA).
11. [ ] Wait for Google’s written re-review on cases `1-8585000041572` and `5-3361000041397`.
12. [ ] After approval, appeal the disapproved assets and relaunch Search only, geo-limited to Pennsylvania.

## Evidence

1. [Client thread](https://mail.google.com/mail/u/0/#all/19ff221c45d90254)
2. [PennDOT Agent Support thread](https://mail.google.com/mail/u/0/#all/19ffd746f33989f2)
3. [Google Ads evidence case](https://mail.google.com/mail/u/0/#all/19ffbf0a0b63dc84)
4. [Google Ads certification case](https://mail.google.com/mail/u/0/#all/1a001ec4ad1109eb)
5. [Google denial](https://mail.google.com/mail/u/0/#all/1a003de0cabae88e)
5b. [Form resubmit case](https://mail.google.com/mail/u/0/#all/1a003fbabf1c5aaa)
6. [PennDOT Contract Administration reply](https://mail.google.com/mail/u/0/#all/1a001d851cf3c721)
7. [PennDOT agent directory PDF](https://docs.penndot.pa.gov/Public/DVSPubsForms/Agent%20Services%20for%20Web.pdf)
8. [PennDOT online-agent PDF](https://docs.penndot.pa.gov/Public/DVSPubsForms/online_stations.pdf)
9. [Google certification form](https://support.google.com/adspolicy/contact/godos_certification)
