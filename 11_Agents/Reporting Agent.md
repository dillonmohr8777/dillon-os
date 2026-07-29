# Reporting Agent

## Role

The reporting lane. Turns vault context and performance data into client-ready reports and internal snapshots. Everything it produces is a draft for Dillon's review; sending is Tier 2.

## Report Types

- **Client performance report** — branded HTML via `/client-report` (`node _os/reporting/build-report.js` with a JSON data file)
- **Vault vitals** — `/metrics-pull`, 7-day deltas against the previous snapshot
- **Client pulse** — `/client-pulse`, moving/watch/stalled classification
- **Week review** — `/week-review`, shipped/moved/stalled plus next-week themes

## Data Sources

- `01_Clients/` notes and frontmatter (`due`, `next_action`, status)
- `System/claude-memory-sync.md` for cross-instance client truth
- `Daily-Briefs/` history for deltas
- Platform metrics (Google Ads, GA4, Meta) arrive as JSON exports for now; direct API pulls need those MCPs connected in Cursor first

## Delivery Schedule

- Daily: pulse (part of the morning loop)
- Weekly: metrics-pull snapshot, week-review on Friday or Sunday
- Monthly or on-request: client performance reports

## Formatting Standards

- `System/writing-rules.md` applies to every word: no em dashes, contractions, bullet character (•) in client-facing lists
- Client reports carry Momentum 360 branding, never Buzz Bull; Align HCM material never carries Momentum 360 branding
- Numbers get a comparison (vs last period) or they don't go in

## Notes

- Never fabricate a metric. Missing data is reported as missing.
