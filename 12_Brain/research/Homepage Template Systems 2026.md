---
tags: [research, templates, websites, design]
created: 2026-08-15
updated: 2026-08-15
expires: 2026-11-13
source: "[[12_Brain/raw/research/2026-08-15 - research - homepage-template-systems]]"
---

# Homepage Template Systems 2026

**Summary:** no single kit is a finished conversion homepage *and* an agent-reusable, commercially clean system. Buy [[Tailwind Plus]] or study [[Launch UI]] / [[Relume]] / [[IronLine Trades Starter]]; treat Framer/Webflow skins as one-off remixes, not a factory.

Research date: **2026-08-15**. Receipts: [[12_Brain/raw/research/2026-08-15 - research - homepage-template-systems]]. Method: [[12_Brain/concepts/Research Verification Loop]]. X MCP was down this session; only FixTweet-verified posts are cited. Scores are **interpretation** (1–10) after a fresh-context skeptic pass — not likes.

Related: [[12_Brain/entities/Website Factory]] · [[12_Brain/entities/LandingFolio MCP]] · [[12_Brain/concepts/Ultimate Homepage System]] · [[12_Brain/protocols/Codex Homepage Implementation Brief]] · `philly-sites/DESIGN-SYSTEM.md`

## How to read this

**Fact** = official page, repo file, or live fetch on 2026-08-15. **Interpretation** = scoring, “should we buy,” pattern synthesis. **Unconfirmed** = price, license, or demo host we could not re-extract.

Penalties already applied: generic AI/SaaS chrome, hero-only pages, broken demos, missing LICENSE, Single-Use licenses (bad for a multi-client factory), AGPL/GPL traps, “AI generator” bans, outdated stacks, inspiration-only galleries.

## Ranked 30

### 1. Tailwind Plus (Salient + UI blocks)

| Field | Value |
|---|---|
| Creator | Tailwind Labs (Adam Wathan, Steve Schoger) |
| Category | Full SaaS homepage + 500+ marketing/app/ecommerce blocks |
| Platform | Next.js 16, React 19, Tailwind CSS v4.3, Headless UI v2.1. **Not shadcn.** |
| Price | Personal **$299**. Teams **$979**. Salient alone **$99**. One-time. |
| Demo | [Salient product page](https://tailwindcss.com/plus/templates/salient) (live-preview hostname not independently fetched) |
| Download | [tailwindcss.com/plus](https://tailwindcss.com/plus) |
| X post | Not recovered |
| Exceptional | Official team wrote the CSS. Keyboard/SR care is first-party. Unlimited personal + client sites. Best code for an agent to *study*. |
| Weaknesses | Not shadcn. No current Figma (leftover file frozen 14 Jul 2021). Self-serve, no technical support. Familiar “pretty SaaS” formula (their own copy). |
| License | Commercial, unlimited projects. No website builders, no resale of kits. [License](https://tailwindcss.com/plus/license) |
| Score | **8.7** |
| Rec | **Install** if buying one paid code kit. Extract tokens/spacing/section rhythm into the factory. Do not fork Salient as the public batch skin. |

### 2. Relume Library + Site Builder

| Field | Value |
|---|---|
| Creator | Relume (Dan Anisse, Adam Mura) |
| Category | Sitemap → wireframe → Figma / Webflow / React section system |
| Platform | Figma (free kit), Webflow (Client-First), React + Tailwind + shadcn-style UI |
| Price | Free tier exists. **USD not on fetched pricing HTML.** Plans named Free / Starter / Pro / Team *and* Free / Design / Build / Grow on the same page. |
| Demo | [relume.ai](https://www.relume.ai/) · React docs [react-docs.relume.io](https://react-docs.relume.io/) |
| Download | [Figma kit v3.7](https://www.figma.com/community/file/1078092050664989246/relume-figma-kit-v3-7) · [Webflow style guide](https://webflow.com/made-in-webflow/website/relume-library-styleguide) (217,029 clones) |
| X post | Not recovered. Relume news is on LinkedIn / relume.ai. |
| Exceptional | Largest marketing-section vocabulary an agent can name (`header`, `hero`, `testimonial`, `cta`). Props-driven React copy/paste. Monthly Component Day. |
| Weaknesses | Unstyled wireframes, not art direction. Easy to ship “Relume-looking” sites. React export of designed style guides has no ETA. Dollar price unconfirmed. |
| License | Commercial projects allowed (FAQ). Do not republish Relume components as your library. |
| Score | **8.4** |
| Rec | **Install** the free Figma kit + style-guide cloneable. Use as IA, not as the visual. Confirm current USD before paying. |

### 3. Launch UI

| Field | Value |
|---|---|
| Creator | Mikołaj Dobrucki |
| Category | Current-stack shadcn homepage kit |
| Platform | Next.js 16.2, React 19.2, Tailwind 4.2, shadcn/ui, Lucide. CSS animation (no Motion in free `package.json`). |
| Price | Free MIT (1 template, 9 blocks). Pro **$99**. Team **$499**. Updated 24 Jun 2026. |
| Demo | [launchuicomponents.com](https://www.launchuicomponents.com/). Official `/preview` **404**. |
| Download | [github.com/launch-ui/launch-ui](https://github.com/launch-ui/launch-ui) · [pricing](https://www.launchuicomponents.com/pricing) |
| X post | Not recovered |
| Exceptional | Newest MIT shadcn *homepage* an agent can clone today. Tokens in CSS. Sections are independently editable. |
| Weaknesses | Free surface is thin. Preview URL broken. Professional/SaaS look, not local-service. |
| License | MIT on the public repo. Pro: commercial, no redistribution. |
| Score | **8.3** |
| Rec | **Download** the OSS repo. Buy Pro only if you need the extra templates and accept the look. |

### 4. IronLine Trades Starter

| Field | Value |
|---|---|
| Creator | IronLine Digital Systems |
| Category | Local-service / trades conversion homepage + CMS |
| Platform | Next.js 16, Sanity v3, Tailwind, shadcn/ui |
| Price | **$249** one-time. Unlimited client projects. Sales final. |
| Demo | [trades-starter.vercel.app](https://trades-starter.vercel.app/) — Durham Electric Co. (fetched: proof strip, priced services, 24/7 CTA, recent work, testimonials, team, FAQ, estimate form) |
| Download | [ironlinedigital.com/trades-starter](https://www.ironlinedigital.com/trades-starter) |
| X post | Not recovered |
| Exceptional | Only verified kit whose *demo* is a real local-service conversion page, not a dark AI agency. LocalBusiness JSON-LD, service-area pages, lead CRM-lite. Matches Dillon OS clients. |
| Weaknesses | Single-source product. PageSpeed 90/99 is vendor copy, not re-run here. Sanity lock-in is optional but default. Visual is contractor-clean, not Awwwards. |
| License | Commercial, unlimited clients (sales page). Full license text not fetched beyond the sales page. |
| Score | **8.2** |
| Rec | **Buy** if the factory needs a Next/Sanity trades lane. **Study** the IA even if you stay on static HTML. Do not copy the Durham Electric fiction as if it were a real client. |

### 5. Untitled UI (Figma)

| Field | Value |
|---|---|
| Creator | Jordan Hughes / Untitled UI |
| Category | Figma design system + 20–420 page examples |
| Platform | Figma. React is a separate paid product ($349 Solo, skeptic). |
| Price | FREE **$0**. PRO SOLO **$129**. STUDIO **$399**. BUSINESS $999. ENTERPRISE $2,499. |
| Demo | [untitledui.com](https://www.untitledui.com/) |
| Download | [FREE Community file](https://www.figma.com/community/file/1020079203222518115/untitled-ui-free-figma-ui-kit-and-design-system-v2-0) · [pricing](https://www.untitledui.com/pricing) |
| X post | Not recovered |
| Exceptional | Best maintained Figma system. Variables, dark mode, Auto Layout 5.0. Unlimited commercial end products. |
| Weaknesses | App/SaaS UI more than cinematic marketing. Not code. PRO is seat-scoped. |
| License | [untitledui.com/license](https://www.untitledui.com/license) — commercial OK, no kit resale. |
| Score | **8.1** |
| Rec | **Download** FREE. Buy PRO SOLO if you want page examples as composition reference. Do not paste Untitled screens into client sites. |

### 6. Tailark

| Field | Value |
|---|---|
| Creator | Meschac Irung / Tailark |
| Category | shadcn marketing registry (blocks + paid full pages) |
| Platform | Next.js, Tailwind, shadcn/ui, Radix or Base UI (Base UI announced 7 Aug 2026) |
| Price | Free OSS. Essentials **$249**. Complete **$299**. Team **$499**. One-time. |
| Demo | [tailark.com](https://tailark.com/) · [example home](https://tailark-theta.vercel.app/examples/home/one) |
| Download | [github.com/tailark/blocks](https://github.com/tailark/blocks) · [pricing](https://tailark.com/pricing) |
| X post | Appears as an example pull in [shadcn, 2025-04-30](https://x.com/shadcn/status/1917597228513853603) — not a Tailark launch. |
| Exceptional | Newest serious shadcn *marketing* system (repo created 2025-02-16). Multiple visual kits (Mist, Dusk, Veil). Complete plan is a page system, not one hero. |
| Weaknesses | Split OSS vs paid. Newer, less battle-tested than Cruip/Tailwind Plus. Still a registry. |
| License | MIT on public blocks. Paid pages gated. Derived-kit FAQ exists — read before forking into a public factory. |
| Score | **8.0** |
| Rec | **Download** OSS blocks. Buy Complete if you want production pages and the license allows your use. |

### 7. Magic UI + Magic UI Pro

| Field | Value |
|---|---|
| Creator | Dillion Verma |
| Category | Animated React components + 9 paid Next templates |
| Platform | React, Tailwind, Motion, shadcn companion |
| Price | Free MIT. Pro **$199** lifetime. Commercial, no resale. |
| Demo | [magicui.design](https://magicui.design/) · [pro.magicui.design](https://pro.magicui.design/) |
| Download | [github.com/magicuidesign/magicui](https://github.com/magicuidesign/magicui) |
| X post | [2023-06-13 pre-order](https://x.com/dillionverma/status/1668408059125702661) ($29 then — **not** current price) |
| Exceptional | Best free motion vocabulary for agents. Pro templates are full landers (SaaS, Agent, Mobile, Devtool). |
| Weaknesses | Free tier is effects, not a page. SaaS docs still say Next 14. ROI block still says “$49”. Easy to over-animate. |
| License | Free MIT. Pro commercial, non-transferable, no compete/resale. Non-refundable (license page 14 Oct 2024). |
| Score | **7.8** |
| Rec | **Download** OSS. **Study** one Pro template if purchased. Use one signature motion, not a magic-card on every section. |

### 8. Page UI

| Field | Value |
|---|---|
| Creator | Dan Mindru / Shipixen |
| Category | MIT full landing templates + steal-mode sections |
| Platform | React / Next, Tailwind **v3**, shadcn-inspired |
| Price | $0. Adjacent Page AI / Shipixen are separate paid products. |
| Demo | [pageui.dev](https://pageui.dev/) · [Specta](https://shipixen.com/demo/landing-page-templates/template/specta) |
| Download | [github.com/PageAI-Pro/page-ui](https://github.com/PageAI-Pro/page-ui) |
| X post | Not recovered |
| Exceptional | Full homepages you can copy section-by-section. Inspired by real SaaS pages (stated). Agent-friendly “thief mode.” |
| Weaknesses | Tailwind v3 only. Some template copy still says “Snappy” on Specta. Not the newest visual language. |
| License | MIT |
| Score | **7.6** |
| Rec | **Download**. Port patterns, not the TW3 stack, into a TW4 factory. |

### 9. Cruip Open PRO

| Field | Value |
|---|---|
| Creator | Cruip (Pasquale Vitiello, Davide Pacilio) |
| Category | Dark SaaS / agency multi-page template |
| Platform | Next.js 16 + Tailwind v4, plus HTML/Alpine and Vue zips. Figma included. |
| Price | **$49** on [cruip.com](https://cruip.com/). Classic Bundle item. |
| Demo | [open.cruip.com](https://open.cruip.com/) (title is Open PRO) · [cruip.com/open-pro](https://cruip.com/open-pro/) |
| Download | [cruip.com/open-pro](https://cruip.com/open-pro/) |
| X post | Mention only: [tdinh_me, 2021-10-05](https://x.com/tdinh_me/status/1445323952042102784) |
| Exceptional | Cheap, complete IA (Home, About, Pricing, Blog, Help, Contact). 2026 Next 16 refresh. Figma + three code targets. |
| Weaknesses | Dark SaaS chrome. Free sibling repo is GPL with a missing LICENSE file. Demo hostname conflates free vs paid. Not shadcn. |
| License | Cruip commercial (unlimited end products; no republish/resell). Confirm [terms](https://cruip.com/terms/). |
| Score | **7.5** |
| Rec | **Buy** as a cheap study/build kit for one SaaS/agency look. Do not use the free GPL repo in closed client sites without legal review. |

### 10. shadcnblocks (Premium)

| Field | Value |
|---|---|
| Creator | Shadcnblocks team |
| Category | 19 multi-page Next/Astro templates + 1600+ blocks |
| Platform | Next.js 16 or Astro 6, React 19, Tailwind 4, shadcn, MDX |
| Price | Pro **$149**. Premium **$299**. Elite **$399**. CMS addons $379. |
| Demo | [shadcnblocks.com](https://www.shadcnblocks.com/) · [templates](https://www.shadcnblocks.com/templates) |
| Download | [shadcnblocks.com/pricing](https://www.shadcnblocks.com/pricing) |
| X post | Not recovered |
| Exceptional | Largest current shadcn *full-site* catalog (Mainline 2025-01, Lumen 2025-10, Meridian 2026-05, Apex 2026-07). CLI + MCP + IDE extension. |
| Weaknesses | “Premium shadcn generic.” License forbids AI site-generators / competing kits — **conflicts with a public Website Factory**. |
| License | Commercial end products OK. No resale, no competing kits, no AI generators trained on their components. |
| Score | **7.4** |
| Rec | **Skip** for the public factory. **Buy** only for private one-off client builds if legal agrees. |

### 11. Aceternity UI All-Access

| Field | Value |
|---|---|
| Creator | Manu Arora / Aceternity Labs |
| Category | Motion-heavy components + 12+ full templates |
| Platform | Next.js, React, Tailwind, Motion. Some templates claim Next 15 + React 19 + Tailwind 4. |
| Price | Annual **$249**. Lifetime **$299**. Teams **$1990**. Strike-throughs $169 / $199 / $1590. brand-facts still says $199 lifetime. |
| Demo | [ui.aceternity.com](https://ui.aceternity.com/) · [templates](https://ui.aceternity.com/templates) |
| Download | [ui.aceternity.com/pricing](https://ui.aceternity.com/pricing) |
| X post | Not recovered. Homepage tweet wall has no status IDs. Profile: @mannupaaji |
| Exceptional | Strongest paid *spectacle* catalog. AI-ready prompts for v0/Lovable (their claim). |
| Weaknesses | Free layer is not a homepage. Noisy for local-service. Per-template hosts not fetched. Price-page contradictions. |
| License | Unlimited end products; no redistribution / competing templates. |
| Score | **7.3** |
| Rec | **Study** free components. **Buy** only for a motion-forward SaaS/studio, then strip 80% of the effects. |

### 12. shadcn-landing-page (leoMirandaa)

| Field | Value |
|---|---|
| Creator | Leopoldo Miranda |
| Category | Classic free full homepage |
| Platform | Vite + React 18 + Tailwind 3.4 + shadcn. 16 sections. |
| Price | $0 MIT |
| Demo | [shadcn-landing-page.vercel.app](https://shadcn-landing-page.vercel.app/) |
| Download | [github.com/leomirandaa/shadcn-landing-page](https://github.com/leomirandaa/shadcn-landing-page) |
| X post | Not recovered |
| Exceptional | Complete section set (hero, sponsors, features, team, pricing, FAQ, contact). Easiest agent clone. |
| Weaknesses | Lorem-heavy. Generic every-SaaS look. Aging stack. |
| License | MIT |
| Score | **7.2** |
| Rec | **Download** as a section checklist. Rebuild on Next 16 / TW4. Do not ship the look. |

### 13. Landingfolio

| Field | Value |
|---|---|
| Creator | Landingfolio |
| Category | Inspiration library + copy-paste components + MCP |
| Platform | Tailwind / Webflow / Figma references. MCP at `https://mcp.landingfolio.com/mcp` |
| Price | $1.99/week or **$59** lifetime (sale from $249). Claims 1,000 MCP req/day. |
| Demo | [landingfolio.com](https://www.landingfolio.com/) |
| Download | [landingfolio.com/pricing](https://www.landingfolio.com/pricing) |
| X post | Vault capture: [[12_Brain/01_Captures/X/2026-07-31 - landingfolio-mcp-launch]] |
| Exceptional | Composition reference at section scale. Already wired in this repo. Commercial client use stated. |
| Weaknesses | Not a homepage. Sandbox-only until Inspector. Returned screenshots are untrusted. |
| License | Commercial on paid pass (their FAQ). Do not copy a reference through. |
| Score | **7.1** |
| Rec | **Keep**. Finish the Inspector check. Query by section type, never by client name. |

### 14. Framer Blocks (official)

| Field | Value |
|---|---|
| Creator | Framer |
| Category | Official SaaS section kit (100+ sections) |
| Platform | Framer. Demo: light/dark example pages. |
| Price | Free. Limited Commercial. |
| Demo | [saas-kit.framer.website](https://saas-kit.framer.website/) |
| Download | [framer.com/marketplace/templates/blocks](https://www.framer.com/marketplace/templates/blocks/) |
| X post | Not recovered |
| Exceptional | Official, maintained, widest Framer section set. Fast for a Framer-hosted client. |
| Weaknesses | Kit, not a brand. Generic Framer SaaS. Not code. Limited Commercial — no competing templates. |
| License | Framer §7.3.1 Limited Commercial |
| Score | **7.0** |
| Rec | **Remix** for a Framer client. **Study** section inventory. Do not treat as a factory engine. |

### 15. CloudCraft (Framer)

| Field | Value |
|---|---|
| Creator | Luca Da Corte |
| Category | Free full SaaS site (deep IA) |
| Platform | Framer CMS (blog / careers / changelog claimed) |
| Price | Free (`Use for Free`). Blogs quoting $149 are stale. |
| Demo | [cloudcraft.framer.website](https://cloudcraft.framer.website/) |
| Download | [marketplace](https://www.framer.com/marketplace/templates/cloudcraft/) |
| X post | Not recovered |
| Exceptional | Deepest *free* Framer IA in the set. |
| Weaknesses | Empty-CMS risk. Generic SaaS chrome. Not code. “Deep IA” is listing copy. |
| License | Framer Limited Commercial |
| Score | **6.9** |
| Rec | **Remix** to steal IA (changelog, careers, legal). Re-skin hard. |

### 16. Finsweet Client-First

| Field | Value |
|---|---|
| Creator | Finsweet |
| Category | Webflow naming / style system |
| Platform | Webflow + Figma kit |
| Price | Free |
| Demo | [finsweet.com/client-first](https://finsweet.com/client-first) |
| Download | [cloneable](https://webflow.com/made-in-webflow/website/client-first-cloneable) (107,553 clones) |
| X post | Not recovered |
| Exceptional | Default agency build convention. Relume is built on it. |
| Weaknesses | **Not a homepage.** No layouts in the official cloneable. |
| License | Open Finsweet resource |
| Score | **6.8** |
| Rec | **Clone** before any Webflow job. Do not expect a designed page. |

### 17. Lumos V2

| Field | Value |
|---|---|
| Creator | Timothy Ricks (docs with Caleb Raney) |
| Category | Variable-driven Webflow framework |
| Platform | Webflow. MIT HTML dump on GitHub (v2.1.0, 2025-08-16). |
| Price | Cloneable free. Patreon extras exist; price not fetched. |
| Demo | [lumos-v2-beta cloneable](https://webflow.com/made-in-webflow/website/lumos-v2-beta) (27,184 clones) |
| Download | [github.com/lumosframework/lumos-v2](https://github.com/lumosframework/lumos-v2) |
| X post | Not recovered |
| Exceptional | Better custom-homepage substrate than a marketplace skin. Accessibility-minded, fluid units. |
| Weaknesses | Not a finished homepage. Steeper than Client-First. Docs host timed out once. Do not confuse with LumosUI / ThemeForest “Lumos.” |
| License | MIT on the GitHub dump. Cloneable license is creator-granted. |
| Score | **6.7** |
| Rec | **Clone** for custom Webflow. Pair with Osmo for one motion moment. |

### 18. Hover.dev templates

| Field | Value |
|---|---|
| Creator | Hover.dev |
| Category | 3 animated Next landers |
| Platform | Next.js (Pages Router) + Tailwind + Framer Motion |
| Price | Pro **$49** lifetime (was $149) |
| Demo | [hover.dev/templates](https://www.hover.dev/templates) — “Live Demo” hosts not extracted |
| Download | [hover.dev/pricing](https://www.hover.dev/pricing) |
| X post | Not recovered |
| Exceptional | Cheapest paid Motion landers. Commercial, unlimited projects. |
| Weaknesses | Only 3 templates. Pages Router. SaaS/neubrutal/portfolio, not trades. Support assumes you know React. |
| License | Proprietary commercial, no competing library. |
| Score | **6.6** |
| Rec | **Buy** only if you want cheap Motion examples. Prefer Launch UI / Page UI for structure. |

### 19. Osmo Vault

| Field | Value |
|---|---|
| Creator | Dennis Snellenberg, Ilja van Eck |
| Category | Award-level interaction snippets (GSAP, Lenis, Unicorn, Barba) |
| Platform | Webflow + HTML/CSS/JS |
| Price | Solo **€20/mo** annual or **€25/mo** quarterly. Lifetime ended 10 Jul 2026. |
| Demo | [osmo.supply](https://www.osmo.supply/) · [try](https://www.osmo.supply/try) |
| Download | Membership. Webflow profile [webflow.com/@osmo](https://webflow.com/@osmo) |
| X post | Not recovered. Profiles exist. |
| Exceptional | Best anti-template motion craft. Creators claim 38 Awwwards SOTD (their copy). |
| Weaknesses | **Not a homepage.** Recurring fee. Easy to over-animate. Resource counts rendered as `000` on marketing pages. |
| License | Commercial/client OK; no resale; no Framer recreation for distribution. |
| Score | **6.5** (as a motion layer; not ranked as a homepage) |
| Rec | **Study** the free demo vault. Subscribe only if a premium Webflow/HTML job needs one signature interaction. |

### 20. GSAP + Lenis

| Field | Value |
|---|---|
| Creator | GSAP (GreenSock). Lenis (darkroom.engineering) |
| Category | Motion / smooth-scroll libraries |
| Platform | Vanilla, React, Webflow, Framer (Lenis kit) |
| Price | GSAP **$0** Standard license (effective 2025-04-30). Lenis MIT $0. |
| Demo | [demos.gsap.com](https://demos.gsap.com/) · [lenis.dev](https://lenis.dev/) · [lenis.framer.website](https://lenis.framer.website/) |
| Download | [gsap.com/pricing](https://gsap.com/pricing/) · [github.com/darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) |
| X post | Not recovered |
| Exceptional | The actual stack behind award sites. GSAP commercial use is allowed under the no-charge Standard license. |
| Weaknesses | Not templates. GSAP is not MIT. No official full homepage. Lenis showcase is JS-heavy. |
| License | GSAP Standard (not MIT). Lenis MIT. |
| Score | **6.4** |
| Rec | **Install** as libraries when a page earns one cinematic moment. Default factory stays CSS + IntersectionObserver. |

### 21. HVACiFlow (Webflow)

| Field | Value |
|---|---|
| Creator | VictorFlow |
| Category | HVAC / home-services marketplace template |
| Platform | Webflow CMS |
| Price | Paid. **USD missing** from listing JSON. |
| Demo | [hvaciflow-template.webflow.io](https://hvaciflow-template.webflow.io/) |
| Download | [listing](https://webflow.com/templates/html/hvaciflow-website-template) |
| X post | Not recovered |
| Exceptional | Full local IA: Home, About, Services CMS, Commercial, Residential, Team, Book, Blog, Contact. |
| Weaknesses | Generic marketplace home-services look. Single-Use = one client. Not exceptional visually. |
| License | Webflow Single-Use |
| Score | **6.3** |
| Rec | **Study** the IA. **Skip** as a factory (one license per client). Reproduce the section list in static HTML. |

### 22. Hously (Webflow)

| Field | Value |
|---|---|
| Creator | Flint Themes |
| Category | Home-services conversion template |
| Platform | Webflow + Blog CMS |
| Price | Paid. USD not in fetched HTML. Sibling Flint templates on the page: $59–$99. |
| Demo | Preview via the [listing](https://webflow.com/templates/html/hously-website-template) |
| Download | Same listing |
| X post | Not recovered |
| Exceptional | Listing emphasizes contact-page trust, service FAQs, blog for local SEO. |
| Weaknesses | Marketplace-average. Single-Use. Price unconfirmed. |
| License | Webflow Single-Use |
| Score | **6.2** |
| Rec | **Study** contact/service-page structure. **Skip** for multi-client reuse. |

### 23. TwoSquares plumber starter

| Field | Value |
|---|---|
| Creator | TwoSquares |
| Category | Next.js local-service lead-gen starter |
| Platform | Next.js 16, React 19, Tailwind 4 |
| Price | $0. Apache-2.0 file. 0 stars. |
| Demo | **None in README** |
| Download | [github.com/TwoSquaresHQ/plumber-services-starter](https://github.com/TwoSquaresHQ/plumber-services-starter) |
| X post | Not recovered |
| Exceptional | Honest conversion IA: urgent vs planned, quote + call, service-area room. |
| Weaknesses | No demo. Required footer credit to twosquares.co.uk. Unproven. |
| License | Apache-2.0 file; GitHub SPDX said `Other` (skeptic). Attribution required. |
| Score | **6.1** |
| Rec | **Study** the page list. **Skip** as a visual or as a dependency. |

### 24. Motion Primitives

| Field | Value |
|---|---|
| Creator | ibelick |
| Category | Copy-paste Motion + Tailwind sections; Pro adds a lander |
| Platform | React, Tailwind, Motion |
| Price | OSS MIT. Pro **$149** (was $299). |
| Demo | [motion-primitives.com](https://motion-primitives.com/) |
| Download | [github.com/ibelick/motion-primitives](https://github.com/ibelick/motion-primitives) |
| X post | Not recovered |
| Exceptional | Cleaner motion than Magic/Aceternity slop. 5,908★ on fetch. |
| Weaknesses | OSS is not a homepage. Pro is SaaS-motion. |
| License | MIT / Pro commercial no-resale |
| Score | **6.0** |
| Rec | **Download** OSS. Use 1–2 primitives. |

### 25. Cruip Open (free repo)

| Field | Value |
|---|---|
| Creator | Cruip |
| Category | Free Next/Tailwind lander |
| Platform | Next 15.1, Tailwind 4, Headless UI, AOS |
| Price | $0. README says GPL. LICENSE file 404. GitHub `license: null`. |
| Demo | [open.cruip.com](https://open.cruip.com/) (brands as Open PRO) |
| Download | [github.com/cruip/open-react-template](https://github.com/cruip/open-react-template) |
| X post | Same 2021 mention as #9 |
| Exceptional | Long-lived, widely forked, still on Tailwind 4. |
| Weaknesses | GPL + missing LICENSE. Demo/product confusion. AOS is older. |
| License | **Unclear enough to treat as copyleft until fixed.** |
| Score | **5.9** |
| Rec | **Skip** for client work. Use Open PRO (#9) or Launch UI instead. |

### 26. Satūs / create-darkroom

| Field | Value |
|---|---|
| Creator | darkroom.engineering (ex Studio Freight) |
| Category | Creative-dev Next starter (GSAP + Lenis + optional R3F) |
| Platform | Next 16, React 19, Bun >= 1.3.5 / Node >= 22.12 |
| Price | $0 MIT |
| Demo | [satus.darkroom.engineering](https://satus.darkroom.engineering) |
| Download | [github.com/darkroomengineering/satus](https://github.com/darkroomengineering/satus) |
| X post | Not recovered |
| Exceptional | Honest creative scaffold. The stack award sites actually use. |
| Weaknesses | Homepage is a setup manual. Not a conversion page. Heavy for local-service. |
| License | MIT |
| Score | **5.8** |
| Rec | **Install** only for a cinematic studio/portfolio. Not the batch factory. |

### 27. Suprema (Framer)

| Field | Value |
|---|---|
| Creator | Praha |
| Category | Free AI/SaaS Framer template |
| Platform | Framer |
| Price | Free. Blogs saying $79 contradicted. |
| Demo | [suprema.framer.website](https://suprema.framer.website/) |
| Download | [marketplace](https://www.framer.com/marketplace/templates/suprema/) |
| X post | Not recovered |
| Exceptional | Live, complete, conversion-shaped SaaS IA. |
| Weaknesses | Dark AI-SaaS cliché. Demo title is task-management. Not code. |
| License | Framer Limited Commercial |
| Score | **5.7** |
| Rec | **Inspiration only.** Do not remix as a client brand. |

### 28. shadcn/create

| Field | Value |
|---|---|
| Creator | shadcn |
| Category | Official themed starters (Next / Vite / TanStack Start / v0) |
| Platform | shadcn/ui |
| Price | Free (product surface) |
| Demo | [ui.shadcn.com/create](https://ui.shadcn.com/create) |
| Download | Same |
| X post | [2025-12-12](https://x.com/shadcn/status/1999530406744293593) — 9,263 likes |
| Exceptional | Highest-engagement *verified* X post in this sweep. Official starting point. |
| Weaknesses | **Not a homepage template.** Thin fetch of `/create`. |
| License | Follow shadcn/ui project license |
| Score | **5.6** |
| Rec | **Use** as the app shell. Compose the homepage from Launch UI / Tailark / Relume sections. |

### 29. Paper Shaders + Unicorn Studio

| Field | Value |
|---|---|
| Creator | Paper. Unicorn Studio. |
| Category | Background/WebGL scene layers |
| Platform | React or vanilla (Paper, Apache 2.0). Unicorn embed ~50 KB gzip. |
| Price | Paper free. Unicorn Free = personal/non-commercial. Legend **$168/yr** or $20/mo (homepage also shows $14/mo yearly). |
| Demo | [shaders.paper.design](https://shaders.paper.design/) · [unicorn.studio](https://www.unicorn.studio/) |
| Download | [github.com/paper-design/shaders](https://github.com/paper-design/shaders) |
| X post | Not recovered |
| Exceptional | Best legal way to get “Awwwards background” without cloning a studio site. |
| Weaknesses | Not homepages. Unicorn free is non-commercial. Easy to tank performance. |
| License | Paper Apache 2.0. Unicorn proprietary. |
| Score | **5.5** |
| Rec | **Use** Paper on one hero if the brand earns it. Skip Unicorn on prospect demos (weight + logo). |

### 30. Recent (ex-Godly)

| Field | Value |
|---|---|
| Creator | Recent / Godly |
| Category | Curated visual inspiration gallery |
| Platform | Gallery. `godly.website` **301 →** [recent.design](https://recent.design/?ref=godly) |
| Price | Free to browse (subscribe modal exists) |
| Demo | [recent.design](https://recent.design/) |
| Download | None — outbound links to original work |
| X post | Gallery cards often link X; no single launch post recovered |
| Exceptional | Daily high-craft feed. Better taste check than Dribbble shots. |
| Weaknesses | Not a template. Do not copy. Separate site godly.design is a different product. |
| License | Inspiration only. Rights stay with original creators. |
| Score | **5.5** |
| Rec | **Inspiration reference only.** Pair with Landingfolio for section composition. |

## Groups

### Best overall full-homepage systems
Tailwind Plus · Relume · Launch UI · Tailark Complete · shadcnblocks Premium (private use only)

### Best React/Next.js templates
Launch UI · Tailwind Plus Salient · Page UI · leoMirandaa · Cruip Open PRO · IronLine · Magic UI Pro · Aceternity templates

### Best Framer templates
Blocks (official) · CloudCraft · Suprema (taste warning) · Active (thin) · paid Strativ/Platform/Evolve (USD unconfirmed)

### Best Webflow cloneables
Relume style guide · Client-First · Lumos V2 · Osmo profile (snippets) · HVACiFlow / Hously (IA only)

### Best Figma resources
Untitled UI FREE/PRO · Relume Figma Kit v3.7 · shadcn community files (unofficial) · Cruip Open PRO Figma · Tailwind Plus Figma **skip** (frozen 2021)

### Best open-source options
Launch UI · Tailark blocks · Page UI · leoMirandaa · Magic UI · Motion Primitives · Lenis · Satūs · Client-First / Lumos dumps · Paper Shaders

### Best motion-heavy creative templates
Osmo (snippets) · GSAP Demo Hub · Satūs (scaffold) · Magic UI / Aceternity / Hover · Paper Shaders · Unicorn Studio · basement/darkroom *sites* (inspiration only)

### Best conversion-focused templates
IronLine demo · Tailwind Plus Salient · Cruip Open PRO · HVACiFlow / Hously IA · TwoSquares page list · Launch UI

### Best templates for local-service businesses
IronLine · HVACiFlow · Hously · TwoSquares (IA) · existing `philly-sites` profile template. **Gap:** no visually exceptional, MIT, local-service Next kit.

### Best premium options worth purchasing
1. Tailwind Plus $299 (or Salient $99)  
2. IronLine $249 if you want a trades Next/Sanity lane  
3. Untitled UI PRO SOLO $129 for Figma discipline  
4. Launch UI Pro $99 or Tailark Complete $299 if you standardize on shadcn  
5. Osmo membership only for a motion-heavy Webflow job  

**Do not buy** Framer/Webflow Single-Use skins for a multi-client factory. **Do not buy** shadcnblocks if the public factory could be read as an AI generator.

## Definitive top 10 (any platform)

1. Tailwind Plus  
2. Relume  
3. Launch UI  
4. IronLine Trades Starter  
5. Untitled UI  
6. Tailark  
7. Magic UI + Pro  
8. Page UI  
9. Cruip Open PRO  
10. Landingfolio (composition) — *or* shadcnblocks if legal clears private use  

## Five best free resources
Launch UI OSS · leoMirandaa · Page UI · Relume Figma kit + Client-First · Magic UI OSS

## Five strongest sources for reusable code
Tailwind Plus · Launch UI · Tailark blocks · Page UI · Relume React copy/paste (paid)

## Five strongest visual references
Recent/Godly · Landingfolio · Osmo showcase · darkroom.engineering / basement.studio (inspiration) · Untitled UI page examples

## Five best options for quickly building client websites
1. Existing [[Website Factory]] static profile template (already proven on the Philly 25)  
2. Relume sitemap → wireframe → restyle  
3. Launch UI or Tailark on Next for a SaaS/tech client  
4. Framer Blocks / CloudCraft for a no-code client who will live on Framer  
5. IronLine for a trades client who needs CMS + service-area pages  

## Recurring patterns (interpretation)

- Hero claim + dual CTA (primary action + secondary proof)  
- Logo/proof strip immediately under the fold  
- Alternating surface rhythm (light / accent / dark)  
- Numbered offerings or 3–6 feature cards  
- Process as 3–5 steps  
- FAQ accordion before final CTA  
- Sticky mobile CTA bar  
- Tokenized color + one display font + one text font  
- shadcn/Radix primitives for a11y on coded kits  

## Already overused

- Dark AI-agency + purple glow + “intelligence” headlines (Suprema, NEUORA, Platform, most 2026 Framer SaaS)  
- Bento grids as the whole page  
- Gradient orbs, glass cards, floating metrics  
- Fake logo walls and invented testimonials  
- Marquee of tools (Next, Stripe, Vercel) on every hero  
- Custom cursors and scrolljacking on local-service pages  
- Relume-unstyled + Inter + 8px as a finished brand  

## Gaps (no existing template is good enough)

- A **visually exceptional local-service** homepage that is MIT, current-stack, and not a Webflow Single-Use skin  
- A **luxury / editorial** full-homepage kit (most winners are SaaS or trades-clean)  
- An **Awwwards-grade** full homepage you can legally clone (Satūs is a scaffold; Osmo is snippets; studio sites are closed)  
- A kit whose license **allows** a public AI site factory (Tailwind Plus and shadcnblocks both ban builders/generators)  
- Framer/Webflow templates that are **multi-client** without re-buying  

## Ultimate homepage system (short)

Full spec: [[12_Brain/concepts/Ultimate Homepage System]]. Agent build order: [[12_Brain/protocols/Codex Homepage Implementation Brief]].

Combine Relume IA + IronLine local conversion + Tailwind Plus spacing/type discipline + Launch UI / Tailark tokens + one Osmo/GSAP or CSS moment + harvest-driven brand (never the template palette). Do not copy a proprietary page.

## What got killed

ChatDeck (no LICENSE, empty preview) · Verve (no LICENSE) · Precedent as a lander · Origin/coss as a homepage · Satūs/Osmo as “homepage templates” · Godly-is-down (it redirected to Recent) · blog prices for Suprema ($79) and CloudCraft ($149) · nobruf as the leoMirandaa Next port · Midday/Dub as kits · Zentry/Fey clones · invented X IDs
