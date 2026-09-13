/**
 * Measurement and safety invariants.
 *
 * The GEO estimators, the brand-safety guardrails, and the crawler's SSRF guard.
 * Each test here corresponds to a specific way a competing product gets it
 * wrong, so the assertion doubles as documentation of the difference.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  wilson, weightedVisibility, twoProportionTest, bootstrapCi, requiredRuns,
  marginOfError, prominence, netStance, phrasingRobustness, kalmanUpdate, median, stdev,
} from '../lib/geo/stats.js';
import { buildPromptSet, screenPromptSet, scanPlan, nounPhrase, PATTERNS } from '../lib/geo/promptset.js';
import { extractMentions, extractCitations, scoreRun, registrableDomain } from '../lib/geo/extract.js';
import { aggregateScan, compareScans, OTHER_WARN_THRESHOLD } from '../lib/geo/score.js';
import { identify, robotsPolicy, auditRobots, parseRobots, GATE, byGate } from '../lib/geo/crawlers.js';
import { runGuardrails, extractClaims, assertPublishable, fleschKincaid } from '../lib/brand/guardrails.js';
import { assertPublicUrl, isBlockedIpv4, ssrCoverage, chunkability, analyzePage, extractText } from '../lib/connectors/crawl.js';

// ---------------------------------------------------------------------------

describe('stats: intervals stay inside [0,1] at the boundaries', () => {
  it('gives a Wilson interval for 0 successes that is not zero-width', () => {
    const w = wilson(0, 5);
    assert.equal(w.p, 0);
    assert.ok(w.low >= 0);
    assert.ok(w.high > 0.2, '0/5 is consistent with a substantial true rate');
    assert.ok(w.high <= 1);
  });

  it('gives a Wilson interval for all successes that does not exceed 1', () => {
    const w = wilson(5, 5);
    assert.ok(w.high <= 1);
    assert.ok(w.low < 1, '5/5 does not prove a 100% rate');
  });

  it('narrows as n grows', () => {
    assert.ok(wilson(50, 100).half < wilson(5, 10).half);
  });

  it('never reports a zero-width aggregate interval when every cell is zero', () => {
    // This is the exact false-precision failure the category is criticised for:
    // "0.0% [0.0-0.0]" off dozens of runs.
    const cells = Array.from({ length: 18 }, () => ({ weight: 1 / 18, successes: 0, trials: 3 }));
    const v = weightedVisibility(cells);
    assert.equal(v.value, 0);
    assert.ok(v.high > 0.01, 'the upper bound must reflect that 54 runs cannot prove absence');
    assert.match(v.intervalMethod, /wilson-pooled/);
    assert.deepEqual(v.pooled, { successes: 0, trials: 54 });
  });

  it('reports the Kish effective sample size, which collapses under skewed weights', () => {
    const equal = Array.from({ length: 100 }, () => ({ weight: 0.01, successes: 1, trials: 3 }));
    assert.equal(weightedVisibility(equal).nEff, 300);

    const skewed = [
      { weight: 0.9, successes: 3, trials: 3 },
      ...Array.from({ length: 99 }, () => ({ weight: 0.1 / 99, successes: 0, trials: 3 })),
    ];
    const s = weightedVisibility(skewed);
    assert.ok(s.nEff < 10, 'one dominant prompt destroys the effective sample size');
  });

  it('separates coverage from the weighted mean', () => {
    const cells = [
      { weight: 0.5, successes: 3, trials: 3 },
      { weight: 0.5, successes: 0, trials: 3 },
    ];
    const v = weightedVisibility(cells);
    assert.equal(v.value, 0.5);
    assert.equal(v.coverage, 0.5, 'the brand appears on half the prompts, which the mean alone hides');
    assert.equal(v.zeroShare, 0.5);
  });

  it('refuses to call a small movement a change', () => {
    assert.equal(twoProportionTest(12, 100, 15, 100).significant, false);
    assert.equal(twoProportionTest(12, 100, 30, 100).significant, true);
  });

  it('reproduces the published sample-size relationship', () => {
    assert.equal(Math.round(marginOfError(300) * 1000) / 10, 5.7);
    assert.equal(Math.round(marginOfError(600) * 1000) / 10, 4.0);
    assert.equal(requiredRuns(0.025), 1537);
  });

  it('produces a deterministic bootstrap interval', () => {
    const cells = Array.from({ length: 20 }, (_, i) => ({ weight: 0.05, successes: i % 4, trials: 3 }));
    const stat = (draw) => draw.reduce((a, c) => a + c.successes / c.trials, 0) / draw.length;
    const a = bootstrapCi(cells, stat, { iterations: 400 });
    const b = bootstrapCi(cells, stat, { iterations: 400 });
    assert.deepEqual(a, b, 'an interval that changes on refresh is not an interval');
    assert.ok(a.low < a.value && a.value < a.high);
  });

  it('scores prominence by ordinal and position', () => {
    const first = prominence({ ordinal: 1, firstOffset: 10, responseLength: 1000 });
    const third = prominence({ ordinal: 3, firstOffset: 900, responseLength: 1000 });
    assert.ok(first > third);
    assert.ok(first <= 1 && third >= 0);
  });

  it('scores an avoid-list mention negatively', () => {
    assert.ok(netStance({ recommended: 8, neutral: 2 }) > 0.5);
    assert.ok(netStance({ negative: 3, cautioned: 2 }) < 0, 'being named as a vendor to avoid is not visibility');
    assert.equal(netStance({}), 0);
  });

  it('measures phrasing robustness', () => {
    assert.ok(phrasingRobustness([0.6, 0.62, 0.58]) > 0.9);
    assert.ok(phrasingRobustness([0.9, 0.1, 0.5]) < 0.5);
    assert.equal(phrasingRobustness([0.5]), null, 'one variant cannot measure robustness');
  });

  it('weights a noisy observation less in the trend', () => {
    const precise = kalmanUpdate(0.3, 0.0004, 0.55, 0.0004);
    const noisy = kalmanUpdate(0.3, 0.0004, 0.55, 0.01);
    assert.ok(Math.abs(noisy.estimate - 0.3) < Math.abs(precise.estimate - 0.3));
  });

  it('has working median and stdev helpers', () => {
    assert.equal(median([3, 1, 2]), 2);
    assert.equal(median([4, 1, 2, 3]), 2.5);
    assert.equal(median([]), 0);
    assert.ok(stdev([1, 1, 1]) === 0);
  });
});

describe('prompt set: the instrument is versioned and honest', () => {
  const seeds = [
    { term: 'furnace repair', volume: 12000 },
    { term: 'ac not cooling', volume: 9000 },
    { term: 'heat pump installation', volume: 6600 },
    { term: 'duct cleaning', volume: 3200 },
    { term: 'what is a heat pump', volume: 22000 },
    { term: 'boiler replacement', volume: 2800 },
  ];
  const vars = { category: 'HVAC service', segment: 'a rowhome', feature: 'same-day service', city: 'Philadelphia', brand: 'Acme HVAC', competitor: 'Comfort Pros' };

  it('hashes the manifest and changes the hash when the set changes', () => {
    const a = buildPromptSet({ setId: 's', seeds, vars, competitors: ['c'] });
    const b = buildPromptSet({ setId: 's', seeds, vars, competitors: ['c'] });
    assert.equal(a.sha256, b.sha256, 'the same input must produce the same instrument');
    const c = buildPromptSet({ setId: 's', seeds: seeds.slice(0, 3), vars, competitors: ['c'] });
    assert.notEqual(a.sha256, c.sha256, 'a different set must be a different instrument');
  });

  it('produces distinct, fully-substituted prompts', () => {
    const set = buildPromptSet({ setId: 's', seeds, vars, competitors: ['c'] });
    const client = set.prompts.filter((p) => p.cohort === 'client');
    assert.equal(new Set(client.map((p) => p.text)).size, client.length, 'no duplicate prompts');
    for (const p of client) assert.ok(!p.text.includes('{'), `unfilled placeholder in: ${p.text}`);
  });

  it('stratifies across intent patterns and funnel stages', () => {
    const set = buildPromptSet({ setId: 's', seeds, vars, competitors: ['c'] });
    assert.ok(Object.keys(set.counts.byPattern).length >= 4, 'a set of one pattern is not an instrument');
    assert.ok(Object.keys(set.counts.byFunnel).length >= 2);
    for (const key of Object.keys(set.counts.byPattern)) assert.ok(PATTERNS[key] || key === 'control');
  });

  it('always includes a control cohort', () => {
    const set = buildPromptSet({ setId: 's', seeds, vars, competitors: ['c'] });
    assert.ok(set.prompts.some((p) => p.cohort === 'control'));
  });

  it('normalises weights to 1 and honours the cap when it is achievable', () => {
    const set = buildPromptSet({ setId: 's', seeds, vars, competitors: ['c'] });
    const client = set.prompts.filter((p) => p.cohort === 'client');
    const total = client.reduce((a, p) => a + p.weight, 0);
    assert.ok(Math.abs(total - 1) < 0.001);
    if (!set.weighting.capRelaxed) {
      assert.ok(Math.max(...client.map((p) => p.weight)) <= 0.0501);
    }
  });

  it('says so when the requested weight cap is mathematically unreachable', () => {
    const tiny = buildPromptSet({ setId: 's', seeds: [{ term: 'furnace repair', volume: 100 }], vars: { category: 'x' }, competitors: [] });
    assert.equal(tiny.weighting.capRelaxed, true);
    assert.match(tiny.weighting.note, /below 1\/n/);
  });

  it('drops prompts where no vendor is ever named, and re-versions', () => {
    const set = buildPromptSet({ setId: 's', seeds, vars, competitors: ['c'] });
    const client = set.prompts.filter((p) => p.cohort === 'client');
    const pilot = client.map((p, i) => ({ promptId: p.id, anyBrandRate: i % 3 === 0 ? 0 : 0.9 }));
    const screened = screenPromptSet(set, pilot);
    assert.ok(screened.screened.droppedCount > 0);
    assert.equal(screened.version, set.version + 1);
    assert.notEqual(screened.sha256, set.sha256);
    const reTotal = screened.prompts.filter((p) => p.cohort === 'client').reduce((a, p) => a + p.weight, 0);
    assert.ok(Math.abs(reTotal - 1) < 0.001, 'weights must be renormalised after screening');
  });

  it('reduces a seed to a usable noun phrase', () => {
    assert.equal(nounPhrase('what is a heat pump'), 'a heat pump');
    assert.equal(nounPhrase('acme hvac vs comfort pros'), 'acme hvac');
    assert.equal(nounPhrase('furnace repair'), 'furnace repair');
    assert.equal(nounPhrase('best hvac company'), 'hvac company');
  });

  it('plans a scan whose precision comes from breadth, not per-prompt depth', () => {
    const set = buildPromptSet({ setId: 's', seeds, vars, competitors: ['c'] });
    const plan = scanPlan(set, { engines: ['a', 'b'], replicates: 5 });
    assert.equal(plan.runs, (plan.prompts + plan.controls) * 2 * 5);
    assert.equal(plan.aggregateRunsPerEngine, plan.prompts * 5);
  });
});

describe('extraction: mentions and citations', () => {
  const brands = [
    { id: 'acme', name: 'Acme HVAC', aliases: ['Acme Heating', 'Acme'], negativeAliases: ['Acme Roofing'], domains: ['acmehvac.com'], owned: true },
    { id: 'comfort', name: 'Comfort Pros', domains: ['comfortpros.co.uk'] },
    { id: 'apple', name: 'Apple', negativeAliases: ['apple cider'] },
  ];

  it('does not double-count overlapping aliases', () => {
    const found = extractMentions('Acme HVAC is good.', brands);
    assert.equal(found.find((f) => f.brandId === 'acme').mentions, 1);
  });

  it('honours negative aliases', () => {
    const found = extractMentions('They drink apple cider. Avoid Acme Roofing.', brands);
    assert.equal(found.find((f) => f.brandId === 'apple'), undefined);
    assert.equal(found.find((f) => f.brandId === 'acme'), undefined);
  });

  it('assigns ordinals by first appearance', () => {
    const found = extractMentions('Comfort Pros first, then Acme HVAC.', brands);
    assert.equal(found.find((f) => f.brandId === 'comfort').ordinal, 1);
    assert.equal(found.find((f) => f.brandId === 'acme').ordinal, 2);
  });

  it('resolves registrable domains, including multi-label suffixes and spoofs', () => {
    assert.equal(registrableDomain('https://blog.acmehvac.com/x'), 'acmehvac.com');
    assert.equal(registrableDomain('https://comfortpros.co.uk/y'), 'comfortpros.co.uk');
    assert.equal(registrableDomain('https://sub.foo.com.au/a'), 'foo.com.au');
    assert.equal(registrableDomain('https://acmehvac.com.attacker.test/z'), 'attacker.test',
      'a domain that merely CONTAINS the owned domain is not the owned domain');
  });

  it('attributes owned citations correctly', () => {
    const cites = extractCitations('See https://blog.acmehvac.com/a and https://other.test/b', { ownedDomains: ['acmehvac.com'] });
    assert.equal(cites.length, 2);
    assert.equal(cites.filter((c) => c.owned).length, 1);
  });

  it('accepts structured citation payloads as well as inline URLs', () => {
    const cites = extractCitations('no urls here', { structured: [{ url: 'https://acmehvac.com/p', title: 'P' }], ownedDomains: ['acmehvac.com'] });
    assert.equal(cites.length, 1);
    assert.equal(cites[0].owned, true);
  });

  it('scores a run into the shape the aggregator consumes', () => {
    const r = scoreRun({
      promptId: 'p1', engine: 'chatgpt', channel: 'api_proxy', replicate: 1,
      text: 'Comfort Pros leads. Acme HVAC also. https://acmehvac.com/x',
      brands, grounded: true,
    });
    assert.equal(r.present, true);
    assert.equal(r.ordinal, 2);
    assert.equal(r.ownedCitations, 1);
    assert.ok(r.evidenceSpan.includes('Acme HVAC'));
  });
});

describe('aggregation: the five structural rules', () => {
  function scan({ engines, competitors = ['comfort'], brandNames = true }) {
    const manifest = {
      setId: 's', version: 1, sha256: 'abc',
      prompts: [
        { id: 'p1', weight: 0.5, cohort: 'client', pattern: 'category_discovery' },
        { id: 'p2', weight: 0.5, cohort: 'client', pattern: 'local' },
        { id: 'c1', weight: 0, cohort: 'control', pattern: 'control' },
      ],
    };
    const runs = [];
    for (const [engine, citeCount] of engines) {
      for (const promptId of ['p1', 'p2', 'c1']) {
        for (let rep = 1; rep <= 4; rep += 1) {
          const isControl = promptId === 'c1';
          const present = !isControl && rep <= 2;
          runs.push({
            promptId, engine, channel: 'api_proxy', replicate: rep,
            present, ordinal: present ? 1 : null, mentionCount: present ? 1 : 0,
            prominence: present ? 0.8 : 0, grounded: rep % 2 === 0,
            brandsPresent: present
              ? [{ brandId: 'self', name: 'Self', ordinal: 1, mentions: 1, owned: true },
                { brandId: 'comfort', name: 'Comfort', ordinal: 2, mentions: 1, owned: false },
                ...(brandNames ? [{ brandId: 'undeclared', name: 'Undeclared Co', ordinal: 3, mentions: 4, owned: false }] : [])]
              : [],
            citations: [], ownedCitations: present ? 1 : 0, totalCitations: citeCount,
            stance: present ? 'recommended' : null,
          });
        }
      }
    }
    return aggregateScan({ runs, manifest, brandId: 'self', competitors });
  }

  it('keys results by engine AND channel, and never blends channels', () => {
    const s = scan({ engines: [['chatgpt', 15], ['gemini', 3]] });
    assert.equal(s.engines.length, 2);
    for (const e of s.engines) assert.equal(e.channel, 'api_proxy');
    assert.ok(!('overallScore' in s), 'there must be no blended cross-engine score');
    assert.match(s.crossEngine.note, /arithmetically invalid/);
  });

  it('normalises citation share within engine so a 5x density difference does not distort it', () => {
    const s = scan({ engines: [['chatgpt', 15], ['gemini', 3]] });
    const chat = s.engines.find((e) => e.engine === 'chatgpt');
    const gem = s.engines.find((e) => e.engine === 'gemini');
    const rawRatio = gem.citation.shareConditional / chat.citation.shareConditional;
    const normRatio = gem.citation.shareNormalized / chat.citation.shareNormalized;
    assert.ok(rawRatio > 3, 'raw share differs sharply purely from citation density');
    assert.ok(Math.abs(normRatio - 1) < 0.2, 'normalised share brings the engines onto one footing');
  });

  it('sums share of voice to 1 with a mandatory other bucket', () => {
    const s = scan({ engines: [['chatgpt', 5]] });
    const e = s.engines[0];
    assert.ok(Math.abs(e.shareOfVoice.sumCheck - 1) < 0.001);
    assert.ok(e.shareOfVoice.other > 0, 'an undeclared brand must land in other, not vanish');
    assert.ok(e.shareOfVoice.otherTopNames.some((n) => n.name === 'Undeclared Co'));
  });

  it('warns when the declared competitor set does not describe the market', () => {
    const s = scan({ engines: [['chatgpt', 5]] });
    const e = s.engines[0];
    if (e.shareOfVoice.other > OTHER_WARN_THRESHOLD) {
      assert.ok(e.warnings.some((w) => w.code === 'COMPETITOR_SET_INCOMPLETE'));
    }
    const none = scan({ engines: [['chatgpt', 5]], competitors: [] });
    assert.ok(none.engines[0].warnings.some((w) => w.code === 'NO_COMPETITOR_SET'));
  });

  it('splits grounded from parametric and names the lever', () => {
    const s = scan({ engines: [['chatgpt', 5]] });
    const r = s.engines[0].retrieval;
    assert.ok(r.groundedRuns > 0 && r.parametricRuns > 0);
    assert.ok(['RETRIEVAL_WORKING', 'BRAND_MEMORY_WORKING', 'BALANCED'].includes(r.lever.code));
  });

  it('names the metric honestly rather than as a bare percentage', () => {
    const s = scan({ engines: [['chatgpt', 5]] });
    assert.match(s.engines[0].composite.metricName, /WeightedPresenceRate/);
    assert.match(s.engines[0].composite.interpretation, /not a share of real user queries/);
  });

  it('keeps the control cohort out of the client aggregate', () => {
    const s = scan({ engines: [['chatgpt', 5]] });
    assert.equal(s.engines[0].control.runs, 4);
    assert.equal(s.engines[0].control.presenceRate, 0);
    assert.equal(s.engines[0].cells.length, 2, 'only client prompts form cells');
  });
});

describe('comparison: no trend without a stable instrument and a control', () => {
  const mk = (sha, vis, control) => ({
    promptSet: { setId: 's', version: 1, sha256: sha },
    engines: [{
      engine: 'chatgpt', channel: 'api_proxy',
      cells: [{ successes: Math.round(vis * 100), trials: 100 }],
      visibility: { value: vis }, composite: { value: vis * 100 },
      control: { presenceRate: control },
    }],
  });

  it('refuses to compare across prompt-set versions', () => {
    const out = compareScans(mk('abc', 0.12, 0), mk('xyz', 0.3, 0));
    assert.equal(out.comparable, false);
    assert.equal(out.problems[0].code, 'PROMPT_SET_CHANGED');
  });

  it('reports an insignificant movement as no change', () => {
    const out = compareScans(mk('abc', 0.12, 0), mk('abc', 0.15, 0));
    assert.equal(out.comparisons[0].significant, false);
    assert.match(out.comparisons[0].verdict, /within sampling noise/);
  });

  it('nets out engine drift measured by the control cohort', () => {
    const out = compareScans(mk('abc', 0.12, 0.05), mk('abc', 0.30, 0.22));
    const cmp = out.comparisons[0];
    assert.equal(cmp.rawDelta, 0.18);
    assert.ok(Math.abs(cmp.controlDelta - 0.17) < 1e-9);
    assert.ok(Math.abs(cmp.adjustedDelta - 0.01) < 1e-9, 'attributable change is the raw delta minus engine drift');
    assert.match(cmp.verdict, /engine itself shifted/);
  });
});

describe('crawler registry: the three gate classes', () => {
  it('classifies each operator bot by what blocking it actually costs', () => {
    assert.equal(identify('GPTBot/1.2').gate, GATE.training);
    assert.equal(identify('OAI-SearchBot/1.0').gate, GATE.searchIndex);
    assert.equal(identify('ChatGPT-User/2.0').gate, GATE.userFetch);
    assert.equal(identify('Mozilla/5.0 (Macintosh) Safari/605'), null);
  });

  it('matches the longest token so Claude-SearchBot is not read as ClaudeBot', () => {
    assert.equal(identify('Mozilla/5.0 (compatible; Claude-SearchBot/1.0)').token, 'Claude-SearchBot');
    assert.equal(identify('Mozilla/5.0 (compatible; ClaudeBot/1.0)').token, 'ClaudeBot');
  });

  it('treats Google-Extended and Applebot-Extended as control tokens that fetch nothing', () => {
    const control = byGate(GATE.controlToken).map((c) => c.token);
    assert.ok(control.includes('Google-Extended'));
    assert.ok(control.includes('Applebot-Extended'));
    for (const token of control) assert.equal(identify(`${token}/1.0`), null, 'a control token never appears in a user agent');
  });

  it('generates a policy that allows retrieval and blocks training', () => {
    const txt = robotsPolicy({ sitemapUrl: 'https://x.test/sitemap.xml' });
    const blocks = parseRobots(txt);
    assert.equal(blocks.get('oai-searchbot').disallowAll, false);
    assert.equal(blocks.get('gptbot').disallowAll, true);
    assert.equal(blocks.get('claude-searchbot').disallowAll, false);
    assert.equal(blocks.get('claudebot').disallowAll, true);
    assert.equal(blocks.get('applebot').disallowAll, false);
    assert.equal(blocks.get('applebot-extended').disallowAll, true);
    assert.match(txt, /Sitemap: https:\/\/x\.test\/sitemap\.xml/);
  });

  it('flags a blanket disallow as critical for search-class crawlers', () => {
    const audit = auditRobots('User-agent: *\nDisallow: /\n');
    const critical = audit.findings.filter((f) => f.severity === 'critical');
    assert.ok(critical.length >= 3);
    assert.ok(critical.every((f) => f.code === 'SEARCH_CLASS_BLOCKED'));
  });

  it('explains that blocking Google-Extended does not remove a site from AI Overviews', () => {
    const audit = auditRobots('User-agent: Google-Extended\nDisallow: /\n');
    const note = audit.findings.find((f) => f.code === 'GOOGLE_EXTENDED_NOTE');
    assert.ok(note);
    assert.match(note.message, /does NOT remove the site from AI Overviews/);
  });
});

describe('guardrails: nothing unsourced reaches a client', () => {
  it('blocks unsourced statistics and superlatives', () => {
    const r = runGuardrails({ body: 'We are the best in town and 97% of our 2,400+ customers agree completely.', evidence: [] }, {});
    assert.equal(r.passed, false);
    assert.equal(r.blocking[0].rule, 'unsourced-claim');
    assert.ok(r.claims.length >= 2);
  });

  it('clears once sources are attached', () => {
    const body = 'We are the best in town and 97% of our 2,400+ customers agree completely.';
    const evidence = Array.from({ length: 6 }, (_, i) => ({ ref: `capture:${i}` }));
    assert.equal(runGuardrails({ body, evidence }, {}).passed, true);
  });

  it('warns when evidence is too thin to cover the claims made', () => {
    const body = 'We hit 97% satisfaction, 4.9 stars, 2,400+ customers, 15 years in business, and 3x faster response than anyone.';
    const r = runGuardrails({ body, evidence: [{ ref: 'one' }] }, {});
    assert.ok(r.warnings.some((w) => w.rule === 'thin-evidence'));
  });

  it('blocks banned phrases from the brand profile', () => {
    const r = runGuardrails({ body: 'Get the cheapest service in the city today from our team.', evidence: [{ ref: 'x' }] }, { bannedPhrases: ['cheapest'] });
    assert.equal(r.passed, false);
    assert.ok(r.blocking.some((b) => b.rule === 'banned-phrase'));
  });

  it('requires disclosures on external copy but not on internal artifacts', () => {
    const profile = { requiredDisclosures: [{ text: 'PA HIC #123' }] };
    const artifact = { body: 'A perfectly ordinary paragraph about heating maintenance for older homes.', evidence: [{ ref: 'x' }] };
    assert.equal(runGuardrails(artifact, profile, { requireEvidence: true, requireDisclosures: true }).passed, false);
    assert.equal(runGuardrails(artifact, profile, { requireEvidence: false, requireDisclosures: false }).passed, true);
  });

  it('detects placeholder text, including bracketed placeholders', () => {
    for (const body of [
      'Our team is [insert value prop] and serves the metro area with pride every day.',
      'Call [YOUR COMPANY] today for fast service across the whole region right now.',
      'Rendered via {{company_name}} which never got substituted before handover today.',
      'TODO: write the intro paragraph about heating service for city rowhomes here.',
    ]) {
      const r = runGuardrails({ body, evidence: [{ ref: 'x' }] }, {});
      assert.ok(r.blocking.some((b) => b.rule === 'placeholder-text'), `should block: ${body}`);
    }
  });

  it('blocks output that is empty rather than shipping a failed generation', () => {
    assert.ok(runGuardrails({ body: 'too short', evidence: [] }, {}).blocking.some((b) => b.rule === 'empty-output'));
  });

  it('warns on stock AI phrasing', () => {
    const body = "In today's fast-paced world, when it comes to service, look no further. Let us dive into how we revolutionize comfort and seamlessly integrate solutions. In conclusion, furthermore, moreover.";
    const r = runGuardrails({ body, evidence: [{ ref: 'x' }] }, {});
    const tells = r.findings.find((f) => f.rule === 'ai-tells');
    assert.ok(tells && tells.count > 5);
  });

  it('throws from assertPublishable when a blocking rule fires', () => {
    assert.throws(
      () => assertPublishable({ body: 'We are #1 with 99% satisfaction across the entire region always.', evidence: [] }, {}),
      /GUARDRAIL|blocking guardrail/,
    );
  });

  it('extracts regulated language that needs substantiation', () => {
    const claims = extractClaims('We are licensed and insured, offer a money-back guarantee, and provide free same-day estimates.');
    assert.ok(claims.some((c) => c.kind === 'regulated'));
  });

  it('computes a reading grade', () => {
    const simple = fleschKincaid('We fix furnaces. We come today. The price is flat.');
    const dense = fleschKincaid('Notwithstanding aforementioned thermodynamic considerations, comprehensive preventative methodologies constitute indispensable prerequisites for operational longevity maximization.');
    assert.ok(dense.grade > simple.grade);
  });
});

describe('crawler: SSRF guard and AEO analysis', () => {
  const publicResolver = async () => [{ address: '93.184.216.34', family: 4 }];

  it('refuses private, loopback, link-local and metadata addresses', async () => {
    for (const url of [
      'http://169.254.169.254/latest/meta-data/',
      'http://127.0.0.1:8080/admin',
      'http://localhost/',
      'http://10.0.0.5/',
      'http://192.168.1.1/',
      'http://[::1]/',
      'https://thing.internal/',
      'file:///etc/passwd',
    ]) {
      await assert.rejects(() => assertPublicUrl(url, { resolver: publicResolver }), `must refuse ${url}`);
    }
  });

  it('refuses a public hostname that resolves to a private address', async () => {
    await assert.rejects(
      () => assertPublicUrl('https://rebind.test/', { resolver: async () => [{ address: '127.0.0.1', family: 4 }] }),
      /private address/,
    );
  });

  it('allows an ordinary public URL', async () => {
    const u = await assertPublicUrl('https://example.test/page', { resolver: publicResolver });
    assert.equal(u.hostname, 'example.test');
  });

  it('classifies reserved IPv4 ranges', () => {
    assert.equal(isBlockedIpv4('169.254.169.254'), true);
    assert.equal(isBlockedIpv4('10.1.2.3'), true);
    assert.equal(isBlockedIpv4('93.184.216.34'), false);
    assert.equal(isBlockedIpv4('not-an-ip'), true, 'unparseable input must be treated as blocked');
  });

  it('reports full SSR coverage for a server-rendered page', () => {
    const html = `<html><body><h1>Title</h1><p>${'Real sentence about heating systems here. '.repeat(20)}</p></body></html>`;
    const s = ssrCoverage(html);
    assert.equal(s.coverage, 1);
    assert.equal(s.emptyShell, false);
    assert.match(s.verdictByEngine['openai/anthropic/perplexity'], /visible/);
  });

  it('flags a client-rendered shell as at risk, per engine', () => {
    const html = '<html><body><div id="__next"></div><script src="/a.js"></script><script src="/b.js"></script>'
      + '<script id="__NEXT_DATA__" type="application/json">{"p":{"hero":"Same-day furnace repair across the city from licensed technicians with flat pricing"}}</script></body></html>';
    const s = ssrCoverage(html);
    assert.ok(s.coverage < 0.5);
    assert.equal(s.emptyShell, true);
    assert.equal(s.hydrationFramework, 'next');
    assert.match(s.verdictByEngine['openai/anthropic/perplexity'], /AT RISK/);
    assert.match(s.verdictByEngine['google-ai-overviews'], /Googlebot renders/);
  });

  it('flags an unstructured wall of text as unchunkable', () => {
    const html = `<html><body><p>${'Sentence about maintenance schedules for older homes. '.repeat(90)}</p></body></html>`;
    const c = chunkability(html);
    assert.ok(c.findings.some((f) => f.code === 'NO_SECTIONS'));
    assert.ok(c.score < 70);
  });

  it('detects nosnippet, which suppresses AI Overview snippets too', () => {
    const a = analyzePage({ url: 'https://x.test/', html: '<html><head><meta name="robots" content="nosnippet, max-snippet:-1"></head><body><p>hello there friends</p></body></html>' });
    assert.equal(a.nosnippet, true);
    assert.equal(a.maxSnippet, '-1');
  });

  it('extracts schema types and counts links by locality', () => {
    const html = '<html><head><script type="application/ld+json">{"@type":"LocalBusiness","name":"X"}</script></head>'
      + '<body><h1>H</h1><a href="/a">in</a><a href="https://other.test/b">out</a><img src="x.jpg"></body></html>';
    const a = analyzePage({ url: 'https://x.test/', html });
    assert.deepEqual(a.schemaTypes, ['LocalBusiness']);
    assert.equal(a.internalLinks, 1);
    assert.equal(a.externalLinks, 1);
    assert.equal(a.imagesMissingAlt, 1);
  });

  it('strips scripts and styles from extracted text', () => {
    const text = extractText('<html><body><script>var secret=1;</script><style>.a{color:red}</style><p>Only this.</p></body></html>');
    assert.equal(text, 'Only this.');
  });
});

describe('a simulated scan can never be presented as a measurement', () => {
  // This guards a defect that shipped once: the GEO probe asked one model to
  // answer "as chatgpt would" and then labelled the row engine="chatgpt",
  // channel="api_proxy". The number was real; its provenance was not. That is
  // the same channel conflation this engine exists to refuse, so it is now a
  // structural property rather than a caller's good intentions.
  const manifest = {
    setId: 's', version: 1, sha256: 'abc',
    prompts: [{ id: 'p1', weight: 1, cohort: 'client', pattern: 'local' }],
  };
  const mk = (channel, simulated, answeredBy) => aggregateScan({
    manifest, brandId: 'self', competitors: ['rival'],
    runs: Array.from({ length: 4 }, (_, i) => ({
      promptId: 'p1', engine: 'chatgpt', channel, replicate: i + 1,
      simulated, answeredBy,
      present: i < 2, ordinal: i < 2 ? 1 : null, mentionCount: i < 2 ? 1 : 0,
      prominence: i < 2 ? 0.8 : 0, grounded: true,
      brandsPresent: i < 2 ? [{ brandId: 'self', name: 'Self', ordinal: 1, mentions: 1, owned: true }] : [],
      citations: [], ownedCitations: 0, totalCitations: 2, stance: null,
    })),
  });

  it('marks a simulated scan not reportable and raises a blocking warning', () => {
    const scan = mk('simulated', true, 'claude-opus-5');
    assert.equal(scan.simulated, true);
    assert.equal(scan.reportable, false);
    const blocking = scan.warnings.filter((w) => w.severity === 'blocking');
    assert.equal(blocking.length, 1);
    assert.equal(blocking[0].code, 'SIMULATED_NOT_MEASURED');
    assert.match(blocking[0].message, /did not come from chatgpt/);
    assert.match(blocking[0].message, /claude-opus-5/);
  });

  it('detects simulation from the runs even if the channel lies', () => {
    // A caller passing channel: 'api_proxy' must not be able to launder it.
    const scan = mk('api_proxy', true, 'claude-opus-5');
    assert.equal(scan.reportable, false, 'run-level simulated flag must win over the channel label');
    assert.ok(scan.engines[0].simulated);
  });

  it('names the simulation in the metric name and the interpretation', () => {
    const e = mk('simulated', true, 'claude-opus-5').engines[0];
    assert.match(e.composite.metricName, /^SIMULATED_/);
    assert.match(e.composite.interpretation, /says nothing about chatgpt itself/);
  });

  it('leaves a real scan reportable and unflagged', () => {
    const scan = mk('api_proxy', false, null);
    assert.equal(scan.simulated, false);
    assert.equal(scan.reportable, true);
    assert.equal(scan.warnings.filter((w) => w.severity === 'blocking').length, 0);
    assert.doesNotMatch(scan.engines[0].composite.metricName, /SIMULATED/);
  });

  it('refuses to trend a simulated scan against a real one', () => {
    const out = compareScans(mk('simulated', true, 'claude-opus-5'), mk('api_proxy', false, null));
    assert.equal(out.comparable, false);
    assert.ok(out.problems.some((p) => p.code === 'SIMULATED_VS_REAL'));
  });
});
