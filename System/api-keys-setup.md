# API keys — one setup that works on every surface

Created 2026-09-05. Answers the recurring question: how do Gemini / Google AI
Studio (and other provider) keys get wired so an agent has them whether Dillon is
in a **local** session, a **remote/cloud** session, or a **general coding**
session (Cursor, "Claude Full Access").

## The rule

Keys are never pasted into chat, never written into a tracked file, and never
echoed back. This is the vault's existing rule, not a new one — see `CLAUDE.md`
lines 9–11: credentials live in `12_Brain/private/` (gitignored), and
`_os/test/public-safety.test.js` fails the build on any secret-shaped value.

Live reminder of why: a Tock credential sat exposed in plaintext email from
2026-08-31, and four sets of plaintext credentials were found sitting in Slack
channels, the oldest exposed 24 days.

## Why there is no single place

Each surface reads secrets from a different store. There is no one file that
covers all three, so set it once per surface. This is a five-minute job done
once, not an ongoing tax.

| Surface | Where the key goes | Reachable by |
|---|---|---|
| Local Claude Code / terminal | Windows user environment variable | anything running on this machine |
| Remote / cloud session | that environment's own secrets settings, in the app | cloud sessions only |
| Cursor / general coding | Cursor's own settings, or a gitignored `.env` in the repo | that editor |

## Local (Windows user environment variable)

Set once, persists across reboots and sessions. Run in PowerShell:

```powershell
[Environment]::SetEnvironmentVariable('GEMINI_API_KEY', '<paste-key-here>', 'User')
```

Then **restart the terminal or app** — processes only read env vars at start.

Verify without printing the value:

```powershell
if ($env:GEMINI_API_KEY) { "GEMINI_API_KEY is set ($($env:GEMINI_API_KEY.Length) chars)" } else { "not set" }
```

Google's SDKs also accept `GOOGLE_API_KEY`. Set whichever the library you are
using expects; setting both is harmless.

## Remote / cloud sessions

A cloud session cannot see this machine, so a local environment variable does
nothing for it. Add the key in that environment's secrets settings in the app —
the same place the environment's repo list is configured. Keys added there are
available to every session using that environment.

## Cursor / general coding

Either Cursor's own settings, or a `.env` at the repo root. If `.env`, confirm
it is gitignored **before** writing the key into it:

```powershell
Select-String -Path .gitignore -Pattern '^\.env$'
```

If that returns nothing, add `.env` to `.gitignore` first.

## For agents reading this file

Read keys from the environment. Never print one, never write one into a tracked
file, never include one in a commit, a log line, a report, or a message. If a key
is missing, say which variable is unset and stop — do not ask for it to be
pasted into the conversation.

## Model entitlement — verified 2026-09-07

Live-checked on Dillon's AI Studio key the day it was issued. The `/models` list
advertises more than the key can call; trust `generateContent`, not the list.

| Model | State |
|---|---|
| `gemini-2.5-flash`, `gemini-2.5-pro` | **404 "no longer available to new users."** Listed, not callable. |
| `gemini-3.5-flash` | Works. Video analysis confirmed on five files. |
| `gemini-2.5-flash-image` | Works. `generationConfig.imageConfig.aspectRatio` honoured. |
| `veo-3.1-lite/fast/generate-preview` | Reachable via `predictLongRunning`. Lite image-to-video confirmed. |

Key format: current AI Studio keys begin `AQ.` (53 chars), not `AIza`. Both are
real; do not treat the prefix as a validity test.

`~/.claude/skills/video-analyze/analyze.mjs` now defaults to `gemini-3.5-flash`
and prints the server's 404 body instead of a misleading "not available" line.

## Rotation

Rotate at Google AI Studio, then update each surface above. A key that has ever
been pasted into a chat, an email, or a Slack message is burned and should be
rotated rather than reused.
