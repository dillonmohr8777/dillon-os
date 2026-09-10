'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { assessLogoEligibility: assess, sameSite, dedupeDecisions, applyLogoEligibility } = require('../lib/logo-eligibility');
const radar = require('../lib/radar');
const { projectRows, renderDashboard } = require('../lib/radar-dashboard');
const { checkImagery, surveyImagery } = require('../lib/imagery');
const { encodePng } = require('../lib/logo-audit');
function row(domain = 'acme.example') {
  return { domain, website: `https://${domain}`, business_name: 'Acme Plumbing', lifecycle: 'queued_build',
    grades: [], current: { verdict: 'rebuild', opportunity: 80 }, imagery: { buildable: true, usable: 6 },
    logo_eligibility: { status: 'verified', source_kind: 'official_site',
      source_page: `https://${domain}/`, source_url: `https://${domain}/brand.png`,
      identity_match: 'exact', exact_match: true, source_sha256: 'a'.repeat(64),
      fetched_at: new Date().toISOString(), fetch_status: 200, bytes: 1200,
      image_format: 'png', width: 240, height: 80, usable: true,
      transparent: true, clarity_reviewed: true, display_width: 120, display_height: 40,
      logo_role: 'business_logo', validation_method: 'visual_review', validated_by: 'test-reviewer' } };
}
test('real logo evidence qualifies; every missing or failed trust boundary holds', () => {
  assert.equal(assess(row()).eligible, true);
  const invalid = [
    { status: 'pending' }, { status: 'rejected' }, { identity_match: false }, { exact_match: false },
    { source_url: 'javascript:alert(1)' }, { source_url: 'https://acme.example/favicon-logo.png' },
    { source_url: 'https://acme.example/facebook-logo.png' }, { source_url: '' }, { source_sha256: '' },
    { fetch_status: 404 }, { usable: false }, { width: 1 }, { image_format: 'html' },
    { fetched_at: '2020-01-01' }, { fetched_at: '2100-01-01' }, { validation_method: 'alt_text' },
    { logo_role: 'generated_mark' }, { validated_by: '' }, { source_page: 'https://unrelated.example/' },
    { transparent: false }, { transparent: undefined }, { clarity_reviewed: false },
    { display_width: 121 }, { display_height: 41 }, { display_width: 0 }, { display_width: '120' },
  ];
  for (const override of invalid) {
    const p = row(); Object.assign(p.logo_eligibility, override);
    assert.equal(assess(p).eligible, false, JSON.stringify(override));
  }
  assert.equal(assess({ website: 'https://acme.example', imagery: { logo: true } }).eligible, false);
  assert.equal(sameSite('https://evil.co.uk', 'https://acme.co.uk'), false);
  assert.equal(sameSite('https://evil.github.io', 'https://acme.github.io'), false);
  assert.equal(sameSite('https://www.acme.example', 'https://acme.example'), true);
  const vector = row(); Object.assign(vector.logo_eligibility, {image_format: 'svg', display_width: 600, display_height: 200});
  assert.equal(assess(vector).eligible, true);
  assert.equal(assess(row()).transparent, true);
});
test('official social needs exact account evidence and a real profile', () => {
  const p = row();
  Object.assign(p.logo_eligibility, { source_kind: 'official_social', profile_url: 'https://instagram.com/acmeplumbing/',
    account_match: true, linked_from_official_site: true });
  assert.equal(assess(p).eligible, true);
  p.logo_eligibility.account_match = false;
  assert.equal(assess(p).eligible, false);
  p.logo_eligibility.account_match = true; p.logo_eligibility.profile_url = 'https://instagram.com/';
  assert.equal(assess(p).eligible, false);
});
test('domain, business and slug duplicates stay auditable and cannot enter active queues', () => {
  const a = row(), b = row('other.example'), c = row('third.example');
  c.business_name = 'Third'; a.slug = c.slug = 'same-slug';
  assert.deepEqual(dedupeDecisions([a, b, c]).map(x => x.eligible), [true, false, false]);
  const alias = row('alias.example'); alias.business_name = 'The Acme Plumbing Co.';
  assert.deepEqual(dedupeDecisions([a, alias]).map(x => x.eligible), [true, false]);
  const reg = { prospects: { a, b, c, missing: { ...row('missing.example'), logo_eligibility: null } } };
  const summary = radar.summarize(reg);
  assert.equal(summary.build_queue.length, 1);
  assert.equal(summary.prospects.length, 4);
  assert.equal(summary.held_prospects.length, 3);
  const projected = projectRows(summary.prospects);
  assert.equal(projected.filter(p => p.ra === 1).length, 1);
  assert.equal(projected.filter(p => p.bd === 1).length, 1);
  assert.ok(projected[0].le.source_sha256);
  const html = renderDashboard(summary);
  assert.match(html, /if \(!qd.logoHeld && qd.key !== 'all' && r.ra !== 1\) return false/);
});
test('previous homepages and actioned companies never return to build queues', () => {
  const a=row(), b=row('new-domain.example');b.business_name='New trading name';
  assert.equal(dedupeDecisions([a],{priorBuilds:[{name:'The Acme Plumbing Co.'}]} )[0].eligible,false);
  assert.equal(dedupeDecisions([b],{priorBuilds:[{name:'Old trading name',website:b.website}]} )[0].eligible,false);
  a.lifecycle='built';assert.equal(dedupeDecisions([a],{priorBuilds:[]})[0].eligible,false);
  assert.equal(radar.isRadarEligible(a),false);
  a.lifecycle='mailed';assert.equal(dedupeDecisions([a],{priorBuilds:[]})[0].eligible,false);
});
test('failed imagery refresh revokes prior logo and retains prior proof in history', async () => {
  const p = row(), reg = { prospects: { [p.domain]: p } };
  const harvestLite = async () => { throw new Error('404'); };
  const result = await checkImagery(p.website, { prospect: p, harvestLite });
  assert.equal(result.logo, false); assert.equal(result.logo_eligibility.eligible, false);
  await surveyImagery(reg, [p], { today: '2026-09-05', harvestLite });
  assert.equal(assess(p).eligible, false);
  assert.equal(p.logo_history.length, 2);
  assert.equal(p.logo_history[0].source_sha256, 'a'.repeat(64));
});
test('harvest labels cannot self-certify; reviewed identical bytes can refresh', async () => {
  const p = row();
  const harvestLite = async () => ({ finalUrl: p.website, images: [], voice: { title: p.business_name } });
  const logo = { url: p.logo_eligibility.source_url, sha256: 'a'.repeat(64), ext: 'png', width: 240, height: 80, bytes: 1200 };
  const harvestImages = async () => ({ images: Array(6).fill({ width: 800 }), logo });
  let result = await checkImagery(p.website, { prospect: p, harvestLite, harvestImages });
  assert.equal(result.buildable, true);
  // Bytes that no longer match the review drop out of it. The row then has to
  // earn `verified` again on measurement alone -- and a stub that serves no
  // bytes cannot, which is the point: the label is not the evidence.
  logo.sha256 = 'b'.repeat(64);
  result = await checkImagery(p.website, { prospect: p, harvestLite, harvestImages });
  assert.equal(result.buildable, false);
  assert.equal(result.logo_eligibility.reason, 'logo_bytes_unavailable');
  delete p.logo_eligibility;
  result = await checkImagery(p.website, { prospect: p, harvestLite, harvestImages });
  assert.equal(result.logo, false);
});
test('a measured, background-removed logo reaches verified with no human in the loop', async () => {
  // The regression this whole lane exists for: before lib/logo-audit.js, this
  // path returned `pending` for every prospect forever, so `logo_verified` was
  // 0 on every sweep and the Next 20 builder had nothing to select.
  const p = row();
  delete p.logo_eligibility;
  const width = 320, height = 120;
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      const mark = x >= 24 && x < width - 24 && y >= 20 && y < height - 20;
      const c = mark ? [12, 60, 130] : [255, 255, 255];
      rgba[o] = c[0]; rgba[o + 1] = c[1]; rgba[o + 2] = c[2]; rgba[o + 3] = 255;
    }
  }
  const png = encodePng(rgba, width, height);
  const harvestLite = async () => ({ finalUrl: p.website, images: [], voice: { title: p.business_name } });
  const logo = { url: `${p.website}/brand.png`, sha256: 'c'.repeat(64), ext: 'png', width, height, bytes: png.length };
  const harvestImages = async () => ({ images: Array(6).fill({ width: 800 }), logo });

  const result = await checkImagery(p.website, {
    prospect: p, harvestLite, harvestImages, fetchLogoBytes: async () => png,
  });

  const e = result.logo_eligibility;
  assert.equal(e.status, 'verified', e.reason);
  assert.equal(e.transparent, true);
  assert.equal(e.background_removed, true);
  assert.equal(e.validation_method, 'automated_pixel_audit');
  assert.ok(e.transparent_ratio > 0.02, 'transparency is a measured number');
  assert.match(e.output_sha256, /^[a-f0-9]{64}$/);
  assert.notEqual(e.output_sha256, e.source_sha256, 'removed background means new bytes');
  assert.ok(e.width >= 2 * e.display_width, 'source carries 2x the painted size');
  assert.equal(result.logo, true);
  assert.equal(result.buildable, true);

  // And the shared contract agrees, which is what actually opens the gate.
  assert.equal(assess({ ...p, logo_eligibility: e }).eligible, true);
});
test('measured claims without their measurements are refused', async () => {
  const p = row();
  // An automated verdict that omits what it measured must not inherit trust.
  for (const missing of ['transparent_ratio', 'content_ratio', 'transformation']) {
    const e = { ...p.logo_eligibility, validation_method: 'automated_pixel_audit',
      transparent_ratio: 0.4, content_ratio: 0.3, transformation: 'flood fill' };
    delete e[missing];
    assert.equal(assess({ ...p, logo_eligibility: e }).eligible, false, missing);
  }
  // Claiming a background was removed without naming the resulting bytes.
  const e = { ...p.logo_eligibility, validation_method: 'automated_pixel_audit',
    transparent_ratio: 0.4, content_ratio: 0.3, transformation: 'flood fill', background_removed: true };
  assert.equal(assess({ ...p, logo_eligibility: e }).eligible, false);
  e.output_sha256 = 'd'.repeat(64);
  assert.equal(assess({ ...p, logo_eligibility: e }).eligible, true);
});
