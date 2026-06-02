# Automation Debug Log

## Active Issues

- **2026-06-02** — Gmail MCP and Slack MCP unavailable in cloud operator (`intel-gmail`, `intel-slack` STALE). Connect per `00_Inbox/Umbrella Automation Setup.md`.
- **2026-06-02** — `10_Sessions/` empty: no Codex exports, Session Index unused, Facebook Ads build docs blank.
- **2026-06-02** — Client vault `last_touched` frozen since 2026-04-15; operator cannot detect real movement until Dillon updates notes or MCP ingests email.

## Resolved Issues

- **2026-05-27** — Seven fragmented crons consolidated into `dillon-os-operator` umbrella (spec + lane files shipped).

## Error Patterns

- Cloud runs without Gmail/Slack MCP → `System/urgent-replies.md` and pulse email/Slack sections stay stale until MCP wired (2+ runs = manual inbox verification required per Master Agent escalation rules).

## Notes

- Green run count toward legacy cron retirement: **0/3** (MCP gap prevents full intel; counts as partial run).
- Next full-intel run requires Gmail + Slack on automation `bc523644-815a-43a9-b434-fd2967c1be2c`.
