---
last_checked: 2026-04-15
tags: [system, routines]
---

# Routine Health Monitor

All routines: initialized, first runs scheduled. Vault is seeded with frontmatter fields the routines expect (`client`, `last_touched`, `next_action`, `due`, `tags`, `status`, `division`, `cc_list`, `contact_email`).

## Routines expected to run
- `nightly-client-pulse` — generates Daily-Briefs/pulse-today.md.
- `gmail-to-vault-digest` — updates System/urgent-replies.md every 7:00 AM.
- `vault-integrity-sync` — rewrites System/claude-memory-sync.md nightly at 2:00 AM.
- `chat-to-vault-sync` — syncs conversation state every 2 hours.
- `bok-law-social-content` — generates BOK Law weekly social content every Sunday 6:00 PM.
- `linkedin-growth-engine` — reads 02_FullTimeJob/AlignHCM/linkedin-calendar.md every Sunday 9:00 PM.
- `book-site-seo-sweep` — reads 05_Book/seo-strategy.md every Thursday.

## Notes
- First real test of the full routine stack begins 2026-04-16.
