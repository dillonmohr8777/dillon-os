---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-09-13T18:39:44
session_last: 2026-09-13T18:41:38
session_count: 2
cwd: "C:\Users\dillo\Documents\Codex\2026-09-13\investigate-why-tags2go-was-so-successful"
open_flags: [blocked, unpublished, unverified]
tags: [codex-recovery, session, 202609]
---

# Documents\Codex\2026-09-13\investigate-why-tags2go-was-so-successful

**2 session(s)** · 2026-09-13 18:39 → 2026-09-13 18:41 · 2.8h agent-time (summed; sessions may overlap) · 60 MB transcript · 4/5 turns completed

> **Open flags:** `blocked`, `unpublished`, `unverified`

## 1. 2026-09-13 18:39 · 2.6h · 43.1 MB

`01a09c11-74a9-74e2-9cba-b1645b0172c3` · turns 3/3 · flags: unpublished, unverified

**Asked:**

> Investigate why Tags2Go was so successful, getting a bunch of calls very early on that actually came in. But that hasn't been, like, the same for other clients. Why? Are we able to find the history of what we did for them? Can you research all sessions, all emails? Can you use the Google API and MCP, all the access that we've put together, create a goal, figure it out, and then can we apply it to Nexla and Omega Landscaping?

**Outcome reported:**

> **Yes. I recovered the original work, and the strongest explanation is that Tags2Go matched an immediate local need with inexpensive Search clicks and a direct way to call.** We can apply that approach to Omega and Nexla, but the evidence also corrects part of the success story.
> 
> I created and completed the investigation goal, with concrete improvements staged for both clients. [Read the full findings](</C:/Users/dillo/Documents/Codex/2026-09-13/investigate-why-tags2go-was-so-successful/FINDINGS.md>).
> 
> **What worked for Tags2Go**
> 
> The original title-and-registration campaign launched August 16 with:
> 
> - A five-mile radius around the Philadelphia location, using presence targeting.
> - Google Search only, with Search Partners and Display off.
> - Searches closely tied to its core business, including “auto tag agency near me” and “car registration.”
> - A direct call option on the ad.
> - A $15 daily budget and Maximize Clicks.
> 
> By August 20, the historical Google Ads readback showed **seven call conversions on $84.05 spend**, with 97 clicks, a 9.55% click-through rate and approximately $0.87 per click. The separate notary campaign we prepared was not the campaign that produced this result.
> 
> But the client confirmation was narrower: on August 19, Silver said **one call reached them, the callers were real customers, and none had become a job yet**. The later seven-call update did not receive a confirming reply in that conversation. So this was promising early call generation, with partial confirmation of real inquiries, rather than proven sales success. [Original client conversation](https://mail.google.com/mail/#all/1a01ae40a34b1f19).
> 
> **Why Omega has been different**
> 
> Omega’s problem includes both higher costs and weaker inquiry quality.
> 
> The owner explicitly reported Google calls from people seeking other companies, ceramic distributors and landscaping-material suppliers. Earlier Meta contacts also reportedly did not understand why they were being called. Those were warning signs that platform lead counts were overstating useful business activity.
> 
> We also **already tried the call-campaign idea**. August’s `Search_Services_Call Only` produced one click costing $44.52 and zero reported conversions. The later work restored High Intent Search and paused the legacy call campaign.
> 
> Current API evidence shows:
> 
> | September 3–12 | Clicks | Spend | Reported conversions |
> |---|---:|---:|---:|
> | Omega High Intent | 47 | $362.37 | 1 form event |
> | Nexla MCP Search | 86 | $415.09 | 0 |
> | Nexla Brand Search | 37 | $72.97 | 0 |
> 
> These are platform events, not verified qualifie

> **Omega’s six approved exact-match exclusions are live and verified.** Its budget remains **$50/day**. The [execution record](</C:/Users/dillo/Documents/Codex/projects/client-operations/clients/omega-landscaping/deliverables/2026-09-13-tags2go-lessons/STAGED-PLAN.md>) includes the API receipt and rollback details.
> 
> Two parts remain incomplete:
> 
> - **Omega website:** the approved copy is ready, but Wix’s “Edit Site” controls failed to open the editor. No website changes were published.
> - **Nexla:** the tracking repair remains unpublished and the challenger ad remains paused. GTM Preview also failed to open, and today’s email check found no response to the coordinated test request sent to Dana. We still need that accepted paid-page submission and tracking proof before launch.
> 
> Your approval remains recorded. **Please open Omega’s Wix editor manually and leave it open** so I can continue the approved edits.

> **Omega’s approved changes are now live.**
> 
> - Published clearer service/location copy, a direct call button, and “Request an Estimate” linking to the contact form.
> - Replaced the unfinished template text and fixed mobile scrolling so visitors can reach both buttons.
> - Confirmed the labeled test submission arrived in Wix and triggered the configured Ads conversion. Email-notification delivery remains unverified.
> - Six exact negative keywords are applied; the budget remains **$50/day**.
> 
> **Nexla remains staged.** Tag Manager Preview still fails to open Tag Assistant. Its seven tracking changes remain unpublished, and the prepared challenger stays paused until the accepted/rejected form tests and CRM receipt can be verified.
> 
> The research supports copying Tags2Go’s **specific buying intent, easy contact path, and actual lead reconciliation**. It does not establish that its seven reported call events were seven received customers or won jobs.
> 
> [View Omega’s live site](https://www.omegalandscapingandconcrete.com/) · [Execution evidence](C:/Users/dillo/Documents/Codex/projects/client-operations/clients/omega-landscaping/deliverables/2026-09-13-tags2go-lessons/EXECUTION-STATUS.md) · [Full investigation](C:/Users/dillo/Documents/Codex/2026-09-13/investigate-why-tags2go-was-so-successful/FINDINGS.md)

**Files written (11):**

- `C:/Users/dillo/Documents/Codex/projects/client-operations/clients/nexla/deliverables/2026-09-13-tags2go-lessons/EXECUTION-STATUS.md`
- `C:/Users/dillo/Documents/Codex/projects/client-operations/clients/nexla/deliverables/2026-09-13-tags2go-lessons/STAGED-PLAN.md`
- `C:/Users/dillo/Documents/Codex/projects/client-operations/clients/omega-landscaping/deliverables/2026-09-13-tags2go-lessons/STAGED-PLAN.md`
- `C:/Users/dillo/Documents/Codex/projects/client-operations/clients/omega-landscaping/deliverables/2026-09-13-tags2go-lessons/apply_negatives.py`
- `C:/Users/dillo/Documents/Codex/projects/client-operations/clients/omega-landscaping/deliverables/2026-09-13-tags2go-lessons/negative-keywords.csv`
- `FINDINGS.md`
- `collect_ads.py`
- `evidence/mail-evidence.json`
- `evidence/mail-thread-excerpts.json`
- `evidence/tags2go-access.json`
- `verify_evidence.py`

<sub>rollout: `C:\Users\dillo\.codex\sessions\2026\09\13\rollout-2026-09-13T14-39-44-01a09c11-74a9-74e2-9cba-b1645b0172c3.jsonl`</sub>

## 2. 2026-09-13 18:41 · 12m · 17.0 MB

`01a09c11-74a9-74e2-9cba-b1645b0172c3` · turns 1/2 · flags: blocked

**Asked:**

> <recommended_plugins>
> Here is a list of plugins that are available but not installed.
> 
> - Airtable (airtable@openai-curated-remote)
> - Alpaca (alpaca@openai-curated-remote)
> - Apollo.io (apollo@openai-curated-remote)
> - Spotify (app-68de829bf7648191acd70a907364c67c@openai-curated-remote)
> - AllTrails (app-68f1afc5a6008191a701eaaab428816c@openai-curated-remote)
> - Instacart (app-691eab1e001081919e57189f8b2f03bc@openai-curated-remote)
> - LONA Trading Assistant (app-694336b0c0948191a4ad234f9942885b@openai-curated-remote)
> - SciSpace (app-69439d715a7c8191aed9e2f6649e105f@openai-curated-remote)
> - Tarot (app-6943a2c078b0819188de39e4fe168d9b@openai-curated-remote)
> - Todoist: To Do List & Calendar (app-6943b73823548191a9f9216c6790c453@openai-curated-remote)
> - Consensus (app-6943e6f4a928819195962de16fb9ffe4@openai-curated-remote)
> - Sider Scholar (app-6948b485f5bc8191adb4df13f369cec7@openai-curated-remote

**Outcome reported:**

> Wrote the bounded note here: [history-findings.md](<C:/Users/dillo/Documents/Codex/2026-09-13/investigate-why-tags2go-was-so-successful/history-findings.md>).
> 
> Key evidence delivered:
> 
> - Routes resolved:
>   - Tags2Go → `tags-2-go`, folder `clients\tags-2-go`, high confidence, registry-backed.
>   - Omega Landscaping → `omega-landscaping`, folder `clients\omega-landscaping`, high confidence, registry-backed.
>   - Nexla → local folder `clients\nexla`, high confidence for local route, but registry gap confirmed.
> 
> - Coverage counts:
>   - 123 Codex JSONL sessions scanned under Aug 16-20, 2026.
>   - Cursor searched: `workspaceStorage` 206 files with 2 matching index files / 88 matches; `History` 53 files 0 matches; `globalStorage` 351 files 0 matches.
>   - Confirmed folder counts: Tags 68 files, Omega 157 files, Nexla 69 files.
> 
> - Primary raw session evidence:
>   - Aug16 Tags launch: `C:\Users\dillo\.codex\sessions\2026\08\16\rollout-2026-08-16T18-19-41-01a00ca8-c1dd-7fe3-88ca-8f10a5101445.jsonl`
>   - Aug20 Tags/Omega mimic comparison and raw Google Ads/Gmail evidence: `C:\Users\dillo\.codex\sessions\2026\08\20\rollout-2026-08-20T14-41-57-01a0207a-da86-7743-81ee-564369ad3cdf.jsonl`
> 
> - Confirmed outcomes:
>   - Tags Search-1 launched live Aug16 in customer `921-429-2423`, `$15/day`, Enabled, Eligible Limited.
>   - Raw Google Ads UI on Aug20 showed 7 `Calls from ads`, `$84.05` spend, 97 clicks, 1,016 impressions, 9.55% CTR.
>   - Raw Gmail readback showed Aug19 client reply: one call came in, callers were real customers, the roughly ten-minute call did not come in, and zero jobs resulted.
>   - Tags winners were concentrated in auto-tag/title-registration terms, especially `near me`; notary already showed non-converting spend.
>   - Omega was compared against Tags and had high contractor CPCs, broader keyword sprawl, homepage final URL routing, and weak form-led conversion evidence.
>   - Omega call-only family existed and was paused in Aug20 raw UI; parent/main live discovery supplied the later `Search_Services_Call Only` 1 click / `$44.52` / 0 conversions and Sep8 rollback evidence.
> 
> - Gaps labeled:
>   - I did not find an exact `copy to Omega` phrase.
>   - I found recommendation plus attempted Omega setup/passkey-blocked flow, not proof of successful launch.
>   - I did not find raw Slack proof for the roughly ten-minute Tags call; Gmail evidence actually records the client saying that one did not come in.
>   - Later Omega 1-click `$44.52` call-only result is attributed to the main live API discovery, not my local raw-session search.
> 

**Files written (10):**

- `../../projects/client-operations/clients/omega-landscaping/content/google-business-profile/2026-08-17-to-2026-09-06-batch/data.mjs`
- `C:/Users/dillo/Documents/Codex/2026-09-13/investigate-why-tags2go-was-so-successful/history-findings.md`
- `C:/Users/dillo/Documents/Codex/weekly-report-dashboard/build/refresh.py`
- `C:/Users/dillo/Documents/Codex/weekly-report-dashboard/build/roster.py`
- `C:/Users/dillo/Documents/Codex/weekly-report-dashboard/index.html`
- `C:/Users/dillo/Documents/Codex/weekly-report-dashboard/live/context-2026-09-08.json`
- `C:/Users/dillo/Documents/Codex/weekly-report-dashboard/live/googleads-browser-2026-09-08.json`
- `C:/Users/dillo/Documents/Codex/weekly-report-dashboard/live/meta-browser-2026-09-08.json`
- `FINDINGS.md`
- `collect_ads.py`

<sub>rollout: `C:\Users\dillo\.codex\sessions\2026\09\13\rollout-2026-09-13T14-41-38-01a09c13-2f30-7a41-af69-63ecfc2b9e96.jsonl`</sub>
