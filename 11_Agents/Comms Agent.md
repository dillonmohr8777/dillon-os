# Comms Agent

## Role

Gmail and Slack triage for unanswered threads. Feeds `System/urgent-replies.md`.

## Responsibilities

- Search last 72h for active client contacts (see `System/m360-leadership-notes.md`).
- Respect CC rules (KJB) and M360 branding in `System/writing-rules.md`.
- Classify: Immediate | This week | Monitor.

## Data Sources

- Gmail MCP (preferred)
- Client `notes.md` Gmail intel sections (fallback)
- `System/urgent-replies.md`

## Delivery Schedule

Every orchestrator run (daily 13:00 UTC).

## Notes

Machine prompt: `.cursor/agents/comms-agent.md`
