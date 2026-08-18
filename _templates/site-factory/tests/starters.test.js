const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { buildSite } = require('../build-site.js');
const {
  loadCatalog,
  listStarters,
  loadStarterBySlug,
  pickStarter,
  EXAMPLE_BRIEF_PATH,
  STARTERS_DIR,
} = require('../lib/starters.js');

describe('factory starter catalog', () => {
  it('lists six templates, one per attitude', () => {
    const catalog = loadCatalog();
    const starters = listStarters();
    assert.equal(starters.length, 6);
    assert.deepEqual(
      starters.map((row) => row.attitude).sort(),
      catalog.attitudes.slice().sort()
    );
    const slugs = new Set(starters.map((row) => row.slug));
    assert.equal(slugs.size, 6);
  });

  it('keeps a brief file that matches each catalog slug', () => {
    for (const entry of listStarters()) {
      const brief = loadStarterBySlug(entry.slug);
      assert.equal(brief.slug, entry.slug);
      assert.equal(brief.attitude, entry.attitude);
      assert.equal(brief.noindex, true);
      assert.equal(brief.images.length, 12);
      assert.match(brief.phone, /^215-555-/);
    }
  });

  it('routes verticals and attitudes to the matching starter', () => {
    const cases = [
      ['hvac', 'kiln-heating'],
      ['heating and cooling', 'kiln-heating'],
      ['industrial', 'kiln-heating'],
      ['landscaping', 'lot-line-landscape'],
      ['concrete', 'lot-line-landscape'],
      ['warm', 'lot-line-landscape'],
      ['bridal', 'atelier-ninth-bridal'],
      ['editorial', 'atelier-ninth-bridal'],
      ['painting', 'two-coats-painting'],
      ['brutal', 'two-coats-painting'],
      ['spa', 'harbor-light-spa'],
      ['glass', 'harbor-light-spa'],
      ['google ads', 'signal-street-ads'],
      ['neon', 'signal-street-ads'],
      ['kiln-heating', 'kiln-heating'],
    ];
    for (const [query, slug] of cases) {
      const picked = pickStarter(query);
      assert.equal(picked.ok, true, query);
      assert.equal(picked.matched, true, query);
      assert.equal(picked.slug, slug, query);
      assert.equal(picked.path, path.join(STARTERS_DIR, `${slug}.json`));
    }
  });

  it('falls back to example-brief when nothing matches', () => {
    const picked = pickStarter('independent bookstore');
    assert.equal(picked.ok, true);
    assert.equal(picked.matched, false);
    assert.equal(picked.fallback, true);
    assert.equal(picked.path, EXAMPLE_BRIEF_PATH);
  });

  it('treats a shared vertical as ambiguous', () => {
    const picked = pickStarter('home services');
    assert.equal(picked.ok, false);
    assert.equal(picked.ambiguous, true);
    assert.ok(picked.candidates.length >= 2);
  });

  it('builds each starter into noindex HTML', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sf-starters-'));
    for (const entry of listStarters()) {
      const brief = loadStarterBySlug(entry.slug);
      const built = buildSite(brief, root);
      assert.match(built.html, /noindex/);
      assert.match(built.html, new RegExp(`name="attitude" content="${entry.attitude}"`));
      assert.equal(built.slug, entry.slug);
    }
  });
});

describe('pick-starter CLI', () => {
  it('prints the matching starter path', () => {
    const result = spawnSync(process.execPath, [path.join(__dirname, '..', 'pick-starter.js'), 'hvac'], {
      encoding: 'utf8',
      cwd: path.join(__dirname, '..', '..', '..'),
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout.trim(), /_templates\/site-factory\/starters\/kiln-heating\.json$/);
  });
});
