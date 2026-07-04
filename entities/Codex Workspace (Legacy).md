---
tags: [entity, tool, historical]
source: "[[raw/2026-06-26 - intel-core-7-master-operating-transfer]]"
updated: 2026-07-04
---

# Codex Workspace (Legacy)

Dillon's previous command center — a Windows Codex workspace at `C:\Users\DillonMohr\OneDrive - Align HCM\Desktop\Codex`, transferred-out via the Intel Core 7 brief when that machine broke (retired 2026-07). Historical reference: this is where 5+ weeks of session history and ~28 automations lived.

Where the durable history is (if the OneDrive account is still reachable):
- Memory registry: `C:\Users\DillonMohr\.codex\memories\MEMORY.md` + rollout summaries.
- Sessions: `.codex\sessions`, `session_index.jsonl` (448 sessions), `history.jsonl`; retrieval layer `workspace-admin\all-sessions-by-project`; packaged narratives in `Codex\handoffs\`.
- Old Obsidian vault: `Desktop\.claude\Dillon OS` (4.26 GB, mostly browser-profile state — indexed, not flattened).
- Google Docs shard corpus already exported: 66 native Docs, search prefix `Dillon OS Hermes Orgo Vault -`, index doc in Drive.

Notable machinery (patterns worth porting, not resurrecting wholesale): [[entities/King Agent OS|King Agent OS]], [[entities/Hermes|Hermes]], hourly Gmail client-reply triage (draft-first), Slack mention triage, Netlify interactive HTML report factory, [[entities/Website Factory|website-factory-core]], m360 daily ads/leads loops, obsidian-vault-daily-session-dump. The `intel-core-7-vault-session-drive-sync` automation was disabled when the machine broke — correct move per the "broken sync target ⇒ disable, don't retry" rule.

## Links
- [[concepts/Truth Hierarchy|Truth Hierarchy]] · [[concepts/Draft-First Operating Rules|Draft-First Operating Rules]] · [[concepts/Google Docs Sharding Pattern|Google Docs Sharding Pattern]]
