---
note_type: project
status: active
created: 2026-08-19
updated: 2026-08-19
owner: Dillon Mohr
area: paid-local-attribution
priority: high
outcome: "One real client on balanced profile with four earning agents; GSC+Places live; GEO reportable only after real SERP; WordPress publish path proven; no public Netlify push until a site ID is pinned."
next_action: "Dillon files Google Ads developer token and GBP quota request; Claude keeps CMO_PROFILE=balanced and does not connect APIs."
due:
review_on: 2026-08-26
verification_status: partial
source_refs:
  - "[[12_Brain/01_Captures/2026-08-19 - CMO lane economics and sequencing]]"
  - "[[12_Brain/04_Decisions/2026-08-19 - Default CMO profile is balanced]]"
tags:
  - brain
  - project
  - cmo-lane
  - goals
  - netlify
  - claude
---

# CMO paid + local + attribution lane

**Summary:** Finish the paid, local, and attribution lanes on `balanced`. Do
not run a sixteen-agent CMO. Do not report simulated GEO. Claude owns the
config; Netlify publish stays pinned and approval-gated.

## Goal

A working CMO lane that Dillon would actually send: one real client, four
agents, `balanced` default, live GSC/Places, reportable GEO only after real
SERP data, and a WordPress approval→publish→receipt path. Content/social
composition is out of scope (buy, don't build).

The HUD hero number stays **ACTIVE CLIENTS 14 / 100**. This project is a
delivery goal, not a replacement of Road to 100.

The `cmo seed` runtime lives on draft PR `#323` (`_cmo/`). Keep that PR.
Do not merge it until `CMO_ROUTING_PROFILE` defaults to `balanced` and the
roster is the four earning agents. That env name is `CMO_ROUTING_PROFILE`,
not `CMO_PROFILE`.

## Finish line

- [ ] Default profile is `balanced` in the machine config (done in this repo).
- [ ] Roster is exactly the four earning agents (done in this repo).
- [ ] Google Ads developer token application filed by Dillon.
- [ ] GBP quota request filed by Dillon.
- [ ] One real `ANTHROPIC_API_KEY` + one real client seed, with ledger checks
      for send-worthy output, `cache_read_input_tokens > 0`, structured-output
      validation, and token-estimate error.
- [ ] GSC + Places connected (OAuth/key; no review queue).
- [ ] GEO tab marked demo until DataForSEO (or equivalent) lands; then
      reportable.
- [ ] One WordPress publisher proves approval→publish→receipt.
- [ ] Server auth if anyone but Dillon opens it.
- [ ] Postgres + scheduler only after ~3 clients or unattended runs.
- [ ] Netlify: noindex operator board, site ID pinned, draft deploy only
      after explicit publish approval.

## Sequence (do not reorder)

| Step | Why here | Owner |
|---|---|---|
| 1. `balanced` + four-agent roster | Cost before connectors | Claude (this change) |
| 2. Google Ads token + GBP quota forms | Week-long review queues | Dillon |
| 3. One real API key, one real client seed | Highest-information test | Dillon + Claude after key |
| 4. GSC + Places | No review; local without GBP | Claude after approval |
| 5. DataForSEO for GEO | Simulated → reportable | Approval-gated spend |
| 6. WordPress publisher | Closes the loop | Approval-gated publish |
| 7. Auth on the server | Only if a second person opens it | If needed, jumps to top |
| 8. Postgres + scheduler | Stop babysitting, not "does it work" | After ~3 clients |

## Runtime gap

`cmo seed` and the sixteen-agent runtime described in the briefing are **not
in this Git tree**. `11_Agents/cmo-lane.json` is the operating contract until
that runtime is connected. Do not invent a second CMO product.

## Claude + Netlify

- Skill: `/cmo-lane` (`.claude/skills/cmo-lane/SKILL.md`)
- Config: `11_Agents/cmo-lane.json`
- Operator board: `_os/cmo-lane/public/` (noindex). Momentum navy/gold app
  with four CMO mascots, seven OS mascots, and platform marks. Still not
  the `cmo seed` runtime.
- Deploy: `node _os/automation/bin/cmo-lane-netlify-deploy.js` — never creates
  a site, draft by default, requires `CMO_LANE_NETLIFY_SITE_ID`

## Links

- Decision: [[12_Brain/04_Decisions/2026-08-19 - Default CMO profile is balanced]]
- Concept: [[12_Brain/03_Concepts/CMO Lane Cost Discipline]]
- Capture: [[12_Brain/01_Captures/2026-08-19 - CMO lane economics and sequencing]]
- Capture: [[12_Brain/01_Captures/2026-08-19 - CMO board should match Momentum agents look]]
- Nearby: [[12_Brain/03_Concepts/Qualified Pipeline Measurement]] · [[12_Brain/03_Concepts/AEO GEO and AI Discovery]] · [[12_Brain/03_Concepts/Netlify Deploy Safety]]
