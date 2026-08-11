---
tags: [raw, system]
updated: 2026-07-29
---

# 12_Brain/raw/ — ground truth (Git-safe subset)

This folder holds **architecture-safe** raw captures that may be committed.

**This GitHub repository is PUBLIC.** Do not put emails, phone numbers,
credentials, Bitwarden locators, account inventories, or machine-specific
absolute paths here.

Sensitive captures belong in **`12_Brain/private/`** (gitignored) or stay only
on the operator machine / Obsidian Sync private notes.

## Conventions

- Filename: `YYYY-MM-DD - short-title.md`
- Architecture blueprint and generic methodology notes are OK in Git.
- Anything with direct personal contact data or access history → `private/`.
- Session mining with PII → write under `private/sessions/` (create locally).
- The Git-tracked `sessions/session-log.md` is a cadence stub only.

## Tracked here

- `2026-07-04 - obsidian-second-brain-article.md` — public blueprint article
- `research/` — sanitized research receipts (model-scout, skill-scout,
  practitioner-pulse captures with sources + dates)
- `sessions/session-log.md` — non-sensitive cadence lines

## Private raw (operator machine only)

Compiled pages may cite `12_Brain/private/raw/<capture>` — those sources are
real but gitignored (PII/client detail). The links resolve on the operator
machine, not on GitHub. Currently cited from the wiki:

- `private/raw/2026-06-26 - intel-core-7-master-operating-transfer.md`
- `private/raw/2026-07-04 - full-autonomy-directive.md`
