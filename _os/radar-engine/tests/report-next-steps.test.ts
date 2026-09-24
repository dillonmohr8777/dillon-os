'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { it } = require('node:test');
const assert = require('node:assert/strict');
const { renderReportHtml, checkReport } = require('../lib/reports.ts');
const { loadConfig } = require('../lib/config.ts');

const manifest = {
  prospect: { business_name: 'Synthetic report preview', website: 'https://example.org' },
  observed_at: '2026-09-23T00:00:00Z', audit_id: 'synthetic-only', score_version: 'test',
  modules: ['executive_summary'], scores: { site_quality_score: null }, findings: [],
  limitations: ['Synthetic layout sample; no business website was audited.'],
  evidence: [{ id: 'fixture', source: 'Synthetic fixture', classification: 'illustrative', metric: 'layout only', captured_at: '2026-09-23' }],
};

it('puts the branded next steps after evidence and retains the tracked booking link', () => {
  const config = loadConfig({ contactEmail: 'hi@needmomentum.com' });
  const bookingUrl = 'https://example.org/cta/synthetic?kind=book&source=report';
  const { html } = renderReportHtml(manifest, { bookingUrl, config });
  assert.equal(checkReport(html, manifest).ok, true);
  assert.match(html, /alt="Momentum Digital"/);
  assert.match(html, /src="data:image\/png;base64,/);
  assert.ok(html.indexOf('Source appendix') < html.indexOf('id="next-steps-title"'));
  assert.match(html, /href="https:\/\/example.org\/cta\/synthetic\?kind=book&amp;source=report"/);
  assert.match(html, /break-before: page/);
  assert.doesNotMatch(html, /Close the highest eligible offer|needmomentum\.com\/book/);
});

it('renders missing scores, source references and tokens without dashes or internal notes', () => {
  const config = loadConfig({ contactEmail: 'hi@needmomentum.com' });
  const full = {
    ...manifest,
    modules: ['executive_summary', 'opportunity_scorecard', 'website_technical_seo'],
    scores: { site_quality_score: 41, local_opportunity: null },
    findings: [{
      id: 'fnd_1', section: 'website_technical_seo', type: 'measured', evidence_ids: ['fixture'], confidence: 0.9,
      severity: 'high', claim: 'Synthetic claim.', allowed_wording: 'Synthetic claim.',
      why_it_matters: 'Synthetic reason.', recommended_action: 'Synthetic action.',
    }],
  };
  const before = process.env.MOMENTUM_TOKENS_CSS;
  const tokens = path.join(os.tmpdir(), `report-tokens-${process.pid}.css`);
  fs.writeFileSync(tokens, ':root{--m-paper:#FBF8F4}/* internal note: papaadvertising */');
  process.env.MOMENTUM_TOKENS_CSS = tokens;
  let html;
  try {
    ({ html } = renderReportHtml(full, { bookingUrl: 'https://example.org/cta', config }));
  } finally {
    if (before == null) delete process.env.MOMENTUM_TOKENS_CSS; else process.env.MOMENTUM_TOKENS_CSS = before;
    fs.rmSync(tokens, { force: true });
  }
  assert.equal(checkReport(html, full).ok, true);
  assert.match(html, /Not scored/);
  assert.match(html, /Source 1</);
  assert.match(html, /--m-paper:#FBF8F4/);
  assert.doesNotMatch(html, /\/\*|papaadvertising/);
  assert.equal(checkReport(html.replace('Synthetic claim.', `Synthetic ${String.fromCharCode(0x2013)} claim.`), full).ok, false);
});

it('refuses to render without the Momentum design tokens', () => {
  const before = process.env.MOMENTUM_TOKENS_CSS;
  process.env.MOMENTUM_TOKENS_CSS = 'Z:/missing/tokens.css';
  try {
    assert.throws(() => renderReportHtml(manifest, { bookingUrl: 'https://example.org/cta', config: loadConfig() }), /Momentum design tokens not found/);
  } finally {
    if (before == null) delete process.env.MOMENTUM_TOKENS_CSS; else process.env.MOMENTUM_TOKENS_CSS = before;
  }
});

module.exports = { manifest };
