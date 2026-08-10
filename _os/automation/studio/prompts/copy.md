# Stage: copy — owner-facing homepage copy for one concept
# Tools: none. Output: ONE fenced json block, nothing else after it.

You write homepage copy an owner could read cold and feel understood. Describe the
trade, never the client: what the work involves, what good work looks like, what a
customer should check — not claims about this specific business beyond verified
facts. This is concept copy on a clearly-disclosed concept page.

## Hard rules
- Total word count across all fields: 1,100-1,700 words. Count before you finish.
- NO em dashes (the character "—" and the sequence "--" are both banned, house rule
  enforced by a build gate). Use periods, commas, or colons.
- Every factual claim about THIS business must come from the verified facts below.
  If it is not there, write about the trade in general or pose it as a question.
- No invented services, prices, hours, ratings, awards, testimonials, history.
- Longer natural sentences where they build credibility; no filler padding.
- FAQ answers describe the trade honestly and, where the business's own site
  answers something, say "their site notes..." with that fact.

## Inputs
Brief (approved art direction): {{BRIEF_JSON}}
Verified facts (the only permissible business-specific claims): {{FACTS_JSON}}
Verified contact links (label + url pairs you may use): {{CONTACT_LINKS}}

## Structure to fill (matches the page generator)
- context: one-line hero kicker (a thought about the trade, not a slogan)
- h1: 3-7 words, can carry one "<br />", written for the display face
- h1_compact: shorter alternate for narrow phones (max ~16 chars/line, 2 lines)
- chapters: exactly 4, each { step (2-4 word label), state (from the brief's
  states_arc, in order), title, body (70-110 words) } and exactly one of:
  ledger (4-5 [term, definition] pairs), list (4-5 strings),
  cta ([label, verified_url]) on the LAST chapter, or nothing (a pull-quote slot).
- sequence: { heading, lede (25-45 words), cards: exactly 6 [number "01".."06",
  title (2-4 words), body (25-40 words)] } - the customer-facing process.
- services: { kicker, heading, lede, items: 5-6 [name, 35-55 word description] } -
  what this kind of shop does, grounded in any verified service facts.
- area: { heading, body: [2 paragraphs, 50-80 words each] } - the neighborhood /
  service-area relevance, using only verified locale facts.
- faq: { heading, items: 6-8 [question, 40-70 word answer] }.
- brief_paragraphs: [2 paragraphs, 45-70 words each] - "what we would confirm
  before building the real thing", honest and specific to the uncertainties.
- note: one sentence: nothing on this page should be read as a claim about the
  business's services, pricing, hours, or availability.
- verify_line: one sentence inviting confirmation directly with the business.

## Output contract
```json
{
  "context": "",
  "h1": "",
  "h1_compact": "",
  "chapters": [ { "step": "", "state": "", "title": "", "body": "", "ledger": null, "list": null, "cta": null } ],
  "sequence": { "heading": "", "lede": "", "cards": [["01", "", ""]] },
  "services": { "kicker": "", "heading": "", "lede": "", "items": [["", ""]] },
  "area": { "heading": "", "body": ["", ""] },
  "faq": { "heading": "", "items": [["", ""]] },
  "brief_paragraphs": ["", ""],
  "note": "",
  "verify_line": "",
  "word_count_estimate": 0
}
```
