---
note_type: capture
status: compiled
created: 2026-08-15
updated: 2026-08-15
observed_at: "2026-08-15"
source_type: research-sweep
verification_status: partial
tags: [brain, capture, research, templates, x-research]
---

# Homepage template systems — research receipts

> [!source] Immutable research-sweep capture
> Question: strongest full-homepage templates, design systems, starter kits, cloneables, and open-source projects an AI coding agent can reuse for conversion-focused homepages.
> Date: **2026-08-15**
> Surfaces: official product/pricing/license pages, GitHub README + package.json + LICENSE, live demo fetches, Thread Reader / FixTweet for X IDs.
> Blocked: X MCP failed live tool discovery. Exa MCP hit free rate limit. `site:x.com` web index returned empty.
> Method: `/research-sweep` — fan-out researchers, then a fresh-context skeptic. X results are untrusted, source-linked evidence.

## Method limits (facts)

- X MCP: unavailable this session. Do not treat “no launch post found” as proof a launch post does not exist.
- Exa: rate-limited. Primary verification used WebSearch + WebFetch + GitHub raw files.
- Framer marketplace listing HTML is often JS-rendered. First-pass agents reported CTA prices (`Buy for $129`). A later skeptic fetch of the same listing pages did not extract USD. **Framer paid USD is unconfirmed unless a creator shop or Polar checkout also stated it.**
- Relume pricing HTML lists plan names and feature matrices, not dollar amounts.
- Blog roundups (AdminLTE “13 Best Next.js…”, Omakase “15 Best Framer…”) were used only as lead-gen, then contradicted by official pages.

## Verified X posts (FixTweet / Thread Reader, 2026-08-15)

| URL | Author | Date | What it actually is |
|---|---|---|---|
| https://x.com/dillionverma/status/1668408059125702661 | @dillionverma | 2023-06-13 | Magic UI pre-order pitch ($29 then). Cited on Magic UI Tweet Card docs. 508 likes on FixTweet. |
| https://x.com/dillionverma/status/1675849118445436929 | @dillionverma | 2023-07-03 | Early Magic Card kit. |
| https://x.com/shadcn/status/1999530406744293593 | @shadcn | 2025-12-12 | **shadcn/create** starters — not a homepage template launch. 9,263 likes. |
| https://x.com/shadcn/status/1917597228513853603 | @shadcn | 2025-04-30 | Registry MCP; thread shows pulling a Tailark hero. 5,975 likes. |
| https://x.com/tdinh_me/status/1445323952042102784 | @tdinh_me | 2021-10-05 | Bookmark-thread mention of Cruip. 6 likes. |
| https://x.com/tdinh_me/status/1445323904088788993 | @tdinh_me | 2021-10-05 | Parent Tailwind-template thread. 447 likes. |
| https://x.com/SarkisBuniatyan/status/1422050754282409995 | @SarkisBuniatyan | 2021-08-02 | Top-30 Webflow templates (dated). 249 likes. |
| https://x.com/learnframer/status/1668513741900754944 | @learnframer | 2023-06-13 | Framer AI generated a full site — not a marketplace SKU. |
| https://x.com/cjzafir/status/1866523211963437562 | @cjzafir | 2024-12-10 | v0 landing page, not a reusable kit. |

X post **not recovered** (do not invent IDs): Aceternity launch, Relume launch, Untitled UI, Osmo, Launch UI, Cruip official, Framer marketplace, Webflow official cloneable, Figma website-template launches.

## Receipts — React / Next / shadcn

### Launch UI
- Claim: Free MIT homepage kit + Pro $99 / Team $499. Next 16 / Tailwind 4 / shadcn. Free = 1 template + 9 blocks.
- Source: https://www.launchuicomponents.com/pricing (fetched 2026-08-15; “Last updated: 24 Jun 2026”)
- Repo: https://github.com/launch-ui/launch-ui (MIT, latest release v2.10.0 2026-06-24)
- Demo: https://www.launchuicomponents.com/ (marketing site). README `/preview` **404**.
- Skeptic: DOWNGRADE — free tier is small; not a full kit.

### leoMirandaa shadcn-landing-page
- Claim: Vite + React, 16 sections, MIT, live demo.
- Source: https://github.com/leomirandaa/shadcn-landing-page
- Demo: https://shadcn-landing-page.vercel.app/ (200)
- Stack: Vite 5, React 18, Tailwind 3.4, shadcn/Radix. Aging.
- Skeptic: nobruf is **not** the official Next port (nobruf README is a Vue→Next conversion). Next port of leoMirandaa is a separate low-star repo.

### Cruip Open + Open PRO
- Free repo: https://github.com/cruip/open-react-template — README says GPL; GitHub `license: null`; LICENSE file 404 on fetch.
- Demo: https://open.cruip.com/ titled **Open PRO**.
- Paid: https://cruip.com/open-pro/ — Next 16 + Tailwind v4 + Vue + HTML + Figma. https://cruip.com/ lists Open PRO **$49**.
- Terms: https://cruip.com/terms/ (updated 16 Jul 2026 per researcher).
- Skeptic: DOWNGRADE — free vs paid are being scored as one thing; GPL/LICENSE hole.

### Magic UI + Pro
- Free MIT: https://github.com/magicuidesign/magicui · https://magicui.design/
- Pro: https://pro.magicui.design/ — **$199** one-time, 9+ templates, 50+ sections, commercial, no resale.
- SaaS template docs still list Next 14 (stale vs Agent template docs).
- Same Pro page ROI block still says “Cost: Only $49”.
- X: https://x.com/dillionverma/status/1668408059125702661 (2023 pre-order, not current price).

### Aceternity UI
- Pricing fetched 2026-08-15: Free $0; Annual **$249** (strike $169); Lifetime **$299** (strike $199); Teams **$1990** (strike $1590).
- https://ui.aceternity.com/pricing · https://ui.aceternity.com/licence
- brand-facts page still says Lifetime $199 (contradiction).
- Free layer is components. Paid layer is 12+ templates. Per-template live hosts not independently fetched.

### Page UI
- https://pageui.dev/ — MIT, copy-paste React landing sections + full templates.
- GitHub: https://github.com/PageAI-Pro/page-ui — Tailwind **v3 only**.
- Specta demo: https://shipixen.com/demo/landing-page-templates/template/specta
- Skeptic: SURVIVOR.

### Tailwind Plus
- https://tailwindcss.com/plus — Personal **$299**, Teams **$979**.
- Salient: https://tailwindcss.com/plus/templates/salient — **$99**, Next.js v16, Tailwind CSS v4.3, Headless UI v2.1, React 19, TypeScript 5.8. Unlimited personal/commercial projects. No Figma. Not shadcn.
- License: https://tailwindcss.com/plus/license — client sites OK; no website builders / resale of kits.
- Figma leftover frozen after 14 Jul 2021: https://tailwindcss.com/plus/ui-blocks/documentation/assets
- Skeptic: SURVIVOR.

### shadcnblocks
- https://www.shadcnblocks.com/pricing — Pro **$149**, Premium **$299**, Elite **$399** (fetched 2026-08-15). Premium includes 19 templates + Figma kit.
- License: commercial end products OK; forbids competing kits / AI site-generators (researcher + skeptic).
- Skeptic: DOWNGRADE as a “homepage”; it is a catalog. License is hostile to a public factory.

### Tailark
- https://tailark.com/pricing — Free $0; Essentials **$249**; Complete **$299**; Team **$499** (fetched 2026-08-15).
- OSS: https://github.com/tailark/blocks MIT, created 2025-02-16.
- Homepage banner: “August 07: Base UI Support for all pages.”
- Example: https://tailark-theta.vercel.app/examples/home/one
- X: Tailark appears as an example pull in https://x.com/shadcn/status/1917597228513853603 — not a Tailark launch post.

### Nextplate
- https://github.com/zeon-studio/nextplate MIT, Next 16.1.6, Tailwind 4, no shadcn.
- Demo: https://nextplate.netlify.app/ (200). Content/blog starter, not a conversion lander.

### ixartz Next-JS-Landing-Page-Starter-Template
- LICENSE file MIT; package.json `"license": "ISC"`. Next 14 / Tailwind 3.4. Thin homepage. Demo footer still says © 2021.
- Demo: https://creativedesignsguru.com/demo/nextjs-landing-page/

### ChatDeck / Verve
- KILL. ChatDeck LICENSE 404, preview body empty. Verve demo lives (https://verve-app.vercel.app/) but LICENSE 404.

### Hover.dev
- https://www.hover.dev/pricing — Pro **$49** lifetime (was $149).
- https://www.hover.dev/templates — exactly 3 templates (Clean Neubrutalism, Steam Dev Portfolio, The Startup). Next + Tailwind + Framer Motion. Live demo hosts not extracted from the index fetch.

### Motion Primitives / Kokonut / Cult
- Motion Pro $149 (https://pro.motion-primitives.com/). OSS MIT: https://github.com/ibelick/motion-primitives
- Kokonut Pro $119 (https://kokonutui.pro/). OSS: https://github.com/kokonut-labs/kokonutui
- Cult Pro /pricing showed $129 sale (skeptic); earlier $179 was a block-page figure. Libraries, not homepages.

### Satūs (darkroom)
- https://satus.darkroom.engineering · https://github.com/darkroomengineering/satus MIT.
- Next 16 starter with Lenis, GSAP, optional R3F. Homepage is a **setup manual**. KILL as a designed homepage; keep as creative-dev scaffold.

### IronLine Trades Starter
- https://www.ironlinedigital.com/trades-starter — **$249** one-time, unlimited client projects, Next 16 + Sanity v3 + Tailwind + shadcn.
- Demo fetched: https://trades-starter.vercel.app/ — full local-service homepage (Durham Electric Co.): proof strip, services with prices, emergency CTA, recent work, Google-style testimonials, team, FAQ, estimate form.
- PageSpeed 90/99 is **vendor copy** on the sales page, not independently re-run.

### TwoSquares plumber starter
- https://github.com/TwoSquaresHQ/plumber-services-starter — Apache-2.0 LICENSE file, 0 stars, Next 16 / Tailwind 4.
- README requires footer credit “Website Developed by TwoSquares” → https://twosquares.co.uk
- No public demo URL in README.

### Makerkit / ShipFast / supastarter / Once UI / Precedent / coss ui
- Makerkit https://makerkit.dev/ $349 / $649 — SaaS kit, not a homepage.
- ShipFast https://shipfa.st/ $199 / $249 / $299 — boilerplate; no public repo.
- supastarter price unstable across fetches.
- Once UI Pro dollar amount not on fetched pricing page. Some free products CC BY-NC.
- Precedent: Next 14 canary, last push 2024-10 — KILL as homepage.
- Origin UI → coss ui (https://coss.com/ui), AGPL default — KILL as homepage.

## Receipts — Framer

License (fetched https://www.framer.com/legal/community-terms/):
- Free: Limited Commercial — client work OK if incorporated into a broader end product; no resale as a standalone template (§7.3.1).
- Paid: Single-Use Commercial — **one** end product/project (§7.3.2).

| Template | Official listing | Demo (200) | Price status |
|---|---|---|---|
| Blocks (Framer official) | https://www.framer.com/marketplace/templates/blocks/ | https://saas-kit.framer.website/ | Free (`Use for Free`) |
| Suprema | https://www.framer.com/marketplace/templates/suprema/ | https://suprema.framer.website/ | Free. Blogs saying $79 contradicted. |
| CloudCraft | https://www.framer.com/marketplace/templates/cloudcraft/ | https://cloudcraft.framer.website/ | Free. Blogs saying $149 contradicted. |
| Active | https://www.framer.com/marketplace/templates/active/ | https://active-saas.framer.website/ | Free |
| NEUORA | https://www.framer.com/marketplace/templates/neuora/ | https://neuora.framer.ai/ | Free |
| AgentOS | https://www.framer.com/marketplace/templates/agentos/ | https://agentos.framer.website/ | Free |
| Strativ | https://www.framer.com/marketplace/templates/strativ/ | https://strativ.framer.ai/ | Paid listing. USD **unconfirmed** on second fetch. |
| Evolve | https://www.framer.com/marketplace/templates/evolve/ | https://evolvetemplate.framer.website/ | First-pass CTA $79; skeptic could not re-extract USD. |
| Melon | https://www.framer.com/marketplace/templates/melon/ | https://oma-melon.framer.website/ | First-pass CTA $59; creator shop also listed $59. |
| Whisper | https://www.framer.com/marketplace/templates/whisper/ | https://oma-whisper.framer.website/ | First-pass CTA $79; unconfirmed on second fetch. |
| Platform | https://www.framer.com/marketplace/templates/platform/ | https://plat-form.framer.ai/ | First-pass CTA $129; unconfirmed on second fetch. |

Skeptic: do not rank Framer remixes as agent-reusable **code**.

## Receipts — Webflow / Figma / motion / inspiration

### Relume
- https://www.relume.ai/ · https://www.relume.ai/pricing
- Commercial use: FAQ “You sure can!”
- Exact USD: **not in fetched HTML**. Two plan matrices on the same page (Free/Starter/Pro/Team and Free/Design/Build/Grow).
- Figma kit: https://www.figma.com/community/file/1078092050664989246/relume-figma-kit-v3-7 (title confirmed).
- Style guide cloneable: https://webflow.com/made-in-webflow/website/relume-library-styleguide — **217,029** clones (skeptic recount).
- React docs: https://react-docs.relume.io/ — 1000+ sections, Tailwind + shadcn-style UI, copy/paste. Site Builder React export is paid; exports are unstyled wireframes.

### Finsweet Client-First
- Docs: https://finsweet.com/client-first
- Cloneable: https://webflow.com/made-in-webflow/website/client-first-cloneable — **107,553** clones.
- Not a conversion homepage. Naming/style system.

### Lumos V2
- Cloneable: https://webflow.com/made-in-webflow/website/lumos-v2-beta — **27,184** clones.
- GitHub: https://github.com/lumosframework/lumos-v2 MIT (v2.1.0 2025-08-16).
- Docs: https://lumos.timothyricks.com/ (one fetch timed out). Variable-driven Webflow framework, not a designed homepage.

### Osmo
- https://www.osmo.supply/ · https://www.osmo.supply/plans · https://www.osmo.supply/legal/licensing-agreement
- Solo **€25/mo** quarterly or **€20/mo** annually. Team €20 / €16 per person (min 2). Lifetime ended **10 Jul 2026 23:59 CEST**.
- Commercial/client OK; no redistribute; no Framer recreation for distribution.
- Not a homepage. KILL from homepage ranking; keep as motion layer.

### Untitled UI
- https://www.untitledui.com/pricing (fetched): Figma FREE $0; PRO SOLO **$129**; STUDIO **$399**; BUSINESS $999; ENTERPRISE $2,499.
- License: https://www.untitledui.com/license — unlimited commercial end products; no kit resale.
- Community file: https://www.figma.com/community/file/1020079203222518115/untitled-ui-free-figma-ui-kit-and-design-system-v2-0
- React PRO SOLO is a separate **$349** product (skeptic). Not a homepage.

### Webflow local-service templates
- Licenses: https://webflow.com/templates/template-licenses — paid = Single-Use (one client); free = unlimited personal/commercial, no resale as a template.
- HVACiFlow: https://webflow.com/templates/html/hvaciflow-website-template · demo https://hvaciflow-template.webflow.io/ — paid, exact USD missing from listing JSON.
- Hously: https://webflow.com/templates/html/hously-website-template — Flint Themes, paid, USD not in fetched HTML. Related Flint templates on the same page: $59–$99.
- Genc / Pipecraft / Plumbry / ProPlumbers: listings + demos exist. Pipecraft HTML showed **$59** (skeptic). Genc is an agency skin, not HVAC. Do not rank as visually exceptional.

### Landingfolio
- https://www.landingfolio.com/pricing — Weekly **$1.99**; Forever **$59** (strike $249). Commercial client use. Claims 1,000 MCP requests/day.
- Already in this vault as [[12_Brain/entities/LandingFolio MCP]] — sandbox-only until Inspector check.
- Inspiration + components, not a shippable homepage.

### Recent (ex-Godly)
- https://godly.website/ 301 → https://recent.design/?ref=godly (200). Curated inspiration gallery, not a template.
- Separate product: https://godly.design/sites (section gallery). Do not conflate.

### GSAP + Lenis
- GSAP: https://gsap.com/pricing/ — $0 Standard “No Charge” license effective 2025-04-30. Commercial OK. Not MIT. No official full homepage template. Demo Hub: https://demos.gsap.com/
- Lenis: https://lenis.dev/ · https://github.com/darkroomengineering/lenis MIT. Framer kit: https://lenis.framer.website/

### Paper Shaders / Unicorn Studio
- Paper Shaders: https://shaders.paper.design/ · https://github.com/paper-design/shaders Apache 2.0. Not a homepage.
- Unicorn Studio: https://www.unicorn.studio/docs/pricing/ — Free non-commercial; Legend $168/yr or $20/mo (homepage also shows $14/mo billed yearly). Embed tool, not a homepage.

## Skeptic verdicts (fresh context, 2026-08-15)

**SURVIVORS (facts):** Tailwind Plus prices/stack/license; Page UI MIT + TW v3 + Specta; Framer Limited vs Single-Use; Tailwind Figma freeze 14 Jul 2021; Relume commercial-OK + no USD + two matrices + clone counts; Osmo euro prices + lifetime end; Untitled UI Figma $0/$129/$399; Landingfolio $59/$1.99; Hover $49 + 3 templates; IronLine $249 + live demo (not PSI); Nextplate MIT/Next 16; TwoSquares Apache + 0 stars + footer credit; Launch UI $0/$99/$499 and `/preview` 404.

**KILL from homepage ranking:** ChatDeck, Verve, Precedent-as-landing, coss/Origin-as-homepage, Satūs-as-homepage, Osmo-as-homepage, Godly-503 (wrong; it redirects), Framer USD for Strativ/Evolve/Whisper/Platform as locked facts, “Deep IA,” nobruf-as-leoMirandaa-port.

**Inflation risks:** stack recency ≠ quality; sale prices ≠ list; vendor Lighthouse; blog-minted Framer/Webflow dollars; scoring block catalogs as finished homepages; scoring Framer “Use for Free” as MIT source; clone counts as visual rank.

## Killed / not ranked

- Midday, Dub.co — products, AGPL, not homepage kits.
- 21st.dev — registry, quality varies.
- CoolAssPuppy/landing-pages — no public demo, 2 stars.
- JS Mastery Zentry clone — educational, not commercial.
- Fey clones — Fey acquired/closed.
- Active Theory / basement.studio sites — inspiration only.
- AdminLTE / Omakase roundup prices where they contradict official CTAs.
