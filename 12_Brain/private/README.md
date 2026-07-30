---
tags: [private, system]
updated: 2026-07-29
---

# 12_Brain/private/ — local / Sync-only layer

**`dillon-os` on GitHub is a PUBLIC repository.**

Everything under `12_Brain/private/` (except this README) is **gitignored** and
must never be committed. Use this folder for:

- Direct emails, phone numbers, mailing addresses
- Client/access inventories, login runbooks, password-manager locators
- Machine-specific absolute paths and local session archives
- Credential-shaped values, tokens, API keys
- Any note you would not paste into a public issue

## How to use

1. Create notes here on the signed-in Obsidian desktop (Sync may carry them
   between your private devices).
2. Keep public wiki pages under `12_Brain/entities/` and `12_Brain/concepts/`
   as **redacted summaries** that link here by path mention only — do not
   copy the sensitive body into Git-tracked files.
3. Agents writing to this vault: if a capture contains PII or access history,
   write it under `12_Brain/private/` (or refuse), never under tracked `raw/`.

## Suggested local layout (create as needed)

```
12_Brain/private/
  README.md          ← this file (tracked)
  contacts/          ← gitignored
  access/            ← gitignored
  sessions/          ← gitignored
  raw/               ← gitignored sensitive captures
```

## Boundary rules

| Location | In Git? | Allowed content |
|----------|---------|-----------------|
| `12_Brain/private/**` (except this README) | No | PII, access, secrets, private paths |
| `12_Brain/raw/` (tracked) | Yes | Architecture-safe captures only |
| `12_Brain/entities|concepts|…` | Yes | Redacted summaries, no direct contact data |

Public-safety tests fail the PR if newly tracked `12_Brain` files contain
credential-shaped values, emails, phones, password-manager locators, or known private
absolute path prefixes.
