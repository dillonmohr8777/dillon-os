```js
'use strict';

const assert = require('assert');

/**
 * WCAG 2.1 contrast ratio between two hex colours.
 * Accepts 3- or 6-digit hex, with or without a leading '#'.
 */
function contrastRatio(hex1, hex2) {
  const parse = (hex) => {
    if (typeof hex !== 'string') {
      throw new TypeError('Hex colour must be a string');
    }
    let h = hex.trim().replace(/^#/, '');
    if (h.length === 3) {
      h = [...h].map((c) => c + c).join('');
    }
    if (!/^[0-9a-f]{6}$/i.test(h)) {
      throw new RangeError(`Invalid hex colour: "${hex}"`);
    }
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  };

  // sRGB channel -> linearised value (WCAG 2.1 definition)
  const linearise = (channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const luminance = (hex) => {
    const [r, g, b] = parse(hex);
    return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
  };

  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return Math.round(ratio * 100) / 100;
}

// ---------------------------------------------------------------------------
// Self-checks
// ---------------------------------------------------------------------------

// 1. Maximum possible contrast: black vs white.
assert.strictEqual(contrastRatio('#000000', '#FFFFFF'), 21);

// 2. 3-digit expansion and optional '#': #abc must equal #AABBCC.
assert.strictEqual(contrastRatio('abc', '#AABBCC'), 1);

// 3. Known AA failure: #777777 on white is 4.48, below the 4.5:1
//    required by WCAG 2.1 AA for normal-size text.
assert.strictEqual(contrastRatio('#777777', 'fff'), 4.48);

console.log('All self-checks passed.');

module.exports = contrastRatio;
```