---
name: calendar-read
description: Read-only calendar lookups. Stays dark until a calendar key is configured.
requires: CLAW_CALENDAR_API_KEY
---

# Calendar read

Gated. This skill only loads when `CLAW_CALENDAR_API_KEY` is set.

## Status

The key gate exists. A calendar transport is not wired into CLAW yet. Until one
is, answer scheduling questions from the vault (`Daily-Briefs/`, client notes)
and say plainly that live calendar access is not connected. Do not infer
availability from anything else and present it as his calendar.

## When to use

He asks what is on the calendar, when he is free, or what a meeting was about.

## Tools

`kb_search` and `kb_open` today. A calendar tool when one ships.

## Stop conditions

- No key, no skill. If you are reading this without the key set, that is a bug.
- Never state a time as confirmed unless it came from a source you can cite.
- Free and busy are claims about a real person day. Unverified means unverified.

## Approval boundary

Read only, permanently. Never create, move, accept, decline, or cancel an event.
Never email an invite. Scheduling with other people is Dillon to send.
