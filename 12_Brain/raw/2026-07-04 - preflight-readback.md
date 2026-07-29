# Capture: local preflight readback (2026-07-04 ~19:00, relayed by Dillon)

Source: Dillon's local session preflight (read-only, live authenticated Chrome
via CDP; log: handoff/PREFLIGHT_RUN_LOG_2026-07-04T19-00.md on his machine).
Raw — do not edit.

---

- **Fagan Meta resolved: real account = 892789268275012** (5 campaigns, owned
  by Fagan Painting LLC portfolio). 878824100200277 = empty shell.
  23849136117580444 = misread (not an accessible ad account).
- **Fagan is fully dark**: both website-leads campaigns "Ad set off"; two new
  draft campaigns ("PRIMARY FIRST OPTIMIZED LEAD CAMPAIGN", "PRIMARY Fagan
  Traffic + Leads Campaign") + 13 unpublished changes await decision.
  Open question: website-form vs instant-form build.
- **Omega PMax**: "Limited by budget" at $50/day, opt score 60.7%, asset group
  Incomplete (needs assets), Call & Messaging Ads Terms unaccepted.
- **NKCDC**: PMax paused; Search "Bid strategy learning" at $15/day; July 1
  keyword cleanup + BIRT/NPT expansion plan pending approval.
- **Replenish**: Kwik Trip #1161 paused (July 4) and holding; Pampano running;
  cost column didn't render — $500-cap dollar check pending; confirm #573/#633
  Ended.
- **KJB: 721-491-4099 shows (Cancelled) — 814-550-6229 is the live account.**

## Remote page-side sweep (same evening, from cloud session)
- **NKCDC LP** (businesstaxprep.fshtechnologies.org/intake/free-tax-prep):
  HTTP 200, title "Philadelphia Business Services", **zero forms, zero Google
  tags, zero pixels in the HTML** (caveat: form may render via JS — verify in
  a real browser). If real: campaign has an untrackable destination — smart
  bidding with no conversion signal is a classic no-spend cause. Check this
  FIRST in the NKCDC diagnosis.
- **Omega: BOTH domains are live separate sites** — omegalandscapecorp.com
  ("Omega Landscape") and omegalandscapingandconcrete.com ("Omega Landscaping
  & Concrete, Colorado Springs"). Both carry Google tags + 1 form. Ads
  destination + conversion tracking must be pointed at ONE canonical site.
- **Fagan site = faganpainting.com** ("Pittsburgh Painting Professionals").
  Already carries a Meta pixel + Google tags + a form. Job is now VERIFY the
  pixel ID matches account 892789268275012 and add/confirm the Lead event —
  not a fresh install.
