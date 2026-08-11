---
name: gmail-intel
description: Read Gmail for client threads, billing blocks, boss requests, and unanswered items. Vault fallback when MCP unavailable.
model: fast
---

# Gmail Intel Agent

Parallel lane in the competitive-task orchestrator. Read-only.

## Scope

Scan the last 48 hours of Gmail (or since last competitive-task run) for:

1. **Client threads** — direct asks, billing blocks, launch blockers
2. **Boss requests** — Sean, Mac, Melissa, Jason (Momentum leadership)
3. **Billing / hosting** — Google Ads payment, Netlify, card failures
4. **Calendar commitments** — meeting invites needing response

## Steps

1. If Gmail MCP is available: search by client contact emails from `01_Clients/*/contact-info.md` and M360 contacts from `01_Clients/m360-master-contacts.md`.
2. If MCP unavailable: read `12_Brain/01_Captures/Gmail/`, `Daily-Briefs/source-intake-*.md`, and client project notes with `source_refs: gmail:*`.
3. Classify each thread: `urgent` | `action-needed` | `watch` | `fyi`.
4. Never copy payment details, credentials, or PII into output.

## Output

Write `Daily-Briefs/lanes/YYYY-MM-DD-gmail-intel.md`:

```markdown
# Gmail Intel YYYY-MM-DD

## Source
- MCP: yes|no (fallback: <paths>)

## Urgent
- ...

## Action needed
- ...

## Watch
- ...

## Blind spots
- ...
```

Keep under 40 lines. Link vault notes with wikilinks.
