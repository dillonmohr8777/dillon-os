# Align HCM HubSpot CMS Edit Pack
**Prepared for:** Dillon Mohr  
**Brand:** Align HCM (not Momentum 360)  
**Date:** July 21, 2026  
**Status:** Paste-ready. Do not publish until reviewed in HubSpot.

---

## 1. Page title and meta description packs

### SmartCare (`/align-hcm-smartcare`)

**Current title:** SmartCare | Align HCM

#### Option A: SEO-primary

**`<title>` (paste into Page settings > SEO title):**
```
SmartCare HCM Support | Post-Go-Live UKG, Dayforce, Workday | Align HCM
```

**Meta description (paste into Page settings > Meta description):**
```
SmartCare is Align HCM's post-go-live HCM support for UKG, Dayforce, Workday, Paylocity, ADP, and HiBob. Stabilize payroll, clear your backlog, and scale from Essentials to Transform without replacing your platform.
```

**HubSpot CMS notes:**
• Character count: title ~68 chars, meta ~158 chars  
• Primary keyword target: post-go-live HCM support, SmartCare  
• Secondary: UKG support, Dayforce support, HCM optimization after go-live

#### Option B: AEO-primary

**`<title>`:**
```
What Is SmartCare? Post-Go-Live HCM Support by Align HCM
```

**Meta description:**
```
SmartCare is vendor-agnostic post-go-live HCM support from Align HCM. Teams use Stabilize, Essentials, Accelerate, and Transform to fix payroll issues, reduce backlog, and improve adoption on UKG, Dayforce, Workday, Paylocity, ADP, or HiBob.
```

**HubSpot CMS notes:**
• Lead with definitional phrasing for AI answer engines  
• Include maturity ladder terms in on-page H2s if not already mirrored in meta  
• Add FAQ schema on page if not present (matches existing FAQ pattern on service pages)

---

### Insights (`/insights`)

**Current title:** Insights | Align HCM

#### Option A: SEO-primary

**`<title>`:**
```
HCM Insights & Best Practices | Implementation, Payroll, Optimization | Align HCM
```

**Meta description:**
```
Expert HCM insights from Align HCM on implementation, payroll, UKG, Dayforce, Workday, optimization, and post-go-live support. Practical guidance for HR, payroll, and IT leaders in the mid-market.
```

**HubSpot CMS notes:**
• Character count: title ~72 chars, meta ~155 chars  
• Primary keyword target: HCM insights, HCM best practices  
• Align with top blog categories already on page: HCM Implementation, System Optimization, Buyer's Guide

#### Option B: AEO-primary

**`<title>`:**
```
Align HCM Insights: Answers for HR, Payroll, and HCM Leaders
```

**Meta description:**
```
Find trusted answers on HCM implementation, payroll go-live, system optimization, vendor selection, and post-go-live support. Align HCM Insights covers UKG, Dayforce, Workday, Paylocity, ADP, and HiBob for mid-market teams.
```

**HubSpot CMS notes:**
• Use "answers" and role-based phrasing for AI citation  
• Consider adding a visible "Popular topics" block above the fold linking to buyer guides and payroll implementation content  
• Listing page meta should complement individual blog post titles, not compete with them

---

### Case Studies (`/case-studies`)

**Current title:** Case Studies

#### Option A: SEO-primary

**`<title>`:**
```
HCM Case Studies | Implementation & Optimization Results | Align HCM
```

**Meta description:**
```
See how Align HCM clients in hospitality, manufacturing, healthcare, and more improved payroll, workforce management, and HCM outcomes. Real case studies across UKG, Dayforce, and enterprise HCM platforms.
```

**HubSpot CMS notes:**
• Character count: title ~62 chars, meta ~157 chars  
• Primary keyword target: HCM case studies, HCM implementation case studies  
• Fixes missing brand in current title

#### Option B: AEO-primary

**`<title>`:**
```
Align HCM Case Studies: How Mid-Market Teams Fix Payroll and WFM
```

**Meta description:**
```
Align HCM case studies show how organizations stabilized UKG and Dayforce environments, reduced union grievances, automated overtime, and optimized talent management after go-live. Browse by industry and service.
```

**HubSpot CMS notes:**
• Name-check outcome types AI systems surface: payroll, WFM, union, overtime, talent management  
• Pair with HubDB-driven card teasers updated per Section 2  
• Listing page should not duplicate individual case study meta descriptions word for word

---

## 2. HubDB access request email

**To:** [Align IT / Web Owner name]  
**Cc:** [HubSpot admin], [Project sponsor if needed]  
**Subject:** HubDB read access request for case study SEO and conversion optimization

Hi [Name],

I'm working on SEO and conversion improvements for the Align HCM website, starting with case study titles, teasers, and service page embeds. I need read access to the HubDB tables that power case studies and any related dynamic modules so I can audit fields, draft optimized copy, and map case studies to service pages without guessing at the data model.

**Access needed:**
• HubSpot portal: [Portal ID]  
• Permission level: Read-only on HubDB (no publish rights required for this phase)  
• Scope: Case study tables and any linked dynamic page modules

**Tables to confirm (exact names may differ in our portal):**

| Table (confirm exact name) | Why I need it |
|---|---|
| `[Case Studies table]` | Master record for each published case study |
| `[Case Study Industries table]` or industry lookup | Filter tags on `/case-studies` (Hospitality, Manufacturing, etc.) |
| `[Case Study Services table]` or service lookup | Service filter tags and service page embed logic |
| `[Authors / Contributors table]` (if separate) | Byline and attribution on detail pages |

**Fields needed per case study row (please confirm internal API names):**

| Field purpose | Placeholder name to confirm in HubSpot |
|---|---|
| Primary headline (listing + detail H1 source) | `[name]` or `[case_study_title]` |
| URL slug | `[hs_path]` or `[slug]` |
| SEO page title override | `[seo_title]` |
| Meta description / SEO description | `[meta_description]` |
| Listing card teaser (short) | `[summary]` or `[card_teaser]` |
| Detail page intro / hero subcopy | `[hero_subhead]` or `[intro_text]` |
| Client / company name | `[client_name]` |
| Industry (single or multi) | `[industry]` / `[industries]` |
| Services delivered | `[services]` |
| HCM platform (UKG, Dayforce, Workday, etc.) | `[platform]` |
| Employee count / scale signal | `[employee_count]` |
| Geography / locations | `[geography]` |
| Key outcome metric or proof point | `[primary_result]` |
| Secondary outcomes (bullet-ready) | `[outcomes]` |
| Featured image | `[featured_image]` |
| Logo (if used on cards) | `[client_logo]` |
| Publish status | `[published]` or `[status]` |
| Publish / updated date | `[publish_date]` / `[updated_date]` |
| Detail page URL (computed or stored) | `[page_url]` |
| Sort order on listing page | `[display_order]` |
| Featured flag (homepage or service embeds) | `[is_featured]` |

**Priority records for first pass:**
• Troon  
• Peco Foods  
• Burnco / Hammerstone  
• Driscoll's  
• Kimberly-Clark  
• Resorts World Las Vegas

**What I'll do with access:**
• Export a field dictionary so marketing and web stay aligned on naming  
• Draft improved listing titles and meta descriptions where they're weak or missing brand/outcome language  
• Build a case study-to-service-page embed matrix (Section 3 of this pack)  
• Flag rows with missing `[meta_description]`, `[platform]`, or `[primary_result]` before we scale AEO content

**What I won't do:**
• Publish or deploy changes without your review  
• Edit production HubDB rows without a separate change request

Can you grant read access or send a CSV export of the tables above with the six priority records? Happy to jump on a 15-minute call if the table structure has changed since the last site build.

Thanks,  
Dillon Mohr  
Digital Marketing Manager, Align HCM  
dillon.mohr@alignhcm.com

---

## 3. Conversion-path pack: highest-traffic service pages

**Scope:** Service pages most likely to drive consultation requests based on current site structure, SEO blog CTAs, and SmartCare positioning. Apply CTAs in HubSpot page editor or relevant modules. Pre-set form field **How Can We Help?** to the suggested value where noted.

**Global CTA rules (all pages below):**
• Primary button style: existing orange CTA  
• Form destination: existing "Talk to Us" / contact module  
• Response promise: keep "usually within the hour" language where the ASAP module is used  
• Every consultation CTA should connect pain to proof via an embedded case study card

---

### 3A. `/services/implementation` — HCM Implementation Services

**Primary intent:** Buyer evaluating implementation partner before or during vendor selection.

**Embed these case studies:**

| Placement | Case study | Why it fits | Teaser line for card |
|---|---|---|---|
| Hero (secondary proof strip below H1) | **Burnco / Hammerstone** | Fast stabilization inside a PE timeline mirrors implementation urgency | Rapid HCM stabilization inside a PE 100-day plan. Ready for integration day one. |
| Mid-page (after "Choosing the right HCM implementation support" table) | **Peco Foods** | Post go-live recovery narrative bridges implementation to sustained WFM success | Moved past post go-live issues to a thriving WFM practice in under 6 months. |
| Mid-page (paired with "at-risk project" row context) | **Troon** | Scale + complexity proof for enterprise-leaning mid-market buyers | Stabilized a UKG environment through acquisitions, union complexity, and turnover. |
| Footer (before global form) | **Driscoll's** | Agriculture/hourly payroll complexity, UKG Pro | Automated overtime calculations for hourly staff on UKG Pro. |

**CTA copy by placement:**

**Hero (replace or supplement "Contact Us →"):**
• **Headline:** Plan your implementation with a team that's done hundreds of go-lives  
• **Button:** Book a free implementation consult  
• **Supporting line:** We'll review your platform, timeline, and risk areas. No vendor pitch.  
• **Form preset:** How Can We Help? = `HCM Implementation`

**Mid-page (new module after situation table):**
• **Headline:** Not sure if your project is on track?  
• **Body:** We'll assess scope, data readiness, testing, and stabilization planning in one working session.  
• **Button:** Request an implementation readiness review  
• **Micro-proof:** Trusted by teams like Peco Foods and Troon.  
• **Form preset:** How Can We Help? = `HCM Implementation`

**Footer (above "Speak to an expert ASAP"):**
• **Headline:** Get live on time without the rework tax  
• **Button:** Talk to an implementation specialist  
• **Supporting line:** Certified experts across UKG, Dayforce, Paylocity, HiBob, and more.  
• **Form preset:** How Can We Help? = `HCM Implementation`

---

### 3B. `/services/support` — SmartCare / HCM Support Services

**Primary intent:** Post-go-live team with backlog, capacity gap, or admin overload.

**Embed these case studies:**

| Placement | Case study | Why it fits | Teaser line for card |
|---|---|---|---|
| Hero (proof strip) | **Troon** | Ongoing support at massive scale | 30,000 employees, 900+ locations. Stabilized UKG through constant change. |
| Mid-page (after "The Support Gap" section) | **Resorts World Las Vegas** | Talent module optimization = SmartCare Essentials/Accelerate | Optimized UKG Talent Management for a complex hospitality workforce. |
| Mid-page (after FAQ block) | **Kimberly-Clark** | Ongoing operational improvement outcome | Reduced union grievances with structured HCM support and process alignment. |
| Footer | **Peco Foods** | "Thriving practice in under 6 months" = SmartCare ROI story | From post go-live firefighting to a thriving WFM practice in under 6 months. |

**CTA copy by placement:**

**Hero:**
• **Headline:** Your platform's live. Your team shouldn't run it alone.  
• **Button:** Get a free SmartCare assessment  
• **Supporting line:** We'll map where you are on Stabilize, Essentials, Accelerate, or Transform.  
• **Form preset:** How Can We Help? = `SmartCare Support`

**Mid-page (after support gap copy):**
• **Headline:** Clear the backlog without adding headcount  
• **Body:** SmartCare gives you expert capacity for payroll, time, reporting, releases, and integrations on the platform you already use.  
• **Button:** See which SmartCare plan fits  
• **Micro-proof:** UKG, Dayforce, Workday, Paylocity, ADP, HiBob. No migration required.  
• **Form preset:** How Can We Help? = `SmartCare Support`

**Footer:**
• **Headline:** Stop losing weeks on tickets your vendor can't solve  
• **Button:** Talk to a SmartCare specialist  
• **Supporting line:** Connect with a subject matter expert, not a sales rep.  
• **Form preset:** How Can We Help? = `SmartCare Support`

---

### 3C. `/services/optimization` — HCM Optimization Services

**Primary intent:** Live system with drift, low adoption, reporting gaps, or unused modules.

**Embed these case studies:**

| Placement | Case study | Why it fits | Teaser line for card |
|---|---|---|---|
| Hero (proof strip) | **Resorts World Las Vegas** | Talent optimization headline match | UKG Talent Management optimization for hospitality at scale. |
| Mid-page (after "Why Systems Drift") | **Kimberly-Clark** | Process + policy alignment outcome | Reduced union grievances by realigning configuration with how the business operates. |
| Mid-page (after situation table) | **Driscoll's** | Automation / overtime = optimization win | Automated overtime calculations and cleaned up hourly payroll workflows. |
| Footer | **Troon** | Ongoing optimization across acquisitions | Kept a complex UKG estate aligned through acquisitions and operating change. |

**CTA copy by placement:**

**Hero:**
• **Headline:** Your HCM system should match how you work today  
• **Button:** Book a free optimization review  
• **Supporting line:** We'll identify quick wins and a prioritized roadmap in one session.  
• **Form preset:** How Can We Help? = `SmartCare Support` (or add `HCM Optimization` if that option exists in the form)

**Mid-page:**
• **Headline:** Features you paid for shouldn't sit unused  
• **Body:** We'll audit adoption, reporting, integrations, and configuration drift, then sequence fixes by business impact.  
• **Button:** Schedule your optimization review  
• **Micro-proof:** See how Resorts World and Kimberly-Clark improved outcomes without replacing their platform.  
• **Form preset:** How Can We Help? = `SmartCare Support`

**Footer:**
• **Headline:** Turn your live system into a platform people actually use  
• **Button:** Talk to an optimization specialist  
• **Supporting line:** Vendor-agnostic across UKG, Dayforce, Paylocity, HiBob, and more.  
• **Form preset:** How Can We Help? = `SmartCare Support`

---

### 3D. `/align-hcm-smartcare` — SmartCare product landing

**Primary intent:** Highest-intent SmartCare buyer. Page already has Troon, Peco, Burnco stories.

**Embed adjustments (add, don't replace existing client stories):**

| Placement | Case study | Why it fits | Teaser line for card |
|---|---|---|---|
| After existing Client Stories row | **Resorts World Las Vegas** | Talent module + hospitality peer for Essentials/Accelerate buyers | Optimized UKG Talent Management after go-live. |
| After maturity ladder section | **Kimberly-Clark** | Transform-level process outcomes | Reduced union grievances through sustained platform partnership. |
| Footer (pre-form) | **Driscoll's** | Hourly payroll stabilization proof for Stabilize tier | Automated overtime on UKG Pro for a complex hourly workforce. |

**CTA copy by placement:**

**Hero (upgrade "Contact us →"):**
• **Headline:** Post-go-live support that scales with your maturity  
• **Button:** Start with a free Month 1 Discovery  
• **Supporting line:** Stabilize → Essentials → Accelerate → Transform. We work on your platform. No migration.  
• **Form preset:** How Can We Help? = `Free Month 1 Discovery` (matches existing form option)

**Mid-page (below maturity ladder, above Managed Services):**
• **Headline:** Not sure which tier you're in?  
• **Body:** We'll assess payroll stability, backlog depth, module adoption, and team capacity, then recommend a starting point.  
• **Button:** Get your SmartCare maturity snapshot  
• **Form preset:** How Can We Help? = `SmartCare Maintenance`

**Footer (upgrade existing "Connect with an HCM expert"):**
• **Headline:** See the roadmap before you commit  
• **Button:** Talk to an HCM expert  
• **Supporting line:** You'll connect with a subject matter expert. If you don't see value, walk away.  
• **Form preset:** How Can We Help? = `Free Month 1 Discovery`

---

### 3E. `/services` — Services overview

**Primary intent:** Wayfinding across the full journey. Highest traffic entry from nav and brand search.

**Embed these case studies (one proof row, service-mapped):**

| Service card / section | Case study | Teaser line |
|---|---|---|
| Implementation | Burnco / Hammerstone | Rapid stabilization for a complex go-live window. |
| Support (SmartCare) | Troon | Ongoing UKG support at 30,000+ employees. |
| Optimization | Resorts World Las Vegas | UKG Talent Management optimization at scale. |
| Data conversion (if module present) | Driscoll's | Cleaner hourly data and automated overtime logic. |
| Fractional assistance | Peco Foods | Extra capacity when post go-live demand spiked. |

**CTA copy by placement:**

**Hero (below Services Overview H1):**
• **Headline:** Tell us where you are in your HCM journey  
• **Button:** Get a free consultation  
• **Supporting line:** Assessments, implementation, SmartCare, optimization, and more. One conversation to find the right front door.  
• **Form preset:** How Can We Help? = leave blank or `Other` with Brief Description prompt: "Which service are you interested in?"

**Mid-page (after "List of Services Available" grid):**
• **Headline:** Not sure which service you need?  
• **Body:** Most teams start with a 30-minute discovery call. We'll point you to the right service line without a heavy sales process.  
• **Button:** Schedule a scoping call  
• **Form preset:** leave default

**Footer:**
• **Headline:** Ready to transform your HCM operations?  
• **Button:** Talk to us today  
• **Supporting line:** Call 888-905-4824 or submit the form. We respond fast.  
• **Form preset:** leave default

---

### 3F. `/services/data-conversion` — HCM Data Conversion Services

**Primary intent:** Implementation-adjacent, high anxiety, high conversion value.

**Embed these case studies:**

| Placement | Case study | Why it fits |
|---|---|---|
| Mid-page | **Driscoll's** | Hourly/payroll data complexity |
| Footer | **Burnco / Hammerstone** | Speed + accuracy under deadline pressure |

**CTA copy:**

**Hero:** Book a free data conversion assessment | Form preset: `HCM Implementation`  
**Mid-page:** Let's profile your source data before you cut over | Button: Request a data readiness review  
**Footer:** Don't risk payroll on bad migration data | Button: Talk to a data conversion specialist

---

### Case study embed module spec (HubSpot)

**Recommended module fields for editors:**
• Case study selector: HubDB row lookup  
• Display mode: Card (listing style) or Quote + metric  
• CTA on card: "Read the story" → detail URL from `[page_url]`  
• Optional service tag pill: pull from `[services]`  
• Keep navy/orange card styling per brand guidelines

---

## 4. HubSpot field monitoring checklist: AI referrals

**Purpose:** Track whether AI-driven discovery (ChatGPT, Perplexity, Google AI Overviews, Copilot, etc.) is producing identifiable traffic and form fills without inventing new property names. Dillon confirms exact field API names in HubSpot before building reports.

### 4A. Fields to confirm in HubSpot (placeholders only)

| Category | Placeholder | What to confirm |
|---|---|---|
| Original source | `[Original Source Type field]` | Does it capture "Organic search," "Direct traffic," "Referral," "Paid search," etc.? |
| Original source drill-down | `[Original Source field]` | Granular source string (e.g., google, chatgpt.com, perplexity.ai) |
| Latest source | `[Latest Source Type field]` | Same taxonomy as original, for returning sessions |
| Latest source drill-down | `[Latest Source field]` | Latest referring domain or campaign |
| First referring site | `[First Referring Site field]` | Full referrer URL on first touch |
| Last referring site | `[Last Referring Site field]` | Referrer on conversion session |
| First page seen | `[First Page Seen field]` | Landing page on first touch |
| Last page seen | `[Last Page Seen field]` | Page before form submit |
| UTM source | `[utm_source field]` | Populated on contact and/or form submission |
| UTM medium | `[utm_medium field]` | e.g., organic, referral, ai |
| UTM campaign | `[utm_campaign field]` | Campaign naming if used for AEO tests |
| UTM content | `[utm_content field]` | Creative or page variant |
| UTM term | `[utm_term field]` | Keyword if passed |
| AI-specific capture (if exists) | `[AI Referral Source field]` | Custom property or hidden form field for self-reported "How did you hear about us?" |
| Form submission source | `[Form Submission Source field]` | HubSpot form analytics linkage on contact |
| Record source | `[Record Source field]` | Whether contact came from form, import, integration |
| Analytics source | `[hs_analytics_source field]` | HubSpot native analytics grouping (confirm internal name) |
| Analytics source data 1 | `[hs_analytics_source_data_1 field]` | Often domain-level detail |
| Analytics source data 2 | `[hs_analytics_source_data_2 field]` | Secondary drill-down |

### 4B. Referrer domains to watch (build filtered views after fields confirmed)

Add these as OR conditions on `[First Referring Site field]` and `[Last Referring Site field]`:

• chatgpt.com  
• chat.openai.com  
• perplexity.ai  
• copilot.microsoft.com  
• gemini.google.com  
• bard.google.com  
• claude.ai  
• you.com  
• phind.com  
• poe.com  
• meta.ai  
• arc.net (if Arc Search referrals appear)

**Note:** Many AI tools strip or proxy referrers. Expect undercounting. Pair referrer monitoring with branded search lift and direct traffic spikes on key URLs.

### 4C. Weekly monitoring checklist (Dillon)

**Contacts and deals**
• [ ] Pull new contacts where `[First Referring Site field]` or `[Last Referring Site field]` matches AI domain list (Section 4B)  
• [ ] Pull contacts where `[Original Source field]` or `[Latest Source field]` contains ai, chatgpt, perplexity, copilot (case-insensitive contains)  
• [ ] Check if `[AI Referral Source field]` exists on forms. If yes, review submissions weekly for "ChatGPT," "AI search," "Perplexity," etc.  
• [ ] Compare week-over-week count of AI-tagged contacts vs total organic form fills

**Landing pages**
• [ ] Filter `[First Page Seen field]` for top entries: `/align-hcm-smartcare`, `/services/support`, `/services/implementation`, `/case-studies`, `/insights`, and top 5 blog URLs  
• [ ] Note if AI-referred contacts land on service pages vs blog posts (informs CTA pack priority)

**Form performance**
• [ ] In HubSpot forms analytics, export submissions by page for "Talk to Us" and SmartCare form variants  
• [ ] Cross-tab form page × `[Original Source field]` to see if AI traffic converts on service pages with new CTAs  
• [ ] Confirm "How Can We Help?" values are passing to contact record for SmartCare vs Implementation segmentation

**Campaign / UTM hygiene**
• [ ] Confirm AEO test links use consistent `utm_medium=ai-referral` or team-agreed convention  
• [ ] Verify UTM values map to `[utm_source field]` through `[utm_term field]` on contact create  
• [ ] Document any gaps where UTMs drop on redirect (www vs non-www, trailing slash)

**Content attribution signals (qualitative)**
• [ ] Read Brief Description on new contacts for phrases like "I asked ChatGPT," "AI recommended," "found you through Perplexity"  
• [ ] Log examples in a shared sheet until `[AI Referral Source field]` is formalized

### 4D. HubSpot reports to build (after field names confirmed)

| Report name | Type | Filters / breakdown |
|---|---|---|
| AI Referral Contacts (Weekly) | Contact list | Referrer domain list OR `[AI Referral Source field]` is known |
| AI Landing Pages | Contact report | Group by `[First Page Seen field]`, filter AI referrers |
| SmartCare AI Pipeline | Deal or contact | `[First Page Seen field]` contains smartcare AND AI referrer |
| Source trend | Line chart | `[Original Source field]` over time, highlight Referral + Direct |
| Form conversion by page | Form analytics | Top pages with consultation CTAs from Section 3 |

### 4E. Decision log (fill after HubSpot audit)

| Question | Dillon's answer (confirm in portal) |
|---|---|
| Exact API name for original source? | |
| Is `[AI Referral Source field]` already on live forms? | |
| Do UTMs persist from blog CTAs to contact record? | |
| Are HubDB case study pages excluded from source tracking? | |
| Who owns weekly export (Marketing vs RevOps)? | |
| Threshold to invest more in AEO meta variants (Section 1)? | e.g., 5+ AI-attributed consults/month |

---

## Implementation order (recommended)

1. Publish title/meta updates for SmartCare, Insights, and Case Studies (SEO-primary Option A first unless AEO test is active)  
2. Send HubDB access email (Section 2) and build field dictionary  
3. Roll conversion CTAs page by page: Support → SmartCare landing → Implementation → Optimization → Services overview  
4. Stand up AI referral monitoring views after Dillon confirms field names in Section 4A  
5. Revisit meta descriptions on individual case study detail pages once HubDB copy audit is complete

---

*End of pack. Review in HubSpot staging before publish.*
