---
tags: [campaign, evidence, slack]
campaign: "[[AI Site Builder Outreach Engine]]"
compiled: 2026-07-29
source_channels: ["#ai-tech-news", "#ghl-leads-apollo", "#momentumsites", "#360newprojects"]
---

# Slack Evidence Log

Every message in Slack that defines, requests, or reports on the site builder engine. Compiled 2026-07-29 from `#ai-tech-news` (C04HXSVN2CS), `#ghl-leads-apollo`, `#momentumsites` (C1CFQBC79), and `#360newprojects`. Quotes are verbatim; permalinks go to the exact message.

## The original ask

**Mac Frederick, 2026-07-07, #ghl-leads-apollo** (to Jesse DiLaura, Melissa Silber, Luke Mazur)

Three AI lead-gen ideas, first one being "AI scrape + AI website + Direct Mail with QR" with an Instagram reference example.

**Mac Frederick, 2026-07-09 10:31 EDT, #ai-tech-news** — [permalink](https://momentum3d.slack.com/archives/C04HXSVN2CS/p1783607518389479)

> AI Outbound/Marketing Ideas to Implement for Client Acquisition
> 1. AI Site Builder Outreach = AI scrape + AI website + Direct Mail with QR
> 2. AI Audit Outreach = Kenzi AI audit + outreach
> 3. AI Video Outreach = Direct Outreach via IG/LI (Higgsfield etc) ie. "hey we made you this"

**Mac Frederick, 2026-07-09 10:39 EDT, #ai-tech-news** — [permalink](https://momentum3d.slack.com/archives/C04HXSVN2CS/p1783607975129749)

> Direct Mail Option = stackadapt.com/programmatic-direct-mail-advertising
> Bot scrape > database > AI site builder > Zapier > QR Code > Direct Mail > Gate Keep for Sales Call

This single line is the canonical pipeline definition for this campaign.

**Jesse DiLaura, 2026-07-09, same thread**

> I like it! Both of these can be automated outbound ai enabled campaigns: Premade marking / SEO audit - sent to you. And pre made ad - sent to you

**Dillon Mohr, 2026-07-09 14:30 EDT, same thread** — [permalink](https://momentum3d.slack.com/archives/C04HXSVN2CS/p1783621805655439)

> Also get started on my end once 5.6 releases later today with the AI site builder I think that's a phenomenal idea

**Mac Frederick, 2026-07-09, same thread (adjacent idea, not this campaign)**

Weekly webinars to a large business-owner list, sell via Zoom then book 1v1s. Noted as "haven't considered how to leverage AI into this yet." Parked as a separate lane.

## Delivery: the Philadelphia package

**Dillon Mohr, 2026-07-12 08:04 EDT, #ai-tech-news** — [permalink](https://momentum3d.slack.com/archives/C04HXSVN2CS/p1783857840872869)

Key claims from the delivery message:

- Hub holds **35 previews**: 25 polished Philadelphia prospect homepages, 7 original concepts, 3 deeper multipage pilots
- Peter Mechanical and The Roof Doctor appear in original and deeper versions to show progression; Graveley Roofing is the third deeper pilot
- Method for the 25: researched how each business presents itself, first-party copy, exact business imagery, every photo unique across the batch, cleaned logo presentation, richer food/merch/event/product/service sections, per-site colors, layout, Liquid Glass treatment, motion, hover behavior, scroll reveals, contact section, footer
- Package includes tracked Netlify previews, **35 QR codes**, prospect CSV files, link manifest, GitHub source, and a PDF mapping the system back to Mac's original ask
- QA: **1,032 responsive assertions across seven screen sizes**, 288 live images verified, zero contrast failures, zero live deployment failures
- All 25 previews live as **private noindex drafts**
- Framing: "this is now a repeatable Philadelphia outreach engine"
- Explicit next-step recommendation: next batch as deeper homepage offers, reserve full multipage builds for prospects who show interest

Closed by asking Mac what stands out, what he'd change, and how he'd want to turn it into the next outreach batch.

## Mac's response: the open question

**Mac Frederick, 2026-07-12 11:37 EDT, #ai-tech-news** — [permalink](https://momentum3d.slack.com/archives/C04HXSVN2CS/p1783870628126779)

> this is pretty cool great awesome start @Dillon Mohr thank you
> whats the steps taken we can use to automate everything
> maybe you and @Jesse DiLaura can collab on that this week

**This is the still-open request driving the current work.** No thread replies on that message. Approval of the output, plus a direct ask for the automation steps.

## Delivery: design upgrade pass

**Dillon Mohr, 2026-07-12 20:34 EDT, #ai-tech-news** — [permalink](https://momentum3d.slack.com/archives/C04HXSVN2CS/p1783902854102049)

> Here's the updated review hub with all 25 upgraded Philadelphia website designs
> This round, I really incorporated Claude into the mix using an array of design, UI/UX, accessibility, and visual-taste skills sourced from GitHub. That helped improve the typography, brand alignment, hierarchy, mobile layouts, interactions, imagery, and overall polish across the entire collection.
> Now that this design system and agent-assisted workflow are established, we'll be able to scale future website batches more quickly while maintaining stronger quality and giving every business a distinctive look.

**Dillon Mohr, immediately after**

> We should definitely have AI analyze sites maybe stay wide now that could really use a lift and they look really old and outdated. I think that would be a really productive way of utilizing this

Implication for the engine: prospect qualification should score how dated a site looks, and prioritize the worst offenders. That's now a scoring input in [[Pipeline Spec]].

## Delivery: the three deeper pilots

**Dillon Mohr, 2026-07-17 20:15 EDT, #ai-tech-news** — [permalink](https://momentum3d.slack.com/archives/C04HXSVN2CS/p1784333724246529)

Maps-first location and directions experience integrated into all three pilots, one link for all three. Pilot set: Bicycle Therapy, Head House Books, Maleek Jackson Boxing. Each routes to the verified business address in Google Maps.

**Dillon Mohr, same thread, build method**

> I connected Kimi Desktop directly into the production workflow as the primary creative and front-end design engine, with Codex operating as the orchestrator, researcher, reviewer, QA layer, and Netlify deployment manager.

> Kimi developed three separate creative directions from the business research instead of applying one reusable template. Bicycle Therapy became a tactile South Street workshop and cycling-community experience. Head House Books became a warm, editorial independent-bookstore experience. Maleek Jackson Boxing became a cinematic Philadelphia boxing experience with its own pacing and motion language.

> These are completely new designs and are intentionally different from the 25-site batch deployed last week. They do not share a common page architecture, typography system, motion vocabulary, or visual treatment with each other. The goal was for each homepage to feel genuinely native to the business rather than like the same template with different colors and copy.

**This establishes the two-tier product**, which the engine now formalizes:
- **Tier A (volume):** one shared architecture, per-brand tokens. Fast, consistent, good. This is what `_templates/site-factory/` automates.
- **Tier B (bespoke):** no shared architecture, creative direction derived per business. Slower, higher taste. Reserved for prospects who engage.

**Dillon Mohr, 2026-07-21 14:18 EDT, #ai-tech-news** — [permalink](https://momentum3d.slack.com/archives/C04HXSVN2CS/p1784657907493259)

> Finished the QA pass on all three live pilots. Desktop and mobile are clean, the links are working, and I found no console or overflow issues.

Individual pilot links given per client. Then the forward plan:

> The next step is basically for me to build out very deep homepage structures that are based on these reiterations and the 25 or so that we built last week and to keep it going in a continuous way every week and then let's really start to tackle outreach!

Sent to `@channel` with an offer to meet whenever. **Weekly continuous batches plus outreach is the stated operating cadence.**

## The orchestration layer

**Dillon Mohr, 2026-07-17 11:14 EDT, #ai-tech-news** — [permalink](https://momentum3d.slack.com/archives/C04HXSVN2CS/p1784301268342849)

M360 Orbit deep pipeline, 19 specialists with defined inputs, outputs, evidence rules, quality gates, cross-agent handoffs, pipeline states, and approval boundaries. The stated pipeline for bucket 1:

> discover a business and verify identity | evaluate fit, website health, ads, reviews, and local visibility | route the work to the right Orbit specialists | generate the prebuilt site, audit, competitor teardown, and sales brief | run quality and suppression checks | hold outreach until a human approves the exact prospect and message | hand approved work into CRM and track the outcome

And the eight-stage framing given to Jesse: Discover, Qualify, Diagnose, Build, Quality gate, Human approval, Activate, Learn.

> Nothing is auto-sending or writing to CRM yet.

**Jesse DiLaura, 2026-07-17:** "trying this now"

## The QR and mail leg

**Mac Frederick, 2026-07-22 09:28 EDT, #ai-tech-news** — [permalink](https://momentum3d.slack.com/archives/C04HXSVN2CS/p1784726883402889)

> Zapier Task = Automating QR Codes from rows added to a sheet [Zapier + QRTiger integration link]
> Direct Mail Process = Address Column in Sheets set to ready > Zapier connection to Mailer such as PostGrid

**This defines the integration contract:** a Google Sheet is the handoff surface. Our batch output must be a sheet-ready CSV with a URL column for QR generation and an address column with a ready flag for mail. That's exactly what the batch engine now emits.

**Dillon Mohr, 2026-07-22, same channel**

> Still ironing out the mail side the qr side is basically figured out

## Adjacent requests worth tracking

**Mac Frederick, 2026-07-22 10:25 EDT** — [permalink](https://momentum3d.slack.com/archives/C04HXSVN2CS/p1784730354170689)

> did we ever figure out how to reintegrate AI into Slack so we can do command props as a team or person directly into Slack @Dillon Mohr

Dillon: "I'll have to get back to that for you." Mac: "kk ty". **Still open.** Partially addressed by the `/slack-intake` skill, but Mac is asking for team-facing AI commands inside Slack, which is a different build.

**Mac Frederick, 2026-07-22 16:52 EDT**

> I just like keeping those trainings more focused and shorter because were going to lose AMs attention span quickly (including me lol), which is why a 5min Loom overview might be most valuable and saved to rewatch

**Format preference, applies to every handoff:** one link, five-minute Loom, detail available but not required.

**Melissa Silber, 2026-07-22**

Wants to discuss projects/ideas; notes team members vary in AI adoption and some need "short guidelines/prompts to test/case studies." Opportunity: the batch engine's runbook doubles as an internal case study.

**Sean Boyle, 2026-06-17, #360newprojects**

Philly shoot, 14 panos, $200 budget. Relevant as an in-house photography source for Philadelphia builds instead of scraped imagery.

## Cross-reference: the industry pages build

`#momentumsites`, ongoing through 2026-07-29. Beth Kann is coordinating content for needmomentum.com industry and service pages. Mac requested an AI section in the main nav with four sub-pages: AEO/GEO, AI Design, AI Marketing, AI Automation.

Industry pages drafted or needed: Medical & Healthcare, Spas & Wellness, Home Services, Legal & Law Firms, Cannabis & Restricted Categories, Industrial & Manufacturing, Multi-Location & Franchise, Professional Services (needed), Ecommerce (needed).

**Why this matters here:** batch verticals should mirror this list so prospect sites and industry pages reinforce each other. See the vertical alignment section in [[AI Site Builder Outreach Engine]] and the vertical column in [[Market Roster]].

## What Slack does NOT say

Worth stating plainly so nobody mistakes assumption for instruction:

- **No explicit Philadelphia to Pennsylvania to national directive from Mac or Melissa.** The geography ladder in [[Market Roster]] is Dillon's expansion plan. What Slack asks for is automating the Philly engine and running continuous weekly batches into outreach.
- No approved mail vendor decision. StackAdapt and PostGrid are both floated, neither confirmed.
- No approved budget for mail, and no target volume per batch.
- No prospect suppression list source of truth named yet.
