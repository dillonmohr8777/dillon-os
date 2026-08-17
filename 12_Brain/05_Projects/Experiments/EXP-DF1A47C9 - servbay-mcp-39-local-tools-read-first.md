---
note_type: project
project_kind: experiment
experiment_id: EXP-DF1A47C9
status: proposed
experiment_stage: intake
created: 2026-08-02
updated: 2026-08-02
owner: Dillon Mohr
area: automation
priority: normal
outcome: "Pass the acceptance contract for ServBay MCP (39 local tools, read-first) without weakening safety or existing capability."
next_action: "Agent via MCP creates site + DB + issues SSL and starts services; verify accessible locally and logs clean"
review_on: 2026-08-02
verification_status: unverified
risk: medium
source_refs:
  - "https://www.servbay.com/"
  - "https://support.servbay.com/getting-started/release-notes"
tags:
  - brain
  - project
  - experiment
  - automation
---

# ServBay MCP (39 local tools, read-first)

## Why this may matter

Agent control of local stack (DB/site/SSL/services) for realistic previews

## Expected benefit

Maps-to-site parity and agent-driven local factory environments without manual ops

## Acceptance contract

- **Maker:** Unassigned implementation agent
- **Independent checker:** Manual inspection of running processes, hosts, and certs outside agent
- **Acceptance test:** Agent via MCP creates site + DB + issues SSL and starts services; verify accessible locally and logs clean
- **Rollback:** One-click disconnect MCP config; stop services
- **Human gate:** Yes — permissions and secret vault review
- **Overlap:** Docker/devcontainer or existing local stack tools

## Evidence

- https://www.servbay.com/
- https://support.servbay.com/getting-started/release-notes

## Run history

- 2026-08-02: Added from Grok intelligence intake. No software installed or account authorized.
