---
name: automation-ops
description: Run Dillon OS automation registry tools — frontmatter validate/repair, site-health sentinel, shared discover/qualify scorer (Maps + Indeed adapter). Draft-only; never sends outreach.
---

# automation-ops

Use when asked to validate vault frontmatter, run site health, score prospects, or inspect the automation queue.

## Steps

1. Read `12_Brain/README.md` and `_os/automation/docs/OPERATOR.md`.
2. Respect `12_Brain/protocols/approval-tiers.md` — Tier 2 outbound is blocked.
3. Prefer dry-run flags first.
4. Run the matching bin under `_os/automation/bin/`.
5. Summarize state files under `12_Brain/state/` and any `Daily-Briefs/*` reports.

## Do not

- Send email/Slack/LinkedIn/direct mail
- Live-scrape Indeed
- Deploy to Netlify/Vercel from this skill
- Duplicate `_templates/site-factory` from PR #226 — call qualify, then hand off to `/site-batch` when that PR is available
