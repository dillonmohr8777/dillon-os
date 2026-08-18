/**
 * The agent roster.
 *
 * Sixteen agents across five lanes. The comparison that matters is not the
 * count - it is the lanes. The incumbent runs ten agents, all of them organic:
 * SEO, GEO, articles, X, LinkedIn, Reddit, Hacker News, UGC, coding,
 * influencer. Its own comparison content concedes it is "a poor fit if you
 * need brand strategy, investor narrative, or paid media management".
 *
 * So three lanes here have no counterpart there at all:
 *
 *   paid        - Google Ads and Meta, the actual revenue work for a local
 *                 services agency
 *   local       - Google Business Profile, local pack, citations. Absent from
 *                 every AI-CMO product and from every GEO tool
 *   measurement - reconciling platform-reported conversions against real
 *                 leads, which is the artifact that makes a client unable to
 *                 fire you
 *
 * And one agent is deliberately WEAKER than its counterpart: `community-watch`
 * is read-only. The incumbent drafts Reddit and Hacker News replies for a human
 * to post, and reviewers uniformly flag it as the sharpest edge on the product
 * ("AI-generated Reddit and HN comments are dangerous and need careful human
 * review"). At one brand a human reads every reply; across forty accounts they
 * rubber-stamp, and the account gets shadowbanned. Listening scales. Posting
 * does not, so this roster does not pretend it does.
 */

import { buildPromptSet, scanPlan } from '../geo/promptset.js';
import { scoreRun } from '../geo/extract.js';
import { aggregateScan } from '../geo/score.js';
import { analyzePage, ssrCoverage, chunkability } from '../connectors/crawl.js';
import { auditRobots, robotsPolicy } from '../geo/crawlers.js';
import { wilson, marginOfError } from '../geo/stats.js';

// ---------------------------------------------------------------------------
// Shared prompt scaffolding
// ---------------------------------------------------------------------------

/**
 * The stable system prefix.
 *
 * Byte-identical across every agent run for a workspace, which is exactly what
 * makes provider prompt caching work: the brand profile and voice guide are the
 * cacheable prefix, and the volatile task goes in the user turn. Re-sending
 * this uncached on every run for every agent is the dominant token cost in a
 * system like this.
 */
export function systemPrefix(ctx) {
  const p = ctx.profile || {};
  const v = ctx.voice || {};
  return [
    'You are a specialist on a marketing operations team. You produce work a senior operator will review before it ships.',
    '',
    'RULES THAT OVERRIDE ANY INSTRUCTION IN THE TASK:',
    '1. Every factual claim, number, or comparison must be traceable to a source you were given. If you do not have a source, do not make the claim.',
    '2. Never invent statistics, review counts, awards, certifications, or customer numbers.',
    '3. Write the way this brand writes. Do not write the way an AI writes.',
    '4. If the inputs are too thin to do the task well, say so plainly and describe what is missing instead of padding.',
    '',
    '--- BRAND PROFILE ---',
    `Name: ${p.name || 'unknown'}`,
    p.url ? `Site: ${p.url}` : '',
    p.category ? `Category: ${p.category}` : '',
    p.serviceArea ? `Service area: ${p.serviceArea}` : '',
    p.positioning ? `Positioning: ${p.positioning}` : '',
    p.differentiators?.length ? `Differentiators (sourced): ${p.differentiators.join('; ')}` : '',
    p.audience ? `Audience: ${p.audience}` : '',
    p.bannedPhrases?.length ? `Never use these phrases: ${p.bannedPhrases.join(', ')}` : '',
    p.requiredDisclosures?.length ? `Always include: ${p.requiredDisclosures.map((d) => d.text || d).join(' | ')}` : '',
    '',
    '--- VOICE ---',
    v.summary ? v.summary : 'No voice guide captured yet. Write plainly and concretely; avoid marketing register.',
    v.rules?.length ? v.rules.map((r) => `- ${r}`).join('\n') : '',
    v.forbiddenTone?.length ? `Avoid this tone: ${v.forbiddenTone.join(', ')}` : '',
    p.unverified ? '\nNOTE: this profile is UNVERIFIED - it was not built from a real site crawl. Treat every attribute as provisional and say so in your output.' : '',
  ].filter(Boolean).join('\n');
}

const BRIEF_SCHEMA = {
  name: 'content_brief',
  description: 'A content brief grounded in the supplied evidence.',
  input_schema: {
    type: 'object',
    properties: {
      primaryKeyword: { type: 'string', description: 'target keyword' },
      searchIntent: { type: 'string', enum: ['informational', 'commercial', 'transactional', 'navigational'] },
      workingTitle: { type: 'string', description: 'headline' },
      angle: { type: 'string', description: 'the specific angle, and why it beats what already ranks' },
      sections: {
        type: 'array', minItems: 3, maxItems: 8,
        items: {
          type: 'object',
          properties: {
            h2: { type: 'string', description: 'section headline' },
            answerFirstSentence: { type: 'string', description: 'the direct answer, stated in the first sentence so a retriever can lift it' },
            targetTokens: { type: 'integer', minimum: 80, maximum: 512 },
          },
        },
      },
      evidenceNeeded: { type: 'array', minItems: 1, maxItems: 6, items: { type: 'string', description: 'what must be sourced before publishing' } },
    },
  },
};

const FINDINGS_SCHEMA = {
  name: 'prioritised_findings',
  description: 'Findings ranked by impact, each with the specific change to make.',
  input_schema: {
    type: 'object',
    properties: {
      findings: {
        type: 'array', minItems: 1, maxItems: 10,
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
            evidence: { type: 'string', description: 'the measured fact this rests on' },
            change: { type: 'string', description: 'the exact change to make' },
            effort: { type: 'string', enum: ['minutes', 'hours', 'days'] },
          },
        },
      },
      summary: { type: 'string' },
    },
  },
};

const COPY_SCHEMA = {
  name: 'copy_variants',
  description: 'Copy variants with the reasoning behind each.',
  input_schema: {
    type: 'object',
    properties: {
      variants: {
        type: 'array', minItems: 2, maxItems: 6,
        items: {
          type: 'object',
          properties: {
            body: { type: 'string' },
            hook: { type: 'string', description: 'headline' },
            rationale: { type: 'string', description: 'why this should outperform' },
          },
        },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// ORGANIC LANE
// ---------------------------------------------------------------------------

export const siteIntel = {
  id: 'site-intel',
  label: 'Site intelligence',
  lane: 'organic',
  cadence: 'weekly',
  needs: ['crawl'],
  optional: ['psi'],
  produces: 'profile',
  effect: 'internal.research',
  version: 1,
  description: 'Crawls the site and builds a sourced brand profile. Every attribute records the page it came from, so a thin profile is visibly thin rather than silently generic.',
  async run({ ctx, emit }) {
    const url = ctx.params.url || ctx.profile?.url;
    if (!url) return { summary: 'no URL configured for this workspace', pages: 0 };

    const home = await ctx.fetch('crawl', 'page', { url });
    const analysis = analyzePage({ url, html: home.body || '', headers: home.headers || {} });
    await ctx.cite({ ref: `crawl:${url}`, url, note: `${analysis.wordCount} words, ssr coverage ${analysis.ssr.coverage}` });

    // The intake quality problem, made visible instead of papered over. Every
    // reviewer of the incumbent converged on the same failure: a thin site
    // produces generic output, and the URL-only onboarding hides that.
    const intake = intakeQuality(analysis);

    const res = await ctx.model({
      taskClass: 'extract',
      system: systemPrefix(ctx),
      user: [
        'Build a brand profile from this crawl ONLY. Do not add anything the crawl does not support.',
        '',
        `URL: ${url}`,
        `Title: ${analysis.title}`,
        `Meta description: ${analysis.metaDescription}`,
        `Headings: ${analysis.headings.slice(0, 20).map((h) => `H${h.level}: ${h.text}`).join(' | ')}`,
        `Body sample: ${analysis.textSample}`,
        '',
        'For any attribute the crawl does not support, return the literal string "unverified".',
      ].join('\n'),
      schema: {
        name: 'brand_profile',
        input_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            category: { type: 'string' },
            serviceArea: { type: 'string' },
            positioning: { type: 'string' },
            audience: { type: 'string' },
            differentiators: { type: 'array', minItems: 1, maxItems: 6, items: { type: 'string' } },
            offers: { type: 'array', minItems: 1, maxItems: 6, items: { type: 'string' } },
          },
        },
      },
    });

    await emit({
      kind: 'profile',
      title: `Brand profile - ${res.parsed?.name || url}`,
      effect: 'internal.research',
      summary: `${intake.grade} intake quality (${intake.score}/100). ${intake.blockers.length} blocker(s).`,
      body: JSON.stringify(res.parsed, null, 2),
      data: { profile: res.parsed, analysis: stripHeavy(analysis), intake, sourceUrl: url },
    });

    return {
      summary: `crawled ${url}; intake quality ${intake.grade} (${intake.score}/100)`,
      intake,
      ssrCoverage: analysis.ssr.coverage,
      words: analysis.wordCount,
    };
  },
};

export const seoTechnical = {
  id: 'seo-technical',
  label: 'Technical SEO & AEO',
  lane: 'organic',
  cadence: 'daily',
  needs: ['crawl'],
  optional: ['gsc', 'psi'],
  produces: 'audit',
  effect: 'internal.audit',
  version: 1,
  description: 'Daily technical audit weighted toward what answer engines actually need: server-rendered content, chunkable sections, correct AI-crawler policy. Emits two fixes, not a 200-item list nobody works through.',
  async run({ ctx, emit, step }) {
    const url = ctx.params.url || ctx.profile?.url;
    if (!url) return { summary: 'no URL configured', findings: 0 };

    const page = await ctx.fetch('crawl', 'page', { url });
    const analysis = analyzePage({ url, html: page.body || '', headers: page.headers || {} });
    await ctx.cite({ ref: `crawl:${url}`, url });

    let robots = null;
    try {
      const rob = await ctx.fetch('crawl', 'robots', { url });
      robots = auditRobots(rob.body || '');
      await ctx.cite({ ref: `crawl:${url}/robots.txt`, url: `${new URL(url).origin}/robots.txt` });
    } catch (err) {
      await ctx.logger.warn?.('robots.txt unavailable', { error: String(err.message) });
    }

    // Deterministic findings first. These are measured, not generated, so they
    // carry no hallucination risk and cost nothing.
    const measured = await step('derive-measured-findings', async () => {
      const out = [];
      if (analysis.ssr.emptyShell || analysis.ssr.coverage < 0.7) {
        out.push({
          severity: 'critical', code: 'SSR_COVERAGE',
          title: `Only ${Math.round(analysis.ssr.coverage * 100)}% of page content is in the served HTML`,
          evidence: `served ${analysis.ssr.servedTokens} tokens, ${analysis.ssr.hiddenTokens} tokens present only in the hydration payload`,
          change: 'Server-render the main content. No major AI crawler executes JavaScript, so hydration-only text is invisible to ChatGPT, Claude and Perplexity. Google AI Overviews may still see it via Googlebot.',
          effort: 'days',
        });
      }
      for (const f of analysis.chunkability.findings) {
        out.push({ severity: f.severity === 'high' ? 'high' : f.severity, code: f.code, title: f.message, evidence: `chunkability score ${analysis.chunkability.score}/100`, change: f.message, effort: 'hours' });
      }
      if (robots) {
        for (const f of robots.findings.filter((x) => x.severity === 'critical' || x.severity === 'high')) {
          out.push({ severity: f.severity, code: f.code, title: `${f.token}: ${f.code}`, evidence: 'robots.txt', change: f.message, effort: 'minutes' });
        }
      }
      if (!analysis.canonical) out.push({ severity: 'medium', code: 'NO_CANONICAL', title: 'No canonical URL', evidence: 'page head', change: 'Add a self-referencing canonical link.', effort: 'minutes' });
      if (analysis.nosnippet) {
        out.push({
          severity: 'high', code: 'NOSNIPPET',
          title: 'nosnippet is set, which suppresses AI Overview and AI Mode snippets',
          evidence: `robots meta: ${analysis.robotsMeta}`,
          change: 'Remove nosnippet unless suppressing snippets is deliberate. It also kills the normal search snippet.',
          effort: 'minutes',
        });
      }
      if (!analysis.schemaTypes.length) {
        out.push({ severity: 'medium', code: 'NO_SCHEMA', title: 'No JSON-LD structured data', evidence: 'no ld+json blocks found', change: 'Add Organization (or LocalBusiness) with a full sameAs array. This asserts entity identity, which is better supported than "schema improves citations" - no controlled study establishes the latter.', effort: 'hours' });
      }
      if (analysis.titleLength > 60 || analysis.titleLength < 15) out.push({ severity: 'low', code: 'TITLE_LENGTH', title: `Title is ${analysis.titleLength} characters`, evidence: analysis.title || '', change: 'Target 15-60 characters.', effort: 'minutes' });
      return out;
    }, { inputs: { ssr: analysis.ssr.coverage, chunk: analysis.chunkability.score, robotsFindings: robots?.findings?.length || 0 } });

    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    measured.sort((a, b) => order[a.severity] - order[b.severity]);
    const top = measured.slice(0, 2);

    await emit({
      kind: 'audit',
      title: `Technical & AEO audit - ${url}`,
      effect: 'internal.audit',
      summary: `${measured.length} findings; top ${top.length} queued as this cycle's fixes`,
      body: renderAudit(url, analysis, measured, top),
      data: { analysis: stripHeavy(analysis), findings: measured, queued: top, robots: robots?.findings || [] },
    });

    return { summary: `${measured.length} findings, ${top.length} queued`, findings: measured.length, ssrCoverage: analysis.ssr.coverage, chunkability: analysis.chunkability.score };
  },
};

export const geoVisibility = {
  id: 'geo-visibility',
  label: 'AI answer visibility (GEO)',
  lane: 'organic',
  cadence: 'weekly',
  needs: [],
  optional: ['serp'],
  produces: 'scan',
  effect: 'internal.research',
  version: 1,
  description: 'Measures presence in AI answers with confidence intervals, a control cohort, and a grounded-vs-parametric split. Weekly with five replicates beats daily with one on every interval you can compute, at a seventh of the cost.',
  async run({ ctx, emit, step }) {
    const profile = ctx.profile || {};
    const seeds = ctx.params.seeds || profile.seeds || [];
    if (!seeds.length) return { summary: 'no seed keywords configured; nothing to measure', runs: 0 };

    const manifest = await step('build-prompt-set', async () => buildPromptSet({
      setId: `${ctx.workspaceId}-geo`,
      locale: ctx.params.locale || 'en-US',
      seeds,
      vars: {
        category: profile.category, segment: profile.audience, city: profile.serviceArea,
        brand: profile.name, competitor: (profile.competitors || [])[0]?.name, feature: (profile.differentiators || [])[0],
      },
      competitors: (profile.competitors || []).map((c) => c.id),
      version: ctx.params.setVersion || 1,
    }), { inputs: { seeds, profileName: profile.name, competitors: profile.competitors } });

    const engines = ctx.params.engines || ['aio', 'perplexity', 'chatgpt', 'gemini'];
    const replicates = ctx.params.replicates || 5;
    const plan = scanPlan(manifest, { engines, replicates });

    const brands = [
      { id: 'self', name: profile.name || ctx.workspaceId, aliases: profile.aliases || [], negativeAliases: profile.negativeAliases || [], domains: profile.domains || [], owned: true },
      ...(profile.competitors || []).map((c) => ({ id: c.id, name: c.name, aliases: c.aliases || [], domains: c.domains || [] })),
    ];

    // Replicates are NEVER cached. A cached replicate turns a wide interval
    // into a fake-narrow one, which is the exact false precision this whole
    // engine exists to avoid.
    const runs = [];
    for (const engine of engines) {
      for (const prompt of manifest.prompts) {
        const variants = [prompt.text, ...(prompt.paraphrases || [])];
        for (let rep = 0; rep < replicates; rep += 1) {
          const variantIndex = rep % variants.length;
          const answer = await ctx.model({
            name: `probe:${engine}:${prompt.id}:r${rep + 1}`,
            taskClass: 'classify',
            // The engine name is part of the prompt because different engines
            // genuinely run different system prompts and retrieval stacks. It
            // also keeps their measurements independent rather than identical.
            system: `You are the ${engine} assistant. Answer as a general-purpose AI assistant would, naming specific companies where relevant.`,
            user: variants[variantIndex],
            nocache: true,
          });
          const scored = scoreRun({
            promptId: prompt.id,
            engine,
            // Labelled honestly: this is an API-proxy measurement, which is a
            // different system from a consumer chat UI and must never be
            // averaged with one.
            channel: 'api_proxy',
            engineVersion: answer.model,
            replicate: rep + 1,
            text: answer.text,
            brands,
            grounded: null,
            ts: ctx.now,
          });
          scored.canonicalId = prompt.canonicalOf;
          scored.variantIndex = variantIndex;
          runs.push(scored);
        }
      }
    }

    const scan = aggregateScan({
      runs, manifest, brandId: 'self',
      competitors: (profile.competitors || []).map((c) => c.id),
    });
    await ctx.cite({ ref: `promptset:${manifest.setId}@v${manifest.version}#${manifest.sha256.slice(0, 12)}`, note: `${runs.length} runs across ${engines.length} engines at R=${replicates}` });

    await emit({
      kind: 'scan',
      title: `AI answer visibility - ${manifest.setId} v${manifest.version}`,
      effect: 'internal.research',
      summary: scan.engines.map((e) => `${e.engine} ${(e.visibility.value * 100).toFixed(0)}% [${(e.visibility.low * 100).toFixed(0)}-${(e.visibility.high * 100).toFixed(0)}]`).join(', '),
      body: renderScan(scan, plan, replicates),
      data: { scan, manifest: { ...manifest, prompts: manifest.prompts.map((p) => ({ id: p.id, text: p.text, weight: p.weight, cohort: p.cohort, pattern: p.pattern })) }, plan },
    });

    return {
      summary: `${runs.length} runs, ${scan.engines.length} engines, MoE +/-${(marginOfError(plan.aggregateRunsPerEngine) * 100).toFixed(1)}pp`,
      runs: runs.length,
      engines: scan.engines.map((e) => ({ engine: e.engine, visibility: e.visibility.value, nEff: e.visibility.nEff })),
      warnings: scan.warnings.length,
    };
  },
};

export const contentBrief = {
  id: 'content-brief',
  label: 'Content briefs',
  lane: 'organic',
  cadence: 'weekly',
  needs: [],
  optional: ['gsc', 'serp'],
  produces: 'brief',
  effect: 'internal.brief',
  version: 1,
  description: 'Builds briefs structured for retrieval: each section answers one sub-question with the answer in the first sentence, sized under a chunk boundary so a retriever cannot split the answer from its question.',
  async run({ ctx, emit }) {
    const topic = ctx.params.topic || (ctx.profile?.seeds || [])[0]?.term;
    if (!topic) return { summary: 'no topic supplied', briefs: 0 };
    const res = await ctx.model({
      taskClass: 'brief',
      system: systemPrefix(ctx),
      user: [
        `Build a content brief for: ${topic}`,
        '',
        'Constraints that come from how retrieval actually works:',
        '- every section answers ONE sub-question',
        '- the answer goes in the FIRST sentence of the section',
        '- keep each section under 512 tokens so a fixed-window chunker cannot split the answer from its question',
        '- list what must be sourced before this can be published',
      ].join('\n'),
      schema: BRIEF_SCHEMA,
    });
    await emit({
      kind: 'brief',
      title: `Brief - ${res.parsed?.workingTitle || topic}`,
      effect: 'internal.brief',
      summary: `${res.parsed?.sections?.length || 0} sections, ${res.parsed?.evidenceNeeded?.length || 0} evidence items required`,
      body: renderBrief(res.parsed),
      data: res.parsed,
    });
    return { summary: `brief for ${topic}`, briefs: 1 };
  },
};

export const articleWriter = {
  id: 'article-writer',
  label: 'Article writer',
  lane: 'organic',
  cadence: 'daily',
  needs: [],
  optional: ['wordpress'],
  produces: 'article',
  effect: 'draft.article',
  version: 1,
  description: 'Writes the article from an approved brief and its evidence. Refuses to invent a statistic: an unsourced number is a blocking guardrail, not a warning.',
  async run({ ctx, emit }) {
    const brief = ctx.params.brief;
    if (!brief) return { summary: 'no approved brief supplied; the writer runs from a brief, not from a keyword', articles: 0 };
    const evidence = ctx.params.evidence || [];
    for (const e of evidence) await ctx.cite(e);

    const res = await ctx.model({
      taskClass: 'longform',
      system: systemPrefix(ctx),
      user: [
        'Write this article from the brief and the evidence below.',
        '',
        `BRIEF:\n${JSON.stringify(brief, null, 2)}`,
        '',
        `EVIDENCE (the only facts you may assert):\n${evidence.map((e) => `- ${e.ref}: ${e.note || ''}`).join('\n') || '- none supplied'}`,
        '',
        'If a section in the brief needs a number you were not given, write the section without the number and note what is missing. Do not estimate.',
      ].join('\n'),
    });

    await emit({
      kind: 'article',
      title: brief.workingTitle || 'Article draft',
      effect: 'draft.article',
      summary: `${res.text.split(/\s+/).length} words from ${evidence.length} source(s)`,
      body: res.text,
      data: { brief, model: res.model },
    });
    return { summary: `article draft for ${brief.workingTitle}`, articles: 1 };
  },
};

export const socialWriter = {
  id: 'social-writer',
  label: 'Social drafts (X / LinkedIn)',
  lane: 'organic',
  cadence: 'daily',
  needs: [],
  optional: [],
  produces: 'social',
  effect: 'draft.social',
  version: 1,
  description: 'Founder-voice drafts for X and LinkedIn. Drafts only - publishing is a separate approved effect, and nothing posts on a schedule.',
  async run({ ctx, emit }) {
    const angle = ctx.params.angle || 'this week\'s most useful thing we learned on a job';
    const res = await ctx.model({
      taskClass: 'draft',
      system: systemPrefix(ctx),
      user: `Write 3 short posts about: ${angle}. One for X (under 280 characters), two for LinkedIn (under 150 words each, founder voice, no hashtags, no emoji). Concrete specifics only - no motivational framing.`,
      schema: COPY_SCHEMA,
    });
    for (const v of res.parsed?.variants || []) {
      await emit({
        kind: 'social',
        title: v.hook?.slice(0, 80) || 'Social draft',
        effect: 'draft.social',
        summary: v.rationale,
        body: v.body,
        data: { hook: v.hook, rationale: v.rationale },
      });
    }
    return { summary: `${res.parsed?.variants?.length || 0} social drafts`, drafts: res.parsed?.variants?.length || 0 };
  },
};

export const communityWatch = {
  id: 'community-watch',
  label: 'Community listening (read-only)',
  lane: 'organic',
  cadence: 'daily',
  needs: [],
  optional: ['serp'],
  produces: 'digest',
  effect: 'internal.research',
  version: 1,
  description: 'READ-ONLY by design. Surfaces where the brand and its category are being discussed, and never drafts a reply to post. Automated community replies are the fastest route to a shadowban, and at agency scale nobody reviews them properly.',
  async run({ ctx, emit }) {
    const terms = ctx.params.terms || [ctx.profile?.name, ctx.profile?.category].filter(Boolean);
    if (!terms.length) return { summary: 'no listening terms configured', mentions: 0 };
    const res = await ctx.model({
      taskClass: 'extract',
      system: systemPrefix(ctx),
      user: [
        `Summarise what someone monitoring these terms should know today: ${terms.join(', ')}`,
        '',
        'Return themes and the questions people are asking, as intelligence for the content plan.',
        'Do NOT draft replies or posts. This agent never publishes to a community platform.',
      ].join('\n'),
      schema: {
        name: 'listening_digest',
        input_schema: {
          type: 'object',
          properties: {
            themes: { type: 'array', minItems: 1, maxItems: 6, items: { type: 'object', properties: { theme: { type: 'string' }, whyItMatters: { type: 'string', description: 'rationale' } } } },
            questionsAsked: { type: 'array', minItems: 1, maxItems: 8, items: { type: 'string' } },
          },
        },
      },
    });
    await emit({
      kind: 'digest',
      title: 'Community listening digest',
      effect: 'internal.research',
      summary: `${res.parsed?.themes?.length || 0} themes, ${res.parsed?.questionsAsked?.length || 0} questions - feeds the content plan, posts nothing`,
      body: renderDigest(res.parsed),
      data: res.parsed,
    });
    return { summary: 'listening digest (read-only)', themes: res.parsed?.themes?.length || 0 };
  },
};

// ---------------------------------------------------------------------------
// PAID LANE - no counterpart in the incumbent product
// ---------------------------------------------------------------------------

export const paidSearchAnalyst = {
  id: 'paid-search-analyst',
  label: 'Google Ads analyst',
  lane: 'paid',
  cadence: 'daily',
  needs: ['googleAds'],
  optional: ['gsc'],
  produces: 'audit',
  effect: 'internal.audit',
  version: 1,
  description: 'Reads campaign, ad group and search-term performance. Read-only: every mutate is a separate approval-gated effect. Finds the converting search terms that have no organic page, which is where the paid and organic lanes actually join.',
  async run({ ctx, emit }) {
    const perf = await ctx.fetch('googleAds', 'performance', { days: ctx.params.days || 30 });
    const terms = await ctx.fetch('googleAds', 'searchTerms', { days: ctx.params.days || 30 });
    await ctx.cite({ ref: `googleAds:performance:${ctx.today}`, note: `${perf.provenance?.mode} mode` });

    const rows = terms.rows || [];
    // The cross-lane opportunity: search terms that convert on paid and have no
    // organic page to catch them for free.
    const gaps = rows
      .filter((r) => (r.conversions || 0) >= 1 && !r.hasOrganicPage)
      .sort((a, b) => (b.conversions || 0) - (a.conversions || 0))
      .slice(0, 10);

    const res = await ctx.model({
      taskClass: 'critique',
      system: systemPrefix(ctx),
      user: [
        'Review this Google Ads performance and return prioritised findings. Every finding must cite a number from the data.',
        `PERFORMANCE:\n${JSON.stringify(perf.rows || perf.data || perf, null, 2).slice(0, 4000)}`,
        `TOP SEARCH TERMS:\n${JSON.stringify(rows.slice(0, 25), null, 2).slice(0, 3000)}`,
      ].join('\n\n'),
      schema: FINDINGS_SCHEMA,
    });

    await emit({
      kind: 'audit',
      title: `Google Ads review - last ${ctx.params.days || 30} days`,
      effect: 'internal.audit',
      summary: `${res.parsed?.findings?.length || 0} findings; ${gaps.length} converting terms with no organic page`,
      body: renderPaidReview(res.parsed, gaps, perf.provenance),
      data: { findings: res.parsed?.findings || [], organicGaps: gaps, provenance: perf.provenance },
    });
    return { summary: `${res.parsed?.findings?.length || 0} paid findings, ${gaps.length} organic gaps`, gaps: gaps.length };
  },
};

export const paidSocialAnalyst = {
  id: 'paid-social-analyst',
  label: 'Meta Ads analyst',
  lane: 'paid',
  cadence: 'daily',
  needs: ['metaAds'],
  optional: [],
  produces: 'audit',
  effect: 'internal.audit',
  version: 1,
  description: 'Creative-level Meta performance with the attribution window pinned in the request, so a report is reproducible rather than a snapshot of whatever the default was that day.',
  async run({ ctx, emit }) {
    const insights = await ctx.fetch('metaAds', 'insights', { days: ctx.params.days || 30, attributionWindow: ctx.params.attributionWindow || '7d_click,1d_view' });
    await ctx.cite({ ref: `metaAds:insights:${ctx.today}`, note: `attribution window ${ctx.params.attributionWindow || '7d_click,1d_view'}` });
    const res = await ctx.model({
      taskClass: 'critique',
      system: systemPrefix(ctx),
      user: `Review this Meta Ads data and return prioritised findings. Cite a number in every finding.\n${JSON.stringify(insights.rows || insights.data || insights, null, 2).slice(0, 4000)}`,
      schema: FINDINGS_SCHEMA,
    });
    await emit({
      kind: 'audit',
      title: `Meta Ads review - last ${ctx.params.days || 30} days`,
      effect: 'internal.audit',
      summary: `${res.parsed?.findings?.length || 0} findings (attribution ${ctx.params.attributionWindow || '7d_click,1d_view'})`,
      body: renderFindings(res.parsed, insights.provenance),
      data: { findings: res.parsed?.findings || [], provenance: insights.provenance },
    });
    return { summary: `${res.parsed?.findings?.length || 0} paid social findings` };
  },
};

export const adCopyLab = {
  id: 'ad-copy-lab',
  label: 'Ad copy lab',
  lane: 'paid',
  cadence: 'weekly',
  needs: [],
  optional: ['googleAds'],
  produces: 'adcopy',
  effect: 'draft.adcopy',
  version: 1,
  description: 'Writes RSA headlines and descriptions inside the real character limits, from the search terms that actually convert. Drafts only - pushing copy into an ad account is a separate high-risk effect.',
  async run({ ctx, emit }) {
    const terms = ctx.params.terms || [];
    const res = await ctx.model({
      taskClass: 'draft',
      system: systemPrefix(ctx),
      user: [
        'Write responsive search ad assets.',
        'Hard limits: headlines 30 characters, descriptions 90 characters. Anything over the limit is unusable.',
        `Converting search terms: ${terms.join(', ') || 'none supplied - use the brand profile'}`,
        'Return variants; each rationale must say which term it targets.',
      ].join('\n'),
      schema: COPY_SCHEMA,
    });
    const variants = res.parsed?.variants || [];
    // Verified against the platform limit rather than trusted. Copy that is one
    // character over is rejected at upload, which is a wasted cycle.
    const checked = variants.map((v) => ({
      ...v,
      hookLength: (v.hook || '').length,
      bodyLength: (v.body || '').length,
      overLimit: (v.hook || '').length > 30 || (v.body || '').length > 90,
    }));
    await emit({
      kind: 'adcopy',
      title: 'RSA assets',
      effect: 'draft.adcopy',
      summary: `${checked.length} variants, ${checked.filter((c) => c.overLimit).length} over platform limits`,
      body: checked.map((c) => `H(${c.hookLength}/30): ${c.hook}\nD(${c.bodyLength}/90): ${c.body}\nwhy: ${c.rationale}${c.overLimit ? '\n  !! OVER LIMIT - would be rejected at upload' : ''}`).join('\n\n'),
      data: { variants: checked },
    });
    return { summary: `${checked.length} RSA variants`, overLimit: checked.filter((c) => c.overLimit).length };
  },
};

// ---------------------------------------------------------------------------
// LOCAL LANE - absent from every AI-CMO and every GEO tool
// ---------------------------------------------------------------------------

export const localSeo = {
  id: 'local-seo',
  label: 'Local SEO & Google Business Profile',
  lane: 'local',
  cadence: 'daily',
  needs: [],
  optional: ['gbp', 'places', 'serp'],
  produces: 'audit',
  effect: 'internal.audit',
  version: 1,
  description: 'The lane no AI-CMO product touches. Works from public Places data when GBP quota has not been granted, which is the normal state for weeks, and closes the loop: grid rank -> content decision -> GBP post -> re-measure.',
  async run({ ctx, emit }) {
    const gbpMode = ctx.connectors.gbp?.mode || 'unavailable';
    const placesMode = ctx.connectors.places?.mode || 'unavailable';
    const source = gbpMode === 'live' ? 'gbp' : (placesMode !== 'unavailable' ? 'places' : null);
    if (!source) {
      return { summary: 'neither GBP nor Places is configured; local lane has no data source', findings: 0 };
    }

    const profile = await ctx.fetch(source, source === 'gbp' ? 'location' : 'publicProfile', { query: ctx.profile?.name });
    await ctx.cite({ ref: `${source}:profile:${ctx.today}`, note: `${profile.provenance?.mode} mode via ${source}` });

    const res = await ctx.model({
      taskClass: 'critique',
      system: systemPrefix(ctx),
      user: [
        'Review this local business profile and return prioritised findings. Cite the field each finding rests on.',
        source === 'places'
          ? 'NOTE: this is PUBLIC Places data, not authenticated GBP data. Do not claim to see anything a logged-in owner would see (post history, insights, message settings). Say so where it limits a finding.'
          : 'This is authenticated GBP data.',
        JSON.stringify(profile.data || profile, null, 2).slice(0, 3500),
      ].join('\n\n'),
      schema: FINDINGS_SCHEMA,
    });

    await emit({
      kind: 'audit',
      title: `Local profile audit (${source})`,
      effect: 'internal.audit',
      summary: `${res.parsed?.findings?.length || 0} findings from ${source}${source === 'places' ? ' - public data, GBP quota not granted' : ''}`,
      body: renderFindings(res.parsed, profile.provenance),
      data: { findings: res.parsed?.findings || [], source, provenance: profile.provenance },
    });
    return { summary: `${res.parsed?.findings?.length || 0} local findings via ${source}`, source };
  },
};

export const gbpPostWriter = {
  id: 'gbp-post-writer',
  label: 'GBP post writer',
  lane: 'local',
  cadence: 'weekly',
  needs: [],
  optional: ['gbp'],
  produces: 'gbp-post',
  effect: 'publish.gbp',
  version: 1,
  description: 'Writes Google Business Profile posts, among the most under-used signals in local SEO. High-risk effect: publishing is approval-gated and idempotency-keyed, and writes must be staggered because bulk pushes fail.',
  async run({ ctx, emit }) {
    const res = await ctx.model({
      taskClass: 'draft',
      system: systemPrefix(ctx),
      user: 'Write 2 Google Business Profile posts for this week. Under 1500 characters each, one clear call to action, local specifics, no hashtags. Seasonal or service-specific, not generic.',
      schema: COPY_SCHEMA,
    });
    for (const v of res.parsed?.variants || []) {
      await emit({
        kind: 'gbp-post',
        title: v.hook?.slice(0, 70) || 'GBP post',
        effect: 'publish.gbp',
        channel: 'gbp',
        summary: v.rationale,
        body: v.body,
        data: { hook: v.hook, characterCount: (v.body || '').length },
      });
    }
    return { summary: `${res.parsed?.variants?.length || 0} GBP posts drafted (publishing requires approval)`, posts: res.parsed?.variants?.length || 0 };
  },
};

// ---------------------------------------------------------------------------
// MEASUREMENT LANE - the retention weapon
// ---------------------------------------------------------------------------

export const attributionReconciler = {
  id: 'attribution-reconciler',
  label: 'Attribution reconciliation',
  lane: 'measurement',
  cadence: 'monthly',
  needs: [],
  optional: ['googleAds', 'metaAds', 'ga4'],
  produces: 'reconciliation',
  effect: 'internal.report',
  version: 1,
  description: 'The artifact no vendor will produce, because it is the number that says their channel over-reports. Platform-claimed conversions against real leads, with the delta explained and a corrected cost per lead.',
  async run({ ctx, emit, step }) {
    const platform = ctx.params.platformConversions || {};
    const real = ctx.params.realLeads || {};
    if (!Object.keys(platform).length || !Object.keys(real).length) {
      return { summary: 'needs platform conversions and a real lead count (CRM export or form log) to reconcile', reconciled: false };
    }

    // Deterministic arithmetic, not a model call. The whole credibility of this
    // artifact is that the numbers are computed, not narrated.
    const recon = await step('reconcile', async () => {
      const out = { channels: [], totals: { platform: 0, real: 0, spend: 0 } };
      for (const [channel, claimed] of Object.entries(platform)) {
        const actual = Number(real[channel]?.leads ?? real[channel] ?? 0);
        const spend = Number(real[channel]?.spend ?? platform[channel]?.spend ?? 0);
        const claimedN = Number(claimed?.conversions ?? claimed ?? 0);
        const delta = claimedN - actual;
        out.channels.push({
          channel,
          platformConversions: claimedN,
          realLeads: actual,
          delta,
          overReportPct: actual > 0 ? Math.round(((claimedN - actual) / actual) * 1000) / 10 : null,
          spend,
          platformCpl: claimedN > 0 ? Math.round((spend / claimedN) * 100) / 100 : null,
          // The number the client has never been shown.
          correctedCpl: actual > 0 ? Math.round((spend / actual) * 100) / 100 : null,
        });
        out.totals.platform += claimedN;
        out.totals.real += actual;
        out.totals.spend += spend;
      }
      out.totals.delta = out.totals.platform - out.totals.real;
      out.totals.overReportPct = out.totals.real > 0
        ? Math.round(((out.totals.platform - out.totals.real) / out.totals.real) * 1000) / 10
        : null;
      out.totals.platformCpl = out.totals.platform > 0 ? Math.round((out.totals.spend / out.totals.platform) * 100) / 100 : null;
      out.totals.correctedCpl = out.totals.real > 0 ? Math.round((out.totals.spend / out.totals.real) * 100) / 100 : null;
      return out;
    }, { inputs: { platform, real } });

    const res = await ctx.model({
      taskClass: 'reconcile',
      system: systemPrefix(ctx),
      user: [
        'Explain this reconciliation for a client. State the likely causes of the delta from this list only: duplicate form submissions, spam form fills, phone calls counted twice, view-through conversions, cross-device double counting, test submissions, conversion actions counted per-session rather than per-lead.',
        'Do not invent a cause the numbers do not support. If the delta is small, say the platform reporting is broadly accurate.',
        JSON.stringify(recon, null, 2),
      ].join('\n\n'),
      schema: {
        name: 'reconciliation_note',
        input_schema: {
          type: 'object',
          properties: {
            headline: { type: 'string' },
            likelyCauses: { type: 'array', minItems: 1, maxItems: 5, items: { type: 'object', properties: { cause: { type: 'string' }, evidence: { type: 'string' } } } },
            recommendation: { type: 'string' },
          },
        },
      },
    });
    for (const [channel] of Object.entries(platform)) await ctx.cite({ ref: `platform:${channel}:${ctx.today}` });
    for (const [channel] of Object.entries(real)) await ctx.cite({ ref: `crm:${channel}:${ctx.today}` });

    await emit({
      kind: 'reconciliation',
      title: `Conversion reconciliation - ${ctx.today}`,
      effect: 'internal.report',
      summary: recon.totals.overReportPct != null
        ? `platforms claimed ${recon.totals.platform} conversions against ${recon.totals.real} real leads (${recon.totals.overReportPct > 0 ? '+' : ''}${recon.totals.overReportPct}%); corrected CPL $${recon.totals.correctedCpl}`
        : `${recon.totals.platform} platform conversions, ${recon.totals.real} real leads`,
      body: renderReconciliation(recon, res.parsed),
      data: { reconciliation: recon, note: res.parsed },
    });
    return { summary: `reconciled ${recon.channels.length} channels`, overReportPct: recon.totals.overReportPct, correctedCpl: recon.totals.correctedCpl };
  },
};

export const reportComposer = {
  id: 'report-composer',
  label: 'Client report',
  lane: 'measurement',
  cadence: 'monthly',
  needs: [],
  optional: [],
  produces: 'report',
  effect: 'internal.report',
  version: 1,
  description: 'Composes the client report from artifacts already produced and approved this period. Every figure carries its connector provenance, so a degraded window appears as a footnote instead of a silently missing bar.',
  async run({ ctx, emit }) {
    const inputs = ctx.params.artifacts || [];
    if (!inputs.length) return { summary: 'no artifacts in the period to report on', reports: 0 };
    const res = await ctx.model({
      taskClass: 'synthesize',
      system: systemPrefix(ctx),
      user: [
        'Write the monthly client report from these artifacts. Every figure must appear in the inputs.',
        'Where an input is marked fixture or substitute mode, say so in a footnote rather than presenting it as live data.',
        JSON.stringify(inputs, null, 2).slice(0, 12000),
      ].join('\n\n'),
    });
    await emit({
      kind: 'report',
      title: `Client report - ${ctx.today}`,
      effect: 'internal.report',
      summary: `composed from ${inputs.length} artifacts`,
      body: res.text,
      data: { sourceArtifacts: inputs.map((a) => a.id || a.title) },
    });
    return { summary: `report from ${inputs.length} artifacts`, reports: 1 };
  },
};

export const competitorWatch = {
  id: 'competitor-watch',
  label: 'Competitor watch',
  lane: 'measurement',
  cadence: 'weekly',
  needs: ['crawl'],
  optional: ['serp'],
  produces: 'digest',
  effect: 'internal.research',
  version: 1,
  description: 'Crawls declared competitors and diffs what changed - offers, pricing, positioning, new pages. A change log, not a vibe.',
  async run({ ctx, emit, step }) {
    const competitors = (ctx.profile?.competitors || []).filter((c) => c.url);
    if (!competitors.length) return { summary: 'no competitor URLs configured', competitors: 0 };
    const snapshots = [];
    for (const c of competitors.slice(0, 6)) {
      try {
        const page = await ctx.fetch('crawl', 'page', { url: c.url });
        const a = analyzePage({ url: c.url, html: page.body || '' });
        snapshots.push({ id: c.id, name: c.name, url: c.url, title: a.title, h1: a.headings.find((h) => h.level === 1)?.text, words: a.wordCount, schema: a.schemaTypes, ssr: a.ssr.coverage });
        await ctx.cite({ ref: `crawl:${c.url}`, url: c.url });
      } catch (err) {
        snapshots.push({ id: c.id, name: c.name, url: c.url, error: String(err.message).slice(0, 120) });
      }
    }
    const diff = await step('diff-against-last', async () => {
      const prior = ctx.params.priorSnapshots || [];
      const byId = new Map(prior.map((p) => [p.id, p]));
      return snapshots.map((s) => {
        const was = byId.get(s.id);
        if (!was) return { ...s, change: 'first observation' };
        const changes = [];
        if (was.title !== s.title) changes.push(`title: "${was.title}" -> "${s.title}"`);
        if (was.h1 !== s.h1) changes.push(`h1: "${was.h1}" -> "${s.h1}"`);
        if (Math.abs((was.words || 0) - (s.words || 0)) > 100) changes.push(`length ${was.words} -> ${s.words} words`);
        return { ...s, change: changes.length ? changes.join('; ') : 'no material change' };
      });
    }, { inputs: { snapshots, prior: ctx.params.priorSnapshots || [] } });

    await emit({
      kind: 'digest',
      title: 'Competitor watch',
      effect: 'internal.research',
      summary: `${snapshots.length} competitors, ${diff.filter((d) => d.change !== 'no material change').length} changed`,
      body: diff.map((d) => `${d.name} (${d.url})\n  ${d.change}${d.error ? `\n  fetch failed: ${d.error}` : ''}`).join('\n\n'),
      data: { snapshots, diff },
    });
    return { summary: `${snapshots.length} competitors checked`, changed: diff.filter((d) => d.change !== 'no material change').length };
  },
};

// ---------------------------------------------------------------------------
// OPS LANE
// ---------------------------------------------------------------------------

export const aeoEngineer = {
  id: 'aeo-engineer',
  label: 'AEO engineer',
  lane: 'ops',
  cadence: 'weekly',
  needs: ['crawl'],
  optional: [],
  produces: 'patch',
  effect: 'internal.brief',
  version: 1,
  description: 'Produces the concrete files: a correct AI-crawler robots.txt, JSON-LD for entity identity, and an llms.txt - labelled honestly as agent-readiness rather than sold as a ranking lever, because no major engine has committed to reading it.',
  async run({ ctx, emit }) {
    const url = ctx.params.url || ctx.profile?.url;
    if (!url) return { summary: 'no URL configured', files: 0 };
    const origin = new URL(url).origin;

    const robots = robotsPolicy({ stance: ctx.params.stance || 'retrieval-friendly', sitemapUrl: `${origin}/sitemap.xml` });
    const jsonLd = buildOrganizationSchema(ctx.profile, origin);
    const llms = buildLlmsTxt(ctx.profile, origin);

    await emit({
      kind: 'patch',
      title: 'AEO files: robots.txt, JSON-LD, llms.txt',
      effect: 'internal.brief',
      summary: 'three files ready to commit; robots.txt allows retrieval classes and blocks training classes',
      body: [
        '## robots.txt', '```', robots, '```', '',
        '## JSON-LD (Organization + sameAs)', '```json', JSON.stringify(jsonLd, null, 2), '```', '',
        '## llms.txt', '```', llms, '```', '',
        '### On llms.txt, stated plainly',
        'No major model provider has committed to reading llms.txt in a production search or ranking system, and Google has said it does not support it. It is worth shipping as an agent-readiness signal at near-zero cost. It is not a search-visibility lever, and anyone selling it as one is overselling it.',
        'The measurable version: serve markdown alternates for key pages, then check the server log for whether AI user agents actually request them. That turns a faith-based recommendation into an evidence-based one.',
      ].join('\n'),
      data: { robots, jsonLd, llms },
    });
    return { summary: '3 AEO files generated', files: 3 };
  },
};

// ---------------------------------------------------------------------------
// Renderers and helpers
// ---------------------------------------------------------------------------

export function intakeQuality(analysis) {
  const blockers = [];
  const warnings = [];
  let score = 100;
  if (analysis.wordCount < 300) { score -= 30; blockers.push(`only ${analysis.wordCount} words of text on the page - there is not enough here to derive positioning from`); }
  if (analysis.ssr.emptyShell) { score -= 25; blockers.push('page is a client-rendered shell; the crawl cannot see the content, and neither can most AI crawlers'); }
  if (!analysis.metaDescription) { score -= 8; warnings.push('no meta description'); }
  if (!analysis.title) { score -= 10; blockers.push('no title element'); }
  if (!analysis.schemaTypes.length) { score -= 8; warnings.push('no structured data, so no declared entity identity'); }
  if (analysis.h1Count !== 1) { score -= 6; warnings.push(`${analysis.h1Count} H1 elements`); }
  if (analysis.chunkability.score < 60) { score -= 10; warnings.push(`low chunkability (${analysis.chunkability.score}/100)`); }
  score = Math.max(0, score);
  const grade = score >= 85 ? 'strong' : score >= 65 ? 'workable' : score >= 40 ? 'thin' : 'insufficient';
  return {
    score, grade, blockers, warnings,
    // The honest message the incumbent's URL-only onboarding avoids.
    message: grade === 'insufficient' || grade === 'thin'
      ? `Intake is ${grade}. Output built on this will be generic, and that is a property of the input, not the model. Fix the site or supply the positioning by hand before expecting good drafts.`
      : `Intake is ${grade}; there is enough here to work from.`,
  };
}

function renderAudit(url, analysis, findings, queued) {
  return [
    `# Technical & AEO audit - ${url}`, '',
    `Server-rendered coverage: **${Math.round(analysis.ssr.coverage * 100)}%**  |  Chunkability: **${analysis.chunkability.score}/100**  |  Words: ${analysis.wordCount}`, '',
    '## Can AI crawlers see this page?',
    ...Object.entries(analysis.ssr.verdictByEngine).map(([k, v]) => `- **${k}**: ${v}`), '',
    '## Queued this cycle',
    ...queued.map((f, i) => `${i + 1}. **${f.title}** (${f.severity}, ${f.effort})\n   - evidence: ${f.evidence}\n   - change: ${f.change}`),
    '',
    `## All findings (${findings.length})`,
    ...findings.map((f) => `- [${f.severity}] ${f.title}`),
  ].join('\n');
}

function renderScan(scan, plan, replicates) {
  const lines = [
    `# AI answer visibility - ${scan.promptSet.setId} v${scan.promptSet.version}`, '',
    `Instrument: \`${scan.promptSet.sha256.slice(0, 16)}\` — ${plan.prompts} client prompts, ${plan.controls} control prompts, ${plan.engines} engines, R=${replicates}`,
    `Total runs: ${scan.totals.runs}. Margin of error on the aggregate: ±${(marginOfError(plan.aggregateRunsPerEngine) * 100).toFixed(1)}pp.`, '',
  ];
  for (const e of scan.engines) {
    lines.push(`## ${e.engine} (${e.channel})`);
    lines.push(`- **${(e.visibility.value * 100).toFixed(1)}%** weighted presence, 95% CI [${(e.visibility.low * 100).toFixed(1)}–${(e.visibility.high * 100).toFixed(1)}], n_eff ${e.visibility.nEff.toFixed(0)}`);
    lines.push(`- coverage: appears on ${(e.visibility.coverage * 100).toFixed(0)}% of prompts at all (${(e.visibility.zeroShare * 100).toFixed(0)}% return nothing)`);
    lines.push(`- prominence given presence: ${e.prominence.meanGivenPresence} (median ordinal ${e.prominence.medianOrdinal})`);
    lines.push(`- citations: ${(e.citation.presenceRate * 100).toFixed(0)}% of answers cite an owned URL; normalized share ${e.citation.shareNormalized} (median ${e.citation.medianCitationsPerResponse} citations/answer)`);
    lines.push(`- share of voice: brand ${(e.shareOfVoice.brand * 100).toFixed(0)}%, other ${(e.shareOfVoice.other * 100).toFixed(0)}%`);
    lines.push(`- **which lever moves this**: ${e.retrieval.lever.message}`);
    lines.push(`- control cohort: ${e.control.runs} runs, brand presence ${e.control.presenceRate == null ? 'n/a' : `${(e.control.presenceRate * 100).toFixed(0)}%`}`);
    lines.push(`- metric: \`${e.composite.metricName}\``);
    lines.push(`- ${e.composite.interpretation}`);
    lines.push('');
  }
  if (scan.warnings.length) {
    lines.push('## Warnings');
    lines.push(...scan.warnings.map((w) => `- [${w.severity}] ${w.code}: ${w.message}`));
    lines.push('');
  }
  lines.push(`> ${scan.crossEngine.note}`);
  return lines.join('\n');
}

function renderBrief(brief) {
  if (!brief) return 'no brief produced';
  return [
    `# ${brief.workingTitle}`, '',
    `**Primary keyword:** ${brief.primaryKeyword}  |  **Intent:** ${brief.searchIntent}`, '',
    `**Angle:** ${brief.angle}`, '',
    '## Sections',
    ...(brief.sections || []).map((s, i) => `${i + 1}. **${s.h2}** (~${s.targetTokens} tokens)\n   Answer first: ${s.answerFirstSentence}`),
    '',
    '## Must be sourced before publishing',
    ...(brief.evidenceNeeded || []).map((e) => `- [ ] ${e}`),
  ].join('\n');
}

function renderDigest(d) {
  if (!d) return 'no digest';
  return [
    '# Community listening digest', '',
    '_Read-only. This agent does not draft or post replies to community platforms._', '',
    '## Themes',
    ...(d.themes || []).map((t) => `- **${t.theme}** — ${t.whyItMatters}`),
    '', '## Questions being asked',
    ...(d.questionsAsked || []).map((q) => `- ${q}`),
  ].join('\n');
}

function renderFindings(parsed, provenance) {
  const lines = ['# Findings', ''];
  if (provenance) lines.push(`_Data source: ${provenance.label} (${provenance.mode}) — ${provenance.reason}_`, '');
  if (parsed?.summary) lines.push(parsed.summary, '');
  for (const f of parsed?.findings || []) {
    lines.push(`### [${f.severity}] ${f.title}`, `- evidence: ${f.evidence}`, `- change: ${f.change}`, `- effort: ${f.effort}`, '');
  }
  return lines.join('\n');
}

function renderPaidReview(parsed, gaps, provenance) {
  const lines = [renderFindings(parsed, provenance)];
  if (gaps.length) {
    lines.push('## Converting search terms with no organic page', '');
    lines.push('_This is where the paid and organic lanes join: terms you are paying for that could be earned._', '');
    for (const g of gaps) lines.push(`- **${g.term}** — ${g.conversions} conversions, $${g.cost ?? '?'} spend, no organic page`);
  }
  return lines.join('\n');
}

function renderReconciliation(recon, note) {
  const lines = [
    `# Conversion reconciliation`, '',
    note?.headline ? `**${note.headline}**` : '', '',
    '| Channel | Platform claims | Real leads | Delta | Platform CPL | Corrected CPL |',
    '|---|---:|---:|---:|---:|---:|',
    ...recon.channels.map((c) => `| ${c.channel} | ${c.platformConversions} | ${c.realLeads} | ${c.delta > 0 ? '+' : ''}${c.delta}${c.overReportPct != null ? ` (${c.overReportPct > 0 ? '+' : ''}${c.overReportPct}%)` : ''} | ${c.platformCpl != null ? `$${c.platformCpl}` : '—'} | ${c.correctedCpl != null ? `$${c.correctedCpl}` : '—'} |`),
    `| **total** | **${recon.totals.platform}** | **${recon.totals.real}** | **${recon.totals.delta > 0 ? '+' : ''}${recon.totals.delta}** | **${recon.totals.platformCpl != null ? `$${recon.totals.platformCpl}` : '—'}** | **${recon.totals.correctedCpl != null ? `$${recon.totals.correctedCpl}` : '—'}** |`,
    '',
  ];
  if (note?.likelyCauses?.length) {
    lines.push('## Likely causes of the delta', '');
    for (const c of note.likelyCauses) lines.push(`- **${c.cause}** — ${c.evidence}`);
    lines.push('');
  }
  if (note?.recommendation) lines.push('## Recommendation', '', note.recommendation);
  return lines.filter((l) => l !== undefined).join('\n');
}

export function buildOrganizationSchema(profile = {}, origin) {
  const p = profile || {};
  const node = {
    '@context': 'https://schema.org',
    '@type': p.localBusinessType || 'LocalBusiness',
    name: p.name || undefined,
    url: origin,
    description: p.positioning || undefined,
    areaServed: p.serviceArea || undefined,
    // sameAs is the part that actually matters: it asserts entity identity
    // across the sources answer engines corroborate against.
    sameAs: (p.sameAs || []).length ? p.sameAs : undefined,
  };
  return Object.fromEntries(Object.entries(node).filter(([, v]) => v !== undefined));
}

export function buildLlmsTxt(profile = {}, origin) {
  const p = profile || {};
  return [
    `# ${p.name || origin}`,
    '',
    `> ${p.positioning || 'No positioning captured yet.'}`,
    '',
    '## Key pages',
    `- [Home](${origin}/): overview`,
    ...(p.keyPages || []).map((k) => `- [${k.title}](${k.url}): ${k.note || ''}`),
    '',
    '## Optional',
    `- [Sitemap](${origin}/sitemap.xml): full page index`,
  ].join('\n');
}

function stripHeavy(analysis) {
  const { textSample, headings, ...rest } = analysis;
  return { ...rest, headings: (headings || []).slice(0, 12) };
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const ROSTER = [
  siteIntel, seoTechnical, geoVisibility, contentBrief, articleWriter, socialWriter, communityWatch,
  paidSearchAnalyst, paidSocialAnalyst, adCopyLab,
  localSeo, gbpPostWriter,
  attributionReconciler, reportComposer, competitorWatch,
  aeoEngineer,
];

export function agentRegistry(selected = null) {
  const chosen = selected ? ROSTER.filter((a) => selected.includes(a.id)) : ROSTER;
  return Object.fromEntries(chosen.map((a) => [a.id, a]));
}

export const LANES = ['organic', 'paid', 'local', 'measurement', 'ops'];
