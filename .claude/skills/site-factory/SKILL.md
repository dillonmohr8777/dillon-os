---
name: site-factory
description: Generate a complete client or prospect website from a short brief, using the Momentum profile template system extracted from the Philly 25 builds. Includes research, palette derivation, build, and QA.
---

# Site Factory

Turn a one-paragraph brief (or a `website-build` task filed by `/slack-intake`) into a finished single-page site on the Momentum profile template. Read `philly-sites/DESIGN-SYSTEM.md` first; it's the design contract.

## Inputs

Accept any of:
- A brief from Dillon ("build a site for X, they do Y, here's their info")
- A note in `00_Inbox/slack/` with `type: website-build`
- A business name plus URL to research

## Steps

1. **Research the business.** Use web search/fetch when available: real address, phone, hours, what they actually sell, their existing site's links (menu, booking, shop). Facts only; never invent an address or phone number. If a fact can't be verified, leave the field empty rather than guessing.
2. **Derive the brand.** Pick tokens per the design system: palette from their real signage/product/interior colors, `border` and `radius` matching their attitude (1px/round for upscale, thick/square for loud), one display + one text Google Font. Never generic blue.
3. **Write the brief.** Copy `_templates/site-factory/example-brief.json` and fill every section with real, specific copy. Voice rules from `System/writing-rules.md`: short declarative hero claim, proof strip states facts not adjectives, offerings name real items, no em dashes, contractions.
4. **Build.**
   `node _templates/site-factory/build-site.js <brief.json> <output-dir>`
   Prospect demos go in `philly-sites/` (or a sibling folder for other cities); client builds go in `01_Clients/<Client>/website/`. Keep `noindex: true` for demos.
5. **Images.** The build prints which `assets/` files are needed. Source real photos of the business when possible (their site, with attribution noted in the vault). Convert to webp. Write honest alt text.
6. **QA.** `node _templates/site-factory/qa.js <site-dir>` and fix every FAIL. When Playwright is available, review the three screenshots in `_templates/site-factory/qa-shots/<slug>/` for visual problems the checks can't catch: cramped headlines, bad contrast, dull palette.
7. **Log it.** Add or update the client/prospect note in `01_Clients/` with a link to the site folder and the source of each verified fact. If the job came from a Slack intake note, set its `status: built`.

## Hard rules

- Deploying is Tier 2: prepare the folder, tell Dillon the exact deploy command, never run the deploy yourself.
- Never remove `noindex` without Dillon confirming the site is going live for a paying client.
- Every factual claim on the page (hours, address, phone, founding year) needs a source; recheck before a demo becomes a live site.
