# Pre-outreach readiness gate

Current status: **WEBSITE AND BOOKING VERIFIED; OUTREACH BLOCKED ON SENDER, POSTAL, SUPPRESSION, AND EXACT APPROVAL GATES**

This checklist is intentionally stricter than a successful local build. Every item that affects a recipient must be checked against the public website and the exact sending setup immediately before outreach begins.

## A. Brand and domain transfer

- [x] `https://www.immohrtalmarketing.com` resolves publicly over valid HTTPS and the apex redirects there in one hop.
- [x] The homepage, metadata, organization schema, logo, visible footer, and contact route say **IMMOHRTAL Marketing Solutions**.
- [x] Canonical URLs, Open Graph URLs, sitemap URLs, feed URLs, `robots.txt`, `llms.txt`, structured-data identifiers, and public asset URLs use `https://www.immohrtalmarketing.com`.
- [x] No public navigation, title, description, page body, form response, downloadable asset, or social preview presents the former brand as the current business.
- [ ] Any intended redirect from a former public origin is verified one hop at a time and lands on the equivalent IMMOHRTAL route without loops or chain damage.
- [x] The exact Vercel project and custom-domain mapping are recorded so a later deploy cannot update the wrong property. The unrelated Netlify artist site is excluded explicitly.

Evidence record:

| Check | URL or system | Checked UTC | Result | Evidence locator | Owner |
|---|---|---|---|---|---|
| Canonical domain and TLS | `https://www.immohrtalmarketing.com/` | 2026-08-26T01:09:00Z | Passed, HTTP 200, Vercel response | Vercel header and live response readback | Codex Marketing Chief |
| Brand replacement | Production homepage and 23 generated routes | 2026-08-26T01:09:00Z | Passed local and live release QA | Commit `05133933`; Vercel production deployment | Codex Marketing Chief |
| Redirect behavior | Pending | Pending | Pending | Pending | Pending |
| Hosting target mapping | Vercel project `mohr-media-site` | 2026-08-26T01:10:00Z | Production deployment succeeded | GitHub deployment `6095088235` | Codex Marketing Chief |

## B. Page and link proof

- [ ] All 23 intended indexable routes return the correct public page and a successful status.
- [ ] Every route in `page-routing-map.md` opens on the new domain without authentication, redirect loops, missing media, or runtime errors.
- [ ] Navigation, footer, related-service links, related-guide links, breadcrumbs, source links, and project links are checked for broken or incorrect destinations.
- [ ] Every guide displays its academic citations as working hyperlinks and does not present a citation as proof of a claim the source does not support.
- [ ] Desktop and 320, 390, 430, and 768 pixel layouts have no blocking overflow or unreadable content.
- [ ] Keyboard navigation, visible focus, reduced motion, image alternatives, and no-WebGL/static fallback behavior are verified.
- [ ] The browser console is clear of release-blocking errors on the homepage, contact route, every service route, and at least one guide template instance.
- [ ] Titles, descriptions, main headings, canonicals, Article schema, breadcrumbs, organization/person entities, sitemap, and discovery files match the visible page.

## C. CTA and contact proof

- [ ] Every outreach-linked service page has a visible, accurate next step.
- [ ] The current mailto contact action opens a new draft on desktop and mobile with the intended recipient and subject; no form submission is implied.
- [ ] The recipient email address is intentional, monitored, and displayed accurately.
- [ ] The contact page clearly tells visitors that their own mail app controls what is sent.
- [ ] No test action sends a message, creates a CRM record, triggers automation, or causes another external action without explicit approval.
- [ ] If a hosted form is introduced later, consent, validation, error, success, duplicate-submit, destination, and privacy behavior must be verified before it replaces this mailto gate.

## D. Measurement proof

- [ ] Outreach links use a documented UTM convention only after analytics collection is verified; otherwise use the clean canonical route and do not claim click attribution.
- [ ] Suggested convention is staged and approved, for example: `utm_source=outbound`, `utm_medium=email` or `linkedin`, `utm_campaign=[approved_segment]`, `utm_content=[approved_variant]`.
- [ ] Page visits, mailto CTA clicks, and any later form submissions use stable event definitions before they appear in reporting.
- [ ] CRM attribution, consent, source, and lifecycle fields are mapped before any performance report is created. Missing measurement does not block one-to-one outreach, but it blocks attribution and conversion claims.
- [ ] Reporting language distinguishes delivery, visits, replies, qualified conversations, and closed work.
- [ ] No ranking, AI-citation, traffic, lead, conversion, or revenue claim is inferred from a single screenshot or partial system.

## E. Sending-domain and mailbox proof

- [ ] Cold outreach will not be sent from the primary website domain unless a deliberate reputation-risk decision is documented and approved.
- [ ] The exact dedicated sending domain or subdomain, mailbox, provider, and authorized sender identity are recorded.
- [ ] SPF, DKIM, and DMARC pass for the exact sender.
- [ ] The domain is appropriately warmed before volume increases.
- [ ] Inbox placement, blacklist status, bounce handling, reply handling, and suppression handling are tested.
- [ ] The approved daily volume and ramp schedule fit the domain's current reputation.
- [ ] Every first touch is plain text or minimal HTML, contains no more than one website link, and avoids attachments.

## F. List, legal, and consent proof

- [ ] Every prospect is a verified business contact whose role fits the observed problem.
- [ ] The source and date for the company, role, contact route, and personalization trigger are recorded.
- [ ] No purchased, scraped, sensitive, private, or unverifiable personal data is used.
- [ ] Invalid, risky, catch-all, bounced, opted-out, client-conflicted, and do-not-contact records are suppressed.
- [ ] The sender identity, company identity, honest subject, physical mailing address, and functioning opt-out method meet the rules for the recipient's jurisdiction.
- [ ] Canadian, UK, EU/EEA, and other stricter markets receive separate legal review before outreach.
- [ ] Opt-outs are honored immediately in the operating system, even when a longer statutory deadline may exist.

This is operational guidance, not legal advice.

## G. Message and approval proof

- [ ] One segment, one current public observation, one offer, one link, and one ask are selected.
- [ ] Every bracketed placeholder in the draft is replaced with a verified fact or removed.
- [ ] The message contains no invented client, testimonial, metric, ranking, AI citation, conversion, urgency, or private-system assumption.
- [ ] The exact recipient, company, subject, body, URL, personalization evidence, evidence date, sender, and opt-out line are staged together.
- [ ] Dillon reviews and approves that exact staged message and recipient before any send.
- [ ] Any edit after approval returns to preview unless the approval explicitly covers the edit.
- [ ] Follow-ups add a new angle or resource. None say “just checking in” or repeat the first touch.
- [ ] Sent, replied, opted out, bounced, paused, and completed are recorded as distinct states.

## Launch authorization record

| Field | Current value |
|---|---|
| Website status | Live verified on Vercel; booking CTA release deployed |
| Outreach copy | Five reviewed Gmail drafts plus 50 nationwide review drafts in preparation; all unsent |
| Prospect list | 137 unique public business emails across all 50 states plus DC; 0 send-authorized |
| Sending domain | Not verified in this artifact |
| Mailbox authentication | Not verified in this artifact |
| Legal footer and address | Not verified in this artifact |
| Messages sent | **0** |
| LinkedIn actions taken | **0** |
| Publication or deployment performed by this outreach task | **No** |
| Permission to use drafts | **No, until all applicable gates pass and the exact send is approved** |
