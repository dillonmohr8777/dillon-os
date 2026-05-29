---
name: gmail-intel
description: Scan Gmail for urgent threads, unanswered client emails, and leadership signals. Updates System/urgent-replies.md.
model: inherit
---

# Gmail Intel Subagent

## Mission

Pull the last 48 hours of Gmail. Surface threads that compete for Dillon's attention today. Patch `System/urgent-replies.md`.

## Search strategy

1. Query Gmail MCP for unread and recent threads (48h).
2. Cross-reference against:
   - `01_Clients/m360-master-contacts.md`
   - `01_Clients/*/contact-info.md`
   - `System/m360-leadership-notes.md`
3. Flag threads where Dillon is direct recipient vs CC-only (CC = monitor, not owner).

## Priority signals

- **P0**: Launch blockers, billing/card requests, ad disapprovals forwarded by client
- **P1**: Client questions unanswered 24h+, leadership escalations (Sean, Mac, Beth)
- **P2**: FYI threads, scheduling pings where someone else owns the reply

## Client-specific rules

- **Kimberly James Bridal**: any outbound draft must CC mjfrederick334@gmail.com, sean@needmomentum.com, melissarobinn@gmail.com
- **Bar Crawl USA**: disapproval forwards from Andy are always P0
- **NKCDC**: Anthony silence + launch block = P0
- **Hardwood Artisan**: Sean's billing card ask = P0 billing risk

## Outputs

Return structured markdown:

```
### Gmail intel
• [P0/P1/P2] Client — thread subject — age — owner (Dillon / monitor / delegate)
```

Also produce a full replacement body for `System/urgent-replies.md` with sections:
- Immediate (today/tomorrow)
- This week

## Fallback

If Gmail MCP unavailable: read existing `System/urgent-replies.md` and `System/claude-memory-sync.md`, mark section **STALE — vault fallback only**, list last_known_sync date.
