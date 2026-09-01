---
note_type: concept
status: active
created: 2026-08-01
updated: 2026-08-19
domain: website production
maturity: operational
summary: A website factory scales reusable production and verification while preserving distinct art direction, factual accuracy, accessibility, performance, AEO, human taste, and purposeful interaction detail.
review_on: 2026-09-01
verification_status: verified
source_refs:
  - "[[_templates/site-factory/README]]"
  - "[[02_Campaigns/AI Site Builder Outreach Engine/AI Site Builder Outreach Engine]]"
  - "[[02_Campaigns/AI Site Builder Outreach Engine/Pipeline Spec]]"
  - "[[12_Brain/05_Projects/2026-07-30 - Dillon OS five-goal operating plan]]"
  - "[[12_Brain/04_Decisions/2026-08-19 - Site factory lineages]]"
  - "[[Daily-Briefs/aeo-trust-report]]"
  - "C:\\Users\\dillo\\Documents\\Codex\\2026-08-04\\build-the-next-25-websites-based\\DESIGN.md"
  - "C:\\Users\\dillo\\Documents\\Codex\\2026-08-04\\build-the-next-25-websites-based\\batch-phl-2026-08-04-b3\\factory-report.json"
  - "https://www.designspells.com/"
tags:
  - brain
  - concept
  - website-factory
  - web-design
  - qa
  - aeo
---

# High-Craft Website Factory

A factory should remove repeated setup and predictable defects. It should not
remove judgment, brand identity, or taste.

## Two production tiers

### Tier A: volume system

Shared architecture and automated build for qualified cold prospects, local
campaign pages, or repeatable client needs. It earns speed through structured
briefs, reusable components, tokens, and deterministic QA.

### Tier B: bespoke system

Unique information architecture, art direction, motion language, and deeper
product thinking for engaged prospects, strategic clients, or important owned
ventures.

Do not spend Tier B effort on unqualified cold volume. Do not present Tier A as
bespoke craft when it is not.

Lineage split (2026-08-19): weekly mail/QR batches use `_templates/site-factory/`.
Daily private concepts use `automation/prospect-radar-next20/`. Radar V2 grades.
Cloud homepage PRs are not a third factory.
[[12_Brain/04_Decisions/2026-08-19 - Site factory lineages]]

## Factory loop

```text
discover -> qualify -> harvest -> diagnose -> brief -> art direction
-> build -> deterministic QA -> visual/taste review -> AEO/trust gate
-> maker/checker evidence -> exact approval -> mapped deploy -> observe
```

## Batch 2 and Batch 3 scaling recipe

The cold-prospect system can scale without becoming a palette-swap factory.
Batch 3 established the production pattern to preserve:

- use 25 structurally different skeletons exactly once per 25-site run;
- give every business a unique proposition, section rhythm, type treatment,
  palette, trade motif, motion vocabulary, and conversion journey;
- translate the trade into visual grammar: pipe routes, valves, and flow for
  plumbing; masking, strokes, swatches, and rollers for finishes; drawings,
  elevations, and assemblies for construction and interiors;
- use an exact verified public logo when one is source-located; otherwise use
  a transparent exact-name concept wordmark and never invent an emblem;
- use verified permission-safe business imagery when available; otherwise use
  original trade-specific illustration and never imply it is completed client
  work;
- ban inherited vertical language, unsupported proof, fake testimonials,
  invented service areas, and self-links that make a preview look official;
- inspect one desktop and one mobile contact sheet as a complete set so visual
  sameness is visible, then perform a bounded repair and confirmation pass;
- run static, rendered, responsive, reduced-motion, accessibility, content,
  deterministic-build, and source-asset uniqueness gates;
- bind an independent reviewer verdict to the final SHA-256 manifest after all
  source changes; a technical pass alone is not publication permission; and
- keep each published batch immutable so a URL sent to a business remains
  valid after later Tuesday, Thursday, and Saturday runs.

The active cadence is 25 sites at 5:00 PM America/New_York on Tuesday,
Thursday, and Saturday. Each run is fail-closed: fewer than 25 currently
verified no-website candidates, an unresolved fact, a weak visual review, or a
missing prior route stops publication instead of lowering the bar.

### No-website identity gate

A blank website field in a sheet, directory, association list, or municipal
record is only a lead. Before a business can enter a batch, search its exact
name, aliases, phone, street address, public email, owner name, Google business
surface, social profiles, and plausible first-party domains. Compare every
candidate domain against those identifiers. A domain matching two independent
identifiers belongs to the prospect even when its displayed brand name or phone
differs, so the prospect must be excluded. A social-only profile is not a
standalone website, but it must be checked for outbound domains.

Every selected prospect needs a dated evidence ledger with one current
legitimacy source, the search surfaces used, plausible domains considered,
identifier cross-match results, and an explicit
`verified_no_standalone_website` decision. Ambiguous identity is a hard hold;
production volume never justifies a filler slot.

The Google Sheet operational source is the `Verified Master` tab only.
`Website Exclusions`, `Needs Review`, and every `ARCHIVE` tab are evidence and
history, never eligible build queues.

This system is now website-only. QR codes, direct-mail files, tracked print
links, and automated outreach are outside the factory. Publication may occur
only to the exact mapped Netlify lane; prospect contact remains on hold.

## Brief contract

Every build needs:

- exact business and project route;
- audience, job, offer, and conversion path;
- verified facts and source locators;
- content hierarchy and page purpose;
- real brand palette, typography, imagery, and voice;
- art-direction concept;
- section and interaction plan;
- responsive and accessibility requirements;
- technical, analytics, and AEO requirements;
- deployment target and `noindex` policy; and
- acceptance checks and rollback.

Unverified facts stay empty or clearly provisional.

## Craft floor

### Art direction

- One coherent visual idea tied to the business.
- Distinct composition, rhythm, typography, imagery, and motion.
- No default template personality.
- Real or properly licensed imagery with provenance.
- No fabricated inventory, awards, testimonials, statistics, or official
  status.

### UX

- Clear hierarchy and primary action.
- Mobile-first flow and usable touch targets.
- Navigation, forms, calls, booking, and links work.
- Content answers the user's actual questions.
- Reduced-motion support and no motion-only meaning.
- Empty, error, loading, and success states where the product needs them.

### DesignSpells reference rule (instituted 2026-08-05)

DesignSpells is a pattern reference for purposeful interaction detail, not an
asset library, a style to copy, or a replacement for the verified factory
brief. Its catalog exposes relevant categories including interaction,
animation, motion, transition, buttons, mobile, desktop, and 3D, so each UI
surface and each 25-site batch may use the relevant category as a bounded
source of ideas. The selected spell URL or slug must be recorded in the brief
or evidence manifest when it materially informs the work.

- Pull at least one purposeful interaction idea only when it supports the
  page goal, hierarchy, comprehension, feedback, or conversion.
- Convert an idea into a local reusable token or component only when the same
  intent appears across at least three surfaces. Preserve the existing
  factory system, each brand's art direction, and the distinct interaction
  language already established across the site portfolio.
- CTA scroll motion must communicate hierarchy or state, activate on
  intentional visibility or interaction, remain short and interruptible, stay
  visible to keyboard users, and provide a reduced-motion-safe fallback. It
  must never make the CTA difficult to use or hide meaning behind motion.
- QA every motion detail on desktop and mobile with touch, keyboard focus,
  reduced motion, overflow and layout-shift checks, console checks, and a
  meaningful-purpose review. CSS, Motion, or GSAP may implement the behavior
  when appropriate, with a simple functional fallback.

The current source is provenance for inspiration only. It does not grant an
asset or licensing claim, and it does not outrank first-party brand evidence,
the current factory brief, accessibility requirements, or human review.

### Engineering

- Responsive at required breakpoints and real device widths.
- No overflow, broken crop, missing asset, or layout shift.
- Semantic HTML, labels, keyboard access, and contrast.
- Performance appropriate to the experience.
- Secure forms and correct destinations.
- Analytics and consent implemented only when authorized and tested.

### Search and trust

- Valid title, description, canonical, viewport, and H1.
- Crawl/index policy matches the build stage.
- Direct answers and useful structure.
- Accurate schema matching visible content.
- Entity, contact, service, and local parity.
- Real proof and internal links.
- No placeholders.

## Prospect demo rules

- Default to private or `noindex`.
- Do not imply endorsement, ownership, or an official redesign.
- Preserve image and source provenance.
- Verify business facts; omit unknowns.
- One review hub can package a batch, but each site remains separately routed.
- Outreach and public deployment require exact approval.

## Quality gates

### Static

Schema parses, required metadata exists, assets resolve, CTAs are non-empty,
alt text is useful, sections meet the brief, and placeholder copy is absent.

### Functional

Navigation, forms, calls, booking, media, analytics, error states, and external
destinations behave as intended.

### Responsive and visual

Inspect desktop, tablet, and mobile screenshots; overflow; crop; contrast;
spacing; density; type scale; visual sameness; and reduced motion.

### Independent review

The checker differs from the maker and inspects the actual rendered output.
For batch work, preserve a hashed walkthrough artifact and checker verdict.

### Deployment

Verify the exact existing target, build artifact, rollback, and live result.
A passing preview gate does not authorize publication.

## Factory scorecard

- builds completed per period;
- time and cost per build;
- first-build full QA pass rate;
- visual defects by type;
- duplicate imagery or sameness violations;
- accessibility and performance results;
- AEO/trust pass rate;
- approval-to-deploy cycle time;
- demo engagement, calls, qualified replies, and closes; and
- post-launch qualified outcomes.

## Learning loop

Every defect or result should update the correct layer:

- reusable component or token;
- brief field or template;
- QA rule;
- content or fact-source rule;
- vertical pattern;
- art-direction library; or
- prospect scoring model.

Do not hard-code one client's facts or style into the reusable system.

## Failure modes

- Template sameness presented as personalization.
- Source imagery treated as licensed ownership.
- A blank directory website field treated as proof that no first-party domain
  exists.
- An alias, changed phone, or slightly different brand name allowed to hide a
  first-party domain that matches the same address, email, or owner.
- Beautiful desktop with broken mobile.
- Automated checks used instead of visual judgment.
- A screenshot used as proof that forms or analytics work.
- A preview called live production.
- Indexing a prospect demo.
- Adding motion without purpose or reduced-motion support.
- Optimizing for AEO while the page is unclear or untrustworthy to people.
