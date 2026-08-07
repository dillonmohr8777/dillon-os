# Domain / Ads / SEO — 2026-08-07

Tier 0 read-only scout. No live account changes.

## Site health summary

**Dry-run command output:**

```json
{
  "status": "fail",
  "dry_run": true,
  "counts": {
    "total": 5,
    "pass": 1,
    "warn": 0,
    "fail": 1,
    "skipped": 3
  },
  "state": "/workspace/12_Brain/state/site-health-sentinel.json",
  "report": "/workspace/Daily-Briefs/site-health-report.md"
}
```

| Count | Value |
|---|---|
| pass | 1 |
| warn | 0 |
| fail | 1 |
| skipped | 3 (live sites not checked in dry-run) |

- **Fixture healthy site** — pass (viewport + tracking hints OK)
- **Fixture broken form** — fail: missing viewport meta, no GA4/Meta pixel hints, **form endpoint marked missing: `/api/dossier-leads`**
- **Book site risk (Opportunity #1):** dry-run fixture models the ironicineptocracy.com failure mode — dead email capture on `/api/dossier-leads`. Live properties (ironicineptocracy.com, themohrmedia.com, immohrtal) were skipped; operator must pass `--live` on a trusted machine to verify production.

## Ads / campaign blockers

### Client checks (requested)

| Client | Issue | Status | Vault source |
|---|---|---|---|
| **Fresh Blends / Replenish** | Google Ads **billing block** — campaigns cannot run until account-side payment update | **Blocked** (since 2026-07-30) | `01_Clients/Replenish/Google Ads Billing Block 2026-07-30.md`, `Fresh Blends Replenish/overview.md` |
| **Link Eze** | Enhanced conversions data-source diagnostics warning; MFA / 2-step enforcement deadline **2026-04-06 passed** | **Overdue** (due 2026-04-06) | `01_Clients/Link Eze/overview.md`, `active-campaigns.md` |
| **Shadow HVAC** | LSA background check reset confirmed 2026-03-02; **no vault confirmation LSA is serving**; GBP cadence stale (`last_touched` 2026-03-02) | **Unverified** | `01_Clients/Shadow HVAC/overview.md`, `System/urgent-replies.md` |
| **Bar Crawl USA** | **2 ad disapprovals** (Halloween / Fall Cocktail Crawl language, forwarded 2026-04-14–15); Dillon replied 2026-04-15 — **resolution still owed** | **Open** | `01_Clients/Bar Crawl USA/overview.md`, `System/urgent-replies.md`, `brand-guidelines.md` |

#### Detail

**Replenish billing**
- Google Ads flagged campaigns blocked pending billing update (2026-07-30). Dillon sent Mia the billing link; Mia asked if she reached the correct page — destination should be the payment screen.
- Admin access granted 2026-04-12 so Mia could enter CC. Overview still lists GBP manager access for 5 kiosk locations as open.
- Next actions: confirm payment screen completed in the correct Replenish account (not Fresh Blends), verify delivery + conversion reporting after clear. No budget/campaign changes implied.

**Link Eze conversions**
- Enhanced conversions diagnostics warning open since 2026-03-23.
- MFA enforcement notice 2026-04-05 — 2-step verification required starting 2026-04-06 on customer ID ending …6448. Deadline passed; vault has no closure note.
- Critical guardrail: location targeting must stay **Presence Only** (same failure mode as Bar Crawl).

**Shadow LSA**
- Evident portal background-check reset confirmed with Google LSA Managed Partners (Yetunde Sotimirin) on 2026-03-02.
- Gmail traffic quiet after reset. `urgent-replies.md` flags catch-up report to Mike and LSA serving confirmation.
- GBP 4-post/week cadence appears stalled — competitive overlap with content-routines lane.

**Bar Crawl disapprovals**
- 2 disapproved assets on Halloween / Fall Cocktail Crawl creative (Andy forwarded 2026-04-15). Earlier batch of 4 on 2026-04-14.
- Compliance: zero alcohol language; pre-approved copy library only (`brand-guidelines.md`). Disapprovals likely policy/copy drift, not budget.
- Related: Soulard budget pacing patched 2026-04-13 (Max Conversions without tCPA caused $54/day spike); cap ~$15–20/day requested.

### Other vault blockers

| Client | Blocker | Source |
|---|---|---|
| NKCDC | Launch blocked — Free Tax Prep landing page missing | `System/urgent-replies.md` |
| Hardwood Artisan | Billing card update outstanding; engagement pauses without it | `System/urgent-replies.md`, `Hardwood Artisan/overview.md` |

### Campaign queue (`02_Campaigns/`)

- **Active:** [[AI Site Builder Outreach Engine]] — build/QA automated through stage 6; activate (QR + direct mail) gated on mail vendor + Netlify token + human approval.
- **Google Ads Optimization Queue** — empty (no queued optimizations logged).
- **Outreach pipeline gaps (from engine note):** mail vendor undecided; discovery/qualify scoring partly manual; Netlify deploy token not in Cloud Agent secrets; QR path ready once Zapier wired to `manifest.csv`.

## SEO ship-ready

**Align HCM full-time lane** — `SEO/AlignHCM/Blogs/` has **10 drafts** tagged `status: ready-to-publish`:

| File | Keyword focus |
|---|---|
| `adp-alternatives-blog.md` | adp alternatives |
| `best-hcm-software-blog.md` | best hcm software |
| `best-hris-for-small-business-blog.md` | best hris small business |
| `hcm-implementation-services-blog.md` | hcm implementation |
| `hcm-vs-hris-blog.md` | hcm vs hris |
| `hris-vs-hrms-blog.md` | hris vs hrms |
| `mid-market-hcm-software-blog.md` | mid-market hcm |
| `switching-from-adp-blog.md` | switching from adp |
| `ukg-vs-adp-blog.md` | ukg vs adp |
| `what-is-hcm-software-blog.md` | what is hcm software |

All carry SEO scores and meta descriptions. Competitive action: publish sweep on Align's CMS (full-time lane, not M360 billing).

## Infrastructure gates (`12_Brain/registry/automations.json`)

| Gate | Status | Impact |
|---|---|---|
| `netlify_deploy_token` | pending-secret | Blocks outreach stage-7 deploy/activate |
| `mail_vendor` | pending-decision | Blocks QR → direct-mail path (`outreach-activate` tier 2) |
| `landingfolio_token` | pending-secret | Optional design reference; sandbox-only until Inspector passes |
| `outreach_send` | hard-blocked | No outbound mail without explicit human approval |
| `obsidian_sync_cli` | pending-human | Operator gate, not pipeline-blocking for ads |

**Implemented and available:** `site-health-sentinel`, `discover-qualify`, `grok-intelligence-ingest`, `xai-daily-search`, `aeo-trust-gate`, `maker-checker`, `competitive-task-orchestrator`.

**External dependency:** `site-factory-batch` (PR #226) — blocks full weekly 25-site activate loop.

## Priority signals for consolidator

1. **Replenish billing block** — ads cannot serve until Mia completes payment screen (launch-blocked).
2. **Bar Crawl disapprovals** — client-facing resolution owed since 2026-04-15.
3. **Link Eze diagnostics + MFA** — overdue technical debt; affects conversion measurement quality.
4. **Shadow LSA verification** — unconfirmed serving + stale GBP cadence.
5. **Book site `/api/dossier-leads`** — infrastructure risk on Opportunity #1 (fixture fail; live check pending).
