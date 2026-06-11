# Automation Debug Log

## Active Issues

• **2026-06-11** — Gmail MCP unavailable on cloud operator run (3rd consecutive partial). Intel inferred from April vault state only. Action: connect Gmail MCP to Cursor automation environment.
• **2026-06-11** — Slack MCP unavailable on cloud operator run (3rd consecutive partial). Action: connect Slack MCP or manually check mobile Slack before Priority Stack execution.
• **2026-06-11** — Vault `last_touched` on client notes frozen since 2026-04-15 (~57 days). Stall detection unreliable until organic edits or live intel backfill resume.
• **2026-06-11** — `10_Sessions/` has no Codex/Cursor session exports; `chat-to-vault-sync` absorbed into `intel-codex-sessions` lane but ingest path empty.

## Resolved Issues

• **2026-06-11** — Seven legacy crons consolidated into `dillon-os-operator` umbrella. Lane prompts restored at `.cursor/automation/lanes/`.

## Error Patterns

• Cloud agent runs without Gmail/Slack MCP → stale April intel recycled → false urgency on 57-day-old blockers. Mitigation: MCP reconnect + human live scan before client outreach.

## Notes

Legacy automations to disable after 3 **green** runs (live MCP + dated pulse): `nightly-client-pulse`, `gmail-to-vault-digest`, `vault-integrity-sync`, `chat-to-vault-sync`, `bok-law-social-content`, `linkedin-growth-engine`, `book-site-seo-sweep`.
