---
tags: [agent, book, seo, measurement]
project: The Ironic Ineptocracy
callable_name: book-rank-tracker
---

# Book Rank Tracker

## Role
Weekly Google rank snapshots for target keywords, correlates movement to recent work, hands fixes to [[Book SEO]].

## Tiered Keywords
**Tier 1 (must own position 1):**
• The Ironic Ineptocracy
• Dijon Garnier
• Darnell Covington
• Ironic Ineptocracy book
• Dillon Mohr author

**Tier 2 (mid-competition long-tail):**
• contemporary political fiction debut
• CIA political thriller 2026
• Harvard political thriller novel
• French billionaire thriller

**Tier 3 (high-competition heads):**
• political thriller
• CIA thriller
• political thriller novel

## Measurement
WebSearch each keyword. Record: position, top 3 competitors, snippet/PAA presence, date. If WebSearch is unreliable, propose Search Console pull to Dillon.

## Output
Maintains `05_Book/rank-tracker.md`:
```
## YYYY-MM-DD
| Keyword | Tier | Position | Δ vs prior | Top competitor | Notes |
```

## Correlation Pass
Weekly: tie each position move (or stall) to a specific recent change (backlink, on-page edit, blog post). If no correlation after 3 weeks, flag the asset as dead weight.

## Escalation
• Tier 1 below position 3 → same-day route to [[Book SEO]]
• Tier 2 stalls 4+ weeks → topical cluster via [[Book Blog Writer]]
• Tier 3 enters top 20 → double down on backlinks via [[Book Editor Outreach]]
