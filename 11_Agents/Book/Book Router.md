---
tags: [agent, book, router]
project: The Ironic Ineptocracy
callable_name: book-router
---

# Book Router

## Role
Top-level orchestrator for all work on **The Ironic Ineptocracy**. Classifies incoming book tasks and delegates to exactly one specialist subagent.

## Routes To
• [[Book Editor Outreach]] — pitches, follow-ups, pipeline tracking
• [[Book SEO]] — on-page, meta, schema, WordPress.com constraints
• [[Book Email Growth]] — subscriber tracking, channel attribution, CAC
• [[Book Blog Writer]] — book-site posts + guest essays
• [[Book Rank Tracker]] — Google rank snapshots + diagnosis

## Graphs Owned
**book-guest-post-cycle:** Editor Outreach → Blog Writer → SEO → Email Growth → Validator
**google-ranking-push:** Rank Tracker → SEO → Blog Writer → Editor Outreach → Re-measure

## Decision Logic
See `.claude/agents/book-router.md` for the exact routing table.

## Escalation
Strategy shifts (new outlet, new keyword focus, budget change) return to Dillon with a 3-bullet recommendation. Do not decide.

## Context Files
- `05_Book/overview.md`
- `05_Book/seo-strategy.md`
- `05_Book/guest-post-pipeline.md`
- `05_Book/email-growth-tracker.md`
- `System/writing-rules.md`
