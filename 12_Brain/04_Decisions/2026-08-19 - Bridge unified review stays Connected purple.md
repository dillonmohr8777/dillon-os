---
note_type: decision
status: superseded
created: 2026-08-19
updated: 2026-08-19T19:30:00Z
owner: Dillon Mohr
client: Bridge Software Development
project: "[[12_Brain/05_Projects/2026-08-19 - Bridge Phase 3 promotion and protected profile]]"
decision_date: 2026-08-19
review_on: 2026-08-26
verification_status: verified
supersedes:
  - "Trusted Current as unified-review visual (2026-08-16 deploy)"
source_refs:
  - "[[12_Brain/01_Captures/2026-08-19 - Bridge restore Connected purple on Phase 1-2 product]]"
  - "[[12_Brain/01_Captures/2026-08-19 - Bridge full approval to publish Connected purple]]"
  - "[[12_Brain/04_Decisions/2026-08-19 - Bridge Phase 3 slice is open]]"
  - "https://github.com/dillonmohr8777/bridge-discovery-prototype/pull/6"
  - "https://bridge-connected-signal.netlify.app"
tags:
  - brain
  - decision
  - bridge-software
  - brand
---

# Bridge unified review stays Connected purple

The unified review URL uses Connected / Modern Network on the same Phase 1/2 five-route product instituted with Tori. It is not Trusted Current navy/teal and not a different app.

## Context

The 2026-08-16 actual-work report shipped the five-route product (Home, Community News, Create, My Profile, Explore, plus legacy Studio/Business/Signal redirects and Phase 1 directory/join/profile/dashboard/admin). The live unified URL was later pinned to Trusted Current. Dillon ordered the old Connected purple restored without dropping those integrations.

## Options considered

1. Keep Trusted Current on `bridge-connected-signal.netlify.app` and leave purple on a side preview.
2. Swap the unified URL to a different repository or the Kimi suite.
3. Restore Connected purple (ink, electric violet, coral, canvas) on `dillonmohr8777/bridge-discovery-prototype` and keep every Phase 1/2 surface in place.

## Decision

Option 3. Visual default is Modern Network. Trusted Current remains an alternate at `bridge-preview-current` and on unlocked local builds. Tori still owns formal brand acceptance. Dillon approved the unified-URL republish on 2026-08-19 (`full approval publish`). Slack, email, live API bind, and merge to `main` stay gated.

## Rationale

Dillon named the last beautiful purple and the Tori-instituted product inventory as the requirement. Color-token-only work on a different app would fail that instruction.

## Consequences

- Draft PR https://github.com/dillonmohr8777/bridge-discovery-prototype/pull/6 carries the purple default, host script, and Phase 3 frontend lock
- Live `https://bridge-connected-signal.netlify.app` now serves Connected purple from commit `65d4a3eb` (Netlify deploy `6a8601e5b1ca6b199926b228`)
- Do not Slack, email Tori/Melissa/Mac/Miraj, bind `NEXT_PUBLIC_BRIDGE_API_BASE`, merge the prototype PR, or mark Tori accept boxes complete

## Superseded

Replaced by [[12_Brain/04_Decisions/2026-08-19 - Bridge unified review is the original 3D suite]]. The Next.js Modern Network restyle on the unified URL was not the product Dillon asked for.

## Evidence

- [[12_Brain/01_Captures/2026-08-19 - Bridge restore Connected purple on Phase 1-2 product]]
- [[12_Brain/01_Captures/2026-08-19 - Bridge full approval to publish Connected purple]]
