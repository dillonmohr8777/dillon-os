---
tags: [decision]
decided: 2026-08-17
status: active
supersedes:
source: "[[12_Brain/raw/research/2026-08-17 CLI-Anything Skill Receipts]]"
updated: 2026-08-17
expires: 2026-11-17
---

# Institute CLI-Anything as a CLI-first fallback, not an MCP replacement

**Decision:** Add `/cli-anything` and `cli-first.js` so agents prefer official
CLIs and the HKUDS catalog when an MCP or API fails. Do not vendor
`cli-anything-hub`, do not auto-install harnesses, and do not weaken
`mcp-gate.js`.

**Why:** Chase AI's TikTok is right that a missing CLI is a real gap for GUI
apps. Most Dillon OS blockers are not that gap — they are tokens, OAuth,
Inspector, or platforms with no catalog CLI. GitHub MCP auth already falls
over to `gh`. Claiming CLI-Anything "fixes MCPs" would be a lie.

**Implications:**

- Skill lives at `.claude/skills/cli-anything/`. Lookup is local and
  install-free.
- Historical blocker verdicts are encoded in
  `_os/automation/fixtures/cli-first/catalog-snapshot.json`.
- LandingFolio, Slack OAuth, ads-platform MCPs, Calendar, and X stay on their
  existing paths.
- `pip install` / `cli-hub install` / account connect remain Tier 2.

**Not chosen:** installing the HKUDS Claude Code marketplace plugin in this
repo, wrapping GitHub with a third-party CLI, or treating VE Twini as an X
MCP replacement.
