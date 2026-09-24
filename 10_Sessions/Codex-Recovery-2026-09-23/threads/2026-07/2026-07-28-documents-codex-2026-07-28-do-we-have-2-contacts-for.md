---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-07-28T17:14:30
session_last: 2026-07-28T17:14:30
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-07-28\do-we-have-2-contacts-for"
tags: [codex-recovery, session, 202607]
---

# Documents\Codex\2026-07-28\do-we-have-2-contacts-for

**1 session(s)** · 2026-07-28 17:14 → 2026-07-28 17:14 · 2.7h agent-time (summed; sessions may overlap) · 36 MB transcript · 8/8 turns completed

## 1. 2026-07-28 17:14 · 2.7h · 36.5 MB

`019fa9b8-885c-7aa0-a4b2-ff0477df0559` · turns 8/8

**Asked:**

> Do we have 2 contacts for shadow heating

> Since we launched! Did anyone get notified?

> I mean in their website dude

**Outcome reported:**

> You were right to push back—my first check missed Netlify’s separate spam queue.
> 
> I found three website contact submissions:
> 
> - July 15: SEO sales solicitation
> - July 20: fake “register your site with Google” solicitation
> - July 21: website-promotion solicitation
> 
> The July 20 and 21 entries are probably the “two people” she saw, but neither was an HVAC customer. Netlify classified all three as spam, hid them from the default verified-submissions view, and no notification emails were delivered. Netlify separates verified and spam submissions, and form notifications apply to verified submissions. [Netlify form-submission documentation](https://docs.netlify.com/manage/forms/submissions/), [Netlify notification documentation](https://docs.netlify.com/manage/monitoring/notifications/).
> 
> Gmail confirms that only our four July 23 QA tests generated notification emails. If she means two genuine HVAC prospects, ask her for their names or approximate submission times—the two real submissions she describes are not currently in Netlify’s verified or spam records.
> 

> Email sent to Lauren at `lauren@laurenhanan.com`, CC Sean at `sean@needmomentum.com`, in the existing Shadow handoff thread. I asked for both names and approximate submission times.

> I traced both names:
> 
> - Scott Smith
> - Mike Cortese
> - Approximate date: July 20
> 
> Neither name appears in Netlify’s verified submissions, spam submissions, or Dillon’s notification emails. The July 23 cleanup deleted only three specifically identified QA records, so Scott and Mike were not accidentally removed during testing.
> 
> The likely issue is that the earlier version of the service form could show success before collecting the final contact details. That defect was repaired and verified on July 23. Their historical contact information is not recoverable from Netlify’s current records.
> 
> The forms work now, but I recommend adding Jennifer to notifications and creating a redundant lead record so a future submission cannot disappear this way.

> The Shadow handoff is now mostly complete and verified:
> 
> - Lauren, Jennifer, and the Shadow inbox have GA4 administrator access and Search Console owner access.
> - All three have Netlify Owner rights limited to the Shadow website. Their invitations are pending acceptance.
> - All three now receive contact forms, service requests, site-health alerts, and the [weekly GA report](https://support.google.com/analytics/answer/13722168).
> - Lauren’s obsolete Netlify invitation was removed.
> - The domain remains client-controlled through Squarespace.
> 
> Two blockers remain:
> 
> - Meta: Dillon’s authenticated Meta account has no Shadow business, Page, or ad account—only unrelated client assets. We need the exact Shadow business/Page/ad-account ID or an invitation from its current owner.
> - GitHub: the private repository still only has Dillon. Send me the GitHub username for Lauren or whichever technical owner should receive it; their emails do not resolve to GitHub accounts.
> 
> I found these four live service-related pages:
> 
> - `/services`
> - `/packages`
> - `/book-a-service`
> - `/service-area`
> 
> I did not delete them because that would remove live content and affect navigation and SEO. Do you mean delete those four pages from `shadow-heating.com`, or remove Momentum’s access/materials after they accept the handoff?
> 
> The access changes also do not recover the historical Scott Smith and Mike Cortese submissions; Netlify still has no stored service-request records for them.
> 

> Do you mean configure **Meta for Shadow Heating**, configure the **website forms**, or configure the **service-page removal/redirects**?

> Yes—the routing is configured correctly now:
> 
> 1. Both forms submit to Netlify as `contact` or `service-request`.
> 2. The website only displays success after Netlify returns a successful response.
> 3. Netlify stores the submission as the source of truth.
> 4. Netlify emails Lauren, Jennifer, the Shadow inbox, and you.
> 
> I also confirmed the live site is serving the Netlify form definitions.
> 
> The final proof is one labeled live test submission, then verifying:
> 
> - It appears inside Netlify Forms.
> - All four recipients receive the email.
> - The website displays the success message.
> 
> That test will email the client team. Say **“run the test”** and I’ll submit one clearly marked `TEST – PLEASE DISREGARD` and verify the stored record.

<sub>rollout: `C:\Users\dillo\.codex\archived_sessions\rollout-2026-07-28T13-14-30-019fa9b8-885c-7aa0-a4b2-ff0477df0559.jsonl`</sub>
