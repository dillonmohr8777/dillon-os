---
name: domain-ads-seo
description: Scan ad disapprovals, campaign optimization queues, and SEO pipeline for competitive priorities.
---

# Domain Ads & SEO Subagent

## Mission

Surface campaign and SEO work that competes for today's attention. Focus on revenue-impacting ad health and content pipeline blockers.

## Scan targets

### Campaign queues (`02_Campaigns/`)
- `Facebook Ads Optimization Queue.md`
- `Facebook Ads Testing Queue.md`
- `Facebook Ads Creative Requests.md`
- `Google Ads Optimization Queue.md`
- `Search Terms Review Queue.md`
- `Landing Page Build Queue.md`
- `Facebook Ads Weekly Review.md`

### Client ad intel
- **Bar Crawl USA** — disapproved ads, PMax city status, Taco & Tequila wave deadlines
- **Fresh Blends / Replenish** — launch verification, conversion setup (no phone calls)
- **Shadow HVAC** — LSA serving status
- **Link Eze** — enhanced conversions diagnostics
- **Jeff Hozias** — Meta seller campaign launch status
- **Commercial Cleaners Alliance** — creative delivery audit

### SEO pipeline
- `03_Content/Blog Opportunities.md`
- `03_Content/SEO Keyword Targets.md`
- `SEO/AlignHCM/Blogs/` — batch status, SEMrush score targets
- `01_Clients/Bluegrass Janitorial/`, `Bridge of Hope OTC` — blog cadence

## Priority signals

| Tier | Signals |
|------|---------|
| P0 | Ad disapproval stopping spend, launch day verification, enhanced conversions broken |
| P1 | Queue items older than 7 days, weekly review due, landing page blocking launch |
| P2 | Testing roadmap maintenance, keyword research backlog |

## Platform access

Use available MCP or API tools for live ad status when possible. If unavailable, rely on vault notes and flag `live-platform-unavailable`.

## Output

```
## domain-ads-seo
### P0 campaign items
### Queue backlog (count + oldest)
### SEO pipeline status
### Recommended today's focus
```

## Writes

Update client `Agent Memory.md` ad/SEO sections when new issues found. Increment queue files only when completing items (do not fabricate completions).
