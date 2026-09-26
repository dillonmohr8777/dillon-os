```javascript
const assert = require('assert');

function contrastRatio(hex1, hex2) {
  const parse = (hex) => {
    let h = String(hex).trim().replace(/^#/, '');
    if (h.length === 3) h = [...h].map((c) => c + c).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`Invalid hex colour: ${hex}`);
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  };

  const luminance = (hex) => {
    const [r, g, b] = parse(hex).map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return Math.round(ratio * 100) / 100;
}

assert.strictEqual(contrastRatio('#000000', '#ffffff'), 21);
assert.strictEqual(contrastRatio('#abc', 'AABBCC'), 1);
// Known AA failure: #777 on white ≈ 4.48, below the 4.5 threshold for normal text
assert.strictEqual(contrastRatio('#777', '#fff'), 4.48);
```