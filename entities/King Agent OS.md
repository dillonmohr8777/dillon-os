---
tags: [entity, tool]
source: "[[raw/2026-06-26 - intel-core-7-master-operating-transfer]]"
updated: 2026-07-04
---

# King Agent OS

Daily command layer built on the old Codex workspace: morning work command, marketing war room, 2-hour money run, dashboard scouting. Lived in `plugins\dillon-agent-arsenal` + `plugins\king-agent-command-center` with os-state JSON files (tasks/approvals/notifications) and a local dashboard API.

Standing rules it enforced (worth keeping regardless of runtime): SMS stays draft/approval-only (`standing_send_approval=false`); priority default = client delivery and paid media outrank Gumroad product work unless Dillon changes it.

Status: infrastructure existed on the retired machine; the *patterns* (morning command, money run, approval queue) map onto this vault's skills (`/am-report`, `/plan-today`) and are candidates for porting.

## Links
- [[entities/Codex Workspace (Legacy)|Codex Workspace (Legacy)]] · [[concepts/Draft-First Operating Rules|Draft-First Operating Rules]]
