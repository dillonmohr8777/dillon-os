---
note_type: verdict
batch: radar-next10-2026-09-02
status: approved
verdict_by: Fable 5.1 lead seat
created: 2026-09-02
source_refs:
  - "[[02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02/qa-summary]]"
  - "[[02_Campaigns/AI Site Builder Outreach Engine/batches/radar-next10-2026-09-02/imagery]]"
---

# Verdict: radar-next10-2026-09-02

**Summary:** 10 of 10 approved for deploy pending the approval-queue line. Basis: qa.json round 2 (imagery present, one template fix, zero mechanical fails at 390 and 1440 px).

| Slug | Verdict | Reason |
|---|---|---|
| advanced-air-services | approve | passes all checks, 199 KB, favicon 404 fixed at template level |
| b-and-m-construction-hvac | approve | passes all checks, 190 KB |
| bradco-heating-and-cooling | approve | passes all checks, 171 KB |
| casey-williams-dmd | approve | passes all checks, 66 KB |
| colonial-animal-hospital | approve | passes all checks, 79 KB |
| germantown-dental-group | approve | passes all checks, 72 KB |
| jt1-electric | approve | passes all checks, 84 KB |
| lees-hoagie-house | approve | passes all checks, 123 KB |
| pearl-dental | approve | passes all checks, 59 KB |
| udis-conn-orthodontics | approve | passes all checks, 80 KB |

Rejected: none. Retry rounds used: 1 (imagery generated via Higgsfield, 120 credits, then re-QA).

Conditions carried into the deploy line:
- Google Fonts rendering is `unverified` (sandbox has no egress); spot-check one live URL after deploy.
- Imagery is Higgsfield-generated, provenance in `imagery.md`; no real photos of the businesses.
- Netlify deploy stays approval-gated; nothing is live.
