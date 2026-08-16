---
type: codex-handoff
date: 2026-08-15
do_not_send: true
---

# Codex prompt — launch three Google Search campaigns

Paste everything below the line into Codex on a machine that already has a trusted Google session (Ops Box / signed-in desktop). Cloud Agent Chrome cannot sign in: unrecognized device + phone ending 33.

---

You are Codex running inside Dillon Mohr's public vault `dillonmohr8777/dillon-os`.

## Mission

Launch **three new Google Ads Search campaigns** that Dillon already ordered. Do it in the live UI (or CDP Chrome on the 64GB Ops Box). Do not email anyone. Do not invent metrics, landing pages, or UTM schemes.

The three clients and the **only** allowed final URLs (fetched live 2026-08-15):

1. **Onsite Concrete & Landscape** → `https://onsite-gads-landing-page.netlify.app/`
2. **Omega Landscaping & Concrete** → `https://omega-landscaping-landing-page.netlify.app/`
3. **Kimberly James Bridal** → `https://www.kimberlyjamesbridal.com/bridal-appointment-request`

Read the create packets first, then apply them in-account:

- `Daily-Briefs/ads-launch-packet-2026-08-15-onsite.md`
- `Daily-Briefs/ads-launch-packet-2026-08-15-omega.md`
- `Daily-Briefs/ads-launch-packet-2026-08-15-kjb.md`
- Parent brief: `Daily-Briefs/ads-launch-2026-08-15-onsite-omega-kjb.md`

Packets live on branch `cursor/ads-campaign-launch-a5e7`. Ads skills live on `cursor/ads-optimization-skills-a5e7`. Read both. Do not create `1Z_Brain/`. This GitHub repo is PUBLIC — no emails, phones, customer IDs, or credentials in `12_Brain/`.

## Skills Dillon OS created (vault-native — use these)

These five were written into `.claude/skills/` on `cursor/ads-optimization-skills-a5e7`. They are Command Deck skills. **Do not vendor foreign plugins into this folder.**

### `/ads-audit` — `.claude/skills/ads-audit/SKILL.md`

Weekly Google + Meta health check. Evidence only. Scores Tracking / Bid fit / Waste / Structure / Creative-LP / Meta as Critical / High / Medium / Working. Writes `Daily-Briefs/ads-audit-YYYY-MM-DD-<slug>.md` plus draft Optimization Ledger rows. Never invent a 0–100 score. Pending-validation events are not conversions.

### `/ads-optimize` — `.claude/skills/ads-optimize/SKILL.md`

Optmyzr-style IF/THEN drafts. Only fire a rule when the IF side has evidence.

- Waste (Tier 1): lookback ≥ 7 days, cost above a stated threshold (default $20), conversions = 0, not brand/conquest → exact negative or pause. Hold if `Protected — brand` or `Review — competitor`.
- Bid fit (Tier 2): under ~30 conv / 30 days → Maximize Conversions (no target), not tCPA. Learning-phase edits in last 7–14 days → hold. Delivery collapse on a tight target → loosen ≤ 20% rescue only.
- Budget (Tier 2): lost IS (budget) > 20% AND CPA at/under target AND tracking real → +budget ≤ 20%. Actual/target > 1.5 and conversions falling → −30% or pause. Actual/target 0.8–1.2 → hold. Never move more than ~20–30% of a campaign budget in one draft.
- PMax: if branded Search is also live and brand exclusions are missing → draft brand exclusions.
- Do not encode cross-industry CPC/CPA medians as this client's target. Do not promise “QS 5→7 cuts CPC by X%.”

Writes `Daily-Briefs/ads-optimize-YYYY-MM-DD-<slug>.md`. A human applies.

### `/ads-search-terms` — `.claude/skills/ads-search-terms/SKILL.md`

Mine queries. Classify **before** theming:

| Status | Meaning | Negative? |
|---|---|---|
| Waste | Off-topic / jobs / DIY / geo-miss in a non-brand, non-conquest campaign | Yes |
| Review — competitor | Rival brand in a conquest campaign | Human only |
| Protected — brand | Own name or misspelling, or a Brand campaign | Never |

Zero-conversion is not automatically waste. Themes: jobs, DIY/free, wrong trade, competitors (flag), geo miss, informational. PMax campaign-level negatives are allowed in 2026. Brand exclusions on PMax when branded Search is live. Paste-ready negative block = negatives only, no comments inside the fence.

### `/ads-tracking` — `.claude/skills/ads-tracking/SKILL.md`

Preflight before any bid change. Broken tracking is a stop.

Google: one primary action for bidding (1–3 primaries). Native Ads tag = primary. GA4 key events = secondary. Never count the same action in both. Enhanced conversions need Customer Data Terms + diagnostics showing data received. Auto-tagging on. `gclid` stored on the lead if offline upload is in play. **Pending validation is not a conversion.** Under ~30 conv / 30 days per campaign → Maximize Conversions, not tCPA.

Meta: `Lead` on pixel + CAPI with the same `event_id`. Local accounts stay Maximize Leads + Higher Intent form unless they clear ~200 leads/month and a CRM stage converts 1–40% inside 28 days.

### `/meta-ads` — `.claude/skills/meta-ads/SKILL.md`

Local lead-gen Meta audit. Higher Intent form first when quality is junk. Advantage+ geo must actually hold. Pixel-only is a fail. Learning wants ~50 conversions / week / ad set — do not fragment $20/day ad sets. Do not recommend Conversion Leads without the volume proof. No live spend changes in a cloud session.

## Skills found (reference only — do not vendor, do not install MCPs)

| Source | What it is | What to do |
|---|---|---|
| `dillonmohr8777/claude-ads` (fork of AgriciDaniel/claude-ads, MIT) | Plugin pack: ads-audit, ads-google, ads-meta, ads-server-side-tracking, ads-attribution, 12 platforms | Distill only. Writes `ADS-AUDIT-REPORT.md` in the plugin tree, not this vault. |
| `dillonmohr8777/claude-skills-repo` → `paid-ads`, `campaign-analytics` | Generic strategy prose + offline JSON math | Reference. Not Command Deck. |
| [optmyzr-skills](https://github.com/optmyzr-skills) `google-ads-audit` | ~42 checks / 14 categories, 4-CSV paste, Apache-2.0 | Reference. Do not copy into `.claude/skills/`. |
| optmyzr-skills `google-ads-ppc-waste-finder` | 7-day, >$20, 0-conv → negatives + Waste/Review/Protected guardrail | Already distilled into `/ads-search-terms`. |
| optmyzr-skills `Google-Ads-audience-segmentation` | Targeting vs Observation | Later `/ads-audiences` if Dillon asks. Not this launch. |
| Hosted Optmyzr MCP `tools.optmyzr.com/OptmyzrMcp` | Paid Rule Engine, keyword writes, preview required | Gated. Needs `_os/automation/bin/mcp-gate.js` + Optmyzr login. |
| `thalesholleben/skill-google-ads` | Cadence / CPA-ratio budget table / learning hold | Advisory. Do not use their cross-industry CPC $4.22 / CPA $53.52 as local-service targets. |
| `narayan-metaflow/metaflow-marketing-skills` | google-ads-optimizer, google-ads-scripts | Advisory. Ignore “19–27% ROAS lift” as a promise. |
| `mardab96/google-ads-skills` | CPA-spike, IS-gap, PMax diagnosis | Next harvest. Not vendored. |
| `itallstartedwithaidea/agent-skills` (googleadsagent.ai) | 12 Google Ads skills + commercial agent | Do not vendor. |
| Adspirer / AdKit hosted ads MCPs | OAuth + paid + overlap with Composio | Stay out until mcp-gate. |
| X / Twitter skill hunt | Bearer authenticates; recent search is HTTP 402 credits-depleted | Dead this session. Keys stay gitignored. |

LandingFolio is still the only project MCP and is sandbox-only. Existing Composio Google Ads is the only live Ads API this stack may call — and it was HTTP 429 quota-exhausted on 2026-08-15. **UI apply is the path.**

## Vault concepts to read (generic — no account IDs)

- `12_Brain/concepts/Google Ads Conversion Optimization 2026.md` — ~30 conv/30d bar; new/thin → Maximize Conversions not tCPA; Maximize Clicks only when tracking/volume is ~zero; learning hold 1–2 weeks; PMax brand exclusions if branded Search is live. **Note:** that page still says “new / <30 conv/mo → Maximize Conversions.” For **these three new campaigns**, tracking is thin or unmatched, so the launch packets override to **Maximize Clicks or Manual CPC**. Do not put them on Maximize Conversions or tCPA at create.
- `12_Brain/concepts/Conversion Tracking Setup 2026.md` — native tag primary, GA4 secondary, no double-count, auto-tagging / gclid.
- `12_Brain/concepts/Meta Lead Ads Optimization 2026.md` — KJB Meta stays the lead engine.
- `11_Agents/Google Ads Agent.md` — Tier 1 = negatives/pauses/CTA fixes; Tier 2 = budget/bid/new campaigns/goal changes. Dillon already ordered these three new campaigns (Tier 2 override). Still do not email clients. Still do not invent metrics.
- `12_Brain/concepts/Ads Optimization Skill Stack.md` (on the skills branch)
- `12_Brain/entities/Claude Ads.md` and `12_Brain/entities/Optmyzr Skills.md` (skills branch)

## Hard rules (non-negotiable)

1. **Existing tracked URL only.** Do not invent a new landing page. Do not append handmade `utm_*`. Auto-tagging on. Let `gclid` / `gbraid` / `wbraid` append.
2. **Search only.** Search Partners off. Display off. No new Performance Max. No Demand Gen.
3. **Presence only** geo. Not Presence or Interest.
4. **Bid:** Maximize Clicks (preferred) or Manual CPC. No tCPA. No Maximize Conversions. No tROAS. No Smart Bidding. Omega’s Aug 17, 2026 Smart Bidding deadline email is **not** permission to flip the new campaign.
5. **Budget:** carve / support-slice from the **current** Google daily budget. Do not stack a second full-spend campaign. Do not invent a new monthly appropriation. Onsite ceiling from late-July weekly reads only (~$23–$60/week). Omega existing Search already spent about $388 in the Aug 3–9 week — carve, do not stack. KJB is a modest support slice; Meta stays primary.
6. **Phrase + exact only.** No Broad on this launch.
7. **Pending / unmatched conversion events are not conversions.** Omega’s 2 reported events still need matching to named inquiries. Onsite Netlify form rows in July were labeled test. KJB form submit is an appointment **request**, not a confirmed booking.
8. **Brand protection.** Do not negative Omega (or obvious misspellings). Do not invent competitor brand negatives.
9. **No PII in tracked `12_Brain/`.** No customer IDs, emails, phones, credentials. Do not put phones in ads or call assets on this CREATE.
10. **Do not email** Onsite, Omega, Kimberly, or anyone else. If a KJB email is ever drafted later (not now), it must CC Mac, Sean, and Melissa. Do not draft it.
11. **Do not login-guess.** If the Google session is dead, mark `needs-reauth` and stop. Do not attempt 2FA from a cloud VM. This Cloud Agent already failed: unrecognized device + phone ending 33.
12. **Tags 2 Go is not in this launch.** Leave that cert/appeal thread alone.
13. After apply, write what launched (campaign names, URLs, bid, budget carve, tracking suffix = none) to `Daily-Briefs/` and append a hypothesis row to each client’s Optimization Ledger if that file exists. Review date = 14 days. Then a search-terms pass — do not change bid strategy on unmatched events.

## Per-client apply spec (summary — the packet is source of truth)

### Onsite — `Onsite | Search | Vacaville | Concrete-Landscape | 2026-08`

- Type: Search. Not another PMax.
- Final URL: `https://onsite-gads-landing-page.netlify.app/`
- Geo: Vacaville, CA, Presence only. If the live account already targets named nearby communities, keep that existing set — do not invent a new city list.
- Bid: Maximize Clicks or Manual CPC.
- Budget: carve from existing Google/PMax daily. Do not add net-new spend.
- Ad groups: `AG | Concrete` and `AG | Landscape`. Keywords and RSA are in the packet (driveways, stamped/decorative, patios, flatwork / landscape install, drought-tolerant, irrigation, walls, pavers).
- Negatives: jobs, careers, diy, wholesale, materials, supplier, how to.
- Do not send traffic to the WordPress homepage.

### Omega — `Omega | Search | Landscape+Concrete Estimate | COS Presence`

- Type: Search. Not another PMax.
- Final URL: `https://omega-landscaping-landing-page.netlify.app/`
- Geo: Colorado Springs, Monument, Falcon, Peyton, Black Forest. Presence only.
- Bid: Maximize Clicks or Manual CPC. **Hold Smart Bidding through and past Aug 17** until named inquiries match conversion events and volume is real. Two unmatched events do not clear the ~30/30 bar.
- Budget: carve from current Search daily so both Search campaigns sum to the current Search daily — not current plus a new daily.
- Ad groups: `AG | Landscape Install`, `AG | Concrete Install`, `AG | Estimate Intent`.
- Campaign negatives: supplier, wholesale, distributor, materials, ceramic, products, supply yard, buy materials, jobs, employment, hiring. **Protected — brand: Omega.**
- RSA: contractor / install / estimate only. Never “buy materials” or “supply yard.” Do not promise free.
- Context: Dillon’s Aug 2 note — most calls are wrong-company / material-supplier confusion. That is why the negatives exist.

### Kimberly — `KJB | Search | Private Appointment | PHL-CH | 2026-08`

- Type: Search. Not PMax. Not homepage.
- Final URL: `https://www.kimberlyjamesbridal.com/bridal-appointment-request`
- Geo: Philadelphia + Chestnut Hill + nearby collar (Wyndmoor, Flourtown, Erdenheim, Glenside, Springfield Twp Montgomery). Presence only. Do not go statewide.
- Bid: Maximize Clicks or Manual CPC.
- Budget: modest support slice of existing Google daily. **Meta stays primary.** Do not starve Meta to fund this.
- Ad groups: Bridal Appointment, Wedding Dress Appointment, Boutique Chestnut Hill, Plus-Size PHL (still the appointment URL).
- Negatives: jobs, wholesale, cheap/costume, DIY. No invented competitor brands.
- RSA: private appointment / Chestnut Hill / stylist. One on-page testimonial line allowed without the reviewer name.
- Decision trail: 2026-07-14 Kim asked to cancel Google and focus on Meta; Dillon agreed “for now.” **2026-08-15 Dillon overrode that** and ordered this small appointment-intent Search campaign. Enable it. Do not rebuild a lead-engine Google account.

## Apply order

1. Confirm you are signed into Google Ads on a **trusted** browser (Ops Box CDP or Dillon’s desktop). If not, stop and say `needs-reauth`.
2. Open each client account from the MCC. Verify the account name. Do not type customer IDs into any tracked vault file.
3. Confirm auto-tagging is on.
4. Confirm conversion actions: do **not** set the new campaigns to optimize to pending or unmatched events. Create with a clicks / traffic goal.
5. Apply Onsite packet → Omega packet → KJB packet. Same session is fine. Do not run three browsers that fight.
6. Screenshot or export: campaign name, status Enabled, final URL, bid strategy, daily budget number you carved (write the number only in `Daily-Briefs/`, not in `12_Brain/`), networks, geo Presence-only.
7. Write `Daily-Briefs/ads-launch-applied-YYYY-MM-DD.md` with those facts. Append ledger rows. Update `12_Brain/projects/Three Campaign Launch 2026-08-15.md` status from blocked → applied, with a `source:` link. Update `12_Brain/INDEX.md` in the same change if you add/remove a wiki page.
8. Do not send client email. Do not “accept” Google’s Smart Bidding recommendation on Omega.

## If something is missing

- If a packet field is blank (daily dollar amount), **look at the live account’s current Search/PMax daily** and carve. Do not invent a new total.
- If the Netlify LP or appointment URL is down, **stop that client** and say so. Do not fall back to the homepage.
- If conversion actions are pending validation, leave bidding on clicks.
- If you cannot reach an account, skip it and report which one. Do not create a new Ads account.

Start by reading the three packets, then apply them. Lead with the action. Skip the fluff.
