---
tags: [campaign, outreach, copy, email, voice]
campaign: "[[AI Site Builder Outreach Engine]]"
created: 2026-09-02
status: draft-awaiting-approval
voice_source: "[[Dillon Voice Profile]]"
---

# Outreach Copy — Dillon voice

One-line summary: the web-design cold sequence written as Dillon rather than as an agency, built on
[[Dillon Voice Profile]] and reusing the sending rules already set in [[Drip Copy]].

**Nothing here sends.** Drafts only, pending approval and a warmed sending domain.

## What this reuses

Sending rules, CAN-SPAM footer, suppression handling, three-touch cap, and the Canada hold all come
from [[Drip Copy]]. Do not restate or re-decide them here. Two changes only:

1. **Sender is Dillon**, not Sean. These are his builds, so his name carries the proof.
2. **Not his personal Gmail.** `dillonmohr8777@gmail.com` runs client work and live proposals. Cold
   volume goes on a separate warmed domain, ramping ~20/day to 100 over 2–3 weeks.

## The wedge

Every other agency email asks for a meeting to talk about a website. This one has already built the
website. The entire advantage is that the link is real and it is theirs, so the copy should get out
of the link's way.

Link format: `https://momentum-prospect-radar-next10-2026-09-02c.netlify.app/sites/{{slug}}/`
(verified live 2026-09-02). One link per email. No attachments, no PDFs, no video files.

---

## T1 — the build

**Subject options:**
1. `built {{business}} a new homepage`
2. `made you something, {{city}}`
3. `{{business}} — new homepage, no charge`

**Body:**

Hi {{first_name}},

I build websites for local businesses in {{city}} and I already built yours. No charge, nothing owed,
you can look at it or not:

{{site_url}}

It's a real page, not a mockup. Your services, your photos, your phone number. I used your existing
site and your Google listing as the source so the facts should be right - if I got anything wrong
tell me and I'll fix it.

If you like it I'll walk you through what it'd take to make it live. If you don't, no hard feelings
and I won't email you again.

Dillon Mohr
Momentum 360 · Philadelphia
[CAN-SPAM footer]

---

## T2 — the specific thing (4 days later)

**Subject:** `re: {{business}} homepage` (threaded reply to T1)

**Body:**

Hi {{first_name}},

Following up on the homepage I built you: {{site_url}}

One specific thing I noticed on your current site: {{observation}}. That's the kind of thing that
quietly costs you calls, and it's fixed on the version I built.

Worth 15 minutes? I'll show you what I changed and why.

Dillon
[CAN-SPAM footer]

> `{{observation}}` is required and must be a real, verified finding from the build - "your site
> isn't mobile responsive so it renders the desktop layout on phones," "your contact form posts
> nowhere," "you don't appear for {{service}} in {{city}}." **Never send T2 without one.** A generic
> observation makes the whole sequence read as a template and kills the wedge.

---

## T3 — the close (5 days later, final)

**Subject:** `last one from me`

**Body:**

Hi {{first_name}},

Last email from me, promise.

The homepage is still up here if you ever want it: {{site_url}}

If it's useful, reply and I'll make it yours. If not I'll leave you alone - I know you're busy running
{{business}}.

Either way, good luck this year.

Dillon
[CAN-SPAM footer]

---

## Why this sounds like him

Checked against [[Dillon Voice Profile]]:

- **No jargon.** Zero instances of elevate, unlock, seamless, solutions, transform. Matches his
  measured 0-count across 479 messages.
- **Front-loads the outcome.** "I already built yours" is the first real sentence, matching his
  "August report attached. Google delivered $504.49..." pattern.
- **Names the gap.** "if I got anything wrong tell me and I'll fix it" is his verified habit of
  stating what he has not confirmed rather than bluffing.
- **Ends on a next step with an owner.** Every touch closes on who does what.
- **Hyphens, contractions, plain words.** No em dashes. `I'll` not `I will`.
- **Gives an easy out.** "no hard feelings," "I'll leave you alone" - his real register with people
  who owe him nothing.

What is deliberately held back from Register A: no profanity, no `lol`, no stretched letters, no
emoji. Those are real but they are how he writes to people who already know him. To a stranger they
read as unserious, and the profile's own limits section flags cold voice as unvalidated.

## Open before this can send

1. Sending domain bought, SPF/DKIM/DMARC passing, warmed 2–3 weeks.
2. `{{observation}}` populated per prospect from the build's QA output. Blocks T2 entirely.
3. Approval on the exact prospect list and this copy.
4. Reply handling: these come back to a mailbox a human reads, same day.
