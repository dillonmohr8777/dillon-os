'use strict';

/**
 * Self-hosted font support in the site factory, ported 2026-08-18 from
 * rescue/site-factory-dup-clone-20260812.
 *
 * The behaviour that matters: a batch that ships woff2 files gets zero
 * third-party font requests, and a batch that ships none keeps working exactly as
 * before. Silently emitting BOTH (or neither) would be the easy bug here, so both
 * directions are asserted.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { buildSite } = require('../../../_templates/site-factory/build-site.js');

const FONTS = [
  'font-display-400.woff2', 'font-display-800.woff2',
  'font-text-400.woff2', 'font-text-700.woff2',
];

// Reuse the canonical example brief rather than inventing a shape: buildSite
// requires slug, name, city, tokens, fonts and hero, and a hand-rolled stub drifts.
const EXAMPLE = path.resolve(__dirname, '../../../_templates/site-factory/example-brief.json');

function brief(slug) {
  const b = JSON.parse(fs.readFileSync(EXAMPLE, 'utf8').replace(/^﻿/, ''));
  b.slug = slug;
  b.logo = false;
  b.images = [];
  return b;
}

function build(slug, withFonts) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sf-fonts-'));
  const assets = path.join(root, slug, 'assets');
  fs.mkdirSync(assets, { recursive: true });
  if (withFonts) for (const f of FONTS) fs.writeFileSync(path.join(assets, f), 'stub');
  let html = '';
  try {
    buildSite(brief(slug), root);
    html = fs.readFileSync(path.join(root, slug, 'index.html'), 'utf8');
  } finally {
    // Leave the tree on failure would be nicer for debugging, but temp dirs pile up.
    fs.rmSync(root, { recursive: true, force: true });
  }
  return html;
}

test('with woff2 present: no third-party font request, @font-face emitted', () => {
  const html = build('with-fonts', true);
  assert.equal(html.includes('fonts.googleapis.com'), false, 'must not call Google Fonts');
  assert.equal(html.includes('fonts.gstatic.com'), false, 'must not preconnect to gstatic');
  const display = brief('probe').fonts.display;
  assert.ok(html.includes(`@font-face{font-family:'${display}'`), `no @font-face for ${display}`);
  assert.match(html, /assets\/font-display-400\.woff2/);
  assert.match(html, /assets\/font-text-700\.woff2/);
  assert.match(html, /font-display:swap/);
});

test('with woff2 absent: falls back to Google Fonts, no @font-face', () => {
  const html = build('no-fonts', false);
  assert.match(html, /fonts\.googleapis\.com\/css2\?/);
  assert.match(html, /rel="preconnect"/);
  assert.equal(html.includes('@font-face'), false, 'must not emit faces for files that do not exist');
});

test('the two paths are mutually exclusive', () => {
  const local = build('excl-a', true);
  const remote = build('excl-b', false);
  // Exactly one strategy per build - never both, never neither.
  const localUsesFaces = local.includes('@font-face');
  const localUsesGoogle = local.includes('fonts.googleapis.com');
  const remoteUsesFaces = remote.includes('@font-face');
  const remoteUsesGoogle = remote.includes('fonts.googleapis.com');
  assert.equal(localUsesFaces && !localUsesGoogle, true, 'local build must use faces only');
  assert.equal(remoteUsesGoogle && !remoteUsesFaces, true, 'remote build must use Google only');
});

test('an optional missing text font does not emit font-family:undefined', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sf-fonts-'));
  const assets = path.join(root, 'no-text', 'assets');
  fs.mkdirSync(assets, { recursive: true });
  for (const f of FONTS) fs.writeFileSync(path.join(assets, f), 'stub');
  const b = brief('no-text');
  delete b.fonts.text;
  try {
    buildSite(b, root);
    const html = fs.readFileSync(path.join(root, 'no-text', 'index.html'), 'utf8');
    assert.equal(html.includes("font-family:'undefined'"), false);
    assert.ok(html.includes(`@font-face{font-family:'${b.fonts.display}'`));
    assert.equal(html.includes('font-text-400.woff2'), false, 'no face for an absent text font');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
