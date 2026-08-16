---
tags: [entity, tool]
source: "[[12_Brain/raw/2026-06-26 - intel-core-7-master-operating-transfer]]"
updated: 2026-08-16
---

# Hermes

**Summary:** phone chat to a local Hermes Agent gateway. iMessage goes through Photon. Telegram is a second adapter on the same process. This Cloud Agent cannot reach that machine.

Two different things share the name:

1. **Legacy Orgo Hermes** (2026-06) — ran on the retired Intel Core 7 box. Auth/provider state lived there, so that install is orphaned. Last verified: localhost webhooks on port 8644, Telegram/Slack/GitHub delivery, Slack `invalid_auth`, email/SMS/Discord/WhatsApp/Signal never configured. See the 2026-06 transfer note.
2. **Live Nous Hermes Agent** (2026-08, operator iMessage thread) — `hermes gateway` on a laptop/worker. Contact name **Hermes Agent**. Grey bubbles that say `Gateway shutting down — Your current task will be interrupted` mean the **gateway process exited**, not that Photon deleted the line.

Photon is a managed iMessage channel ([official Photon docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/photon)), not an MCP and not a Mac Messages.app relay. A Node sidecar holds a gRPC stream to Photon. Cron and `hermes send` reuse that sidecar and fail if the gateway is down.

Telegram is a second platform on the **same** gateway ([official Telegram docs](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/telegram)). Default mode is long polling: the machine must stay awake. Official always-on path is `hermes gateway install` (launchd on macOS, user or `--system` systemd on Linux).

This Cursor Cloud VM has no route to the laptop, the Ops Box, `~/.hermes/`, or Photon. Tokens stay on the host (`~/.hermes/.env`) — never in this public repo.

Always-on means: one always-on host (not a sleeping laptop), both platforms enabled in one gateway, service installed so it survives reboot, then `hermes gateway status` and `hermes photon status` both healthy. Lid close / `hermes gateway stop` / host sleep = the iMessage interrupt you already saw.

## Operator checks (on the Hermes host only)

```bash
hermes gateway status
hermes photon status
hermes doctor
```

If the service is missing: `hermes gateway setup` (pick Telegram + Photon iMessage), then `hermes gateway install` and `hermes gateway start`. Do not put bot tokens, Photon secrets, or phone numbers in Git.

## Links

- [[12_Brain/entities/Ops Box (EliteDesk 800 G4)|Ops Box]] — the always-on machine this should live on if the laptop sleeps
- [[12_Brain/entities/Codex Workspace (Legacy)|Codex Workspace (Legacy)]] · [[12_Brain/concepts/Google Docs Sharding Pattern|Google Docs Sharding Pattern]]
- [[12_Brain/private/README|private/]] — any host path or token note
