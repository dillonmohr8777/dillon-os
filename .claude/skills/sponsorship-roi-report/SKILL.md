---
name: sponsorship-roi-report
description: Build a fact-safe sponsorship performance recap for Pritzker Law Group's podcast sponsorship — landing-page traffic, leads captured, review lift, and branded-search movement around episode drops — extending the client-report factory. Use when asked for a Pritzker sponsorship recap or ROI report (e.g. "/sponsorship-roi-report Pritzker 2026-09"). Stays draft with sampleData:true until real analytics is connected; sending is approval-gated.
---

# sponsorship-roi-report

Extend the `client-report` skill for the Pritzker podcast sponsorship. See
`pritzker-ops` for the operating model and the six confirmations. Client truth:
`01_Clients/Pritzker Law Group/`.

## Inputs

- Parse client + period from arguments (default: last full month), e.g.
  `Pritzker 2026-09`.
- `01_Clients/Pritzker Law Group/overview.md` and `Client Intelligence Overlay.md`
  for retainer, contacts, and compliance rules.
- `System/writing-rules.md` for house style.
- Analytics figures only once the analytics property (confirmation #4) is
  connected; until then everything is sample data.

## Steps

1. **Gather context** from the client files above. Respect the fact-safety
   guardrail — no invented audience, outcomes, or benefits.
2. **Assemble the data file** at `_os/reporting/data/pritzker-<period>.json`
   following the `client-report` data shape:
   - `kpis` — landing-page traffic, leads captured, review lift, branded-search
     movement (set `deltaGoodWhenDown: true` for cost metrics).
   - `charts` — weekly series around episode drops (traffic / branded search).
   - `wins` and `actions` — 3 bullets each, to Dillon's rules.
   - `summary` — 2 plain-language sentences.
   - Set `"agency": "Momentum 360"`.
3. **Keep `"sampleData": true`** until every figure is a real, confirmed number
   from the connected analytics property. That renders the visible draft banner.
   Never fabricate metrics.
4. **Render:** `node _os/reporting/build-report.js _os/reporting/data/pritzker-<period>.json`
5. **Log it** under a `## Reports` heading in the client note: date, period, path.
6. **Queue delivery.** Sharing/sending the report is a Tier 2 approval-gated
   action — append it to `System/approval-queue.md` and stop; do not send.

## Boundaries

- No fabricated metrics; unconfirmed figures stay `sampleData: true`.
- The report stays a draft. Sharing or sending is Tier 2, approval-gated.
- Fact-safe: no invented audience size, outcomes, awards, testimonials, or benefits.
- Approval boundary: draft locally, append to `System/approval-queue.md`, stop.
