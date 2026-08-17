# IMMOHRTAL Claude Production Briefs

**Purpose:** Give Claude bounded, fact-safe production jobs that turn the existing brand system into human-led social content, SEO assets, outreach, and weekly analysis.

## Source hierarchy

Claude must read these before producing copy:

1. `02_Campaigns/IMMOHRTAL/IMMOHRTAL Brand Direction.md`
2. `02_Campaigns/IMMOHRTAL/Entity Pack.md`
3. `02_Campaigns/IMMOHRTAL/Social/Content Playbook.md`
4. Approved track notes and corrected transcripts only
5. `IMMOHRTAL_CONTENT_UPGRADE_PLAN.md`

If sources conflict, stop and flag the conflict. Never invent a biography detail, release date, quote, lyric, achievement, stream count, review, press mention, collaborator approval, or link.

## Brief 1: 30 direct-to-camera scripts

Create 30 scripts, each 20 to 45 seconds, across Delusion Diary, The Split, Making It, 814/Pittsburgh, First Listen setup, and Audience Verdict. Every script needs:

- A spoken first sentence under 12 words.
- A specific personal fact or tension.
- A complete thought, not a teaser with no payoff.
- One optional natural CTA.
- Two alternate hooks that change only the opening.
- A simple shot note and B-roll suggestion.
- A platform recommendation.

Write in Dillon's sincere, self-aware voice. Confess rather than promote. Avoid marketing jargon, motivational clichés, fake vulnerability, and repeated use of **IF NOT NOW, WHEN.**

## Brief 2: hook laboratory

For each of the ten strongest source stories, create three hook families:

- Conflict first.
- Proof first.
- Question first.

Score each hook for specificity, curiosity, emotional stakes, ease of saying aloud, and risk of sounding manufactured. Recommend one test order, but preserve every variant for controlled testing.

## Brief 3: track-story system

For each track with verified notes, create:

- A 100-word story card.
- A 30-second spoken explanation.
- A seven-slide carousel outline.
- Three non-lyric discussion questions.
- One search-friendly page outline.
- One press or playlist-context paragraph.

Any lyric excerpt must be copied only from a corrected, approved source and marked for final human approval.

## Brief 4: first-listen production pack

Create eight unscripted reaction-session setups with:

- Who to invite and why that perspective matters.
- The neutral pre-listen question.
- The camera and audio setup.
- The music segment to use, marked pending approval.
- Three post-listen follow-ups that do not lead the witness.
- A 15-second, 30-second, and 45-second edit map.

Do not write reactions for the listener or ask anyone to pretend surprise.

## Brief 5: native caption bank

Create platform-specific captions for the approved 30-day calendar:

- TikTok: conversational and minimal.
- Instagram: concise context plus one action.
- YouTube Shorts: a searchable title and description.
- LinkedIn: a complete honest observation, not a sales post.
- Facebook: personal and locally shareable.

Use one CTA at most. Include a UTM content ID field. Flag any post that depends on an unverified link, date, lyric, number, or platform feature.

## Brief 6: SEO and AI-discovery cluster

Create a prioritized 12-page content map across branded/entity, Erie/814, Pittsburgh, CMO-to-rapper, independent album process, and individual track topics. For every page provide:

- Primary search intent and audience question.
- Proposed title, slug, definition block, and page outline.
- First-party facts or media required.
- Internal links and conversion action.
- Appropriate schema type based on visible content.
- A reason the page deserves to exist beyond ranking.

Avoid generic keyword filler and mass-produced location pages. Recommend FAQ content only for questions the page actually answers.

## Brief 7: authority and press kit expansion

Create:

- One 80-word bio, one 200-word bio, and one full narrative bio.
- Erie/814, Pittsburgh, independent hip-hop, and marketing-trade pitch angles.
- Six personalized pitch-email frameworks.
- A press FAQ and interview question bank.
- A fact sheet with every field traced to the source file.
- A press-mention log template.

Do not claim coverage, reviews, charting, awards, or audience size that is not verified.

## Brief 8: creator and community outreach

Design a qualification rubric and message framework for:

- Erie and Pittsburgh creators.
- Independent hip-hop reviewers.
- Marketing creators interested in the CMO/artist story.
- College radio and local podcasts.
- Fathers and late-starting creatives with authentic audience overlap.

Claude may create templates, research criteria, and personalization fields. It must not invent a contact list or pretend a creator has been researched without live evidence.

## Brief 9: comment and community playbook

Create a response bank organized by praise, honest criticism, lyric questions, production questions, late-starting creatives, local identity, collaborator questions, and trolling. Responses must sound like a person and lead to conversation rather than paste the same campaign line.

Also create 25 audience questions that can become polls, Story stickers, reply videos, or live-session prompts.

## Brief 10: weekly analytics memo

Given exported platform data and `IMMOHRTAL_WEEKLY_SCORECARD.csv`, produce a one-page memo with:

- Confirmed facts and reporting window.
- Top two posts and the likely causal pattern.
- One post to repackage and why.
- One idea to stop.
- Three controlled tests for next week.
- Funnel movement from reach to confirmed fan action.
- Data gaps and attribution caveats.

Use the account's own history as the benchmark. Separate Instagram, TikTok, YouTube, LinkedIn, and Facebook. Report counts as whole numbers. Do not merge incompatible attribution windows.

## Brief 11: long-form repurposing

Turn one approved 10-to-20-minute Dillon interview into:

- One YouTube story outline.
- One first-person blog draft.
- One LinkedIn post.
- Four vertical-video scripts.
- Ten short text posts.
- One subscriber email.
- A list of exact source timestamps for every claim and quotation.

Preserve Dillon's spoken language. Remove repetition without sanitizing the personality.

## Brief 12: adversarial quality review

Before delivery, have Claude act as a skeptical fan, platform editor, music journalist, and brand guardian. It should flag:

- Anything generic, overdesigned, self-important, or unclear.
- Hooks that sound written rather than spoken.
- Posts where the campaign line substitutes for a real point.
- Unsupported facts, copied phrasing, or questionable lyric use.
- Repetition across the month.
- A CTA that does not match the viewer's stage.
- A design asset being used where a human clip would be stronger.

Claude should suggest the smallest useful revision and preserve the core voice.

## Master prompt

```text
You are the production editor for IMMOHRTAL, Dillon Mohr's independent artist project. Read the required source files before writing. The central story is a CMO who spent years marketing other people and is finally releasing the rap album he kept talking himself out of. The voice is sincere, specific, self-aware, and never generic. Confess; do not promote.

Use only verified facts from the source hierarchy. Never invent biography, lyrics, dates, links, metrics, praise, reactions, press, or achievements. Mark missing information as PENDING. Lyrics require corrected-source and human approval. Mac Miller can be discussed only as a verified influence, never as an affiliation or endorsement.

Optimize discovery content for a human opening: Dillon's face or voice, visible reaction, specific conflict, or approved music proof in the first two seconds. Designed assets support the story; they are not the story. Use one natural CTA at most. Vary the closer and do not force IF NOT NOW, WHEN into every post.

For each deliverable, include: source facts used, assumptions, approval flags, platform adaptation, content ID, and the metric that would prove the idea worked. Return finished copy plus a short adversarial review.
```

## Recommended production order

1. Direct-to-camera scripts and hook laboratory.
2. First-listen pack and weekly capture batch.
3. Native captions for the first seven days only.
4. Track-story system after lyrics and excerpts are approved.
5. SEO cluster and cornerstone pages.
6. Press and creator outreach after release details are verified.
7. Weekly analytics memo after the first complete reporting window.
