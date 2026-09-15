---
name: "momentum-spec-homepage"
description: "Build a speculative homepage for a local business in Dillon's \"Papa house style\" — the unsolicited spec site that gets printed and mailed as the pitch itself. Use this for any spec build, mock homepage, redesign concept, or outreach batch page for a prospect business (prior batches covered Philadelphia metro and South-Central PA; an Erie County batch is in progress). Applies the design calibration of visual variance 9/10, motion 8/10, information density 4/10 and the anti-slop ban on AI purple, neon glow, glassmorphism, floating gradient orbs and three-equal-card feature rows. Not for existing Momentum client sites, and not for reviewing a build that already exists."
---

# Momentum Spec Homepage

Build the speculative homepage that *is* the pitch. Dillon's outreach engine does not send a letter asking for a meeting — it sends the business a better version of their own website, already built.

## What makes this different from normal web work

The page has to survive being seen cold, by an owner who did not ask for it, in about four seconds. That changes the priorities:

- **It must be recognizably their business.** Real name, real services, real location, real photos where obtainable. A generic template with their logo dropped in reads as spam and gets thrown away. The whole persuasive force comes from "someone actually looked at my business."
- **It must be visibly better than what they have.** Not different — better, in a way a non-designer can feel instantly. Usually that means their current site is cramped, dated and text-heavy, and yours is spacious, modern and confident.
- **It must look expensive.** This is what justifies the call.

## Step 1: Learn the business before designing anything

Do not start laying out until you can answer these. Guessing here is what produces the generic result that fails.

- Exact business name, as they write it
- What they actually sell, in their own words, and which services matter most to them
- Where they operate and the towns they name — local businesses are specific about service area, and naming their towns is a strong signal you looked
- Who their customer is
- Their current site: what is on it, what it says, what it looks like, what is broken or dated
- Real proof: reviews, years in business, certifications, notable jobs, family history
- Their existing visual identity: logo, colors, any usable photography

Their existing photography matters more than anything you can generate. A masonry contractor's own job photos are the single most persuasive asset on the page, and stock imagery of a different building undoes the "someone looked at my business" effect immediately.

## Step 2: The design standard

Read the full brief at `C:\Users\dillo\Documents\Codex\2026-07-17\find-these-for-me-pls-in\publish\kimi-packet\kimi-brief.md` when you can reach it. The compressed version:

**Visual variance 9/10.** Consecutive sections must not share a skeleton. Rotate the axis, the crop, the rhythm, the background. If two adjacent sections can be described by the same sentence, rebuild one.

**Motion 8/10.** Scroll-linked reveals, staggered entrances, parallax with real depth, hover states that displace. Motion with a job, not shimmer.

**Information density 4/10.** Low. Big type, few words, lots of air, one idea per section. This is the dial that separates the spec page from what the business currently has, because their current site is almost always dense. Resist filling space.

**Banned outright:** AI purple and indigo-violet gradients, neon glow, glassmorphism, floating gradient orbs, and the three-equal-card feature row. That last one especially — three identical icon-heading-blurb cards is the reflexive layout that variance 9 exists to prevent.

**Color** comes from the business, not from you. Take it from their logo, their trucks, their storefront, their trade conventions. A landscaper and a bridal shop should not arrive at the same palette.

## Step 3: What goes on the page

Structure follows the business, but a local service business page generally needs: an opening that names them and what they do without cleverness, real proof early, the services they actually sell, the towns they serve, their own photography given room, and an obvious way to contact them with their real phone number.

Two things to get right because they are what the owner checks first:

**Their phone number and name must be correct and prominent.** An owner who spots a wrong number stops reading.

**The headline should sound like their business, not like a marketing agency.** "Third-generation masonry in Erie County since 1974" beats "Elevating Your Outdoor Living Experience." Local owners are allergic to agency language, and it undermines the credibility the rest of the page is building.

## Step 4: Build it clean

Ship a self-contained HTML file with inlined CSS and JS — it has to be openable, screenshotable and printable without a build step. Make it responsive; the owner may well open it on a phone.

Do not include fake content the business would have to make real: invented testimonials, made-up stats, fictional team members, fake awards. Beyond the honesty problem, it collapses the pitch the moment they notice. Where real content is missing, design around the absence rather than fabricating it.

## Step 5: Hand it off

Save to the batch's working folder, following the naming pattern already in use for that batch. Note anything you had to leave as a placeholder and anything you could not verify, so it gets caught before mailing.

Then it should go through the spec build QA pass before it is printed and mailed. Do not treat a build as ready because it looks good in your own preview — the QA pass exists because the failure modes here (wrong phone number, wrong town, stale business name) are invisible to the person who just built it.

