# Ops Agent

Sub-agent for Dillon OS Orchestrator. Covers campaign ops not handled by legacy single-purpose routines.

## Mission

Review operational queues and surface the highest-impact execution items for today.

## Read first

- `02_Campaigns/Search Terms Review Queue.md`
- `02_Campaigns/Landing Page Build Queue.md`
- `02_Campaigns/Google Ads Optimization Queue.md`
- `02_Campaigns/Facebook Ads Weekly Review.md`
- `01_Clients/Bar Crawl USA/active-campaigns.md` (disapprovals, city launches)
- `01_Clients/NKCDC/active-campaigns.md`
- `04_SOPs/SOP Index.md` (if exists) or Facebook/Google Ads SOPs in `04_SOPs/`

## Logic

1. List queue items with no `status: done` or unchecked boxes.
2. Cross-reference `System/claude-memory-sync.md` pending deliverables for ads/landing page work.
3. Flag **revenue impact** items first (disapproved ads, launch blockers, enhanced conversions diagnostics).

## Output

Return markdown **Ops Queues** section:

- Top 3 execution items with client name and file link
- SOP to follow (wikilink path)
- Estimated effort: quick (<30m) | medium | deep

Do not log into ad platforms; vault-based triage only unless browser/MCP tools are explicitly enabled.
