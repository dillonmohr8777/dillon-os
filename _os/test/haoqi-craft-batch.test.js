/**
 * Haoqi 25-pack: unused slugs, extra sections, logo knockout.
 * Run: node --test _os/test/haoqi-craft-batch.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { DONE, QUEUE, slugify } = require('../automation/bin/haoqi-craft-batch');
const { render } = require('../automation/lib/haoqi-craft-page');
const { markFromName, tidy } = require('../automation/lib/haoqi-craft-copy');

const VAULT = path.resolve(__dirname, '..', '..');
const ROOT = path.join(VAULT, 'haoqi-radar-sites');

describe('haoqi 25-pack guards', () => {
  it('never rebuilds Jarman or Andorra', () => {
    assert.equal(DONE.has('jarman-sales'), true);
    assert.equal(DONE.has('andorra-family-dentistry'), true);
    for (const domain of QUEUE) {
      assert.notEqual(domain, 'jarmanairconditioning.com');
      assert.notEqual(domain, 'andorradental.com');
      assert.notEqual(domain, 'jarmansalesandservice.com');
    }
  });

  it('queue is unique and long enough to fill 25', () => {
    assert.equal(new Set(QUEUE).size, QUEUE.length);
    assert.ok(QUEUE.length >= 25);
  });

  it('renderer ships proof, process, and area plus noindex', () => {
    const html = render({
      slug: 'test-shop',
      name: 'Test Shop',
      vertical: 'dentist',
      siteUrl: 'https://example.com/',
      word: 'smile more',
      phone: '2155550100',
      street: '1 Main St',
      city: 'Philadelphia',
      region: 'PA',
      postcode: '19103',
      headline: 'Test headline',
      lede: "We're Test Shop.",
      description: 'Test Shop in Philadelphia.',
      title: 'Test Shop',
      offerTitle: 'Work',
      offers: ['One', 'Two', 'Three'],
      proofTitle: 'Proof',
      proofs: [{ quote: 'They were kind.', cite: 'From their site' }],
      processTitle: 'Process',
      steps: ['Call', 'Sit', 'Leave'],
      expTitle: 'Floor',
      experience: ['A', 'B', 'C'],
      areaTitle: 'Block',
      areas: ['City', 'Hours', 'Area'],
      storyTitle: 'Story',
      story: ['A paragraph.'],
      closeTitle: 'Close',
      closeBody: 'Come in.',
      sign: 'Test.',
      shotMeta: 'PHL',
      mark: 'TEST.SHOP',
      logo: 'logo.png',
      images: {},
      note: 'Prospect demo. noindex.',
    });
    assert.match(html, /noindex/);
    assert.match(html, /class="proof"/);
    assert.match(html, /class="process"/);
    assert.match(html, /class="area"/);
    assert.match(html, /word: "smile more"/);
    assert.match(html, /has-logo/);
    assert.match(html, /assets\/logo\.png/);
    assert.match(html, /tel:\+12155550100/);
    assert.match(html, /google\.com\/maps\/dir/);
    assert.doesNotMatch(html, /\u2014/);
  });

  it('logo knockout clears a white field and keeps the mark', () => {
    const { createCanvas } = (() => {
      try {
        return { createCanvas: null };
      } catch {
        return { createCanvas: null };
      }
    })();
    const tmp = path.join(VAULT, '_os/test/tmp-logo');
    fs.mkdirSync(tmp, { recursive: true });
    const src = path.join(tmp, 'in.png');
    const dest = path.join(tmp, 'out.png');
    // 32x32 white with a black 8x8 square in the center, written as raw PNG via PIL.
    const py = `
from PIL import Image
im = Image.new('RGB', (128, 128), (255, 255, 255))
for y in range(40, 88):
    for x in range(40, 88):
        im.putpixel((x, y), (10, 10, 10))
im.save(${JSON.stringify(src)})
`;
    const make = spawnSync('python3', ['-c', py], { encoding: 'utf8' });
    assert.equal(make.status, 0, make.stderr);
    const cut = spawnSync('python3', [path.join(VAULT, '_os/automation/lib/haoqi-logo.py'), src, dest], {
      encoding: 'utf8',
    });
    assert.equal(cut.status, 0, cut.stderr);
    assert.equal(fs.existsSync(dest), true);
    const check = spawnSync(
      'python3',
      [
        '-c',
        `
from PIL import Image
im = Image.open(${JSON.stringify(dest)}).convert('RGBA')
pix = list(im.getdata())
clear = sum(1 for p in pix if p[3] < 16)
ink = sum(1 for p in pix if p[3] > 200 and p[0] < 40)
print(im.mode, clear, ink, im.size[0], im.size[1])
assert im.mode == 'RGBA'
assert clear > 50
assert ink > 20
`,
      ],
      { encoding: 'utf8' },
    );
    assert.equal(check.status, 0, check.stderr + check.stdout);
  });

  it('copy tidy strips em dashes', () => {
    assert.equal(tidy('hello \u2014 world'), 'hello, world');
    assert.match(markFromName('Go Vertical Climbing'), /GO\.VERTICAL/);
  });
});

describe('haoqi shipped pages', () => {
  it('copy is recut, not harvest soup', () => {
    const slugs = fs
      .readdirSync(ROOT, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name !== 'lib')
      .map((e) => e.name);
    const banned = /They do the work they already list|Start with contact us\.|TOP PHILADELPHIA DENTIST|document\.getElementById|404 Error|OOPS! THAT PAGE|New Patient Registration General Dentistry/;
    for (const slug of slugs) {
      const html = fs.readFileSync(path.join(ROOT, slug, 'index.html'), 'utf8');
      assert.doesNotMatch(html, banned, slug);
      assert.doesNotMatch(html, /\u2014/, slug);
    }
  });

  it('every site folder is noindex with the three extra sections', () => {
    const slugs = fs
      .readdirSync(ROOT, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name !== 'lib')
      .map((e) => e.name);
    assert.ok(slugs.includes('jarman-sales'));
    assert.ok(slugs.includes('andorra-family-dentistry'));
    for (const slug of slugs) {
      const html = fs.readFileSync(path.join(ROOT, slug, 'index.html'), 'utf8');
      assert.match(html, /noindex/, slug);
      assert.match(html, /class="proof"/, slug);
      assert.match(html, /class="process"/, slug);
      assert.match(html, /class="area"/, slug);
      assert.match(html, /HaoqiCraft\.mount/, slug);
      assert.match(html, /<main id="main">/, slug);
    }
  });

  it('shipped logos are real marks, not favicons', () => {
    const slugs = fs
      .readdirSync(ROOT, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name !== 'lib')
      .map((e) => e.name);
    for (const slug of slugs) {
      const html = fs.readFileSync(path.join(ROOT, slug, 'index.html'), 'utf8');
      if (!/has-logo/.test(html)) continue;
      const file = (html.match(/assets\/(logo\.[a-z]+)/) || [])[1];
      assert.ok(file, slug);
      const abs = path.join(ROOT, slug, 'assets', file);
      assert.equal(fs.existsSync(abs), true, slug);
      if (file.endsWith('.svg')) continue;
      const check = spawnSync(
        'python3',
        ['-c', `from PIL import Image; im=Image.open(${JSON.stringify(abs)}); print(im.size); assert max(im.size) >= 80 and min(im.size) >= 20`],
        { encoding: 'utf8' },
      );
      assert.equal(check.status, 0, `${slug} ${check.stderr} ${check.stdout}`);
    }
  });
});
