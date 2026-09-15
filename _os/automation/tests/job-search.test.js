'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { stripHtml, toISO, collectAll, stableId } = require('../lib/job-search/sources');
const {
  isEligible, scoreFit, scoreOdds, rank, rankAll, requiredYears, bandOf,
} = require('../lib/job-search/scoring');
const { selectEvidence, extractAsks, draftFor } = require('../lib/job-search/drafting');
const { renderRankedList, renderDraft, verdict } = require('../lib/job-search/render');
const { readJson, repoPath } = require('../lib/fsutil');

const profile = readJson(repoPath('02_FullTimeJob', 'JobSearch', 'profile', 'dillon-profile.json'));
const evidence = readJson(repoPath('02_FullTimeJob', 'JobSearch', 'profile', 'evidence.json'));
const NOW = Date.parse('2026-09-10T12:00:00Z');

function job(overrides = {}) {
  return {
    job_id: 'test1',
    source: 'test',
    title: 'Director of Marketing',
    company: 'Midsize Agency Co',
    location: 'Remote - US',
    remote: true,
    url: 'https://example.com/job',
    posted_at: '2026-09-08T00:00:00Z',
    description: 'We need a hands-on leader for paid search, SEO, and demand generation. 5+ years experience. HubSpot a plus.',
    tags: [],
    ...overrides,
  };
}

describe('job-search sources', () => {
  it('strips html and entities down to plain words', () => {
    const html = '<p>Lead <b>growth</b>&nbsp;&amp; SEO</p><script>evil()</script>';
    assert.equal(stripHtml(html), 'Lead growth & SEO');
  });

  it('normalizes unix seconds and ISO strings, and rejects junk', () => {
    assert.equal(toISO(1788989441), new Date(1788989441 * 1000).toISOString());
    assert.equal(toISO('2026-09-08T00:00:00Z'), '2026-09-08T00:00:00.000Z');
    assert.equal(toISO('not a date'), null);
    assert.equal(toISO(null), null);
  });

  it('generates a stable id for the same posting', () => {
    assert.equal(stableId('a', 'b', 'c', 'd'), stableId('a', 'b', 'c', 'd'));
    assert.notEqual(stableId('a', 'b', 'c', 'd'), stableId('a', 'b', 'c', 'e'));
  });

  it('a failing board does not sink the sweep', async () => {
    // The whole point of Promise.allSettled here: one dead company slug must
    // not cost the day's list.
    const sources = { aggregators: [], greenhouse_boards: ['dead-slug'], lever_boards: [], ashby_boards: [] };
    const errors = [];
    const result = await collectAll(sources, {
      onError: (label, message) => errors.push([label, message]),
      options: { fetchFn: async () => ({ ok: false, status: 404, json: async () => ({}) }) },
    });
    assert.equal(result.jobs.length, 0);
    assert.equal(errors.length, 1);
    assert.match(errors[0][1], /404/);
  });

  it('prefers the company board row over the aggregator duplicate', async () => {
    const shared = { title: 'Head of Growth', company_name: 'Acme', company: 'Acme' };
    const sources = { aggregators: [{ id: 'remotive', enabled: true }], greenhouse_boards: ['acme'], lever_boards: [], ashby_boards: [] };
    const result = await collectAll(sources, {
      options: {
        fetchFn: async (url) => ({
          ok: true,
          status: 200,
          json: async () => (url.includes('remotive')
            ? { jobs: [{ ...shared, url: 'https://remotive.com/x', candidate_required_location: 'USA' }] }
            : { jobs: [{ title: 'Head of Growth', company_name: 'Acme', absolute_url: 'https://boards.greenhouse.io/acme/1', location: { name: 'Remote' } }] }),
        }),
      },
    });
    assert.equal(result.jobs.length, 1, 'the duplicate should collapse');
    assert.match(result.jobs[0].source, /^greenhouse/);
  });
});

describe('eligibility gate', () => {
  it('accepts a marketing role in the US', () => {
    assert.equal(isEligible(job(), profile, NOW).ok, true);
  });

  it('rejects non-marketing roles', () => {
    const gate = isEligible(job({ title: 'Senior Backend Engineer' }), profile, NOW);
    assert.equal(gate.ok, false);
  });

  it('rejects explicitly excluded titles even when marketing-flavored', () => {
    const gate = isEligible(job({ title: 'Marketing Intern' }), profile, NOW);
    assert.equal(gate.ok, false);
    assert.equal(gate.reason, 'excluded title');
  });

  it('reports the remote failure before the location one', () => {
    // A non-remote foreign role fails both gates; remote is checked first
    // because it is the requirement with no exceptions.
    const onsite = isEligible(job({ title: 'Marketing Manager', location: 'Munich', remote: false }), profile, NOW);
    assert.equal(onsite.ok, false);
    assert.equal(onsite.reason, 'not remote');

    const remoteForeign = isEligible(job({ title: 'Marketing Manager', location: 'Munich - Remote', remote: true }), profile, NOW);
    assert.equal(remoteForeign.ok, false);
    assert.match(remoteForeign.reason, /outside US/);
  });

  // Remote is a hard requirement, not a preference.
  it('rejects hybrid and on-site roles even in the US', () => {
    for (const [location, title, remote] of [
      ['Hybrid - San Francisco, Austin', 'Marketing Operations Manager', true],
      ['Philadelphia, PA', 'Director of Marketing', false],
      ['New York, NY', 'VP Marketing', false],
      ['Onsite - Austin, TX', 'Growth Lead', false],
    ]) {
      const gate = isEligible(job({ title, location, remote }), profile, NOW);
      assert.equal(gate.ok, false, `${title} @ ${location} is not remote and should be rejected`);
    }
  });

  // Regression, all three from real postings that reached the ranked list:
  //   "APAC"       contains "pa" -> Pennsylvania
  //   "Manager:in" contains "in" -> Indiana
  //   "BC, or NS"  contains "or" -> Oregon, and put a Canada-only role at #1
  it('rejects foreign postings whose text contains a US state code', () => {
    for (const [location, title] of [
      ['Canada - Remote (ON, AB, BC, or NS Only)', 'Growth Media Marketing Manager, Paid Search'],
      ['Achim bei Bremen', '(Senior) SEO Manager:in I SEO, GEO & AI Search'],
      ['Berlin', 'Account Manager, SME & Growth'],
      ['', 'Field Marketing Lead, APAC'],
      ['Remote - EMEA', 'Marketing Lead'],
      ['Toronto, ON', 'Marketing Director'],
      ['London, United Kingdom', 'Head of Marketing'],
    ]) {
      const gate = isEligible(job({ title, location, remote: true }), profile, NOW);
      assert.equal(gate.ok, false, `${title} @ ${location || 'no location'} should be rejected`);
    }
  });

  it('accepts remote roles open to the US', () => {
    for (const [location, title] of [
      ['Remote - US', 'Head of Growth'],
      ['Remote, USA', 'Director of Marketing'],
      ['Remote (PA, NJ, NY)', 'Marketing Director'],
      ['Worldwide', 'Marketing Manager'],
      ['Remote', 'Head of Growth'],
    ]) {
      const gate = isEligible(job({ title, location, remote: true }), profile, NOW);
      assert.equal(gate.ok, true, `${title} @ ${location} should be accepted`);
    }
  });

  it('rejects stale postings', () => {
    const gate = isEligible(job({ posted_at: '2026-01-01T00:00:00Z' }), profile, NOW);
    assert.equal(gate.ok, false);
    assert.match(gate.reason, /stale/);
  });
});

describe('scoring', () => {
  it('reads a stated years-of-experience requirement', () => {
    assert.equal(requiredYears('We want 8+ years of experience in growth'), 8);
    assert.equal(requiredYears('no numbers here'), null);
  });

  it('places titles in the right seniority band', () => {
    assert.equal(bandOf('Chief Marketing Officer', profile), 'executive');
    assert.equal(bandOf('Director of Marketing', profile), 'director');
    assert.equal(bandOf('Marketing Manager', profile), 'manager');
    assert.equal(bandOf('Marketing Coordinator', profile), 'junior');
  });

  it('scores a target-band title above an adjacent one', () => {
    const target = scoreFit(job({ title: 'Head of Growth' }), profile).score;
    const adjacent = scoreFit(job({ title: 'Marketing Manager' }), profile).score;
    assert.ok(target > adjacent, `expected ${target} > ${adjacent}`);
  });

  it('rates a manager seat as better odds than an executive seat', () => {
    const exec = scoreOdds(job({ title: 'Chief Marketing Officer' }), profile, NOW).score;
    const mgr = scoreOdds(job({ title: 'Marketing Manager' }), profile, NOW).score;
    assert.ok(mgr > exec, `expected manager odds ${mgr} > exec odds ${exec}`);
  });

  it('penalizes household-name employers on odds', () => {
    const big = scoreOdds(job({ company: 'Google' }), profile, NOW).score;
    const small = scoreOdds(job({ company: 'Midsize Agency Co' }), profile, NOW).score;
    assert.ok(small > big, 'a small company should be better odds than Google');
  });

  it('penalizes a stated requirement far beyond his experience', () => {
    const reach = scoreOdds(job({ description: 'Requires 15+ years of experience.' }), profile, NOW).score;
    const fine = scoreOdds(job({ description: 'Requires 5+ years of experience.' }), profile, NOW).score;
    assert.ok(fine > reach);
  });

  it('rewards fresh postings over old ones', () => {
    const fresh = scoreOdds(job({ posted_at: '2026-09-09T00:00:00Z' }), profile, NOW).score;
    const old = scoreOdds(job({ posted_at: '2026-08-15T00:00:00Z' }), profile, NOW).score;
    assert.ok(fresh > old);
  });

  it('keeps both scores in range and always explains itself', () => {
    const ranked = rank(job(), profile, NOW);
    for (const key of ['fit_score', 'odds_score', 'priority_score']) {
      assert.ok(ranked[key] >= 0 && ranked[key] <= 100, `${key} out of range`);
    }
    assert.ok(ranked.fit_reasons.length > 0, 'fit must be explained');
    assert.ok(ranked.odds_reasons.length > 0, 'odds must be explained');
  });

  it('sorts by priority and separates rejected rows', () => {
    const { ranked, rejected } = rankAll([
      job({ job_id: 'a', title: 'Marketing Coordinator' }),
      job({ job_id: 'b', title: 'Head of Growth' }),
      job({ job_id: 'c', title: 'Backend Engineer' }),
    ], profile, NOW);
    assert.equal(rejected.length, 2, 'coordinator and engineer are both out');
    assert.equal(ranked.length, 1);
    assert.equal(ranked[0].job_id, 'b');
  });
});

describe('drafting', () => {
  it('picks evidence that matches the posting', () => {
    const selected = selectEvidence(job({
      description: 'Own SEO and organic search content strategy end to end.',
    }), evidence);
    assert.ok(selected.length > 0);
    const tags = selected.flatMap((item) => item.tags);
    assert.ok(tags.includes('seo'), 'an SEO posting should surface SEO evidence');
  });

  it('pulls the asks out of the posting text', () => {
    const asks = extractAsks(job({ description: 'You will own paid search, SEO, and attribution reporting.' }));
    assert.ok(asks.includes('paid media'));
    assert.ok(asks.includes('SEO'));
    assert.ok(asks.includes('attribution and analytics'));
  });

  it('every drafted claim carries a source ref', () => {
    const draft = draftFor(rank(job(), profile, NOW), profile, evidence);
    assert.ok(draft.evidence_used.length > 0);
    for (const item of draft.evidence_used) {
      assert.ok(item.source_ref && item.source_ref.length > 3, 'evidence must cite a source');
    }
  });

  it('produces a cover note that names the company and role', () => {
    const draft = draftFor(rank(job(), profile, NOW), profile, evidence);
    assert.match(draft.cover_note, /Midsize Agency Co/);
    assert.match(draft.cover_note, /Director of Marketing/);
  });
});

describe('rendering', () => {
  const ranked = rankAll([job()], profile, NOW).ranked;
  const drafts = { [ranked[0].job_id]: draftFor(ranked[0], profile, evidence) };
  const stats = { raw_count: 10, deduped: 9, eligible: 1, rejected: 8, sources: [{ source: 'test', ok: true, count: 10 }], sources_ok: 1, sources_total: 1 };

  it('renders a list that states the draft-only boundary', () => {
    const md = renderRankedList({ date: '2026-09-10', ranked, drafts, stats, profile });
    assert.match(md, /Draft only/i);
    assert.match(md, /Director of Marketing/);
    assert.match(md, /\| Fit \| Odds \| Priority \|/);
  });

  it('renders a draft that says it was never sent', () => {
    const md = renderDraft({ date: '2026-09-10', row: ranked[0], draft: drafts[ranked[0].job_id], profile });
    assert.match(md, /Draft only\. Never sent\./);
    assert.match(md, /status: draft-never-sent/);
  });

  it('maps priority onto a verdict', () => {
    assert.equal(verdict({ priority_score: 80 }), 'Apply today');
    assert.equal(verdict({ priority_score: 30 }), 'Skip unless something changes');
  });
});

describe('fit floor', () => {
  it('drops an easy-to-get role that is the wrong job', () => {
    // Real case: an account-manager req scored odds 90 and fit 38, and rode the
    // odds onto the top fifteen. The floor is what stops that.
    const weak = job({
      job_id: 'weak',
      title: 'Account Manager | Growth',
      description: 'Manage a book of customers. 2+ years experience. Small team, scrappy.',
    });
    const strong = job({ job_id: 'strong', title: 'Director of Marketing' });
    const { ranked, rejected } = rankAll([weak, strong], profile, NOW);
    assert.ok(ranked.every((r) => r.fit_score >= profile.hard_filters.min_fit_score));
    assert.ok(
      rejected.some((r) => /below fit floor/.test(r.reason)) || !ranked.some((r) => r.job_id === 'weak'),
      'the weak-fit row must not survive',
    );
  });

  it('excludes non-marketing titles that used to slip through', () => {
    for (const title of [
      'Senior Brand Designer',
      'Customer Success Manager, Growth',
      'Account Executive, Growth',
      'Senior Software Engineer, Growth',
    ]) {
      const gate = isEligible(job({ title }), profile, NOW);
      assert.equal(gate.ok, false, `${title} should be excluded`);
    }
  });
});
