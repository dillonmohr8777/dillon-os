---
name: sponsorship-roi-report
description: Build a fact-safe sponsorship performance recap for Pritzker Law Group's podcast sponsorship — landing-page traffic and leads captured on the sponsor page — extending the client-report factory. Use when asked for a Pritzker sponsorship recap or ROI report (e.g. "/sponsorship-roi-report Pritzker 2026-09"). Stays draft with sampleData:true until real analytics is connected; sending is approval-gated.
---

# sponsorship-roi-report

Extend the `client-report` skill for the Pritzker podcast sponsorship. See
`pritzker-ops` for the operating model and the gating confirmations. Client
truth: `01_Clients/Pritzker Law Group/`.

Operating model in one line: authentic firm voice + human approval + high craft,
not concealment — see `12_Brain/03_Concepts/Anti-AI Client Operating Model.md`.

## Inputs

- Parse client + period from arguments (default: last full month), e.g.
  `Pritzker 2026-09`.
- `01_Clients/Pritzker Law Group/overview.md` and `Client Intelligence Overlay.md`
  for retainer, contacts, and compliance rules.
- `System/writing-rules.md` for house style.
- Analytics figures only once the analytics property (confirmation #4) is
  connected; until then everything is sample data.

## In-lane KPIs (what is actually obtainable)

The locked lane is the sponsor landing page. Only two KPIs are obtainable inside
it, and both are gated:

- **Landing-page traffic** — gated on the confirmed analytics property
  (confirmation #4). Unconfirmed ⇒ sample data.
- **Leads captured** — gated on the confirmed form destination (confirmation #3),
  because a lead is only countable once its destination is known.

Report these two. Do not add a KPI whose data source is not confirmed.

## OUT-OF-LANE / ADDITIONAL ACCESS REQUIRED

These are **not** reportable from the locked lane. Do not include them in the
KPI set; if they are wanted, they require new access first:

- **Review lift** — requires Google Business Profile ownership. GBP existence and
  firm ownership are **unconfirmed**; do not assume a profile exists or that the
  firm controls it.
- **Branded-search movement** — requires Search Console access on the **firm's own
  site**, which is outside the locked sponsor-landing-page lane.

Both need a separate access request and a scope change. Flag them as such rather
than estimating them.

## Steps

1. **Gather context** from the client files above. Respect the fact-safety
   guardrail — no invented audience, outcomes, benefits, metrics, or search
   volumes.
2. **Assemble the data file** at `_os/reporting/data/pritzker-<period>.json`
   following the `client-report` data shape:
   - `kpis` — landing-page traffic and leads captured only (see the in-lane list
     above).
   - `charts` — weekly landing-page series around episode drops, once launch
     facts are confirmed.
   - `wins` and `actions` — 3 bullets each, to Dillon's rules.
   - `summary` — 2 plain-language sentences.
   - Set `"agency": "Momentum 360"`.
3. **Keep `"sampleData": true`** until every figure is a real, confirmed number
   from the connected analytics property. That renders the visible draft banner.
   Never fabricate metrics.
4. **Render:** `node _os/reporting/build-report.js _os/reporting/data/pritzker-<period>.json`
5. **Log it** under a `## Reports` heading in the client note: date, period, path.
6. **Queue delivery.** Sharing/sending the report is a Tier 2 approval-gated
   action — **when the rendered report exists**, append it to
   `System/approval-queue.md` and stop; do not send. Do not append the gate in
   advance of a rendered artifact.

## Boundaries

- No fabricated metrics; unconfirmed figures stay `sampleData: true`.
- Report only in-lane KPIs. Review lift and branded-search movement are
  out-of-lane and require access that is not held.
- The report stays a draft. Sharing or sending is Tier 2, approval-gated.
- Fact-safe: no invented audience size, outcomes, awards, testimonials, benefits,
  metrics, or search volumes. Unknown ⇒ mark TO CONFIRM.
- Publication of any derived asset needs the client's **final approval owner
  (role TO CONFIRM — client evidence says "final approval owner", not necessarily
  an attorney)**.
- Approval boundary: draft locally, append to `System/approval-queue.md` when an
  artifact is ready, stop.
