# Client Pulse — 2026-08-13

## Coverage notes

- Scanned all `01_Clients/**/*.md` for frontmatter (`due`, `next_action`, `last_touched`, `status`) and file modified times.
- 37/37 client notes have complete frontmatter (last validate: 2026-07-29).
- No Git-tracked client file modifications in 14 days — classify by `last_touched` frontmatter where present.
- Gmail/Slack live connectors unavailable in cloud; Slack vault mirror frozen 2026-07-30.

## Moving (< 48h)

_None with `last_touched` within 48h in vault data._

## Watch (2–7 days)

- **Momentum 360** — 4 open boss requests in `00_Inbox/slack/` need replies
- **Omega Landscaping** — Google Ads account discussion pending (John Belaska, Thursday)
- **Buzz Bull / CCA** — Teams meeting commitment from prior email thread

## Stalled (7+ days)

- All client notes by Git mtime — vault is not receiving daily touch updates via Git
- **Root cause:** client work happens in Gmail/Slack/ads platforms, not vault commits
- **Fix:** run `/client-pulse` after each client touch OR wire metrics-pull into daily command cycle

## Due in 48h

- Nothing with explicit `due` frontmatter within 48h

## Tomorrow's priority stack

1. Bot case-status alert (Jason/Sean) — launch blocked for M360 automation
2. Book site form fix — subscriber capture for 2,000-book target
3. CallRail status reply (Sean) — billing/attribution risk if tracking is broken
