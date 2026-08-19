# 9 AM Eastern pickup — finish the 138-site unslop

Paused 2026-08-19 ~00:50 America/New_York. Resume **Thursday 2026-08-20 at 9:00 AM America/New_York** (Eastern; summer EDT). User said "9 am EST"; use Eastern local 9:00, not UTC-5 in August.

Calendar block: https://www.google.com/calendar/event?eid=bmZmZTYwcWFuZmRzNHZyMjhwdXJrMGNhNmMgZGlsbG9ubW9ocjg3NzdAbQ

Calendar block: https://www.google.com/calendar/event?eid=bmZmZTYwcWFuZmRzNHZyMjhwdXJrMGNhNmMgZGlsbG9ubW9ocjg3NzdAbQ

Do not deploy. Do not send mail. `mail_ready` stays hold. Update Google Sheet `Fixed?` only after QA green.

## Paste this into the 9 AM cloud agent

```
Continue PR https://github.com/dillonmohr8777/dillon-os/pull/326
on branch cursor/prospect-unslop-collages-56f2.

Read automation/prospect-unslop/PICKUP.md and handoffs/unslop-138-9am-pickup.md.
Finish the 138-row Google fix queue (sheet 1Ux1biD1_FeBOVKPbxkfN4WR-WkedMrWvD0KdQaB3rOo, tab Untitled).

Image rules: services/medical/auto/legal/salon/trade = people doing the work.
Food = plated food, the pass, the kitchen — not random people.
Nothing random. Five unique 4:5 collages per site.

State at pause: 45 QA-ready, 91 need industry photographs, 2 duplicates dropped
(#23 johnny-s-pizza keep #106 johnnys-pizza; #42 thr-insurance-agency keep #135 thr-insurance).

Next actions in order:
1. Firecrawl stealth scrape official URLs in automation/prospect-unslop/pickup-needs-urls.json (Composio FIRECRAWL_BATCH_SCRAPE, proxy stealth, json image URLs). Download into harvest/<slug>/photos as src-*.
2. node automation/prospect-unslop/run.js  (resume skips green receipts).
3. For remaining needsGen: generate 5 unique industry-intent photos per site from scenesFor() / harvest/<slug>/prompts.json. Save as harvest/<slug>/photos/gen-0.jpg … gen-4.jpg. Re-run those slugs.
4. node automation/prospect-unslop/qa-batch.js — zero hash collisions, mode matches family.
5. Google Sheet Fixed? = YES only for QA-ready rows (column I, row = id+1). Duplicates stay blank. Composio session fort, GOOGLESHEETS_UPDATE_VALUES_BATCH, 60 writes/min.
6. Commit, push, update PR 326. Do not merge. Do not Netlify deploy.

Factory: automation/prospect-unslop/
Output: 02_Campaigns/AI Site Builder Outreach Engine/batches/radar-unslop-20260819/
```

## State at pause

| Count | Meaning |
|------|---------|
| 45 | Built and QA green (official photos, 5 unique collages) |
| 91 | `needsGen` — fewer than 3 unique industry photographs |
| 2 | Dropped duplicates |
| 138 | Sheet rows |

- Branch: `cursor/prospect-unslop-collages-56f2`
- PR: https://github.com/dillonmohr8777/dillon-os/pull/326
- Overnight agent: https://cursor.com/agents/bc-01a01844-f9de-7f7e-b9ee-4bcd1aa656f2
- Sheet: https://docs.google.com/spreadsheets/d/1Ux1biD1_FeBOVKPbxkfN4WR-WkedMrWvD0KdQaB3rOo/edit

## Already fixed in branch (do not redo)

- People vs food intent, including Katana / Eastern Dragon / wine-cheese / still works
- Do not classify MacLaren Kitchen and Bath or The Restaurant Store as food
- Skip `fonts.gstatic.com` as an "official URL"
- Playwright harvest when fetch-only hits Cloudflare
- Never use Netlify `assets/image-N.webp` concept-study placeholders
- Closed-business headlines are rejected

## Firecrawl

Composio Firecrawl is connected (~1000 credits). Use `FIRECRAWL_BATCH_SCRAPE` with `proxy: stealth`, `formats: ["json"]`, extract photograph URLs, then download with Node. Do not spend fal.ai (restricted in this environment). Cursor `GenerateImage` is the fill path after official harvest.
