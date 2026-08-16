---
tags: [project]
status: active
updated: 2026-08-16
source: "[[12_Brain/decisions/2026-08-13 - Prospect Radar V2 audit engine]]"
---

# Prospect Radar V2

**Summary:** Evidence-backed free SEO, AI/AEO, and marketing audit engine for
Momentum 360, wrapping the existing radar instead of replacing it.

Engine: `_os/radar-engine/`. Setup: `_os/radar-engine/README.md`. Decision:
[[12_Brain/decisions/2026-08-13 - Prospect Radar V2 audit engine]].

Durable private state is PostgreSQL when `DATABASE_URL` is set. Jobs claim with
`FOR UPDATE SKIP LOCKED`. Stores hydrate on boot. Object storage writes the
private filesystem; live S3/Places/Turnstile/CRM stay off until an explicit
live flag is set. Outbound adapters stay dry-run. Human QA is mandatory. Intake/contact columns encrypt at rest when
`RADAR_V2_FIELD_KEY` is set. `radar-v2.js retain` revokes expired report URLs
and anonymizes aged PII.

Existing radar (preserve): `_os/automation/lib/radar.js`, `site-audit.js`,
`site-grader.js`, `opportunity.js`, `places.js`, `contacts.js`,
`contact-store.js`.

## 2026-08-16 product pass

Intake now runs the funnel. A submit resolves the business, infers vertical from
the form (no more hardcoded HVAC), scans a matching fixture or a live public URL
when `RADAR_V2_LIVE_SCAN=true`, and drafts a NeedMomentum report through human
QA. The report cover matches the Fallston-style promise: SEO + MARKETING AUDIT,
plus brand, competitor honesty, content strategy, and lead generation tied to
what the requester typed.

## Critique (what was weak, what is still open)

Shipped this pass:
- The public form was a dead end. It stored the request and never scanned.
- Every prospect was scored as HVAC.
- Intake answers never appeared in the report.
- The PDF read like an internal scorecard, not a client audit.
- Competitive, brand, content, and lead-gen modules were named and empty.
- Score tables used an em dash. Privacy and terms said Placeholder.

Still better later, not this pass:
- Homepage only. No inner pages, GBP live match, or Search Console.
- Competitor section is honest and empty of names. Do not invent rivals.
- Live scan is gated. Default is fixture or wait.
- No send. Kill switch stays on.
- Form is still long. A two step (URL first, then goals) would convert better.
- Print PDF needs Playwright on the box that serves it.

## Slack draft for Mac (no dashes)

Mac

We built the free SEO AI and marketing audit lane you sketched.

What a business does
They enter the site plus a few facts. We scan the public homepage. A human checks the evidence. Then they get a NeedMomentum branded report.

What the report now covers
Website SEO
Brand presence
Competitor position without inventing rival names
Content strategy tied to the goal they typed
Lead generation path
A 90 day roadmap

What we will not do yet
No live email
No CRM write
No autonomous outreach
Kill switch stays on until you and Jesse want a real send

If you want this in market next we should pick one vertical and one human reviewer and run 10 real sites through QA before anyone gets a link.
