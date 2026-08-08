# Gmail Intel — Competitive Task Orchestrator Run 3

**Run date:** 2026-08-08  
**Scout:** gmail-intel (vault fallback)  
**Sources:** `01_Clients/*/overview.md` Gmail intel sections, `Daily-Briefs/pulse-today.md`, `Daily-Briefs/source-intake-2026-07-30.md`, `01_Clients/Replenish/Google Ads Billing Block 2026-07-30.md`, `System/urgent-replies.md`, `12_Brain/09_Ops/Netlify Credits Suspension 2026-07-30.md`

---

## MCP status

**vault-fallback** — Gmail MCP unavailable. No live mailbox search performed. All signals below are compiled from vault notes; ages are computed from source dates to 2026-08-08 unless noted.

---

## P0 signals

Ranked by launch/billing impact, then recency. Stale vault dates are flagged.

| Rank | Client / area | Signal type | Age | One-line next action |
|------|---------------|-------------|-----|----------------------|
| 1 | **Replenish** | `billing-risk` + `launch-blocked` | 9d (2026-07-30) | Confirm Mia completed the Google Ads payment screen and campaigns are delivering in the correct Replenish account. |
| 2 | **Netlify (ops)** | `launch-blocked` | 9d opened; cycle reset 2026-08-06 | Verify whether suspended mapped sites are back online post–Aug 6 reset or still need a top-up decision. |
| 3 | **NKCDC** | `launch-blocked` | ~115d vault stale (last intel 2026-04-15) | Nudge Anthony Miller on Free Tax Prep landing page; launch fully blocked until NKCDC ships the page and responds. |
| 4 | **Bar Crawl USA** | `client-ask` | ~115d vault stale (2026-04-15) | Close the loop on 2 disapproved Halloween / Fall Cocktail Crawl ads — resolution owed to Andy Zirger. |
| 5 | **Hardwood Artisan** | `billing-risk` | ~123d vault stale (2026-04-07) | Nudge Dalton Fashik on card update; engagement at risk of pausing per Sean's billing request. |
| 6 | **BigOrange Marketing** | `client-ask` | Due in 2d (2026-08-10) | Prepare Custom Home Builder pillar audit and Janice interview for team review. |
| 7 | **Commercial Cleaners Alliance** | `client-ask` | ~122d overdue (commit 2026-04-08) | Audit delivery of CCA + NexGen creatives promised 2026-04-08. |
| 8 | **Shadow HVAC** | `client-ask` | ~159d quiet (last Gmail 2026-03-02) | Send Mike a catch-up report; confirm LSA is serving and GBP cadence is healthy. |
| 9 | **Kimberly James Bridal** | `boss-ask` | ~115d vault stale (2026-04-15) | Publish approved Wedding Dress Timeline page; verify GA4/GSC indexing per Mac. **CC required:** mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com on all Kim threads. |
| 10 | **Fresh Blends / Replenish** | `client-ask` | ~117d vault stale (2026-04-13) | Verify 2026-04-13 launch actually spent; ship first-week performance snapshot to Mia (may overlap with billing block above). |
| 11 | **Link Eze** | `billing-risk` | ~124d vault stale (MFA notice 2026-04-06) | Confirm MFA is enabled on Google Ads account 809-600-6448 and enhanced-conversions warning is cleared. |
| 12 | **Omega Landscaping** | `fyi` | ~116d vault stale (2026-04-14) | Monitor only — Dillon CC'd on John Belaska → David Thursday meeting thread; David hasn't replied. |
| 13 | **Jeff Hozias** | `client-ask` | ~116d vault stale (2026-04-14) | Launch Meta Ads with approved seller/buyer copy; investigate March GBP post rejections. |
| 14 | **Bok Law** | `fyi` | ~116d vault stale (2026-04-14) | Healthy engagement; continue weekly social cadence (Wednesday Wisdom, etc.). |
| 15 | **Onsite Concrete** | `fyi` | ~115d vault stale (2026-04-15) | Standing Thursday sync; no async deliverables surfaced in Gmail intel. |

### Secondary signals (source intake 2026-07-30, non-Gmail)

| Area | Signal type | Note |
|------|-------------|------|
| Slack — Jason/Sean | `boss-ask` | Bot and case-status alerts flagged urgent unanswered in source intake; route via Slack lane, not Gmail. |
| Slack — Melissa | `boss-ask` | Guidelines prompt and Loom training need verified status and meeting slot. |

---

## Unanswered threads

Vault-only view. Live mailbox may show newer replies not yet compiled into client overviews.

| Who | Subject / thread | Age | Dillon role | Reply owed? |
|-----|------------------|-----|-------------|-------------|
| **Mia Lange** (Replenish) | Google Ads billing / payment screen | 9d | Direct | **Yes** — confirm billing cleared and ads serving. |
| **Anthony Miller** (NKCDC) | Free Tax Prep launch / Mac check-in | ~115d (vault) | Direct (Mac also pinged) | **Yes** — client-side blocker; nudge on landing page. |
| **Andy Zirger** (Bar Crawl USA) | 2 ad disapprovals (Halloween / Fall Cocktail Crawl) | ~115d (vault) | Direct | **Yes** — resolution promised 2026-04-15, not confirmed in vault. |
| **Dalton Fashik** (Hardwood Artisan) | Card update for next 90 days (via Sean) | ~123d (vault) | CC on Sean thread | **Monitor** — Sean owns billing ask; engagement at risk. |
| **Mike Ross** (CCA / Buzz Bull) | Buzz Bull CCA / Sterile Care Teams invite | ~116d (vault) | Direct | **Verify** — pulse flagged attendance confirm; may be historical. |
| **John Belaska → David Granados** (Omega) | Re: Adding User To Google Ad Account / Thursday meeting | ~116d (vault) | CC only | **No** — monitor unless Sean pulls Dillon in. |
| **Kimberly Iraci** (KJB) | Wedding Dress Timeline publish + GA4/GSC | ~115d (vault) | Direct | **Yes** — publish page and confirm indexing to Mac/Kim. |

---

## Data gaps

What live Gmail (last 48h search per scout contract) would have answered that vault fallback cannot:

1. **Recency** — Whether any P0 threads received replies after vault `last_touched` dates (most client Gmail intel stops at 2026-04-15; newest vault signal is 2026-07-30).
2. **Replenish billing** — Whether Mia completed payment and campaigns are spending as of today.
3. **Netlify** — Post–2026-08-06 reset status of suspended sites; any new billing alerts.
4. **NKCDC** — Whether Anthony or NKCDC team responded after Mac's 2026-04-15 check-in.
5. **Bar Crawl USA** — Current ad approval state and Soulard budget pacing since 2026-04-15 patches.
6. **Boss asks** — New threads from Sean Boyle, Mac Frederick, Melissa Silber, or Jason Fallon in the last 48h.
7. **Billing / invoice keywords** — Fresh payment failures, disapprovals, or M360 invoice threads not yet ingested.
8. **Align HCM** — No Gmail intel in vault for full-time employer threads (correctly routes to `fulltime-job`, not M360).
9. **Bridge Software Development** — No dedicated Gmail intel section; last accessible history note is 2026-07-11 (brand/prototype gap).
10. **CCA contact** — Confirm whether David Stemm or Mike Ross is current POC; Gmail shows Mike as active thread owner.

---

## Scout notes

- KJB CC discipline is non-negotiable on outbound: mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com.
- No credentials, payment data, or MFA secrets recorded in this lane output.
- Recommend re-running with Gmail MCP when available and backfilling `last_touched` / Gmail intel sections on client overviews after intake.
