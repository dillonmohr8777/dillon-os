const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { resolveLayout, buildLayoutCss, RULES } = require('../lib/layouts.js');
const { buildSite } = require('../build-site.js');
const { passingBrief } = require('./helpers.js');

describe('wow composition layouts', () => {
  it('maps each wow host to a distinct layout id', () => {
    const a = resolveLayout({ composition_ref: 'https://stripe.com' });
    const b = resolveLayout({ composition_ref: 'https://linear.app' });
    const c = resolveLayout({ composition_ref: 'https://www.apple.com' });
    assert.equal(a.id, 'stripe-split');
    assert.equal(b.id, 'linear-dark');
    assert.equal(c.id, 'apple-stage');
    assert.notEqual(a.id, b.id);
  });

  it('keeps copilot ahead of github.com matching', () => {
    assert.equal(resolveLayout({ composition_ref: 'https://github.com/features/copilot' }).id, 'copilot-split');
    assert.equal(resolveLayout({ composition_ref: 'https://github.com' }).id, 'github-repo');
  });

  it('maps the 25 seed hosts to 25 unique layout ids', () => {
    const urls = [
      'https://stripe.com',
      'https://linear.app',
      'https://www.notion.so',
      'https://vercel.com',
      'https://www.figma.com',
      'https://www.apple.com',
      'https://www.cosmos.so',
      'https://www.raycast.com',
      'https://arc.net',
      'https://cal.com',
      'https://resend.com',
      'https://clerk.com',
      'https://www.framer.com',
      'https://webflow.com',
      'https://www.webflow.com',
      'https://openai.com',
      'https://www.anthropic.com',
      'https://cursor.com',
      'https://github.com',
      'https://github.com/features/copilot',
      'https://todoist.com',
      'https://www.shopify.com',
      'https://shopify.design',
      'https://www.airbnb.com',
      'https://www.spotify.com',
    ];
    const ids = urls.map((u) => resolveLayout({ composition_ref: u }).id);
    assert.equal(new Set(ids).size, 25);
    assert.equal(RULES.length, 25);
  });

  it('emits different layout CSS, chrome, and a layout body class', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sf-layout-'));
    const stripe = passingBrief({
      slug: 'stripe-shop',
      name: 'Stripe Shop',
      composition_ref: 'https://stripe.com',
    });
    const linear = passingBrief({
      slug: 'linear-shop',
      name: 'Linear Shop',
      composition_ref: 'https://linear.app',
    });
    const spotify = passingBrief({
      slug: 'spotify-shop',
      name: 'Spotify Shop',
      composition_ref: 'https://www.spotify.com',
    });
    const builtA = buildSite(stripe, tmp);
    const builtB = buildSite(linear, tmp);
    const builtC = buildSite(spotify, tmp);
    assert.match(builtA.html, /layout-stripe-split/);
    assert.match(builtB.html, /layout-linear-dark/);
    assert.match(builtC.html, /layout-spotify-player/);
    assert.match(builtA.html, /name="layout" content="stripe-split"/);
    assert.match(builtA.html, /layout-proofbar/);
    assert.match(builtB.html, /layout-status/);
    assert.match(builtC.html, /layout-library/);
    assert.match(builtC.html, /layout-nowplaying/);
    assert.notEqual(buildLayoutCss(stripe, resolveLayout(stripe)), buildLayoutCss(linear, resolveLayout(linear)));
    assert.notEqual(builtA.html, builtC.html);
  });
});
