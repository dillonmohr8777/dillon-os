---
name: hermes-local-control
description: Take over Dillon's Mac Hermes Agent via local Chrome CDP (/browser connect). Use when Dillon says hermes-local-control, wants TV-visible browser control, or Composio Enhanced Controls block cloud browser tools.
---

# hermes-local-control

Drive Hermes on Dillon's Mac against a live Chromium window (TV-visible).
Cloud Cursor agents **cannot** reach Mac `127.0.0.1:9222` — this skill
orchestrates the **local** attach path and documents what Dillon must run.

## When to use

- Dillon says `hermes-local-control` or "take over Hermes"
- Logged-in Ads / GBP / GHL / Slack UI work that needs his cookies
- Composio returns `Tool execution denied by user: BROWSER_TOOL_*`
- He wants to watch the agent on the TV monitor

## Do not use when

- Pure cloud research with no Mac session (use Composio Browser Tool if allowed)
- Claude Code local with `--chrome` already covering the task
- CDP would be exposed on `0.0.0.0` (forbidden — bind `127.0.0.1` only)

## Operator steps (Mac)

1. Run the launcher (starts Chrome debug profile + prints Hermes commands):

```bash
bash _os/tools/hermes-local-control.sh
```

2. In a **Hermes terminal** (not Web UI / Telegram / Discord):

```text
hermes chat
/browser connect
/browser status
```

3. Start a **new chat session** in Hermes and give the task.

4. Confirm CDP:

```bash
curl -s http://127.0.0.1:9222/json/version | head
```

## Agent steps (this skill)

1. Confirm cloud cannot attach — do not pretend CDP is reachable from cloud.
2. Point Dillon at `_os/tools/hermes-local-control.sh` + handoff.
3. Prep the exact Hermes prompt / task packet he should paste into the new session.
4. If Composio was the intended path, note Enhanced Controls still apply separately.
5. Update [[12_Brain/entities/Hermes|Hermes]] only if the local control path changed.

## Hermes slash commands

| Command | Effect |
|---------|--------|
| `/browser connect` | Attach to `http://127.0.0.1:9222` (auto-launches if needed) |
| `/browser connect ws://host:port` | Specific CDP endpoint |
| `/browser status` | Connection check |
| `/browser disconnect` | Detach; return to cloud/local agent-browser |

## Hard rules

- Use a **dedicated** `--user-data-dir` (`~/.hermes/chrome-debug`) so port 9222 actually opens when Chrome is already running.
- Never close Dillon's live browser; disconnect CDP only.
- Never expose CDP on `0.0.0.0`.
- `/browser connect` only works in interactive Hermes CLI — not gateway chats.

## References

- [[12_Brain/protocols/browser-control-routing|browser-control-routing]]
- [[12_Brain/entities/Hermes|Hermes]]
- `handoffs/hermes-local-control.md`
- Docs: https://hermes-agent.nousresearch.com/docs/user-guide/features/browser
