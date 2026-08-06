---
note_type: research
status: verified-with-caveats
created: 2026-08-01
updated: 2026-08-01
expires: 2026-10-30
owner: Dillon Mohr
question: "Which Grok 4.5, X Search, AEO, and Imagine claims are safe to operationalize?"
verification_status: partial
source_refs:
  - "https://docs.x.ai/developers/grok-4-5"
  - "https://docs.x.ai/developers/tools/x-search"
  - "https://x.ai/news/workflows"
  - "https://hermes-agent.nousresearch.com/docs/user-guide/features/x-search"
  - "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide"
  - "https://help.openai.com/en/articles/12627856-publishers-and-developers-faq"
  - "https://docs.x.ai/developers/model-capabilities/imagine"
  - "https://x.ai/news/grok-imagine-video-1-5-references"
tags: [research, grok, x-search, aeo, creative]
---

# Grok marketing OS verification

Grok is operationally useful for fresh, read-only X evidence, but every downstream claim and creative remains source-checked, client-scoped, and approval-gated.

## Survivors

- Grok 4.5 supports X Search, web search, code execution, and agentic workflows; use native X Search as a fresh evidence surface, not as proof by itself.
- Hermes can route read-only X Search through xAI subscription OAuth, but account allowlist failures are documented and the local [[12_Brain/entities/Hermes|Hermes]] worker is retired.
- Grok Build workflows can fan out research and include skeptics. Vendor documentation does not prove that every output is correct, so Dillon OS keeps its own independent checker.
- Durable AEO work remains ordinary quality and technical accessibility: unique expert content, clear answers, crawlability, accurate entities, visible dates, and supported citations.
- Grok Imagine supports image editing and image-to-video. Reference locking is useful, but no official benchmark guarantees exact production logo fidelity.
- Multi-reference video capability was announced on 2026-07-31 with a staged rollout; availability must be checked at execution time.

## Claims reduced to experiments

- A 40–60-word FAQ answer is a formatting experiment, not a proven universal citation factor.
- A 30/60/90-day refresh cadence is a review experiment, not a universal decay law.
- Structured data can improve ordinary understanding and rich-result eligibility, but it is not a primary or guaranteed AI-citation lever.
- Engagement ranking helps triage X posts but can reward gaming; authoritative checks determine whether a claim can be labeled verified.

## Claims killed

- “Imagine Omni” as an official xAI model or mode — no official model listing supports it.
- “Pixel-faithful” or guaranteed exact logo preservation — unsupported; require visual review against the hash-locked source.
- Any implication that Hermes OAuth permits likes, replies, reposts, DMs, or publishing — X Search is read-only.
- Any universal freshness threshold or guaranteed AI citation lift — unsupported by Google or OpenAI documentation.
- Any claim that Grok’s verifier guarantees truth — product documentation describes a verification phase, not a measured factuality guarantee.

## Operating consequence

The executable controls live in [[12_Brain/projects/2026-08-01 - Client-scoped Grok marketing OS|Client-scoped Grok marketing OS]] and `12_Brain/registry/automations.json`. X and web output is evidence input only; it cannot authorize CRM writes, sends, publishing, spending, deployment, or client delivery.
