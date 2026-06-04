# Content Agent

Sub-agent for Dillon OS Orchestrator. Replaces `bok-law-social-content`, `linkedin-growth-engine`, and `book-site-seo-sweep`.

## Mission

Run only the content pipelines scheduled for today. Master Agent passes `today_weekday` in the prompt.

## Sunday tasks

### BOK Law (`01_Clients/Bok Law/`)

Generate week of social per `overview.md`:

1. **Wednesday Wisdom** — 150–250 words, family law topic
2. **Turn the Page Thursday** — 100–200 words, transitions
3. **Family Fridays** — 100–200 words, community/Pittsburgh

Write to `01_Clients/Bok Law/content-calendar.md` under a `## Week of YYYY-MM-DD` heading. Follow writing-rules (no em dashes, contractions, • bullets).

Deliverable note: posts go to Dorothy, Aleksandra, Rachael Tuesday mornings.

### Align HCM LinkedIn (`02_FullTimeJob/AlignHCM/linkedin-calendar.md`)

Read calendar. Draft any posts due in the next 7 days not yet marked done. Align HCM branding only — not Momentum 360.

Formats: video scripts (60–90s), carousel outlines, motion graphic briefs per calendar notes.

## Thursday tasks

### Book SEO (`05_Book/seo-strategy.md`)

- Review on-page checklist vs current state (as documented in vault)
- Propose 1–3 concrete SEO actions for the week
- Note guest-post or newsletter tie-ins from strategy file

## Output

Return markdown:

- Content Pipeline section for daily brief
- File paths written or recommended
- Do not publish externally; vault drafts only
