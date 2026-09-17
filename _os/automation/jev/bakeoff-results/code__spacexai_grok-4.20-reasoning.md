```javascript
const assert = require('assert');

function contrastRatio(hex1, hex2) {
  function parseHex(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    return [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16)
    ];
  }

  function srgbToLinear(c) {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function getLuminance(hex) {
    const [r, g, b] = parseHex(hex);
    return 0.2126 * srgbToLinear(r) +
           0.7152 * srgbToLinear(g) +
           0.0722 * srgbToLinear(b);
  }

  let l1 = getLuminance(hex1);
  let l2 = getLuminance(hex2);
  if (l1 < l2) [l1, l2] = [l2, l1];
  const ratio = (l1 + 0.05) / (l2 + 0.05);
  return Math.round(ratio * 100) / 100;
}

assert.strictEqual(contrastRatio('#000000', '#ffffff'), 21);
assert.strictEqual(contrastRatio('000', 'f00'), 5.25);
assert.strictEqual(contrastRatio('ffffff', '#ff0000'), 4);
```