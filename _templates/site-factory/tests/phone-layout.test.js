const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const factoryRoot = path.join(__dirname, '..');

function mediaBlock(css, query) {
  const start = css.indexOf(`@media${query}`);
  assert.notEqual(start, -1, `missing ${query} media query`);
  const next = css.indexOf('@media', start + 1);
  return css.slice(start, next === -1 ? undefined : next);
}

describe('phone catalog layout', () => {
  it('stacks catalog full-width under 700px instead of a broken 3-up carousel', () => {
    const css = fs.readFileSync(path.join(factoryRoot, 'base.css'), 'utf8');
    const phone = mediaBlock(css, '(max-width:700px)');
    assert.ok(phone.includes('.catalog-grid') && phone.includes('grid-template-columns:1fr'));
    assert.match(phone, /\.catalog-grid[^{]*\{\s*display:grid/);
    assert.doesNotMatch(phone, /\.catalog-grid\{\s*display:flex/);
    assert.doesNotMatch(phone, /\.catalog-card\{[^}]*flex:0 0/);
    assert.match(phone, /\.site-header nav,.button-header,.offerings-tabs,.marquee-strip\{display:none\}/);
    assert.match(phone, /\.catalog-card figure,.gallery-rail figure,.social-rail figure\{height:180px\}/);
    assert.match(phone, /\.gallery-rail figure\{flex:0 0 100%/);
    assert.match(phone, /min-height:0/);
  });

  it('stops tilt wrappers from stretching catalog cards to equal height on phones', () => {
    const css = fs.readFileSync(path.join(factoryRoot, 'lib', 'transitions.css'), 'utf8');
    const phone = mediaBlock(css, ' (max-width: 700px) ');
    assert.match(phone, /\.catalog-grid \.t-tilt/);
    assert.match(phone, /height:\s*auto/);
  });
});
