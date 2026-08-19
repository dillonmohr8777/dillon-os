---
note_type: capture
status: unprocessed
created: 2026-08-19
updated: 2026-08-19
captured_at: "2026-08-19T19:14:17Z"
source_type: Cursor cloud agent
source_url: "https://cursor.com/agents/bc-b45ed6a6-20f8-40de-9b56-033aa21f1573"
source_author: Dillon Mohr
related_entities: []
tags:
  - capture
  - github
  - incident
source_refs: []
---

# 2026-08-19 — dillon-os was briefly public and was set private again

## Why this matters

After the operator said "ur in", live GitHub reads showed `dillon-os` as
`visibility: public`. An unauthenticated `GET` of the GitHub API and HTML
page both returned HTTP 200. This vault holds client evidence. The agent
set the repository private again.

## Source material

- Unauthenticated `https://api.github.com/repos/dillonmohr8777/dillon-os`
  returned HTTP 200, `private: false`, `visibility: public`.
- Unauthenticated HTML for the same repo returned HTTP 200, not a sign-in wall.
- Composio GitHub tool `GITHUB_UPDATE_A_REPOSITORY` was called with
  `private: true` and `visibility: private` as account `dillonmohr8777`.
- API response `updated_at`: 2026-08-19T19:14:17Z, `private: true`,
  `visibility: private`.
- Re-check: unauthenticated API and HTML both HTTP 404; authenticated
  `gh repo view` reports `PRIVATE`.
- Forks at revert time: 0. Stars at revert time: 0. Treat the public window
  as possibly cached or scraped anyway.

## Claims to verify

- Operator intent of "ur in" (GitHub login vs intentional public publish).
- Whether any fork, archive, or crawler captured the public window.

## Compile targets

- Decision: [[12_Brain/04_Decisions/2026-08-18 - Keep dillon-os private]]
- Operating: `System/operating-status.md`, `System/approval-queue.md`
