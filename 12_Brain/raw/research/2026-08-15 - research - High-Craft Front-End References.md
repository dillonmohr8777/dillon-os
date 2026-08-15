---
tags: [raw, research, front-end, references]
captured: 2026-08-15
method: live HTTP checks, Awwwards/CSSDA/Codrops page text, harvest of two radar prospects
agent: cloud agent (haoqi-radar-craft)
---

# Raw receipts — high-craft front-end references, 2026-08-15

Operator-supplied URL lists (Awwwards batch, CSSDA/Codrops/organic batch, 3D/WebGL batch) plus a live study of [haoqi.design](https://haoqi.design/). Findings are receipts only. Stack tags on award pages are submitter tags unless a second source names the same tools.

Skeptic gate ran in a fresh subagent that did not gather the first pass. Verdicts sit under each block.

## Method

- Awwwards award pages and their listed Visit-Site hrefs: HTTP 200 on 2026-08-15.
- CSSDA WOTD listings resolved to exact `/sites/<slug>/<id>/` URLs.
- Codrops articles fetched as full text.
- Live Haoqi page fetched (Next.js on Vercel) and screenshotted at 390px after an 8s settle. Desktop 1440px capture stayed on the load bar (slow WebGL boot in this environment).
- X MCP was down this session. No X-thread claims landed.
- Exa MCP was rate-limited. Fetches used WebFetch and direct HTTP.

## Haoqi.design (the attached reference)

Live: [haoqi.design](https://haoqi.design/) HTTP 200. Award page: [awwwards.com/sites/haoqi-design](https://www.awwwards.com/sites/haoqi-design) (SOTD Aug 14, 2026). CSSDA: [sites/haoqi-design/49819/](https://www.cssdesignawards.com/sites/haoqi-design/49819/) (WOTD Aug 12, 2026).

Author case study: [Inside HAOQI.DESIGN: Letting DOM and WebGL Share a Retro-Futurist Stage](https://tympanus.net/codrops/2026/08/15/inside-haoqi-design-letting-dom-and-webgl-share-a-retro-futurist-stage/) (Haoqi Wen, 2026-08-15).

Observed on the live mobile screenshot (390px, settled):

- Soft sky-blue vertical gradient with diagonal light beams
- Fine drafting grid with `+` crosshairs at intersections
- `HAOQI.DESIGN` in heavy black all-caps, two-line hamburger
- Circular dithered sticker overlapping the mark
- Headline `I BRING CRAFT & TASTE TO DIGITAL WORK`
- Glossy tubular blue script `hello` plus a matching 3D pointer
- IBM-style mono bio with black redaction blocks
- Footer meta `HH:MM 26°C` and a record-dot

Codrops (author, single-source) names the stack: Next.js + React, Lenis, Motion, Three.js / R3F / Drei, custom shaders / post-processing, Spline GLTF for the glass hello, Figma stickers. Shared scroll frame (Lenis `autoRaf: false` driven from R3F `addEffect`). DOM owns layout. WebGL owns hover dot-matrix, polarity develop, scroll curl, glass refraction/dispersion/Fresnel, Star 6 flare, falling sticker field. Type: TikTok Sans. Credits Maxime Heckel for the refraction base.

Author also claims FWA of the Day. Skeptic: FWA case exists, dated FOTD line was not recovered. Do not compile a "triple crown" as one fact.

## Awwwards / high-craft (operator list 1-17)

All 16 award pages HTTP 200. Listed live URLs HTTP 200. Haoqi (Aug 14) sits between PX PUSH (Aug 15) and Mosby's Files (Aug 13) and was missing from the operator Awwwards numbering.

| Name | Award | Live URL | Stated tags | Skeptic |
|---|---|---|---|---|
| PX PUSH | SOTD Aug 15 2026 | https://pxpush.com/ | WebGL, GSAP, Nuxt.js | Survivor. Codrops 2026-08-07 adds Lenis, Three.js, CRT. "Nuxt 3" pin not extracted. |
| Haoqi.Design | SOTD Aug 14 2026 | https://haoqi.design/ | see Codrops | Survivor for awards. Stack is single-source Codrops. |
| Mosby's Files | SOTD Aug 13 2026 | https://www.mosbyfiles.com/ | GSAP, Vue.js | Survivor as SOTD. "CSS-only folder system" contradicted by GSAP/Vue tags. Kill CSS-only as engineering fact. |
| Revelatio Studio | SOTD Aug 12 2026 | https://revelatio.studio/ | WebGL, GSAP, Webflow | Survivor |
| Studio K95 | SOTD Aug 11 2026 | https://k95.it | GSAP, Three.js, Nuxt.js | Survivor |
| Nothin | SOTD Aug 10 2026 | https://www.noth.in | WebGL, GSAP, Webflow | Survivor. Live URL is `noth.in`, not "nothin". "Hero Shaders" is an element title. |
| Produx Design | SOTD Aug 9 2026 | https://www.produx.design | GSAP, Three.js, Next.js | Survivor |
| Vero New York | SOTD Aug 8 2026 | https://www.verostudio.com/ | WebGL, Next.js, Sanity | Survivor |
| No Art | SOTD Aug 6 2026 | https://www.noartmusic.com/ | GSAP, Webflow, Shopify | Survivor. No-code Honors is a nomination. |
| Alethia | SOTD Aug 5 2026 | https://www.alethia.earth/ | Framer | Survivor |
| Serotoninn | SOTD Aug 4 2026 | https://serotoninn.com/ | GSAP, Wordpress | Survivor |
| Lacoste Ace Breaker | SOTD Aug 3 2026 | https://members-play.lacoste.com/ace-breaker-rg | WebGL, Three.js | Survivor |
| Noomo Showcase | SOTD Aug 1 2026 | https://showcase.noomoagency.com | WebGL, GSAP, Three.js | Survivor |
| Ciao Energy Launch | SOTD Jul 30 2026 | https://www.ciaoenergy.com/ | Webflow, Three.js | Survivor |
| Made With GSAP | SOTD Jul 29 2026 | https://madewithgsap.com/ | GSAP, Vanilla JS | Survivor |
| Obys Experiment Space | SOTD Jul 28 2026 | https://experiment.obys.agency/ | WebGL, GSAP, Three.js | Survivor |
| Trionn | SOTD Jul 27 2026 | https://trionn.com | Next.js, GSAP, Three.js | Survivor |

## Individual portfolios (operator 18-20)

| Name | URL | Live 2026-08-15 | Note |
|---|---|---|---|
| Kons | https://kons.design | 200 | No award-page stack audited |
| Sophie Manalo | https://www.sophiamanalo.com | 200 | No award-page stack audited |
| Akriti | https://helloakriti.framer.website/ | 200 | Framer is in the host |

## CSS Design Awards / Codrops / organic

| Name | Live URL | Gallery | Live? | Skeptic |
|---|---|---|---|---|
| Union | https://db-union-awards.webflow.io/ | CSSDA `/sites/union/49845/` WOTD Aug 15 | 200 | Survivor as WOTD + Digital Butlers. Visit-URL exclusivity vs unionthefilm.com killed (both hosts live). |
| United Carriers | https://unitedcarriers.com/ | CSSDA `/sites/united-carriers/49865/` WOTD Aug 14 | 200 | Survivor as WOTD. Bearplus credit is single-source / mismatched on BestCSS. |
| Daoism Systems | https://www.daoism.systems/ | CSSDA `/sites/daoism-systems/49832/` WOTD Aug 13 | 200 | Survivor. Lynksen on the CSSDA page. |
| Why Zero | https://why.zero.university/ | CSSDA `/sites/why-zero/49794/` WOTD Aug 11 | 200 | Survivor |
| Orgnzm Studio | https://orgnzm.studio/ | CSSDA `/sites/orgnzm-studio/49814/` WOTD Aug 10 | 200 | Survivor |
| Parinaz desktop | https://www.parinazkassemi.com/ | CSSDA `/sites/parinazs-desktop-portfolio/49807/` WOTD Aug 9 | 200 | Survivor. Apex without `www` 404'd. |
| MilleDollars | https://milledollars.fr/ | CSSDA `/sites/milledollars/49776/` WOTD Aug 8 | 200 | Survivor |
| Son Daven | https://sondaven.com/en | CSSDA `/sites/son-daven/49788/` WOTD Aug 7 | 200 | Survivor |
| Razed Mods | https://razed-mods.webflow.io/ and https://www.razedmods.com/ | CSSDA `/sites/razed-mods/49748/` WOTD Aug 6 | 200 | Survivor. Award visit URL is the Webflow build. |
| Chems Studio | https://chems.studio | Codrops 2026-08-08 | 200 | Survivor. Codrops names Webflow, Swup.js, Vimeo API. No CSSDA hit. |
| MERSI | https://www.mersi-architecture.com/ | CSSDA `/sites/mersi-architecture-studio/49039/` WOTD Mar 26 2026 | 200 | Survivor as live + FLOT NOIR footer. Thomas Carré is in writeups, not homepage text. |
| Userjot | https://userjot.com | none | 200 | Survivor as live SaaS. Not a CSSDA WOTD on the checked list. |
| Outline Online | https://www.outline-online.com/ | none | 200 | Survivor as live Swiss foundry shop. |
| Indigo Laboratory | https://indigo-laboratory.it/ | CSS Winner SOTD Aug 15 2026 | 200 | Survivor |

## 3D / WebGL extras

| Name | URL | Live? | Note |
|---|---|---|---|
| Meng To — Kage | https://mengto.github.io/kage/ | 200 | Live only. No stack audit this pass. |
| Last Train Records | https://hxmzaehsan.github.io/last-train-records/ | 200 | Live only |
| Night Street | https://night-street.vercel.app/ · https://github.com/StarKnightt/night-street | 200 | README: Three.js + R3F, zero external assets. "Prasenx" not on the repo. |
| Lusion | https://lusion.co/ | 200 | Live only |
| UI8 Skate | https://skate.ui8.dev | 200 | Live only |
| Brometal | https://brometal.dev/ | 200 | Live only |
| Techartist pieces | no single public URL | — | Killed as a catalog row. Video-only on the operator note. |

## Galleries

| URL | Status 2026-08-15 |
|---|---|
| https://recent.design/ | 200 |
| https://godly.website/ | 301 to recent.design/?ref=godly. Alias, not a second corpus. |
| https://inspora.design/ | HTTPS 429 Vercel challenge |
| https://loadmo.re/ | 200. Mobile Web Design Archive. |
| https://www.landing.love/ | 200 |
| https://saaspo.com/ | 403 on skeptic recheck. Do not file with the 200 set. |
| https://craftwork.design/curated/websites/ | 200 |
| https://viewport-ui.design/ | 200 |
| https://design-on-x.com/ | 200 |
| https://bestdesignsonx.com/ | 200 |

## Radar prospects used for the craft demos

Latest brief: `Daily-Briefs/radar-2026-08-15.md`. Two rebuild rows with harvestable sites:

1. Jarman Sales & Service, Inc (hvac, Philadelphia). Radar URL `http://jarmanairconditioning.com/` returned IIS 404 on 2026-08-15. Live builder site harvested: `https://jarmansalesandservice.com/`. Voice: "Servicing the Philadelphia area for 72 years", "Window & Wall Units", family-owned since 1951, Friedrich authorized dealer. Stale copyright 2023. Palette weight on `#02537E`.
2. Andorra Family Dentistry (dentist, Philadelphia). Live: `https://www.andorradental.com/`. Voice: "Personalized Service With State-of-the-Art Technology", Drs Shah / Emani / Bansal, Andorra / Conshohocken / Lafayette Hill / Roxborough. Harvest pulled 0 images (stock hero only in screenshots). Palette weight on `#2C4A80` and `#FDB913`.

Dutton Road Veterinary Clinic was the next live rebuild (`duttonroadvetclinic.com` → 2008 Wolf Investments ASP page) and was not built this pass.

## Killed

- Award-page "CSS-only" on Mosby's Files as an engineering fact
- Live URL "nothin" (use `https://www.noth.in`)
- Union visit-URL exclusivity
- saaspo.com in the live-gallery set (403)
- Techartist as a URL catalog
- Night Street credited to "Prasenx" on the repo
- FWA of the Day as a dated independent line
- godly.website as an independent gallery
- Any claim that the operator Awwwards 1-16 list is the complete SOTD run (Haoqi Aug 14 missing)

## Sources

- [haoqi.design](https://haoqi.design/) (15 Aug 2026)
- [Haoqi Awwwards](https://www.awwwards.com/sites/haoqi-design) (14 Aug 2026)
- [Haoqi CSSDA](https://www.cssdesignawards.com/sites/haoqi-design/49819/) (12 Aug 2026)
- [Haoqi Codrops](https://tympanus.net/codrops/2026/08/15/inside-haoqi-design-letting-dom-and-webgl-share-a-retro-futurist-stage/) (15 Aug 2026)
- [PX PUSH Codrops](https://tympanus.net/codrops/2026/08/07/the-department-is-open-building-the-px-push-website/) (7 Aug 2026)
- [Chems Codrops](https://tympanus.net/codrops/2026/08/08/designing-a-flexible-digital-archive-for-chems-studios-creative-practice/) (8 Aug 2026)
- Awwwards SOTD pages listed in the table (27 Jul 2026 to 15 Aug 2026)
- CSSDA WOTD pages listed in the table
- [CSS Winner homepage / Indigo](https://www.csswinner.com/) (15 Aug 2026)
- [StarKnightt/night-street](https://github.com/StarKnightt/night-street)
- Radar brief `Daily-Briefs/radar-2026-08-15.md`
- Harvests `_templates/site-factory/harvest/jarman-sales/harvest.json` and `andorra-family-dentistry/harvest.json`
