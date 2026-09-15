# Ads API five-account pull — findings Claude did not finish

**Pickup:** Antigravity session `Dillon Mohr Operating Handoff` (`14eb7d00-100a-4c60-af2b-8fe3d3a178cf`) pulled 24 JSON files per account into `dillon-os/_os/automation/google-ads-api/pulls/` then hit Gemini 3.8 Flash High quota at ~10:20 ET. Cursor finished the analysis with Claude's probe scripts.

**Onsite mutation later the same morning:** Dillon ordered the $80 LSA off. LSA `23068725075` is now PAUSED and its budget is $1/day. Replacement Search `24243107659` exists PAUSED at $15/day. Nothing in the Onsite account is serving.

**Source:** Google Ads REST v23, direct, no login-customer-id. Probe `%LOCALAPPDATA%\Dillon\GoogleAdsProbe\`. Observed 2026-09-10 ~11:20 ET.

**Do not** sum Replenish and Fresh Blends on CID `6275014654`. Keyword-metrics joins can repeat the same brand-term spend across campaigns; those rows are flagged below, not added.

---

## What actually changes a meeting

### 1. Omega is buying a blank Wix page

2026 landing-page view (API):

| URL | Cost | Clicks | Conv |
|---|---:|---:|---:|
| `omegalandscapingandconcrete.com/blank-1` | $3,442.96 | 505 | 7.0 |
| homepage `/` | $3,436.64 | 800 | 5.0 |
| `/blank-2` | $649.07 | 67 | 0.0 |
| `/blank` | $155.55 | 17 | 0.0 |

The live Search campaign (`Search | High Intent | Colorado Springs | 2026-07-30`, ENABLED, $50/day) is losing **65% impression share to rank**, only **4% to budget**. Raising budget does not fix this. QS is almost unrated (250 of 254 keywords). Top live keyword `landscape design build` $635.40 / 86 clicks / 3.0 conv. Concrete terms still spend with conversion reporting pending on those rows.

Access request (Wix / Ads admin / GHL) is still the unsent 2026-07-30 draft. The blank URLs are why that request is not optional.

### 2. Onsite LSA is off. The $15 Vacaville concrete Search exists paused. Conversion soup is still Primary.

Live API after the 2026-09-10 repair (this supersedes the morning pull for campaign status):

| Campaign | Status now | Budget | Notes |
|---|---|---:|---|
| Onsite Concrete & Landscape (Smart) | PAUSED | $7/day | unchanged |
| Leads-Performance Max-1 | PAUSED | $5/day | unchanged |
| Local Services (system) `23068725075` | PAUSED | $1/day | was ENABLED $80/day with $0 / 0 impr; Dillon ordered it off |
| Search High Intent Solano `24183437726` | PAUSED | $7/day | leftover mixed landscaping + WordPress `/services/` |
| **Onsite \| Search \| Concrete \| Vacaville \| 2026-09-10** `24243107659` | PAUSED | $15/day | created from the Aug 14 package; Netlify LP; Phrase/Exact; Vacaville Presence |

Homepage `onsiteconcretelandscape.com/` 2026: $936.20 / 3,481 clicks / **95.0 conversions**. That 95 is not 95 booked jobs. Enabled Primary actions still include directions, map clicks, smart-campaign calls, GA4 form, web contact form, web phone calls, submit lead form, OnSite form, OnSite phone from ads, website phone click. Friday's call with Nicky is measurement plus whether to enable the new $15 Search. Nothing is serving until Dillon says enable.

### 3. Nexla live pair is fine. The landmine is paused budgets, not live spend.

Live today (reconfirmed HTTP 200): Brand Exact $25 Maximize Conversions; MCP Search $40.75 Maximize Clicks; combined **$65.75/day**.

90-day IS on the two live campaigns:

- Brand Exact: Search IS **85%**, lost rank 11%, lost budget 4%.
- MCP-Agentic: Search IS **12%**, lost rank **54%**, lost budget **34%**. MCP is both under-ranked and under-funded.

Paused campaign **budget objects** were **$1,440/day** this morning (competitor campaigns at $75, data-integration $50, ETL $30, PMax $20, etc.). **Repaired 2026-09-10:** those 31 paused budgets are now $1/day. Brand $25 and MCP $40.75 were not touched. Custom goal on the live pair is now HubSpot Demo Request only; it had been CRM Lead.

MCP ads: many ENABLED RSAs at POOR/AVERAGE to `nexla.com/lp/mcp-servers/`, `mcp-in-action`, `mcp-for-agents`. Older ETL/Governance ads (campaigns paused) still POOR to `nexla.com/demo/`.

2026 LP view: `nexla.com/demo/` $16,098.70 / 2,770 clicks / 3.0 conv. `mcp-architecture/` $1,882.30 / 325 clicks / conversion reporting pending. Demo Request remains Secondary. Do not quote MCP as a qualified-lead machine until Primary is one HubSpot success action.

Search-term insight categories on MCP (live API, last Antigravity query): linear ai, ai glossary, hugging face ai, julius ai, coreweave reviews, prediction market software. That is the leftover junk taxonomy after the 60 negatives.

### 4. KJB Search is paused. The appointment RSA is POOR and the homepage ate the clicks.

Both `Campaign #1` and `KJB | Search | Local Bridal | Philadelphia` are **PAUSED**. 90d Search IS ~10–23%, lost mostly to rank.

One RSA on the appointment campaign: POOR, 3,137 impr / 175 clicks / $627.20, URL `kimberlyjamesbridal.com/bridal-appointment-request`. LP view 2026: homepage $1,615.38 / 3,319 clicks with conversion reporting pending on that row; appointment-request $785.42 / 508 clicks / 1.0. Landing-page quality on bridal keywords is BELOW_AVERAGE.

### 5. Replenish / Fresh Blends (campaign rows only, no CID total)

Many Replenish PMax rows are **ENABLED / ENDED** at $16.67/day. Fresh Blends Ice Box PMax is mixed PAUSED/ENDED vs PAUSED/SERVING. That matches the billing-block story, not a silent restart.

Landing rows mix Replenish Netlify URLs with `kwiktrip.com/icebox` and 7-Eleven UTM parameters on the same pull. Keep brands separate. Do not brief a combined spend number.

---

## Beth 13:00 one-pager (say this, not the 24 JSON files)

- Ads API is live on the local probe. Composio is still dead.
- Nexla: two campaigns on, $65.75/day. Measurement is the remaining quality-lead problem. Dana/Jayashree email already sent this morning. Slack to Sean already posted (Cursor footer attached; do not reuse that send path).
- Omega: live Search is rank-limited, not budget-limited. Traffic is landing on `/blank-1`. Access draft still unsent.
- Onsite: Nicky's "no calls" vs 95 homepage conversion events is mixed Primary tracking. LSA $80/day is on with no 90-day delivery. Friday 12:00 call is the decision.
- KJB: paused. Appointment page is the only URL that recorded a conversion in this pull.
- Replenish: ended/paused rows, Mia draft is copy and tracking, not a restart. No account total.
- Nothing to Mac from this seat. Friday 11:00 is Dillon's meeting.

---

## Still waiting on Dillon (unchanged)

1. Power supply.
2. Text Matt Otten EOD.
3. Andy pause-ack send (Mac off).
4. Omega access send.
5. Retire Fagan / NKCDC drafts.

Antigravity remains open on quota until 2026-09-17 9:55 AM. Do not wait on it for this analysis.
