---
note_type: capture
status: unprocessed
created: 2026-08-19
updated: 2026-08-19
captured_at: "2026-08-19T18:42:00Z"
source_type: Cursor cloud agent
source_url: "https://cursor.com/agents/bc-b45ed6a6-20f8-40de-9b56-033aa21f1573"
source_author: Dillon Mohr
related_entities: []
tags:
  - capture
  - github
  - visibility
source_refs: []
---

# 2026-08-19 — Request to make dillon-os public

## Why this matters

Dillon asked a Cursor cloud agent to make every GitHub repo on the connected
account public, and to flip `dillon-os` public immediately.

## Source material

Operator message (paraphrase, not a credential dump): permission granted to
make all owned repos public; specifically make `dillon-os` public, quickly.

Live `gh repo list dillonmohr8777` on 2026-08-19 returned **22** repos, not 34:

- Private: `dillon-os` only.
- Public: the other 21 listed under that account.

GitHub MCP in this environment has no repository-visibility write tool. `gh`
is read-only here. Visibility was not changed.

## Claims to verify

- Whether any additional repos exist on orgs or other accounts that this
  integration cannot list (the "34" count).
- Whether Dillon still wants a **sanitized public fork** after the client-evidence
  hold is explained.

## Compile targets

- Decision: [[12_Brain/04_Decisions/2026-08-18 - Keep dillon-os private]]
- Operating: `System/approval-queue.md`
- Artifact: `Daily-Briefs/artifacts/2026-08-19-github-visibility-inventory.md`
