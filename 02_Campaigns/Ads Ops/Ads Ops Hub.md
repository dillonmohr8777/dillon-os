---
tags: [ads-ops, moc]
source: "[[raw/2026-07-04 - full-autonomy-directive]]"
updated: 2026-07-04
---

# Ads Ops Hub

**The every-2-days optimization loop.** Dillon has granted full autonomy
([[raw/2026-07-04 - full-autonomy-directive|directive]]) — analyze, recommend,
and institute changes across all ad accounts.

## The cycle (every 2 days)

1. **Remote analysis session** (scheduled trigger): reads these spec pages +
   freshest `raw/ads-exports/`, runs research + per-account analysis + page-side
   tracking checks, writes the **Action Packet** to `Daily-Briefs/ads-ops/`.
2. **Local apply session** (Dillon's machine, `claude --chrome`, "Claude Ops"
   Chrome profile): exports fresh account reports → commits to
   `raw/ads-exports/` → executes the Action Packet in Meta/Google/Zapier →
   logs what was applied back to the packet.
3. Results feed the next cycle. See [[System/Chrome Session Runbook|Chrome
   Session Runbook]] for the local half.

## Account spec pages

- [[02_Campaigns/Ads Ops/KJB Ads Spec|KJB]] — Search + PMax + Meta leads; attribution depth into Squarespace
- [[02_Campaigns/Ads Ops/Replenish Ads Spec|Replenish / 7-Eleven]] — PMax per kiosk; brand rules; gclid gap
- [[02_Campaigns/Ads Ops/Shadow HVAC Ads Spec|Shadow HVAC]] — instant form: Hampshire IL geo + English-only + qualification
- [[02_Campaigns/Ads Ops/Fagan Painting Ads Spec|Fagan Painting]] — same instant-form treatment; intake pending
- [[02_Campaigns/Ads Ops/NKCDC Ads Spec|NKCDC]] — built & approved; blocked on client LP since April
- [[02_Campaigns/Ads Ops/Omega Ads Spec|Omega Landscaping]] — access verification first; Meta is John Belaska's, not ours
- [[02_Campaigns/Ads Ops/Onsite Ads Spec|Onsite Concrete]] — ads-readiness audit lane
- [[02_Campaigns/Ads Ops/Zapier Lead Routing|Zapier Lead Routing]] — the standing fix: lead → client notified

## Standing guardrails (autonomy ≠ recklessness — these keep it sustainable)

- New campaigns/ad sets are created **paused**; enabled only after the packet
  says verified. Budget changes >20% in one step get flagged, not auto-applied.
- Client brand rules are law (e.g. Mia: no phone-call conversions, "Replenish"
  not "Fresh Blends").
- Every applied change is logged in the cycle's Action Packet — the vault's
  diff-not-claim rule, applied to ad accounts.
- Credentials: logged-in Chrome profile + Bitwarden autofill. **Never** bulk
  credential export, never passwords in chat/vault/packets
  ([[concepts/Access Verification Discipline|discipline]]).
- [[concepts/Evidence Boundaries in Reporting|Evidence rules]] apply to all
  client-facing numbers.
