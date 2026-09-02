---
tags: [protocol, connectors, degraded-mode]
updated: 2026-09-01
source: "[[12_Brain/09_Ops/Connector Map]]"
---

# Connector Preflight

**Summary:** every agent checks what it can actually reach before it promises
anything, and degrades to draft mode instead of failing silently.

1. **First call of any lane:** list the connectors and MCP servers available in
   this session. In claude.ai sessions that is `ListConnectors`; in Claude Code
   it is `/mcp`; in Cursor it is the MCP panel. Never assume from the agent file.
2. **Compare against the lane's needs** in [[12_Brain/09_Ops/Connector Map]].
3. **Missing a read surface** (HubSpot, Ads, GA4, Meta, Semrush): switch to
   `degraded`. Use the vault, Gmail, Slack, and Drive as evidence. Label every
   number you cannot pull live as `unverified` and say which connector would fix it.
4. **Missing a write surface** (Netlify, WordPress, HeyGen render): produce the
   artifact locally, write the deploy or publish step to
   `System/approval-queue.md`, stop.
5. **Missing Claude Browser:** use Playwright against a local copy for QA. The
   `qa-critic` agent must never report "unverified" because of a missing browser.
6. **Log the gap once** per session in `12_Brain/09_Ops/Connector Map.md` under
   a dated line if it is new. Do not re-log a known gap.
7. **Never work around a gap with credentials.** No pasting tokens, no reading
   Bitwarden, no borrowed sessions across client spaces.

Result states: `live-verified`, `complete`, `drafted`, `degraded`, `blocked`.
Use the exact word.
