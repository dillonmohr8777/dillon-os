---
tags: [private, system]
updated: 2026-08-18
---

# 12_Brain/private/ — local / Sync-only layer

**`dillon-os` on GitHub is PRIVATE** (since 2026-08-18). Credentials, access
inventories, and recovery codes still stay out of Git.

Everything under `12_Brain/private/` (except this README) is **gitignored** and
must never be committed. Use this folder for:

- Direct emails, phone numbers, mailing addresses
- Client/access inventories, login runbooks, password-manager locators
- Machine-specific absolute paths and local session archives
- Credential-shaped values, tokens, API keys
- Sanitized operator browser-history exports
- Browser evidence screenshots (`12_Brain/private/screenshots/`)
- Any note you would not paste into a public issue

## How to use

1. Create notes here on the signed-in Obsidian desktop (Sync may carry them
   between your private devices).
2. Keep public wiki pages under `12_Brain/02_Entities/` and `12_Brain/03_Concepts/`
   as **redacted summaries** that link here by path mention only — do not
   copy the sensitive body into Git-tracked files.
3. Agents writing to this vault: if a capture contains PII or access history,
   write it under `12_Brain/private/` (or refuse), never under tracked `raw/`.

## Suggested local layout (create as needed)

```
12_Brain/private/
  README.md          ← this file (tracked)
  contacts/          ← gitignored (Growth Workshop send-ready CSVs live here locally)
  access/            ← gitignored
  sessions/          ← gitignored
  raw/               ← gitignored sensitive captures
  browser-history/   ← gitignored; written by System/scripts/Export-BrowserHistory.py
  screenshots/       ← gitignored; Playwright / browser-access evidence PNGs
```

## Boundary rules

| Location | In Git? | Allowed content |
|----------|---------|-----------------|
| `12_Brain/private/**` (except this README) | No | PII, access, secrets, private paths |
| `12_Brain/01_Captures/` (tracked) | Yes | Architecture-safe captures only |
| `12_Brain/entities|concepts|…` | Yes | Redacted summaries, no direct contact data |

Public-safety tests fail the PR if newly tracked `12_Brain` files contain
credential-shaped values, emails, phones, password-manager locators, or known private
absolute path prefixes.
