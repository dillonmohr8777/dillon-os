---
note_type: decision
status: active
created: 2026-08-19
updated: 2026-08-19
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
  - "[[12_Brain/04_Decisions/2026-08-19 - Bridge Phase 3 slice is open]]"
  - "https://github.com/dillonmohr8777/bridge-discovery-prototype/pull/6"
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

Option 3. Visual default is Modern Network. Trusted Current remains an alternate at `bridge-preview-current` and on unlocked local builds. Tori still owns formal brand acceptance. Netlify republish stays approval-gated.

## Rationale

Dillon named the last beautiful purple and the Tori-instituted product inventory as the requirement. Color-token-only work on a different app would fail that instruction.

## Consequences

- Draft PR https://github.com/dillonmohr8777/bridge-discovery-prototype/pull/6 carries the purple default, host script, and Phase 3 frontend lock
- Live `https://bridge-connected-signal.netlify.app` stays teal until Dillon republishes from that branch
- Do not Slack, email Tori/Melissa/Mac/Miraj, bind `NEXT_PUBLIC_BRIDGE_API_BASE`, or mark Tori accept boxes complete

## Reversal trigger

Tori writes a different default direction, or Dillon cancels the Netlify restore.

## Evidence

- [[12_Brain/01_Captures/2026-08-19 - Bridge restore Connected purple on Phase 1-2 product]]
