```javascript
const assert = require('assert');

function contrastRatio(hex1, hex2) {
  function parseHex(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  function linearize(c) {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function luminance(rgb) {
    const [r, g, b] = rgb.map(linearize);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  const l1 = luminance(parseHex(hex1));
  const l2 = luminance(parseHex(hex2));
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return Math.round(ratio * 100) / 100;
}

assert.strictEqual(contrastRatio('#000000', '#FFFFFF'), 21);
assert.strictEqual(contrastRatio('808080', 'fff'), 3.95);
assert.ok(contrastRatio('#808080', '#FFFFFF') < 4.5);
```