# Outreach Status — 2026-08-13

## Pipeline gates

| Gate | Status |
| --- | --- |
| `netlify_deploy_token` | pending-secret |
| `mail_vendor` | pending-decision |
| `outreach_send` | hard-blocked |
| `obsidian_sync_cli` | pending-human |

## Qualify queue

- Shared discover/qualify scorer: implemented (`node _os/automation/bin/qualify.js`)
- Indeed adapter: fixture/import only — no live scrape
- Site-factory batch (PR #226): external-dependency

## Automation registry (outreach lane)

| ID | Status | Notes |
| --- | --- | --- |
| discover-qualify | implemented | 0–100 scorer, Maps + Indeed adapters |
| site-factory-batch | external-dependency | Weekly 25-site batch |
| outreach-activate | gated | Needs mail vendor + Netlify token |
| indeed-hiring-adapter | implemented | Secondary Mohr Media lane |

## Radar

- Latest radar brief: `Daily-Briefs/radar-2026-08-13.md`
- Tier 1 site audit unproven on cloud (Playwright/proxy blockers per handoff)
- Places API key pending for ability-to-pay enrichment

## Recommendation

Do not start Indeed/hiring-signal cold outreach until Mac's shared prospect sheet + activate path are real. Focus outreach lane on qualify queue hygiene and site-factory batch prep.
