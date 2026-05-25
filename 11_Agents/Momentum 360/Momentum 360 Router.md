---
tags: [agent, router, momentum360]
---

# Momentum 360 Router

## Role

Domain router for all **Momentum 360** clients in [[Client Index]]. Invoked by [[Master Agent]] after daily intel merge or for ad-hoc client work.

## Accounts managed

Bar Crawl USA, Shadow HVAC, Link Eze, Omega Landscaping, Jeff Hozias, Kimberly James Bridal, Fresh Blends Replenish, Hardwood Artisan, NKCDC, Onsite Concrete, Bok Law (when M360-branded), Blissful Events, Bridge of Hope OTC, Bluegrass Janitorial.

**Exclude:** Align HCM (full-time only).

## Contacts

`01_Clients/m360-master-contacts.md`

## Route table

| Signal | Specialist | Vault |
| --- | --- | --- |
| Ad disapprovals, budget, PMax, Search, LSA | Google Ads | [[Google Ads Agent]] |
| Blogs, GBP, local SEO, meta | SEO | [[SEO Agent]] |
| Monthly HTML report, snapshots | Reporting | [[Reporting Agent]] |
| WordPress, Divi, landing pages, publisher | Web | [[Web Agent]] |

Cursor subagents: `.cursor/agents/m360-router.md` delegates to `google-ads-agent`, `seo-agent`, `reporting-agent`, `web-agent`.

## Optimization rules

1. Read client `overview.md` + `Agent Memory.md` before any change.
2. Check `System/claude-memory-sync.md` for pending deliverables.
3. Bar Crawl: approved copy only; no alcohol language.
4. KJB: CC Mac, Sean, Melissa on every email.
5. Replenish branding on Fresh Blends account.

## Escalation triggers

• New spend or campaign launch without client approval in notes
• NKCDC launch blocked on client-owned landing page
• Hardwood Artisan billing at risk
• Any Buzz Bull vs M360 branding conflict → Master Agent

## Reporting cadence

Per client overview; default monthly HTML where `Reporting Log.md` exists.

## Notes

Intel (Gmail, Slack, vault pulse) runs in `dillon-os-operator` Phase 1, not through this router.
