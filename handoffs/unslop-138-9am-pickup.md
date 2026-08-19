# 9 AM Eastern pickup — finish the 138-site unslop

**Done 2026-08-19** (operator said pickup now; did not wait for Thursday 9 AM).

QA: 136 ready, 2 dropped, 0 collisions, 0 mode mismatches. Sheet `Fixed?` YES for QA-green rows; `#23` and `#42` blank. PR https://github.com/dillonmohr8777/dillon-os/pull/326. Do not deploy. Do not send mail. `mail_ready` stays hold.

Original pause notes remain below for history.

Paused 2026-08-19 ~00:50 America/New_York. Resume **Thursday 2026-08-20 at 9:00 AM America/New_York** (Eastern; summer EDT). User said "9 am EST"; use Eastern local 9:00, not UTC-5 in August.

Calendar block: https://www.google.com/calendar/event?eid=bmZmZTYwcWFuZmRzNHZyMjhwdXJrMGNhNmMgZGlsbG9ubW9ocjg3NzdAbQ

Do not deploy. Do not send mail. `mail_ready` stays hold. Update Google Sheet `Fixed?` only after QA green.

## Paste this into the 9 AM cloud agent

Superseded — pickup already finished on 2026-08-19.

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
