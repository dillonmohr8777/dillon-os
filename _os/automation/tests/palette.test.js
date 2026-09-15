'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../lib/palette');
const { encodePng, decodePng } = require('../lib/logo-audit');

/** A logo-shaped bitmap: transparent field, mark painted in `colors`. */
function logo(colors, { width = 120, height = 60 } = {}) {
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      if (y < 8 || y >= height - 8) continue; // transparent margin
      const c = colors[Math.floor((x / width) * colors.length)] || colors[0];
      rgba[o] = c[0]; rgba[o + 1] = c[1]; rgba[o + 2] = c[2]; rgba[o + 3] = 255;
    }
  }
  return { rgba, width, height };
}

test('contrast ratio matches the WCAG reference values', () => {
  assert.equal(Number(P.contrastRatio([0, 0, 0], [255, 255, 255]).toFixed(2)), 21);
  assert.equal(Number(P.contrastRatio([255, 255, 255], [255, 255, 255]).toFixed(2)), 1);
  // #767676 is the canonical "just passes AA on white" grey.
  assert.ok(P.contrastRatio([118, 118, 118], [255, 255, 255]) >= 4.5);
  assert.ok(P.contrastRatio([119, 119, 119], [255, 255, 255]) < 4.6);
});

test('forceContrast returns the background and foreground as separate fields', () => {
  // The regression: both were once called `color` on merged objects and the
  // object spread replaced the background with the foreground, so every derived
  // brand colour came out #ffffff or the ink while the audit still passed.
  const mid = [110, 140, 175];
  const out = P.forceContrast(mid, [44, 41, 39]);
  assert.ok(Array.isArray(out.background) && Array.isArray(out.foreground));
  assert.notDeepEqual(out.background, out.foreground);
  // The background must stay recognisably the colour we handed in, not collapse
  // to white or ink.
  const [h] = P.rgbToHsl(out.background);
  assert.ok(P.hueGap(h, P.rgbToHsl(mid)[0]) < 0.02, 'hue is preserved');
  assert.ok(P.contrastRatio(out.background, out.foreground) >= P.AA_NORMAL);
});

test('forceContrast darkens a mid tone rather than lightening it away', () => {
  const navy = [70, 95, 140];
  const out = P.forceContrast(navy, [44, 41, 39]);
  assert.ok(P.rgbToHsl(out.background)[2] <= P.rgbToHsl(navy)[2] + 0.01, 'went darker, not lighter');
  assert.deepEqual(out.foreground, [255, 255, 255], 'white text on a deepened navy');
});

test('the brand colour is read off the logo and keeps its hue', () => {
  const red = [230, 30, 30];
  const out = P.buildPalette(logo([red, [0, 0, 0], [255, 255, 255]]));
  assert.equal(out.ok, true, out.reason);
  const brand = P.fromHex(out.tokens['--brand']);
  assert.ok(P.hueGap(P.rgbToHsl(brand)[0], P.rgbToHsl(red)[0]) < 0.05, `brand ${out.tokens['--brand']} keeps the logo hue`);
});

test('every emitted palette passes every declared text pair', () => {
  const seeds = [[230, 30, 30], [20, 80, 160], [200, 150, 30], [30, 130, 90], [120, 40, 140], [12, 168, 229]];
  for (const seed of seeds) {
    const out = P.buildPalette(logo([seed, [255, 255, 255]]));
    assert.equal(out.ok, true, `${P.toHex(seed)} -> ${out.reason} ${JSON.stringify(out.failures)}`);
    for (const pair of out.contrast) {
      assert.ok(pair.pass, `${P.toHex(seed)}: ${pair.fg} on ${pair.bg} = ${pair.ratio}, needs ${pair.target}`);
    }
    assert.equal(Object.keys(out.tokens).length, 22, 'the full token contract is emitted');
  }
});

test('a greyscale mark is refused rather than given an invented brand colour', () => {
  const out = P.buildPalette(logo([[40, 40, 40], [160, 160, 160], [220, 220, 220]]));
  assert.equal(out.ok, false);
  assert.equal(out.reason, 'logo_has_no_usable_brand_color');
});

test('transparent pixels never contribute a colour', () => {
  // A mark of pure red on a fully transparent field must read as red, not as
  // an average of red and the zeroed RGB behind the transparency.
  const l = logo([[255, 0, 0]]);
  const dom = P.dominantColors(l.rgba, l.width, l.height);
  assert.equal(dom.length, 1);
  assert.equal(dom[0].hex, '#ff0000');
});

test('the accent is a different colour, not a second shade of the brand', () => {
  const out = P.buildPalette(logo([[20, 80, 160], [40, 100, 180]]));
  assert.equal(out.ok, true, out.reason);
  const brand = P.rgbToHsl(P.fromHex(out.tokens['--brand']));
  const accent = P.rgbToHsl(P.fromHex(out.tokens['--accent']));
  assert.ok(P.hueGap(brand[0], accent[0]) > 0.08, 'accent is visibly a different hue');
});

test('validatePalette catches an unreadable pair instead of passing it', () => {
  const out = P.buildPalette(logo([[230, 30, 30]]));
  const broken = { ...out.tokens, '--on-brand': '#e8534f' }; // near-brand on brand
  const audit = P.validatePalette(broken);
  assert.equal(audit.ok, false);
  assert.ok(audit.failures.some((f) => f.fg === '--on-brand'));
});

test('round trip: hex parsing and hsl conversion are lossless enough to trust', () => {
  for (const hex of ['#3f5b78', '#0f7268', '#e2b560', '#ffffff', '#000000']) {
    assert.equal(P.toHex(P.fromHex(hex)), hex);
    const back = P.hslToRgb(P.rgbToHsl(P.fromHex(hex)));
    for (let i = 0; i < 3; i++) assert.ok(Math.abs(back[i] - P.fromHex(hex)[i]) <= 1, hex);
  }
});

test('the CSS block matches the shape the reference stylesheet expects', () => {
  const out = P.buildPalette(logo([[20, 80, 160], [220, 120, 20]]));
  const css = P.toCssBlock('acme-plumbing', out.tokens);
  assert.match(css, /^\[data-site="acme-plumbing"\] \{/);
  assert.match(css, /\n {2}--brand: #[0-9a-f]{6};/);
  assert.match(css, /--on-field: #[0-9a-f]{6};\n\}$/);
});

test('a real decoded PNG drives the same path a build would take', () => {
  const l = logo([[12, 168, 229], [255, 255, 255]]);
  const round = decodePng(encodePng(l.rgba, l.width, l.height));
  assert.equal(round.error, undefined);
  const out = P.buildPalette({ rgba: round.rgba, width: round.width, height: round.height });
  assert.equal(out.ok, true, out.reason);
  assert.ok(P.hueGap(P.rgbToHsl(P.fromHex(out.tokens['--brand']))[0], P.rgbToHsl([12, 168, 229])[0]) < 0.05);
});
