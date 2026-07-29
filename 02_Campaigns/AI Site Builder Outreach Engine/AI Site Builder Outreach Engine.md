---
tags: [campaign, outreach, websites, ai-pipeline]
status: active
owner: Dillon Mohr
requested_by: Mac Frederick
stakeholders: [Mac Frederick, Melissa Silber, Jesse DiLaura, Sean Boyle]
started: 2026-07-09
source: "#ai-tech-news, #ghl-leads-apollo"
---

# AI Site Builder Outreach Engine

The master campaign note. Momentum's client-acquisition engine: scrape prospects, build them a real website before they ask, put a QR code on a direct mail piece, and gatekeep the sales call behind it.

Companion notes:
- [[Slack Evidence Log]] — every request and delivery with permalinks
- [[Pipeline Spec]] — the seven stages, what's built, what's open
- [[Market Roster]] — the Philly to PA to national ladder
- [[Batch Runbook]] — how to actually run a weekly batch

## The ask (Mac, 2026-07-09)

> Bot scrape > database > AI site builder > Zapier > QR Code > Direct Mail > Gate Keep for Sales Call

That's the whole thesis in one line. It sat inside a three-bucket client-acquisition plan:

1. **AI Site Builder Outreach** — AI scrape + AI website + direct mail with QR (this campaign)
2. **AI Audit Outreach** — Kenzi-style AI audit + outreach
3. **AI Video Outreach** — direct outreach via IG/LinkedIn, "hey we made you this"

Direct mail vendor floated: StackAdapt programmatic direct mail. QR automation floated: Zapier + QRTiger from a Google Sheet. Mail automation floated: PostGrid from Sheets.

## Where it stands

**Shipped:**
- 25 polished Philadelphia prospect homepages, 7 original concepts, 3 deeper multipage pilots (Peter Mechanical, The Roof Doctor, Graveley Roofing). Review hub delivered 2026-07-12, upgraded design pass same day.
- 3 deeper Kimi-built pilots with Maps-first directions: Bicycle Therapy, Head House Books, Maleek Jackson Boxing. QA'd clean desktop and mobile 2026-07-21.
- QA discipline: 1,032 responsive assertions across seven screen sizes, 288 live images verified, zero contrast failures, zero deploy failures. All previews live as private noindex drafts.
- M360 Orbit deep pipeline live with 19 specialists, evidence rules, quality gates, cross-agent handoffs, and a hard stop before outreach or CRM writes.
- The template system is now extracted and codified in this vault: `philly-sites/DESIGN-SYSTEM.md` plus the generator at `_templates/site-factory/`.
- **Weekly 25-site batch pipeline (2026-07-29):** reference harvester (`harvest.js`) pulls screenshots + copy + brand palette from target sites and socials; designated design skills (`ui-design`, `ux-audit`, `frontend-build`, `motion-design`) plus `mirror-and-improve` keep their lingo and upgrade everything else; `build-batch.js` builds the batch, QAs every site, enforces the measured canonical spec (10 sections, 350–500 words, 12–13 images), detects duplicate imagery, and emits the review hub + `manifest.csv` (QR) + `prospects.csv` (`qa_ready` for review; **`mail_ready` always `hold` until explicit human approval**). Runbook: [[Batch Runbook]]. Skill: `/site-batch`.

**Mac's open question, answered in [[Pipeline Spec]]:**

> whats the steps taken we can use to automate everything

Build through quality gate is automated. Approval stays human. Activate (QR via Zapier/QRTiger, mail via PostGrid or StackAdapt) still needs the mail vendor decision and a deploy token.

**Known gaps as of 2026-07-29:** mail vendor still undecided; discovery/qualify scoring still manual; Netlify deploy token not in Cloud Agent secrets yet. QR path is ready once the sheet zap is wired to `manifest.csv`.

## Strategy: three waves

The geography ladder is Philadelphia, then Pennsylvania, then national. Full target list in [[Market Roster]].

- **Wave 1 — Philadelphia (in progress).** Prove the engine in the home market where we can shoot our own photos and name-drop local proof.
- **Wave 2 — Pennsylvania metros.** Pittsburgh, Erie, Allentown/Bethlehem, Harrisburg, Lancaster, Reading, Scranton, State College. Same engine, new markets, no new template work.
- **Wave 3 — National by vertical.** Lead with the verticals Momentum already sells into, matched to the industry pages the website team is building right now.

## Vertical alignment (important)

The website team is building industry pages on needmomentum.com in `#momentumsites`: Medical & Healthcare, Spas & Wellness, Home Services, Legal & Law Firms, Cannabis & Restricted Categories, Industrial & Manufacturing, Multi-Location & Franchise, plus Professional Services and Ecommerce still needed.

Batch verticals should mirror that list exactly. Every prospect site we build then has a matching industry page to link into on the Momentum site, and every industry page gets real portfolio proof. One effort feeds the other instead of running in parallel.

## Operating cadence

Dillon's stated plan on 2026-07-21: build deep homepage structures weekly, continuously, then push hard on outreach. That means:

- One batch per week, **25 sites**, single market and one or two verticals per batch
- Every target is harvested (site + socials screenshots, their copy, their palette) before brief writing
- Batch ships as one review hub link (Mac reviews one URL, not 25)
- Approved sites feed the QR and mail merge from the batch CSVs
- Nothing goes out until Mac or Melissa approves the specific prospect list and the mail piece

## Deliverable format that works for Mac

Two lessons straight from channel: Mac wants **one link** for a batch, and he'd rather watch a **five-minute Loom** than read a wall of text or sit through a long training. Every batch handoff should be one hub URL plus a short Loom, with the detail parked in the vault for whoever wants it.

## Success metrics

- Sites built per week, and cost/time per site
- Batch QA pass rate on first build (target: no manual fixes)
- Mail pieces sent, QR scan rate, scan-to-call rate
- Calls booked, then closed, attributed back to batch and vertical
- Ledger: which verticals and which design directions convert

## Risks

- **Facts.** These are real businesses. A wrong address, phone, or hours on a demo is a credibility killer. Every fact needs a source; unverifiable fields stay empty.
- **Indexing.** Prospect demos must stay `noindex` so we never compete with or misrepresent a business we don't work for.
- **Image rights.** We use first-party business imagery for the mirror; provenance is tracked per batch and a duplicate-image gate runs across the batch.
- **Sameness.** The 25-site batch shares one architecture on purpose (speed). The 3 Kimi pilots deliberately didn't (taste). Keep both tiers: template batch for volume outreach, bespoke build for prospects who bite.
- **Approval discipline.** Sending is Tier 2. The engine drafts and stages; a human approves the exact list and copy.
