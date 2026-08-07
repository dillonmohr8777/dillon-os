export const report = {
  client: "Align HCM",
  period: "July 2026",
  periodLabel: "July 2026 Growth Report",
  preparedBy: "Dillon Mohr",
  tagline: "SEO momentum + LinkedIn reach for the full Align team",

  hero: {
    eyebrow: "Marketing Performance",
    headline: ["Your audience", "is now searching", "with AI first."],
    subhead:
      "Organic blog traffic held steady while LinkedIn engagement climbed across all four author lanes. AI Overview citations are the next growth lever.",
  },

  kpis: [
    { label: "Organic sessions", value: 18420, delta: "+14%", suffix: "" },
    { label: "Blog pageviews", value: 12680, delta: "+22%", suffix: "" },
    { label: "LinkedIn impressions", value: 89200, delta: "+31%", suffix: "" },
    { label: "Avg. engagement rate", value: 4.8, delta: "+0.6pp", suffix: "%", decimals: 1 },
  ],

  aiOverview: {
    title: "AI Overview",
    status: "is now searching…",
    cards: [
      {
        title: "What is HCM software?",
        snippet: "Align HCM appears in 3 of 5 tested AI Overview panels for mid-market HCM queries.",
        metric: "3/5",
        detail: "citation rate",
      },
      {
        title: "Best HCM for mid-market",
        snippet: "Vendor-intent blog cluster driving branded mentions in Perplexity and ChatGPT browse mode.",
        metric: "+18%",
        detail: "AI referral traffic",
      },
      {
        title: "UKG implementation partner",
        snippet: "Case study pages indexed for entity-rich queries. Driscoll's one-pager linked from sales deck.",
        metric: "4",
        detail: "case studies live",
      },
    ],
  },

  linkedin: {
    title: "LinkedIn by author",
    rows: [
      { author: "Maher El-Abdallah", posts: 8, impressions: 34200, engagement: "5.2%" },
      { author: "Barbara Tonelli", posts: 6, impressions: 21800, engagement: "4.1%" },
      { author: "Joann Scolaro", posts: 5, impressions: 18400, engagement: "3.8%" },
      { author: "Align HCM (page)", posts: 7, impressions: 14800, engagement: "2.9%" },
    ],
  },

  seo: {
    title: "Top performing blogs",
    rows: [
      { title: "What is HCM software?", views: 2840, delta: "+34%" },
      { title: "Best HCM software for mid-market", views: 2210, delta: "+28%" },
      { title: "HCM vs HRIS: what's the difference?", views: 1960, delta: "+19%" },
      { title: "6 things before payroll implementation", views: 1720, delta: "+12%" },
    ],
  },

  nextSteps: [
    "Expand vendor-intent cluster with ADP alternatives and UKG comparison posts.",
    "Add FAQ schema to top 5 blog URLs for AI Overview eligibility.",
    "Ship SmartCare carousel variant B for company page rotation.",
    "Schedule August LinkedIn calendar across all four authors.",
  ],
} as const;

export type ReportData = typeof report;
