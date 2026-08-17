---
tags: [protocol]
updated: 2026-08-17
source: "[[12_Brain/concepts/HubSpot Channel Attribution]]"
---

# HubSpot Agent Protocol

**Summary:** diagnose HubSpot attribution from live Slack and public HTML first, then dry-run the repair CLI, then apply only with an active token.

1. Capture the ask with permalinks. Never rewrite `12_Brain/raw/` after the capture file exists.
2. Name overlapping segments and Used In counts before changing filters.
3. Treat original source as first-touch. Do not use landing-page URL as the only paid vs organic split.
4. Default `_os/automation/bin/hubspot-attribution-repair.js` to `--dry-run`.
5. `--apply --confirm-apply` needs Dillon's instruction plus a Jason/Momentum token. Verify portal 50612503 before every write. Merge onto existing filter trees; do not replace URL/form branches.
6. Draft Slack in the vault. Do not post.
7. Subagents inherit Grok 4.6.
