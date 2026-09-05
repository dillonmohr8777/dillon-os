---
name: ad-teardown
description: Tear down the two strongest local competitors' ad creative for a prospect or client domain — hook, structure, offer, cut cadence — and flag what to steal. Use before a paid-media pitch, a creative refresh, or when video-director needs a remix brief.
---

# Ad Teardown

Turns a bare domain into a one-page brief on what the two strongest local
competitors are actually running, cross-checked across two ad-intelligence
surfaces so the read holds up. Read-only end to end unless a remix is later
approved.

## When to use

Before a paid-media pitch or creative refresh, when a client or prospect asks
"what is everyone else running," or as the research step behind a
video-director remix (see [[12_Brain/09_Ops/Agent Roster|Agent Roster]]).
Pairs with [[.claude/skills/site-grade|site-grade]] when the two competitors
aren't already known from a radar pull.

## Inputs

- A prospect or client domain (required).
- Optional: the two competitor domains, if already known from a prior
  `site-grade` or radar-operator pass — skip discovery and go straight to the
  Motion/AdWhispr pulls on those two.

## Steps

1. **Preflight.** Run [[12_Brain/protocols/Connector Preflight]]: confirm
   Motion Creative Analytics, AdWhispr, and Higgsfield are live this session.
   Missing one is `degraded`, not a stop — skip that source and say so.
2. **Find the two.** If not supplied, call AdWhispr `find_competitors` on the
   domain and take its top two *verified* advertisers. Never brainstorm names.
3. **Motion pull.** `get_auth_context` once this session, then
   `get_brand_by_domain` on each of the two competitors, then
   `get_inspo_creatives` for their strongest creative.
4. **AdWhispr pull.** `get_brand_ads` on each (`add_brand` first with the
   `pageId` from step 2 if not already tracked), `sortBy: longevity`, to
   surface proven long-runners. Read-only: never call `launch_campaign`,
   `launch_meta_ad`, `launch_tiktok_campaign`, `launch_pmax_campaign`,
   `launch_search_campaign`, `launch_cloned_ad`, or any other `launch_*` tool.
5. **Pick one.** The single best video across both signals — longevity plus
   Motion's insight, not a guess.
6. **Analyze it.** Higgsfield `video_analysis_create` on that one video,
   capped at 40 credits. Poll `video_analysis_status` until it resolves.
7. **Write the teardown** to `Daily-Briefs/teardowns/<slug>-<date>.md`: hook,
   structure, offer, cut cadence, what to steal — one page, not a transcript.
8. **Optional remix brief.** Append a short "for video-director" section to
   the same file if a remix is worth making. This is a brief only — the
   generation itself is a separate, approval-gated step.

## Cost

Sonnet end to end — competitor triage, cross-referencing two data sources, and
brief-writing all need judgment; nothing here is mechanical enough for Haiku
and nothing needs Fable. A subagent invoked for this skill returns a summary
capped at 150 words: the two competitors, the chosen video, pass/fail on the
40-credit cap, and the output path.

## Approval gates

- `video_analysis_create` stops at 40 credits per run — hitting the cap
  without a clear best video is a reason to stop and ask, not overspend.
- Never call an AdWhispr `launch_*` tool from this skill — read-only on every
  ad account, full stop.
- The remix brief is a document, not a video. Any Higgsfield `generate_*`
  spend to actually produce the remix goes to `System/approval-queue.md` first.
- Nothing here sends or publishes — the teardown lands in Daily-Briefs, never
  in front of a client or prospect.

## Output paths

- `Daily-Briefs/teardowns/<slug>-<date>.md` — the teardown, and the optional
  remix-brief section, both in one file.

## References

[[12_Brain/09_Ops/Connector Map]] · [[12_Brain/protocols/Connector Preflight]] · [[.claude/skills/site-grade|site-grade]] · [[.claude/skills/scroll-hero|scroll-hero]]
