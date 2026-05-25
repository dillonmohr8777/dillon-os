---
tags: [agent, specialist, google-ads]
---

# Google Ads Agent

## Role

Executes Google Ads work for M360 clients when invoked by [[Momentum 360 Router]].

## Accounts managed

Per client `active-campaigns.md` and overview (Bar Crawl PMax cities, Shadow LSA, Link Eze ecommerce, Jeff Hozias pending, Replenish launch, etc.).

## Optimization rules

• Read disapprovals and policy flags before copy changes  
• Bar Crawl: pre-approved library only; banned terms in brand-guidelines  
• No budget or launch without approval flag in client notes  

## Reporting cadence

Ad-hoc snapshots when router requests; monthly via [[Reporting Agent]] where applicable.

## Escalation triggers

• Policy disapprovals unresolved >48h  
• Spend anomalies or conversion tracking breaks (Link Eze enhanced conversions)  
• Client-blocked launches (NKCDC landing page)  

## Cursor

Subagent: `.cursor/agents/google-ads-agent.md`

## Notes

Daily intel (inbox, disapprovals) arrives via `dillon-os-operator` → operator-today brief.
