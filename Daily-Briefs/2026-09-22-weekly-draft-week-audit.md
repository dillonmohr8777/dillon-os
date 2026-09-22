---
date: 2026-09-22
type: audit
status: hold
source_refs:
  - "System/approval-queue.md"
  - "gmail search subject:September 7 to 13 on 2026-09-22"
  - "https://momentum-weekly-client-reports.netlify.app/reports/"
---

# Weekly draft week audit — 2026-09-22

The September 15 Gmail drafts that say “September 7 to 13” link to the report index. That index, re-fetched today, is titled **Sep 14 to Sep 20, 2026** for every sendable client checked. Dated PDFs for Sep 7–13 and Sep 14–20 returned 404 for Omega and Kimberly James Bridal. Fagan and NKCDC index URLs still return 404.

Gmail was not edited. `update_draft` replaces the HTML body and drops attachments unless they are sent back. The draft bullets describe September 7–13 events, while the page they link to is now a September 14–20 report. Changing the subject to match the live page would attach the old bullets to a different week. Leaving the subject as September 7–13 points clients at the wrong page. Either send is unsafe. The hold is the correction.

## Drafts read in full

| Draft id | Subject week claimed | Index linked | Live title today |
|---|---|---|---|
| `r-3933555524800265587` | September 7 to 13 | `/reports/bar-crawl-usa/` | Sep 14 to Sep 20, 2026 |
| `r8608910586077273697` | September 7 to 13 | `/reports/hope-wellness-center/` | Sep 14 to Sep 20, 2026 |
| `r-1413046903131223141` | September 7 to 13 | `/reports/replenish-7-eleven/` | Sep 14 to Sep 20, 2026 |
| `r178387925568094416` | September 7 to 13 | `/reports/fresh-blends-kwik-trip/` | Sep 14 to Sep 20, 2026 |
| `r4241363141952146295` | September 7 to 13 | `/reports/onsite-concrete-landscape/` | Sep 14 to Sep 20, 2026 |
| `r-1858937002664212554` | September 7 to 13 | `/reports/revive-systems/` | Sep 14 to Sep 20, 2026 |

`r-3739288102106090515` has a September 7 to 13 subject for VA Claims Edge and is a scheduling note, not a report link. The live VA Claims page is also titled Sep 14 to Sep 20, 2026.

Omega’s open client draft `r4420360796608729033` is the conversion-tracking note, not a weekly-report link. Kimberly’s open draft `r-1785543596714300005` is the five-Meta-lead follow-up to Kim, not the weekly report.

## Hold line to put on each of the six before anyone sends

The link in this draft opens a page titled September 14 to 20, 2026. The bullets were written for September 7 to 13. Do not send until the link and the bullets are the same week.

## What a real week fix still requires

A September 7–13 report does not exist at the dated PDF URLs. Publishing a rebuilt week is a Netlify deploy and stays approval-gated. This audit does not deploy.
