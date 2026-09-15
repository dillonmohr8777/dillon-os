---
name: fable-advisor
description: Run creative writing (ebooks, blog posts, ad scripts, VO, brand narrative) through a Fable-model review for voice, tone, narrative shape, and reader experience — as a second-opinion pass distinct from a fact-check or an editorial-rules check. Use after a draft exists, before it ships, when the question is "does this read well and sound like Dillon" rather than "is this factually sourced."
---

# Fable advisor

A creative-review pass that dispatches the actual **Fable 5.1** model (`model: "fable"`
on the Agent tool) to read finished copy and report on it as a reader, not as a
fact-checker. This is deliberately a different kind of review from a sourcing audit
(rules, page numbers, "no invented statistics") or a technical QA pass (contrast
ratios, broken links). Fable judges the thing rules can't: does the voice land, does
the story move, would a real owner keep reading past paragraph two.

## When to use it

- A finished draft of long-form creative content (ebook, blog post, ad script,
  landing-page narrative, VO script) that has already passed its factual/sourcing
  review, and now needs a read for craft.
- Never as a substitute for the sourcing/rules check. Run this *after* that pass,
  not instead of it — Fable is not asked to verify facts, and should not be treated
  as having done so.
- Not for short copy (a single headline, a tagline) where a direct read is faster
  than a subagent round-trip.

## How to run it

Dispatch one Agent call per piece (or a small batch of closely related pieces —
e.g. all five chapters of one ebook in one call, but not five different ebooks in
one call) with `model: "fable"`. Fable has no memory of this conversation, so the
prompt must be fully self-contained:

1. **State what the piece is and who it's for** — the brand (Momentum Digital /
   Momentum AI), the author voice it's written under (Dillon Mohr — Philadelphia
   marketing operator, direct, dry, plain words, first person, no hype adjectives),
   and the intended reader (a specific owner archetype, not "the general public").
2. **Paste or point at the actual draft.** Give the file path and ask Fable to read
   it directly (it has the same file tools) rather than pasting a huge draft inline
   when the file is large.
3. **Ask for a reader's verdict, not a rules audit:**
   - Where does it lose momentum or start to feel like a list of facts stitched
     together rather than a chapter someone wrote?
   - Where does the voice slip — does any passage read like generic AI copy instead
     of a specific person talking?
   - Is the opening line worth the reader's next ten seconds? If not, what would be?
   - Does the ending earn the call to action, or does it just arrive?
   - One paragraph: would you finish this if you found it on a stranger's blog?
4. **Do not ask Fable to fact-check, invent examples, add statistics, or rewrite
   wholesale.** Ask for a verdict and, where useful, a short suggested rewrite of
   the single weakest passage — not a full rewrite of the piece. Fable's job is
   critique and one demonstration edit, not authorship of the final draft.
5. **Bring the verdict back to the user in your own words** — don't just relay
   Fable's raw output. Say what changed your view of the piece, and let the user
   decide whether to act on it. A Fable pass is advisory; it does not gate
   publication the way the sourcing/rules check does.

## What this is not

- Not a fact-checker. Fable's read of "this feels true" is not evidence anything
  in the piece is sourced — that's a separate, already-completed pass.
- Not a ghostwriter. If a piece needs a real rewrite, that's a follow-up task with
  its own scope, not something to fold into the advisory pass silently.
- Not for code, data, or anything where "does it read well" isn't the question.
