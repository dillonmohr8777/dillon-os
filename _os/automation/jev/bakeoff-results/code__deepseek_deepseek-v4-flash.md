```js
'use strict';
const assert = require('assert');

function contrastRatio(hex1, hex2) {
    const parse = (hex) => {
        hex = hex.trim().replace(/^#/, '');

        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }

        if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
            throw new Error('Invalid hex color');
        }

        const value = parseInt(hex, 16);
        return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
    };

    const luminance = (hex) => {
        const [r, g, b] = parse(hex);

        const channel = (c) => {
            const s = c / 255;
            return s <= 0.03928
                ? s / 12.92
                : Math.pow((s + 0.055) / 1.055, 2.4);
        };

        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };

    const l1 = luminance(hex1);
    const l2 = luminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

assert.strictEqual(contrastRatio('#000', '#fff'), 21);
assert.strictEqual(contrastRatio('aabbcc', 'aabbcc'), 1);
assert.ok(contrastRatio('#777777', '#ffffff') < 4.5, 'AA failure');
```