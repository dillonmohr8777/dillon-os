/**
 * Haoqi craft demos: structure, noindex, and vault wiring.
 * Run: node --test _os/test/haoqi-craft.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VAULT = path.resolve(__dirname, '..', '..');
const ROOT = path.join(VAULT, 'haoqi-radar-sites');
const SITES = ['jarman-sales', 'andorra-family-dentistry'];

function read(rel) {
  return fs.readFileSync(path.join(VAULT, rel), 'utf8');
}

describe('haoqi-radar-sites', () => {
  it('ships a hub and two prospect folders', () => {
    assert.equal(fs.existsSync(path.join(ROOT, 'index.html')), true);
    assert.equal(fs.existsSync(path.join(ROOT, 'lib/craft.js')), true);
    assert.equal(fs.existsSync(path.join(ROOT, 'lib/craft.css')), true);
    for (const slug of SITES) {
      assert.equal(fs.existsSync(path.join(ROOT, slug, 'index.html')), true);
    }
  });

  for (const slug of SITES) {
    it(`${slug} is a noindex semantic demo with JSON-LD and a primary tel CTA`, () => {
      const html = fs.readFileSync(path.join(ROOT, slug, 'index.html'), 'utf8');
      assert.match(html, /noindex/);
      assert.match(html, /<meta name="viewport"/);
      assert.match(html, /<meta name="description" content="[^"]+"/);
      assert.match(html, /class="skip"/);
      assert.match(html, /<main id="main">/);
      assert.match(html, /class="hero"/);
      assert.match(html, /class="contact-system"/);
      assert.match(html, /class="closing"/);
      assert.match(html, /HaoqiCraft\.mount/);
      assert.match(html, /tel:\+1/);
      const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      assert.ok(jsonLd, 'JSON-LD block');
      const data = JSON.parse(jsonLd[1]);
      assert.ok(data.name);
      const imgs = [...html.matchAll(/src="assets\/([^"]+)"/g)].map((m) => m[1]);
      for (const file of new Set(imgs)) {
        assert.equal(
          fs.existsSync(path.join(ROOT, slug, 'assets', file)),
          true,
          `missing ${slug}/assets/${file}`,
        );
      }
      assert.match(html, /alt="[^"]+"/);
    });
  }

  it('Andorra glass word is lowercase smile; Jarman stays hello', () => {
    assert.match(read('haoqi-radar-sites/andorra-family-dentistry/index.html'), /word:\s*"smile"/);
    assert.match(read('haoqi-radar-sites/andorra-family-dentistry/index.html'), /id="word-slot"/);
    assert.match(read('haoqi-radar-sites/jarman-sales/index.html'), /word:\s*"hello"/);
    assert.match(read('haoqi-radar-sites/jarman-sales/index.html'), /id="word-slot"/);
    assert.match(read('haoqi-radar-sites/lib/craft.js'), /toLowerCase\(\)/);
    assert.match(read('haoqi-radar-sites/lib/craft.js'), /word-slot/);
    assert.match(read('haoqi-radar-sites/lib/craft.css'), /\.word-slot/);
  });

  it('craft runtime has scramble, dither, and a WebGL refraction pass', () => {
    const js = read('haoqi-radar-sites/lib/craft.js');
    assert.match(js, /function scramble/);
    assert.match(js, /BAYER/);
    assert.match(js, /createGL/);
    assert.match(js, /bulge/);
    assert.match(js, /prefers-reduced-motion/);
    assert.match(read('haoqi-radar-sites/lib/craft.css'), /prefers-reduced-motion/);
  });
});

describe('haoqi-craft-deploy pin', () => {
  const deploy = require('../automation/bin/haoqi-craft-deploy');

  it('pins haoqi-radar-craft and refuses live client sites', () => {
    assert.equal(deploy.SITE_NAME, 'haoqi-radar-craft');
    assert.equal(deploy.assertSiteName(), 'haoqi-radar-craft');
    assert.equal(deploy.assertSiteName('haoqi-radar-craft'), 'haoqi-radar-craft');
    assert.throws(() => deploy.assertSiteName('momentum-workshop-pilot'), /refusing site/);
    assert.throws(() => deploy.assertSiteName('immohrtal-site'), /refusing site/);
    assert.throws(() => deploy.assertSiteName('omega-landscaping-landing-page'), /refusing site/);
    for (const name of [
      'immohrtal-site',
      'momentum-workshop-pilot',
      'momentum-prospect-radar',
      'omega-landscaping-landing-page',
    ]) {
      assert.equal(deploy.BLOCKED_SITES.includes(name), true, name);
    }
  });

  it('collects demo files, skips README, and keeps noindex on every HTML page', () => {
    const files = deploy.collectFiles(path.join(VAULT, deploy.SOURCE_DIR));
    const keys = [...files.keys()];
    assert.equal(keys.includes('/README.md'), false);
    assert.equal(keys.includes('/index.html'), true);
    assert.equal(keys.includes('/jarman-sales/index.html'), true);
    assert.equal(keys.includes('/andorra-family-dentistry/index.html'), true);
    assert.equal(keys.includes('/lib/craft.js'), true);
    assert.equal(keys.includes('/_headers'), true);
    assert.equal(keys.includes('/robots.txt'), true);
    const htmlPages = keys.filter((k) => /\.html?$/i.test(k));
    assert.ok(htmlPages.length >= 3);
    for (const p of htmlPages) {
      assert.match(files.get(p).toString('utf8'), /noindex/i, p);
    }
  });
});

describe('haoqi craft vault pages', () => {
  it('INDEX lists the compiled research and language pages', () => {
    const index = read('12_Brain/INDEX.md');
    assert.match(index, /Haoqi Design Language/);
    assert.match(index, /High-Craft Front-End References/);
    assert.match(index, /Haoqi Craft Demos/);
    assert.match(index, /Haoqi Craft Word/);
    assert.match(index, /haoqi-radar-craft\.netlify\.app/);
  });

  it('compiled pages carry source and expires', () => {
    const lang = read('12_Brain/concepts/Haoqi Design Language.md');
    const research = read('12_Brain/research/High-Craft Front-End References.md');
    const words = read('12_Brain/concepts/Haoqi Craft Word.md');
    assert.match(lang, /source:/);
    assert.match(lang, /expires: 2026-11-15/);
    assert.match(research, /source:/);
    assert.match(research, /expires: 2026-11-15/);
    assert.match(words, /source:/);
    assert.match(words, /expires: 2026-11-15/);
  });
});
