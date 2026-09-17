```javascript
const assert = require('assert');

function contrastRatio(hex1, hex2) {
  function relativeLuminance(hex) {
    let h = hex.replace(/^#/, '');
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    const normalize = c => parseInt(c, 16) / 255;
    const srgbToLinear = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    
    const r = normalize(h.slice(0, 2));
    const g = normalize(h.slice(2, 4));
    const b = normalize(h.slice(4, 6));
    
    return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
  }

  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

assert.strictEqual(contrastRatio('#000000', '#FFFFFF'), 21.00);
assert.strictEqual(contrastRatio('fff', '#000'), 21.00);
assert.ok(contrastRatio('#FFFFFF', '#7A7A7A') < 4.5, 'Known AA failure: contrast ratio must be >= 4.5 for normal text');
```