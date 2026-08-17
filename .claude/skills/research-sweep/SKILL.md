---
name: research-sweep
description: The research machine that feeds the vault — split a question into sub-questions, fan out parallel searchers across different surfaces, collect receipts, let a fresh-context skeptic attack every claim, and land only survivors as dated, sourced, expiring vault pages. Usage - /research-sweep <question>.
---

# Research Sweep

Research, not rumor collection. Input: one question (from args, or ask).

## 1. Split

Break the question into 3–5 sub-questions covering different angles
(practitioner experience, official docs/pricing, competitors, failure modes).

## 2. Fan out

Launch parallel subagents, each owning one sub-question on a different
surface — use whatever is connected this session (WebSearch/WebFetch always;
X MCP, ScrapeCreators/last30days, yt-dlp, Perplexity, Firecrawl if available).
Prioritize the practitioner layer (socials, forums, recent threads) over
6-month-old blog posts — in AI/marketing, stale advice is often actively wrong.

Every finding comes back as a **receipt**: claim + source link + date. No
receipt, no finding.

## 3. Skeptic gate

Spawn a fresh subagent that did NOT do the research. It attacks every claim:

- single-source hype → labeled `single-source`
- contradicted elsewhere → both sides surfaced
- undated / unverifiable → killed

Only survivors pass. Fresh-context checkers outperform a model reviewing its
own work — never let a researcher grade its own findings.

## 4. Land it

- Full receipts + skeptic verdicts → `12_Brain/raw/research/YYYY-MM-DD - research - <topic>.md`
  (also acceptable: `12_Brain/raw/YYYY-MM-DD - research - <topic>.md`)
  (untouched from here on).
- Survivors → compiled into `12_Brain/concepts/` (or `12_Brain/entities/`) pages: one-line
  summary, `source:` to the raw file, `updated:` today, `expires:` date
  matched to how fast the topic moves (fast-moving AI/ads topics: ~90 days).
  Update existing pages instead of duplicating; `[[link]]` related pages.
- Add new pages to `12_Brain/INDEX.md` and link from `12_Brain/research/README.md` when the topic is research-shaped.
- Reply with: survivors (one line each), what got killed and why, and
  `git diff --stat`.
