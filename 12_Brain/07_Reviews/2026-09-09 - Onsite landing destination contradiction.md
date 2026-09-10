---
note_type: review
status: active
created: 2026-09-09
updated: 2026-09-09
owner: Dillon Mohr
client: "[[01_Clients/Onsite Concrete/overview]]"
priority: critical
verification_status: verified
observed_at: 2026-09-09
next_action: Read the final URL of Search campaign 24183437726 in the Ads UI and settle it
tags: [review, onsite, google-ads, tracking, contradiction, unresolved]
source_refs:
  - "C:/Users/dillo/repos/dillon-os/_os/automation/google-ads-daily/omega-onsite-applied-status.md line 15 (2026-09-05)"
  - "C:/Users/dillo/Documents/Codex/projects/client-operations/clients/onsite-concrete-landscape/deliverables/2026-09-08-call-evidence-audit/form-destination-trace.md line 29 (2026-09-08)"
---

# Onsite landing destination contradiction

**Summary:** Two dated, read-only sessions three days apart recorded opposite
facts about where Onsite's live Search campaign sends its traffic. Both are
still on disk, neither has been reconciled, and the answer decides whether the
account's only live lane is measured or blind.

Verified 2026-09-09 by reading both source files directly.

## The two claims

**2026-09-05**, `omega-onsite-applied-status.md` line 15:

> "Exact active ad landing destinations: Omega
> `https://www.omegalandscapingandconcrete.com/` ; Onsite
> `https://onsiteconcretelandscape.com/services/` . **Neither targets the
> separately audited Netlify landing page.** Do not attribute the alternate
> pages' source defects to current ad traffic."

**2026-09-08**, `form-destination-trace.md` line 29:

> "**The Search campaign launched Jul 30 sends traffic to the Netlify page**,
> where the form is silent to Google Ads and has zero submissions since Aug 2."

These cannot both be true.

## Why it decides the account

**If 2026-09-05 is right** — traffic lands on the WordPress site, which *does*
carry tracking: GTM `GTM-PFJ633DF`, Google Ads conversion ID `16871144532`, a
form tag on `gtm.formSubmit`, and it carried **all 32** Google Ads form
conversions between 2026-04-01 and 2026-09-08. The Netlify page's missing
container is then harmless dead weight.

**If 2026-09-08 is right** — the only live lane in the account is
measurement-blind, and worse: the Netlify form's notifications go to **Dillon's
Gmail and a Zapier catch hook**, not to the client's inbox and not to Ads. Any
lead it produced would be invisible to both Onsite and Google.

The Netlify gap itself is verified independently and is not in dispute:
`index.html` for the 2026-08-01 landing page contains zero matches for `gtag`,
`googletagmanager`, `GTM-` or `AW-`, and its `script.js` guards a
`window.dataLayer.push` that no container ever creates — a silent no-op.
Submission history: 3 ever (Jun 18, Jul 7, Jul 7), and **0 on the version live
since Aug 2**.

## The single check that settles it

Open Google Ads account `103-371-5894`, campaign
`Search | High Intent | Solano County | 2026-07-30` (id `24183437726`), and read
the ad's **Final URL**. One field. Everything above turns on it.

That check could not be completed on 2026-09-09 — the in-app browser was held
by a page-opened sign-in popup for the whole session.

## The same Zapier shape as Omega

Worth noting: the Netlify form's notification path is an email to Dillon plus a
Zapier catch hook. That is the identical architecture that makes Omega's
match-back impossible — the client never receives the lead directly, and the
notification is a trigger rather than a record.

## Related

- [[12_Brain/07_Reviews/2026-09-09 - Omega search terms, first audit]]
- [[12_Brain/03_Concepts/2026-09-07 - Conversion match-back is the differentiator]]
