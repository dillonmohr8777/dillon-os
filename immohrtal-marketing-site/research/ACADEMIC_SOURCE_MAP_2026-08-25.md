# Academic source map — IMMOHRTAL Insights

Research date: 2026-08-25  
Scope: 10 production articles in `content/articles.mjs`  
Source discovery and validation: Exa searches followed by direct page extraction  
Publication rule: every external article link resolves to an academic paper, conference proceeding, scholarly journal, or university-hosted preprint. Vendor blogs, product documentation, commercial SEO blogs, and unsupported statistics are excluded from the article source lists.

## Editorial implementation standard

Each article now contains:

- one direct answer before the long-form body;
- six natural-language keyword targets used as an editorial map, not a density quota;
- four visible FAQs with plain-text answers for paired FAQPage markup;
- four scholarly external sources with a short statement of relevance;
- four internal destinations spanning the owning service, an adjacent guide, and a next action;
- at least 1,150 editorial words when the direct answer, body, and visible FAQs are counted.

Preprints are labeled as preprints in the source organization or note. A preprint is useful research evidence, but it is not represented as peer reviewed unless a conference or journal publication is independently established.

## Article-to-source matrix

| Article | Primary research role | Scholarly sources | Internal destinations |
|---|---|---|---|
| AEO vs GEO for service businesses | Define GEO, distinguish retrievable answers from generative citation, and qualify citation claims | GEO (ACM SIGKDD / arXiv); What Gets Cited (ACM SIGIR / arXiv); Structural Feature Engineering for GEO (preprint); SourceBench (preprint) | `/aeo-geo/`; Google AI Overviews guide; AI visibility measurement; schema guide |
| Google AI Overviews for service businesses | Ground source-selection, volatility, claim-support, and structure recommendations | Measuring Google AI Overviews (preprint); How Generative AI Disrupts Search (preprint); SourceBench (preprint); Structural Feature Engineering for GEO (preprint) | `/aeo-geo/`; JavaScript SEO; entity-first architecture; AI visibility measurement |
| Website redesign checklist | Connect visual trust, perceived quality, mobile conditions, and rendering architecture to redesign QA | The Impact of Website Design on Users’ Trust (ACM); Core Web Vitals and actual web QoE (Springer Nature); Web Experience in Mobile Networks (ACM); Next.js and React comparison (preprint) | `/web-design-optimization/`; `/work/`; JavaScript SEO; `/contact/` |
| Schema markup for service businesses | Explain snippet types, explicit entities, and relationships without promising a search feature | The Snippets Taxonomy (Springer / arXiv); Entity-Duet Neural Ranking (ACL); Hypergraph-of-Entity (ACM / arXiv); Structural Feature Engineering for GEO (preprint) | `/aeo-geo/`; entity-first architecture; Google AI Overviews guide; `/contact/` |
| AI search crawlers, discovery, and citations | Separate robots preferences, crawler behavior, browser-based crawling, and citation selection | Scrapers selectively respect robots.txt (preprint); Survey of Web Content Control for Generative AI; Sprinter (USENIX NSDI); How Generative AI Disrupts Search (preprint) | JavaScript SEO; AI visibility measurement; `/aeo-geo/`; schema guide |
| JavaScript SEO for React | Explain why ready HTML reduces rendering dependency and supports variable networks and devices | Sprinter (USENIX NSDI); Next.js and React comparison (preprint); Web Experience in Mobile Networks (ACM); Core Web Vitals and actual web QoE (Springer Nature) | `/web-design-optimization/`; crawler guide; Google AI Overviews guide; `/contact/` |
| HubSpot, website forms, and business agents | Ground CRM integration, governed execution, human oversight, and interaction design | AI in CRM integration (Journal of Business Research); POLARIS (preprint); Human–AI combinations meta-analysis (Nature Human Behaviour); Human–AI interaction taxonomy (Frontiers) | `/business-agents/`; approval-gates guide; `/contact/`; entity-first architecture |
| Measuring AI search visibility | Support a sampled, multi-signal measurement model instead of a fabricated universal rank | Measuring Google AI Overviews (preprint); GEO (ACM SIGKDD / arXiv); What Gets Cited (ACM SIGIR / arXiv); SourceBench (preprint) | `/aeo-geo/`; crawler guide; Google AI Overviews guide; `/contact/` |
| Entity-first content architecture | Ground joint word/entity retrieval, explicit relationships, structure, and source quality | Hypergraph-of-Entity (ACM / arXiv); Entity-Duet Neural Ranking (ACL); Structural Feature Engineering for GEO (preprint); SourceBench (preprint) | schema guide; `/aeo-geo/`; AEO vs GEO; `/contact/` |
| Human approval gates for marketing agents | Explain why oversight must be designed as an enforceable interaction and execution boundary | Human–AI combinations meta-analysis (Nature Human Behaviour); Human–AI interaction taxonomy (Frontiers); POLARIS (preprint); AI in CRM integration (Journal of Business Research) | `/business-agents/`; HubSpot and agents guide; `/contact/`; entity-first architecture |

## Validated source catalog

1. [GEO: Generative Engine Optimization](https://arxiv.org/html/2311.09735v2) — 2024 ACM SIGKDD research introducing GEO and a visibility benchmark.
2. [What Gets Cited: Competitive GEO in AI Answer Engines](https://arxiv.org/html/2605.25517) — controlled 2026 citation experiments associated with ACM SIGIR.
3. [Structural Feature Engineering for Generative Engine Optimization](https://arxiv.org/html/2603.29979) — 2026 arXiv preprint on document architecture, chunking, and citation behavior.
4. [SourceBench: Can AI Answers Reference Quality Web Sources?](https://arxiv.org/html/2602.16942) — 2026 arXiv preprint proposing a human-labeled source-quality benchmark.
5. [Measuring Google AI Overviews: Activation, Source Quality, Claim Fidelity, and Publisher Impact](https://doi.org/10.48550/arxiv.2605.14021) — 2026 Washington University in St. Louis preprint.
6. [How Generative AI Disrupts Search](https://arxiv.org/abs/2604.27790) — 2026 preprint comparing traditional search, Gemini, and AI Overviews.
7. [The Impact of Website Design on Users’ Trust](https://dl.acm.org/doi/10.1145/3419249.3420086) — Nordic Conference on Human-Computer Interaction proceeding.
8. [Do you agree? Contrasting Google’s Core Web Vitals and the impact of cookie consent banners with actual web QoE](https://link.springer.com/article/10.1007/s41233-023-00058-3) — 2023 open-access research article in *Quality and User Experience*.
9. [Web Experience in Mobile Networks: Lessons from Two Million Page Visits](https://dl.acm.org/doi/10.1145/3308558.3313606) — large-scale empirical paper from The Web Conference.
10. [Evaluating the Efficacy of Next.js: A Comparative Analysis with React.js](https://arxiv.org/html/2502.15707v1) — 2025 New York University Abu Dhabi preprint.
11. [The Snippets Taxonomy in Web Search Engines](https://arxiv.org/abs/1906.04497) — academic analysis of 50,000 localized search results.
12. [Entity-Duet Neural Ranking](https://aclanthology.org/P18-1223/) — peer-reviewed ACL 2018 paper on entity and word representations in retrieval.
13. [Hypergraph-of-Entity: A General Model for Entity-Oriented Search](https://arxiv.org/abs/2109.00450) — entity-oriented information-retrieval research.
14. [Scrapers selectively respect robots.txt directives](https://arxiv.org/html/2505.21733) — 2025 Duke University empirical preprint.
15. [A Survey of Web Content Control for Generative AI](https://arxiv.org/html/2404.02309v1) — University of Passau academic survey.
16. [Sprinter: Speeding Up High-Fidelity Crawling of the Modern Web](https://www.usenix.org/system/files/nsdi24-goel.pdf) — peer-reviewed USENIX NSDI 2024 systems paper.
17. [Artificial intelligence in customer relationship management](https://www.sciencedirect.com/science/article/pii/S0148296325003546) — 2025 *Journal of Business Research* article on AI-CRM integration.
18. [POLARIS: Typed Planning and Governed Execution for Agentic AI](https://doi.org/10.48550/arxiv.2601.11816) — 2026 arXiv preprint on policy-aware orchestration.
19. [When combinations of humans and AI are useful](https://www.nature.com/articles/s41562-024-02024-1) — 2024 systematic review and meta-analysis in *Nature Human Behaviour*.
20. [Human-AI collaboration is not very collaborative yet](https://www.frontiersin.org/journals/computer-science/articles/10.3389/fcomp.2024.1521066/full) — systematic review and interaction taxonomy in *Frontiers in Computer Science*.

## Renderer field contract

The editorial data uses these optional fields on every article:

```js
{
  keywords: ['primary query', 'supporting query'],
  faqs: [
    { question: 'Plain-text question?', answer: 'Plain-text answer.' },
  ],
  sources: [
    { title: 'Paper title', organization: 'Journal or academic host', url: 'https://...', note: 'Why the paper is relevant.' },
  ],
  related: [
    ['/absolute-site-path/', 'Descriptive anchor label'],
  ],
}
```

FAQPage structured data must be emitted only when the same FAQ pairs are visible on the page. Article structured data may use `keywords`, `citation`, and `about`, but markup must never introduce a claim, review, credential, or entity that the visible page does not support.
