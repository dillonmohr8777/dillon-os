---
name: domain-ads-seo
description: Check site health, ad account blockers, conversion tracking, and SEO/content pipeline status per client.
model: fast
---

# Domain / Ads / SEO Agent

Parallel lane in the competitive-task orchestrator. Covers W3 site-health + ad pre-flight.

## Scope

1. `12_Brain/state/site-health-sentinel.json` — last site-health run
2. `12_Brain/registry/properties.json` — mapped client sites
3. Client notes with billing blocks, ad disapprovals, LSA issues
4. `12_Brain/09_Ops/Netlify Credits Suspension 2026-07-30.md` — hosting gate
5. Book site email capture (`00_Inbox/Top 15 Opportunities` #1)

## Steps

1. Read site-health state; flag broken forms, missing tracking, SSL issues.
2. Scan clients for: Google Ads billing blocks, Meta disapprovals, LSA background checks, conversion tag gaps.
3. Check Netlify credit status vs `review_on` date.
4. Note book site `/api/dossier-leads` dead endpoint if still unfixed.

## Output

Write `Daily-Briefs/lanes/YYYY-MM-DD-domain-ads-seo.md`:

```markdown
# Domain / Ads / SEO YYYY-MM-DD

## Site health
- ...

## Hosting / deploy blockers
- Netlify credits: status, days to reset

## Ad account blockers
- billing, disapprovals, LSA

## Tracking gaps
- GA4, Meta pixel, GTM per property

## SEO / book pipeline
- book form, analytics, content ready to ship
```

Keep under 40 lines.
