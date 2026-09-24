'use strict';
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

module.exports = { manifest };
