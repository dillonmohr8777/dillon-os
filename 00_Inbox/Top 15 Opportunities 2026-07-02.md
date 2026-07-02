---
tags: [inbox, strategy, opportunities]
created: 2026-07-02
source: Cross-reference of the vault, the Intel Core 7 Master Operating Transfer brief, the book site repo, the skills repo, and the mohr-vault MCP project
status: unprocessed
---

# Top 15 Opportunities: Where Claude Can Help Most

Ranked by leverage against your three written targets: 2,000 book subscribers in 4 months, $40,000 Mohr Media revenue in 5 months, and the ROAD TO 100 CLIENTS directive (currently 12).

## The Book (ironicineptocracy.com)

### 1. Fix the broken email capture on the book site
• The signup form posts to `/api/dossier-leads` and that endpoint doesn't exist in the repo. The SPA rewrite swallows every submission.
• Git history shows MailerLite wiring, then a Google Sheets bridge, but neither survives in the shipped bundle.
• Every visitor since roughly June 2 has hit a dead form. The 2,000-subscriber goal can't start until this works.
• Fix: one Vercel serverless function, forward UTM params, confirm delivery of the Garnier Dossier lead magnet.

### 2. Ship the month-one dispatch calendar that's already drafted
• The repo contains finished social assets for four drops: The File Opens, Who Gets Spent, The Memory Economy, The Garnier Position. Only drop one is live.
• Write and publish dispatches 02 through 04, finish the press kit (it still says "Assets coming soon"), and push the per-character social graphics that are sitting unused in `images/social/`.

### 3. Build the paid funnel to the 2,000-subscriber target
• The site has zero analytics beyond Vercel: no GA4, no Meta Pixel, so ads can't be measured today.
• Install tracking, then launch the Meta ads to lead magnet plan from [[05_Book/overview]], and start logging weekly numbers in [[05_Book/email-growth-tracker]] (it still says "Baseline not yet captured").
• Run the guest-post pipeline: draft the CrimeReads, Spybrary, and Independent Book Review pitches that are defined but never sent.

## Clients and Momentum 360

### 4. Guardrail Agent: make your compliance rules machine-enforceable
• All five files in [[11_Agents]] (Master, Google Ads, SEO, Reporting, Web) are empty shells, and every client's Agent Memory file is a blank template.
• Your history shows exactly why this matters: Bar Crawl ad disapprovals over alcohol language, the Soulard $54 runaway spend, the Presence-or-Interest bug on LinkEZE.
• Fill each agent with the real rules (banned terms, Presence Only, tCPA guardrails, Replenish branding, KJB CC list) so every future launch gets a pre-flight check automatically.

### 5. Client reporting factory
• Monthly interactive HTML reports for Align plus roughly 8 M360 retainers are your single biggest recurring manual load.
• The Netlify interactive HTML publishing lane is already proven in your Codex history. Rebuild it here as one command per client: pull data, render the branded report, publish, return the share link.

### 6. Stalled-client revival sweep
• Cross-referencing the vault with the June brief: NKCDC (Anthony silent since April on the tax-prep landing page), Hardwood Artisan (billing card outstanding, 90-day continuation at risk), Shadow HVAC (LSA background check reset in March, no comms since), Omega (drone footage chase).
• Deliverable: one evidence-backed chase list with a drafted follow-up email per client, written to your rules, ready to send.

### 7. Website factory as a productized offer
• Your Codex workspace has the whole assembly line already: website-factory-core plugin, the AMI homepage builds, landing-page-generator skill, Netlify and Vercel deploy lanes.
• Package it as a fixed-scope offer (site or landing page in days, not weeks) and it becomes both a client deliverable and a Mohr Media product. Onsite Concrete's Divi repair and Omega are immediate candidates.

## Mohr Media and Revenue

### 8. Operationalize the $40K business plan into an audit-to-retainer funnel
• You wrote a 96 KB business plan and [[05_Offers/Offer Index]] is still empty.
• Build the launch-first offers as real assets: the paid audit deliverable template, the proposal generator, pricing one-pagers, and the outreach sequences. The plan itself says audits convert to $1,500 to $3,000 retainers, which is 70% of the early revenue math.

### 9. One weekly revenue scorecard
• Your money currently lives in fragments: the June commissions sheet ($5,275), roughly $2,750/mo in named M360 retainers, a Gumroad revenue loop, and book subs at zero baseline.
• Build a metrics-pull that consolidates all of it into one weekly scorecard in the vault, tracked against the $40K and 100-client targets, so the HUD hero number stays honest.

## Align HCM (full-time)

### 10. Build the SmartCare assessment and ROI calculator
• The SmartCare website spec in [[02_FullTimeJob/AlignHCM]] calls for a maturity assessment tool and an FTE ROI calculator. Neither exists yet.
• These are interactive lead-gen apps I can build end to end, and they're the strongest AEO/GEO assets in your HubSpot recommendation map from the June brief.
• Also ready to move: the 10 drafted SEO blogs in `SEO/AlignHCM/Blogs/` need final polish and publishing.

## Agentic Infrastructure

### 11. Vault revival: make the OS current again
• The vault froze on 2026-04-15 while May and June happened in Codex. The pulse skill literally reported "either everything's stalled or the vault isn't where you're tracking daily movement."
• Fix: backfill client truth from the Intel Core 7 brief, add `due` / `next_action` / `status` / `last_touched` frontmatter to every client note (the pulse skills flagged this twice as the #1 data gap), and clean the root (stray zips, Untitled canvases, empty notes).

### 12. Port the Codex automation lanes into this stack
• Your Codex machine runs 28 automations: hourly Gmail client-reply triage, Slack mention triage, the King Agent morning work command and 2-hour money run, daily vault dumps.
• Rebuild the highest-value ones as vault-native skills and scheduled jobs here, draft-first boundaries intact, so the loop runs wherever you are instead of only on one machine.

### 13. D.I.L.L.O.N. OS HUD v2
• The HUD shipped today with vitals, directives, and the command deck. Next layer: live client cards driven by the new frontmatter, a book-subscriber ticker, the revenue scorecard, and one-click report generation per client.
• This turns the dashboard from a status screen into the actual cockpit for items 4, 5, 6, and 9.

### 14. Repair the Obsidian MCP second brain
• The mohr-vault MCP server is fully built (17 tools, 10 templates) but dead in the water: the config points at a folder that doesn't exist, the API key is a placeholder, and the active `.mcp.json` only registers Orgo.
• Repair the wiring, point it at this vault, and implement the unbuilt Phase 2 roadmap (scheduled inbox processing, auto daily notes, revenue tracking).

## The Doctorate

### 15. DBA co-pilot
• [[07_DBA/assignment-tracker]] says "TBD, capture next assignments." That's the whole file.
• Set up a working lane: Canvas due-date capture, APA 7 journal-review pipeline, research summarization for Strategic Media coursework. The doctorate also feeds the author platform, so the research doubles as book-marketing authority content.

## Suggested attack order
• This week: 1 (dead form), 6 (at-risk clients), 11 (vault backfill).
• Next two weeks: 4, 5, 9.
• This month: 2, 3, 8, 10.
• Rolling: 7, 12, 13, 14, 15.
