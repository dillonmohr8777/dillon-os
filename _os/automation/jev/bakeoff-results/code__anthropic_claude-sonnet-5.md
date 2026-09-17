```javascript
function contrastRatio(hex1, hex2) {
  function parseHex(hex) {
    let h = hex.replace('#', '');
    if (h.length === 3) {
      h = h.split('').map(c => c + c).join('');
    }
    if (!/^[0-9a-fA-F]{6}$/.test(h)) {
      throw new Error('Invalid hex color: ' + hex);
    }
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return { r, g, b };
  }

  function linearize(channel) {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function relativeLuminance({ r, g, b }) {
    const R = linearize(r);
    const G = linearize(g);
    const B = linearize(b);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  }

  const rgb1 = parseHex(hex1);
  const rgb2 = parseHex(hex2);

  const L1 = relativeLuminance(rgb1);
  const L2 = relativeLuminance(rgb2);

  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  return Math.round(ratio * 100) / 100;
}

// Self-checks
// 1. Black on white should give maximum contrast ratio of 21:1
assert(contrastRatio('#000000', '#FFFFFF') === 21, 'Black on white should be 21:1');

// 2. Same color should give contrast ratio of 1:1
assert(contrastRatio('#123456', '#123456') === 1, 'Same color should be 1:1');

// 3. Known AA failure: light gray text on white background (fails WCAG AA for normal text, which requires 4.5:1)
const failRatio = contrastRatio('#AAAAAA', '#FFFFFF');
assert(failRatio < 4.5, 'Light gray (#AAAAAA) on white should fail WCAG AA (ratio < 4.5), got ' + failRatio);

console.log('All self-checks passed.');

function assert(condition, message) {
  if (!condition) {
    throw new Error('Assertion failed: ' + message);
  }
}
```