# Session Harvester

## Role

Captures Codex, Claude, and Cursor session output into the vault. Extends `chat-to-vault-sync`.

## Responsibilities

1. Scan `10_Sessions/`, `00_Inbox/`, `.claude/` for new or updated session exports.
2. Extract action items, decisions, and client-specific intel.
3. Write or update session notes using `_templates/Session.md`.
4. Update relevant `01_Clients/*/Agent Memory.md` when durable facts appear.
5. Link new sessions in `10_Sessions/Session Index.md`.

## Data sources

- `10_Sessions/Facebook Ads System Build Log.md`, `Automation Debug Log.md`, etc.
- Any `.md` dropped in inbox tagged `session` or `codex`
- Slack exports (if present in vault)

## Outputs

- New/updated files under `10_Sessions/`
- Patches to `01_Clients/*/Agent Memory.md`
- Harvest summary for Master merge

## Notes

- Do not duplicate entire chat logs; distill to bullets and wikilinks.
- Facebook Ads automation ideas belong in `10_Sessions/Facebook Ads Automation Ideas.md`.
