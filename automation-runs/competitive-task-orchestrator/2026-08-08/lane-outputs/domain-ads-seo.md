# Domain / Ads / SEO Scout — Run 3 · 2026-08-08

Tier 0 read-only scout. Dry-run only; no live HTTP checks.

## Site health summary

**Run:** `node _os/automation/bin/site-health.js --dry-run`  
**Overall status:** fail  
**Counts:** 5 total · 1 pass · 0 warn · 1 fail · 3 skipped (live properties deferred in dry-run)

| Property | Status | Notes |
|---|---|---|
| Fixture healthy site | pass | Viewport + GA tracking hints OK |
| Fixture broken form | **fail** | Missing viewport, no tracking hints, **`/api/dossier-leads` marked missing** |
| ironicineptocracy.com (book) | skipped | Live GET skipped; `--live` required |
| themohrmedia.com | skipped | Live GET skipped |
| immohrtal-site.netlify.app | skipped | Live GET skipped |

**Book form failure (Opportunity #1):** The Ironic Ineptocracy book site posts signups to `/api/dossier-leads`, which is not implemented in the repo. The SPA rewrite swallows submissions. Registry marks this property `priority: critical` with `canary_allowed: false`. The fixture-broken-form test encodes this as the canonical failure mode. Every visitor since ~June 2 has hit a dead form — blocks the 2,000-subscriber goal until a serverless handler (e.g. Vercel function → MailerLite/Sheets) ships.

Report artifact: `Daily-Briefs/site-health-report.md` · state: `12_Brain/state/site-health-sentinel.json`

## Ads / campaign blockers

**Outreach engine (active):** [[AI Site Builder Outreach Engine]] — build-through-QA is automated; **approval stays human**. Radar today: **877 tracked**, **147 build-queue**, **1 blocked on render pass**. Radar explicitly states: *"Nothing here is outbound-ready. A human approves every send."*

**Ad-task queues:** `Google Ads Optimization Queue`, `Facebook Ads Optimization Queue`, and `Landing Page Build Queue` are all empty — no queued disapprovals, LSA resets, or tracking-gap items logged in vault.

**Known historical blockers (vault notes, not in today's queues):**
- Bar Crawl ad disapprovals (alcohol language)
- Soulard $54 runaway spend
- Presence-or-Interest bug on LinkEZE
- Book site: no GA4/Meta Pixel → paid funnel cannot be measured until tracking ships (paired with dead form)

**IMMOHRTAL ads:** Social scale plan gates paid spend behind verified tracking and working destination links.

**Sell-traffic lane (radar):** 10 prospects flagged "sell traffic, not a rebuild" — ads/SEO/GBP upsell candidates, not site-build outreach.

## SEO ship-ready (Align HCM lane)

All **10** drafts in `SEO/AlignHCM/Blogs/` carry `status: ready-to-publish`:

| File | Title | Keyword |
|---|---|---|
| `ukg-vs-adp-blog.md` | UKG vs ADP: Which HCM Fits Your Mid-Market Team? | ukg vs adp |
| `what-is-hcm-software-blog.md` | What Is HCM Software? A Plain English Explainer | what is hcm software |
| `adp-alternatives-blog.md` | 7 ADP Alternatives Worth a Look for Mid-Market HR | adp alternatives |
| `best-hcm-software-blog.md` | Best HCM Software in 2026: A Buyer's Guide | best hcm software |
| `switching-from-adp-blog.md` | Switching From ADP: A Mid-Market Migration Playbook | switching from adp |
| `best-hris-for-small-business-blog.md` | Best HRIS for Small Business: 2026 Shortlist | best hris for small business |
| `mid-market-hcm-software-blog.md` | Mid Market HCM Software: How to Pick the Right Fit | mid market hcm software |
| `hcm-vs-hris-blog.md` | HCM vs HRIS: What's the Difference and Which Fits? | hcm vs hris |
| `hcm-implementation-services-blog.md` | HCM Implementation Services: What Good Looks Like | hcm implementation services |
| `hris-vs-hrms-blog.md` | HRIS vs HRMS: The Difference Buyers Actually Care About | hris vs hrms |

**Action:** None blocked on content quality. Publish lane needs operator/CMS access (not in automation registry gates).

## Infrastructure gates

From `12_Brain/registry/automations.json`:

| Gate | Status | Impact on pipeline |
|---|---|---|
| `obsidian_sync_cli` | pending-human | Vault sync verification still operator-gated |
| `netlify_deploy_token` | pending-secret | Blocks automated deploys (outreach previews, client sites) |
| `landingfolio_token` | pending-secret | MCP layout reference inert; harvest-only design |
| `mail_vendor` | pending-decision | Blocks QR → direct-mail activation (PostGrid vs StackAdapt) |
| `outreach_send` | **hard-blocked** | No automated outbound until explicit human unlock |

**Outreach engine gaps (campaign note):** mail vendor undecided; discovery/qualify scoring manual; Netlify deploy token not in Cloud Agent secrets; QR path ready once sheet zap wires to `manifest.csv`.

## Pipeline status (radar 2026-08-08)

- **877** businesses tracked · **30** new today · **30** re-audited
- **147** qualify for rebuild · **1** blocked on render pass
- Top faults: ENOTFOUND dead domains, missing viewport meta, occasional 503
- **8** prospects declined since last audit (score drops up to −19)
- Dashboard: `Daily-Briefs/prospect-radar.html` · queue: `12_Brain/state/radar/build-queue.csv`

## Scout verdict

| Lane | Status |
|---|---|
| Site health | **Blocked** — book form `/api/dossier-leads` is the critical known failure; live canary not run |
| Ads / outreach | **Gated** — `outreach_send` hard-blocked; mail vendor + deploy token pending; queues empty |
| SEO (Align) | **Ready** — 10 blogs ship-ready; publish is operator action |
| Competitive execution | Book lead capture + outreach activation are the top domain blockers |
