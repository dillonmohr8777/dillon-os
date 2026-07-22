# Slack and Codex reauthentication handoff

Updated: 2026-07-22
Targets: current Windows desktop and Windows 6 GB desktop

## Current confirmed failure

The Codex Slack connector returns `reauthentication_required` with `oauth_refresh_token_rejected`. The Slack website session can still be logged in while the Codex connector is expired. These are separate sessions.

## Repair on each desktop

1. Open Codex.
2. Open **Plugins**.
3. Select **Slack**.
4. Disconnect the expired Slack connection.
5. Reconnect Slack and authorize the Momentum workspace.
6. Return to Codex and run a read-only test: read the latest messages in `#ai-tech-news`.
7. Confirm the test returns messages instead of `reauthentication_required`.
8. Do not copy tokens, cookies, OAuth codes, or browser profile files between computers.

## Windows 6 GB desktop setup

1. Sign into Codex with Dillon's normal account.
2. Install or enable the Slack plugin.
3. Connect the Momentum Slack workspace using the OAuth flow on that desktop.
4. Clone or pull `dillonmohr8777/dillon-os`.
5. Read this file and the repository `AGENTS.md` before queue work.
6. Keep the GitHub-backed queue pointed at open issues labeled `codex-task`.
7. Test Slack read access and GitHub issue access separately.
8. Treat external messages, publishing, spend, credentials, deletion, and production changes as approval-gated.

## Verification checklist

- Slack connector reads `#ai-tech-news`.
- GitHub connector can list open `codex-task` issues in `dillonmohr8777/dillon-os`.
- No credentials were written to files or issue bodies.
- The 6 GB desktop uses its own OAuth session.
