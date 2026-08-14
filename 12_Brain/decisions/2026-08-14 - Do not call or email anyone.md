---
tags: [decision]
decided: 2026-08-14
status: active
supersedes:
source: "operator instruction"
updated: 2026-08-14
---

# 2026-08-14 — Do not call or email anyone

**Decision:** Dillon OS does not call or email anyone. Agents, the HUD, and the outreach engine do not dial, `mailto:`, send Gmail, or drop mail. `mail_ready` stays hold. This agent does not send Slack as a substitute.

**Why:** Operator instruction, 2026-08-14: "Do not call or email anyone."

**Implications:**

- Phone HUD links are sheet / sites / GitHub only. No `tel:` or `mailto:`.
- Outreach packs stay proof-only. Approval still does not send.
- Inbox capture may remind Dillon to talk to someone. The OS does not contact them.
