const assert = require('node:assert/strict');

function contrastRatio(hex1, hex2) {
  function luminance(hex) {
    if (typeof hex !== 'string' ||
        !/^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
      throw new TypeError('Expected a 3- or 6-digit hex colour, optionally prefixed with #');
    }

    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = [...hex].map(char => char + char).join('');
    }

    const [r, g, b] = hex.match(/.{2}/g).map(channel => {
      const sRGB = parseInt(channel, 16) / 255;
      return sRGB <= 0.03928
        ? sRGB / 12.92
        : ((sRGB + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return Number(ratio.toFixed(2));
}

assert.equal(contrastRatio('#000', 'ffffff'), 21);
assert.equal(contrastRatio('123456', '#123456'), 1);
assert.equal(
  contrastRatio('777', '#fff'),
  4.48,
  'Known WCAG AA failure for normal text: 4.48 is below 4.5'
);

module.exports = contrastRatio;