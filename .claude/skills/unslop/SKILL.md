---
name: unslop
description: Cut AI tells from client copy, ads, emails, blogs, and landing-page prose. Use when Dillon says unslop, de-AI, or tighten the writing, or when generating marketing copy.
command_deck: false
---

# Unslop

Cut AI tells from agent-authored marketing prose. Keep the meaning. Match the intended voice.

Do not treat this skill as always-on. Upstream pstack applies it to every writing pass. Here it is a named copy pass for drafts that are about to be reviewed. `System/writing-rules.md` wins on conflict. Do not rewrite captures, skills, or harvested client nouns.

## When to run

- Client emails, ads, blogs, GBP posts, landing-page copy, reports Dillon will read
- After a factory or content draft, before calling it ship-ready
- When Dillon says unslop, de-AI, sounds like ChatGPT, or tighten the prose

## When not to run

- `12_Brain/01_Captures/` (immutable)
- Skill files, `AGENTS.md`, `CLAUDE.md` (use `writing-for-agents`)
- Harvested nouns, names, claims, menu items, and taglines in `mirror-and-improve` (keep their words; only unslop sentences the agent invented)
- Bar Crawl USA ads (pre-approved library only; do not invent a cleaner line)
- Anything already sent, published, or live. Unslop the draft. Sending stays gated.

## Process

1. Read `System/writing-rules.md` and any client brand-guidelines named there.
2. Scan for the patterns below.
3. Rewrite. Preserve meaning. Match intended tone.
4. Add voice (see next section) without inventing facts.
5. Self-audit: "What makes this obviously AI generated?" Fix remaining tells.

House style that always applies to Dillon-facing copy:

- No em dashes.
- Contractions.
- Conversational, not corporate.
- Momentum 360 branding on client emails, never Buzz Bull. Align HCM stays off Momentum branding.
- Replenish, not Fresh Blends.

## Voice

Removing patterns is half the job. Sterile writing is still obvious.

For **Dillon or Momentum copy:** have a point of view, vary sentence length, be specific, use "I" when it is actually Dillon talking.

For **a client's site:** voice comes from the harvest. Keep their nouns. Cut agent filler. Do not replace a roast-pork counter with a founder-essay.

Do not add "soul" by inventing a feeling, a founding myth, or a fact that was not in the source.

## Patterns to detect and fix

### Content

1. **Puffery.** "pivotal moment", "testament to", "evolving landscape", "setting the stage for", "indelible mark", "deeply rooted". State what happened.
2. **Name-dropping.** Listing outlets without context. Pick one, say what was said.
3. **Superficial -ing phrases.** "highlighting...", "ensuring...", "reflecting...", "showcasing...", "fostering...". Delete or expand with a real source.
4. **Promotional language.** "nestled", "vibrant", "breathtaking", "groundbreaking", "renowned", "stunning", "must-visit". Use a concrete description.
5. **Vague attributions.** "Experts believe", "Industry reports suggest", "Some critics argue". Name the source or delete.
6. **Formulaic challenges.** "Despite challenges... continues to thrive." Replace with specific facts.

### Language

7. **AI vocabulary.** Additionally, crucial, delve, enduring, enhance, fostering, garner, interplay, intricate, landscape (abstract), pivotal, showcase, tapestry (abstract), testament, underscore, vibrant. Replace with plain words.
8. **Fancy ways to say "is".** "serves as", "stands as", "boasts", "features". Say "is" or "has".
9. **"Not just X, but Y."** State the point directly.
10. **Rule of three.** Forcing ideas into groups of three. Use the natural number.
11. **Synonym cycling.** Four names for the same thing in one paragraph. Pick one, repeat it.
12. **False ranges.** "from X to Y" where X and Y are not on a scale. List the topics.

### Style

13. **Em dashes.** Cut them. Use a period or a comma. Do not swap in parentheses or en dashes as a disguise.
14. **Colon overuse.** Fine before a list. Not as a mid-sentence connector.
15. **Boldface overuse.** Do not bold every proper noun.
16. **Inline-header lists.** "**Performance:** Performance improved..." is a tell. Convert to prose, or a bold lead-in that adds new detail.
17. **Title case headings.** Use sentence case, except where a client brand-guideline says otherwise.
18. **Decorative emojis.** Remove from headings and bullets.
19. **Curly quotes.** Straight quotes.

### Communication artifacts

20. **Chatbot phrases.** "I hope this helps!", "Let me know if...", "Of course!", "Certainly!", "Found the smoking gun!" Remove.
21. **Cutoff disclaimers.** "While specific details are limited..." Find a source or remove.
22. **Sycophantic tone.** "Great question! You're absolutely right!" Answer directly.

### Filler

23. **Filler phrases.** "In order to" becomes "To". "Due to the fact that" becomes "Because". "It is important to note that" gets deleted.
24. **Excessive hedging.** "could potentially possibly" becomes "may".
25. **Generic conclusions.** "The future looks bright." State a plan or a fact.

### Jargon

26. **Abstract metaphor nouns.** Substrate, wedge, vector, locus, vantage, nexus, primitive (as noun), harness (as metaphor), surface (as in "API surface"), bedrock, scaffolding (as metaphor), modality, paradigm, gold-plating, ratchet (as metaphor), north star, flywheel. Pick the concrete word.

### Plain speech

27. **Say what it does.** If the sentence names a feeling ("stays close at hand") and not a mechanism, fact, or number, rewrite or cut it. If the sentence could appear unchanged on another client's site, it says nothing about this one.
28. **Shorten or split dense sentences.** One idea per sentence when the reader would have to backtrack.
29. **Active voice.** Name the actor. Passive is fine when the actor is unknown or does not matter.
30. **Cut adverbs, or use a stronger verb.** Prefer a number over "significantly".
31. **Prefer the plain word.** "utilize" / "leverage" becomes "use". "facilitate" becomes "help". "in the event that" becomes "if".

## Done

The rewritten text has no remaining tell you can name, keeps every sourced fact, and still reads like the intended speaker (Dillon, Momentum, or the harvested client). It is a draft until Dillon approves a send or publish.

Adapted from pstack `unslop` (MIT, Copyright 2026 Lauren Tan). House style and harvest-voice rules are Dillon OS specific.
