---
tags: [system, clients, reconciliation]
date: 2026-09-05
active_client_count: 12
supersedes: System/client-roster-reconciliation-2026-07-12.md
source_refs:
  - "https://claude.ai/code/session_01UBuynVuUrhJmfCMcP4Tq4G"
  - "[[System/client-roster-reconciliation-2026-07-12]]"
---

# Client Roster Reconciliation - 2026-09-05

Owner decision on 2026-09-05, taken in a Claude Code remote session: three accounts
with no active work are retired. Nothing is deleted. The notes moved to
`_archive/01_Clients/` with `status: former`, and git history holds every prior state.

## Retired

| Client | Was | Moved to | Why |
|---|---|---|---|
| Fagan Painting | `01_Clients/Fagan Painting/` (overview + overlay), `status: active`, last touched 2026-08-01 | `_archive/01_Clients/Fagan Painting/` | Owner: "take away Fagan Painting". No active work; the last queue items (Aug 6-11 lead routing) are done. |
| Shadow Heating & Cooling (Shadow HVAC) | `01_Clients/Shadow HVAC/` (57 files incl. the Next.js site), `status: active`, last touched 2026-07-12 | `_archive/01_Clients/Shadow HVAC/` plus `creative-factory/` for the LP, reel, and hero image | Owner: retired. Meta campaigns paused 2026-07-25 and confirmed off 2026-07-27 (queue items wi-20260725-0005, wi-20260727-0002). |
| Jeff Hozias | `01_Clients/Jeff Hozias.md`, `status: active`, last touched 2026-07-29 | `_archive/01_Clients/Jeff Hozias.md` | Owner: retired. Never in the canonical registry; parked in pulse since July. |

## Kept active (12)

Kimberly James Bridal; Omega Landscaping & Concrete; On-Site Concrete & Landscape;
Replenish; Capsule & Tonic; Bar Crawl USA; Revive Systems; Hope Wellness Center;
Pro Fence & Deck; Everyday Life Insurance; VA Claims; Bridge Software Development.

Align HCM stays the separate full-time lane. Replenish carries `status: paused` in
its own note while `System/OS Config.md` says paused accounts are excluded from the
count; the July reconciliation counted it and this note keeps that, so the true
figure may be 11. Follow-up, not changed here.

## Updated in the same commit

- `System/OS Config.md` and `System/operating-status.md`: `goal_current` 14 -> 12;
  roster lines drop Shadow and Fagan.
- `_os/reporting/client-registry.json`: `shadow-hvac` and `fagan-painting` entries
  removed (7 -> 5).
- `_os/creative-factory/`: `client-tokens.json` shadow-hvac block, `index.html`
  links, and the README section removed; the LP, reel, and hero image moved to the
  archive folder.
- `12_Brain/10_Maps/Generated/`: `client-fagan-painting.md` and
  `client-shadow-hvac.md` deleted; three lines dropped from
  `01 Clients and Revenue.md`; two rows dropped from
  `12_Brain/09_Ops/Client Intelligence Coverage.md`. `Update-SecondBrainMaps.ps1`
  and `Update-ClientIntelligenceCoverage.ps1` regenerate the same result.
- `.claude/agents/web-product-builder.md` and `System/scripts/Build-ClaudeAgents.py`:
  `shadow-heating-website` relabelled "former client, site frozen on Netlify, do not build".
- `AGENTS.md`, `11_Agents/Web Agent.md`, `02_Campaigns/Landing Page Build Queue.md`:
  Shadow paths point at the archive and are marked frozen; Fagan LP row marked retired.
- `System/approval-queue.md`: the three open Shadow/Fagan approvals closed as
  "client retired"; two new operating actions (registry patch, Netlify cleanup).
- The two July Fagan report notes under `12_Brain/07_Reviews/Reports/2026-07/`
  now link to the archive path.

## Left in place on purpose

- `12_Brain/01_Captures/` (immutable) and dated `Daily-Briefs/` keep their old
  links; dead links in captures are the vault's accepted precedent.
- `_os/automation/incoming/` payloads from August name the old Fagan path. They are
  processed-once history; if an ingest ever replays them, it would recreate
  `01_Clients/Fagan Painting/overview.md`, so treat any such file as a replay bug.
- `.claude/agents/paid-media-analyst.md` still lists `shadow-heating` among the
  `google_search_console_mooner-urban` properties because the property still exists
  in that Search Console account.
- `System/m360-leadership-notes.md` (April history) still names Jeff Hozias.

## Still live outside this vault (hand-offs)

- Canonical registry (client-operations, desktop is the sole writer): both clients
  still `active`. Patch queued in `System/approval-queue.md` with the
  `zen-spa-tropicana` precedent fields.
- The `momentum-client-context` account plugin (claude.ai, not a repo) names Fagan
  Painting in its active roster in both the description and the body.
- Netlify: `shadow-hvac-website` keeps serving shadow-heating.com by owner decision
  until the client moves hosting. Ten stale sites to delete in the Netlify UI:
  shadow-hvac-2026-05-31-report, shadow-hvac-2026-05-31-report-717,
  shadow-hvac-2026-05-31-report-443, shadow-hvac-2026-05-24-report,
  shadow-hvac-2026-05-24-report-680, shadow-hvac-2026-05-17-report, shadow-hvac-v2,
  shadow-hvac-concept-website-redesign, shadow-hvac-march-report,
  shadow-heating-cooling-bear-concept.
- GitHub `shadow-heating-website` stays until hosting moves, then archive.
- Fagan access: `wordpress-production` and
  `access-broker:fagan-painting/meta-ads-production` to revoke.
- Search Console: remove the `shadow-heating` property from the mooner-urban account
  if the client is not coming back.

## Recovery

`git mv "_archive/01_Clients/<name>" "01_Clients/<name>"`, set `status: active`,
restore the registry entry from git history, and re-run the two map scripts.
