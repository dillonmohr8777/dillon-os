# hermes-local-control — take over Mac Hermes via CDP

Updated: 2026-07-31

## Goal

Start a **new Hermes session** on Dillon's Mac that drives a live Chrome window
(TV monitor) over CDP. This is the local control lane — not Composio cloud browser.

## One-liner (Mac terminal)

```bash
cd ~/dillon-os   # or wherever this vault is
bash _os/tools/hermes-local-control.sh
```

Then:

```bash
hermes chat
```

Inside Hermes:

```text
/browser connect
/browser status
```

Start a **new chat** and give Hermes the task.

## Why this lane

| Lane | Works from cloud Cursor? | Sees Mac cookies / TV Chrome? |
|------|--------------------------|-------------------------------|
| hermes-local-control (CDP) | No — Mac-only | Yes |
| Composio `BROWSER_TOOL` | Yes (if Enhanced Controls allow) | No — separate cloud browser |
| Claude in Chrome | No — local CLI | Yes |

Cloud agents prep the task packet; Hermes on Mac executes against the TV browser.

## Optional permanent CDP config

`~/.hermes/config.yaml`:

```yaml
browser:
  cdp_url: http://127.0.0.1:9222
```

## Verify

```bash
curl -s http://127.0.0.1:9222/json/version
```

## Rules

- Dedicated profile: `~/.hermes/chrome-debug` (required so port 9222 opens)
- CDP bind: `127.0.0.1` only — never `0.0.0.0`
- `/browser connect` only in Hermes **terminal** CLI
- Disconnect when done; do not close Dillon's browser

## Skill

`.claude/skills/hermes-local-control/SKILL.md`

## Related

- `12_Brain/protocols/browser-control-routing.md`
- `handoffs/composio-hermes-browser-control-2026-07-31.md` (cloud lane)
