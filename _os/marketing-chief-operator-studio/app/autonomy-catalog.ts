export interface ChiefCapability {
  rank: number;
  id: string;
  name: string;
  role: string;
  group: "orchestrate" | "understand" | "create" | "optimize" | "measure" | "operate";
}

export interface PredictionCapability {
  id: string;
  name: string;
  scope: "project" | "global";
  lane: "data" | "retrieval" | "evaluate" | "train" | "serve" | "govern";
  role: string;
}

export const skillInventoryCount = 943;

export const everydayStack = [
  "marketing-ops",
  "customer-research",
  "ads / content-strategy",
  "analytics",
  "campaign-analytics",
  "revenue-operations"
] as const;

export const chiefCapabilities: ChiefCapability[] = [
  { rank: 1, id: "marketing-ops", name: "Marketing Ops", role: "Campaign, channel, content, SEO, CRO, and analytics orchestration", group: "orchestrate" },
  { rank: 2, id: "campaign-analytics", name: "Campaign Analytics", role: "Attribution, funnel performance, ROI, ROAS, CPA, and reporting", group: "measure" },
  { rank: 3, id: "ads", name: "Ads", role: "Google, Meta, and LinkedIn targeting, bidding, budget, and optimization", group: "create" },
  { rank: 4, id: "revenue-operations", name: "Revenue Operations", role: "Pipeline, forecasting, sales efficiency, and revenue connection", group: "measure" },
  { rank: 5, id: "analytics", name: "Analytics", role: "GA4, GTM, conversions, UTMs, events, and attribution", group: "measure" },
  { rank: 6, id: "cmo-advisor", name: "CMO Advisor", role: "Positioning, growth models, channel allocation, budgets, and leadership", group: "orchestrate" },
  { rank: 7, id: "customer-research", name: "Customer Research", role: "ICP, voice of customer, interviews, reviews, personas, and motivations", group: "understand" },
  { rank: 8, id: "competitive-intel", name: "Competitive Intel", role: "Competitors, positioning, battlecards, market change, and win/loss", group: "understand" },
  { rank: 9, id: "content-strategy", name: "Content Strategy", role: "Audience, editorial priorities, and content-to-growth alignment", group: "orchestrate" },
  { rank: 10, id: "copywriting", name: "Copywriting", role: "Websites, offers, headlines, CTAs, and conversion messaging", group: "create" },
  { rank: 11, id: "ad-creative", name: "Ad Creative", role: "Cross-channel campaign concepts and iterative creative production", group: "create" },
  { rank: 12, id: "cro", name: "CRO", role: "Landing pages, forms, lead capture, and conversion improvement", group: "optimize" },
  { rank: 13, id: "social", name: "Social", role: "Calendars, LinkedIn, carousels, short-form scripts, and listening", group: "create" },
  { rank: 14, id: "emails", name: "Emails", role: "Nurture, welcome, re-engagement, lifecycle, and automation", group: "create" },
  { rank: 15, id: "content-production", name: "Content Production", role: "Publication-ready articles, guides, and supporting assets", group: "create" },
  { rank: 16, id: "seo-audit", name: "SEO Audit", role: "Technical SEO, on-page issues, metadata, rankings, and site health", group: "optimize" },
  { rank: 17, id: "ai-seo", name: "AI SEO", role: "Visibility in AI answers, overviews, and emerging discovery surfaces", group: "optimize" },
  { rank: 18, id: "analytics-tracking", name: "Analytics Tracking", role: "Event taxonomies, GTM implementation, debugging, and data quality", group: "measure" },
  { rank: 19, id: "impeccable", name: "Impeccable", role: "Web, app, dashboard, responsive design, and visual polish", group: "create" },
  { rank: 20, id: "browser-automation", name: "Browser Automation", role: "Repeatable research, extraction, screenshots, and form workflows", group: "operate" },
  { rank: 21, id: "agent-workflow-designer", name: "Agent Workflow Designer", role: "Repeatable agent systems and operating automations", group: "operate" },
  { rank: 22, id: "alignhcm-brand", name: "Align HCM Brand", role: "Exact Align HCM and SmartCare brand execution", group: "create" },
  { rank: 23, id: "alignhcm-smartcare", name: "Align HCM SmartCare", role: "SmartCare GTM, positioning, pricing, offers, and case studies", group: "understand" },
  { rank: 24, id: "imagegen", name: "Image Generation", role: "Campaign imagery, mockups, illustration, and branded variations", group: "create" },
  { rank: 25, id: "video", name: "Video", role: "Demos, explainers, social video, and reusable production pipelines", group: "create" }
];

export const predictionCapabilities: PredictionCapability[] = [
  { id: "hf-cli", name: "HF CLI", scope: "project", lane: "serve", role: "Versioned model, dataset, repository, and local-cache operations" },
  { id: "hf-mem", name: "HF Memory Estimator", scope: "project", lane: "serve", role: "Weights and KV-cache fit checks before a local model is selected" },
  { id: "huggingface-best", name: "HF Model Finder", scope: "project", lane: "serve", role: "Benchmark-backed candidate discovery with hardware-fit filtering" },
  { id: "huggingface-community-evals", name: "Community Evals", scope: "project", lane: "evaluate", role: "Local smoke tests and held-out benchmark runs across inference backends" },
  { id: "huggingface-datasets", name: "HF Datasets", scope: "project", lane: "data", role: "Read-only dataset inspection, split discovery, statistics, and extraction" },
  { id: "huggingface-llm-trainer", name: "LLM Trainer", scope: "project", lane: "train", role: "SFT, DPO, GRPO, reward modeling, cost checks, and durable model output" },
  { id: "huggingface-local-models", name: "Local Models", scope: "project", lane: "serve", role: "GGUF, quantization, and private OpenAI-compatible local serving" },
  { id: "huggingface-trackio", name: "Trackio", scope: "project", lane: "evaluate", role: "Experiment metrics, alerts, diagnostics, and autonomous run monitoring" },
  { id: "train-sentence-transformers", name: "Sentence Transformers", scope: "project", lane: "retrieval", role: "Dense retrieval, reranking, sparse retrieval, and hard-negative learning" },
  { id: "trl-training", name: "TRL Training", scope: "project", lane: "train", role: "Reproducible preference alignment and reinforcement-learning workflows" },
  { id: "senior-data-scientist", name: "Senior Data Scientist", scope: "global", lane: "evaluate", role: "Predictive modeling, causal inference, calibration, and experiment design" },
  { id: "statistical-analyst", name: "Statistical Analyst", scope: "global", lane: "evaluate", role: "Power, confidence intervals, effect sizes, and decision validity" },
  { id: "data-quality-auditor", name: "Data Quality Auditor", scope: "global", lane: "data", role: "Completeness, consistency, validity, uniqueness, and freshness gates" },
  { id: "senior-data-engineer", name: "Senior Data Engineer", scope: "global", lane: "data", role: "Idempotent pipelines, contracts, lineage, and recurrence-safe processing" },
  { id: "senior-ml-engineer", name: "Senior ML Engineer", scope: "global", lane: "serve", role: "Model registry, drift monitoring, rollback, serving, and cost controls" },
  { id: "autoresearch-agent", name: "Autoresearch Agent", scope: "global", lane: "evaluate", role: "One-variable shadow experiments against an immutable evaluator" },
  { id: "rag-architect", name: "RAG Architect", scope: "global", lane: "retrieval", role: "Hybrid retrieval, reranking, grounded context, and retrieval evaluation" },
  { id: "prompt-governance", name: "Prompt Governance", scope: "global", lane: "govern", role: "Prompt registry, golden sets, versioning, promotion, and rollback" },
  { id: "observability-designer", name: "Observability Designer", scope: "global", lane: "govern", role: "SLIs, SLOs, metrics, traces, alerts, and proof-carrying runbooks" },
  { id: "ai-security", name: "AI Security", scope: "global", lane: "govern", role: "Injection, poisoning, inversion, tool-abuse, and output-filtering controls" }
];

export const predictionLaneOrder = ["data", "retrieval", "evaluate", "train", "serve", "govern"] as const;
