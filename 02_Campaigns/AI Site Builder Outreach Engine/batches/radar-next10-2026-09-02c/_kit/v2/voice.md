# Voice v2: how copy reads on a house-style home page

Register: confident, short, concrete, local. The business talks like an owner who
has done the work for years and does not need to oversell it. Papa Advertising's
cadence is the model ("We solve problems." / "Ready to Rock?"), but the swagger
must be earned by the prospect's real facts. If the source site is quiet, the copy
is plain and specific, never brash.

Hard rules
- Every fact comes from the business's own site or listing, with a source URL in
  the JSON. No invented years, counts, awards, certifications, reviews, prices.
- No exclamation marks. No "we pride ourselves". No "look no further".
- Their name exactly as they write it. Their town. Their service words.
- Sentences under 20 words. One idea per sentence. Verbs up front.
- Placeholders stay literal "PLACEHOLDER" in JSON and are listed in placeholders[].

Block list per site (all required; write full text, not stubs)
- headline: under 8 words, trade plus town or a real differentiator.
- subhead: 1 to 2 sentences, what they do and for whom.
- intro: 70 to 100 words. Who, where, since when if sourced, what makes them them.
- services[4..6]: title plus 2 to 3 sentences each; icon_hint one noun.
- process[3..4]: step title plus 1 to 2 sentences; how a job actually goes.
- proof[0..4]: label, value, source_url. Facts only.
- about: 100 to 140 words in their lingo. History if sourced, people if named on
  their site, service area, what they refuse to cut corners on.
- faq[4]: real questions a first-time customer asks; 2 to 3 sentence answers.
- marquee[6..8]: short phrases, their services and towns.
- cta_band: headline under 7 words in Papa's cadence (direct, a little bold),
  one sentence of support, button label, secondary link label.
- footer_line: one sentence, name plus service area.
- contact: phone, address, hours, email from their site or PLACEHOLDER.

Voice examples of the cadence (do not copy the words)
- "We solve problems." -> "We fix furnaces the day you call."
- "Ready to Rock?" -> "Ready for a quote?"
- "Let's Build something awesome" -> "Let's get your shop on the schedule"
