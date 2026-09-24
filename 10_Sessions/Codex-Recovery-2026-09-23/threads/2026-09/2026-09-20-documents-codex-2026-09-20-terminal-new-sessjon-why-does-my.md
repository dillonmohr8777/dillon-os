---
note_type: session-recovery
status: recovered
created: 2026-09-23
updated: 2026-09-23
session_first: 2026-09-20T04:44:25
session_last: 2026-09-20T04:44:25
session_count: 1
cwd: "C:\Users\dillo\Documents\Codex\2026-09-20\terminal-new-sessjon-why-does-my"
tags: [codex-recovery, session, 202609]
---

# Documents\Codex\2026-09-20\terminal-new-sessjon-why-does-my

**1 session(s)** · 2026-09-20 04:44 → 2026-09-20 04:44 · 1.4h agent-time (summed; sessions may overlap) · 3 MB transcript · 1/1 turns completed

## 1. 2026-09-20 04:44 · 1.4h · 3.2 MB

`01a0bd21-352f-71c3-b89e-d81bfb960c1f` · turns 1/1

**Asked:**

> Terminal. New sessjon. WHY DOES MY CODEEX DESKTOP AND REMO CONECCTIIN MEEP FUCKING UP

**Outcome reported:**

> Confirmed: **it is not your phone or Wi‑Fi. Codex Desktop has multiple competing backends, and the wrong process owns Remote.**
> 
> The failure chain is:
> 
> `too many concurrent sessions/subagents → process explosion → 99% system commit → emergency backend restart → old Remote daemon keeps connection → new Desktop backend gets HTTP 409 → phone sees the task but cannot load its messages`
> 
> Evidence from this machine:
> 
> - From 10:50–11:43 PM, Remote failed to refresh its token **110 times**.
> - At 11:43 PM, Codex had **7 app servers, 377 descendant processes, and 55 `node_repl` generations**. System commit reached **99%**.
> - The watchdog emergency-restarted the Desktop backend at 11:44 PM.
> - An older managed Remote daemon, PID `55288`, remained connected.
> - The replacement Desktop backend, PID `53980`, is now repeatedly receiving: **`409 Conflict — Remote app server already online`**.
> - There was no functioning Remote transport between that restart and 12:51 AM. Your screenshot was taken at 12:44 AM—exactly inside that dead window.
> - `Watch Higgsfield` is still running with about **18.7 million accumulated tokens**. There are **14 recent threads marked in progress**, plus 55 `ChatGPT.exe` processes and 192 Codex tool descendants.
> - The local thread-history database is **7.77 GB**, adding further load.
> - Wi‑Fi is healthy at 88% signal, HTTPS works, Windows logged no disconnect at the failure time, and no newer Desktop package is available.
> 
> That explains the weird screenshot: the relay still knows the host name, thread title, and “Pursuing goal” status, but the backend responsible for supplying the actual messages is disconnected or fighting for ownership.
> 
> OpenAI’s official guidance says Remote depends on one current, awake, online Desktop host and recommends restarting/re-enabling Remote or re-pairing after connection failures. Your pairing is enabled; the local backend collision is the part breaking it. [OpenAI Remote connections guide](https://developers.openai.com/es-419/docs/remote-connections)
> 
> I have not killed anything because doing that now would interrupt `Watch Higgsfield` and the other live goals. The proper repair is a controlled checkpoint, full Desktop shutdown, removal of the stale Remote daemon and stray app servers, then one clean Desktop restart and Remote reconnection.
> 
> Say **“stabilize it now”** and I’ll perform that controlled repair. It will interrupt the currently running sessions.
> 

<sub>rollout: `C:\Users\dillo\.codex\sessions\2026\09\20\rollout-2026-09-20T00-44-25-01a0bd21-352f-71c3-b89e-d81bfb960c1f.jsonl`</sub>
