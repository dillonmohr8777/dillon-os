'use strict';
// The viewer ships as a plain HTML file with no build step, so the accessibility
// invariants are held here rather than by a linter in a pipeline that does not
// exist. Each of these was a real defect at some point.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(
  path.join(__dirname, '..', 'viewer', 'index.html'), 'utf8');

test('the frame-rate readout is not inside a live region', () => {
  // #perf is rewritten every animation frame. Inside aria-live="polite" that
  // announces the frame rate about sixty times a second and makes the page
  // unusable with a screen reader.
  const readout = html.match(/<div id="readout"[^>]*>/)[0];
  assert.ok(!/aria-live/.test(readout),
    'the readout wrapper is live, so #perf is announced every frame');
  assert.ok(/<span id="perf"[^>]*aria-hidden="true"/.test(html),
    '#perf must be hidden from assistive tech');
  assert.ok(/<b id="status"[^>]*aria-live="polite"/.test(html),
    'the status line should still be announced');
});

test('nothing that carries content is display:none at any width', () => {
  // #sites was display:none below 980px, which removed the whole prospect
  // layer from every phone rather than collapsing it.
  // Only rules that target the panel itself, not a descendant or a pseudo
  // element: hiding the default disclosure marker is fine, hiding the panel
  // is not.
  const rules = (html.match(/#sites[^{}]*\{[^}]*\}/g) || [])
    .filter((r) => /^#sites(\[[^\]]*\])?\s*\{/.test(r));
  assert.ok(rules.length >= 2, `only found ${rules.length} #sites rules`);
  for (const r of rules) {
    assert.ok(!/display\s*:\s*none/.test(r),
      `#sites is hidden outright by: ${r.replace(/\s+/g, ' ').slice(0, 120)}`);
  }
  assert.ok(/<details id="sites"/.test(html),
    'the prospect list should collapse as a disclosure, not disappear');
});

test('a pin never loses its address to a narrow screen', () => {
  // display:none takes the subtitle away from a screen reader too. On a phone
  // the pin is the only place that address appears at all.
  assert.ok(!/\.pin-sub\{display:none\}/.test(html),
    'the pin subtitle is display:none on small screens, not visually hidden');
});

test('there is a way past the canvas for a keyboard', () => {
  // The canvas takes focus on load and role="application" swallows browse mode.
  assert.ok(/<a class="skip" href="#controls"/.test(html), 'no skip link');
  assert.ok(/\.skip:focus\{top:12px\}/.test(html), 'the skip link never becomes visible');
  assert.ok(/aria-describedby="keyhelp"/.test(html), 'canvas is not tied to its key help');
  assert.ok(/id="keyhelp"/.test(html), 'the key help has no id to point at');
});

test('the canvas does not take focus on load', () => {
  // Focusing the canvas at boot puts it ahead of the skip link in the tab ring,
  // so the first Tab lands inside the 3D scene and the escape hatch is only
  // reachable backwards.
  // Moving focus to the canvas IN RESPONSE to a click is correct focus
  // management; doing it at boot is not. Every call must sit inside a handler.
  const calls = [...html.matchAll(/canvas\.focus\(\);/g)];
  assert.ok(calls.length > 0, 'walk mode should still hand the keyboard the canvas');
  for (const m of calls) {
    const before = html.slice(Math.max(0, m.index - 260), m.index);
    assert.ok(/addEventListener\(/.test(before),
      'canvas.focus() outside an event handler steals focus on load and ' +
      'puts the canvas ahead of the skip link in the tab ring');
  }
});

test('every control has an accessible name', () => {
  const buttons = html.match(/<button[^>]*>[\s\S]*?<\/button>/g) || [];
  assert.ok(buttons.length >= 5, `only found ${buttons.length} buttons`);
  for (const b of buttons) {
    const text = b.replace(/<[^>]*>/g, '').trim();
    const labelled = /aria-label=/.test(b) || text.length > 0;
    assert.ok(labelled, `unlabelled button: ${b.slice(0, 90)}`);
  }
  const range = html.match(/<input id="time"[^>]*>/)[0];
  assert.ok(/aria-label=/.test(range), 'the time slider has no name');
});

test('toggles report their state', () => {
  for (const id of ['henge', 'pins-toggle', 'walk']) {
    const m = html.match(new RegExp(`<button id="${id}"[^>]*>`));
    assert.ok(m, `no button #${id}`);
    assert.ok(/aria-pressed="(true|false)"/.test(m[0]),
      `#${id} is a toggle with no aria-pressed`);
  }
});

test('the light palette is reachable and the dark choice still wins', () => {
  assert.ok(/@media \(prefers-color-scheme:light\)/.test(html),
    'the light palette is dead code: nothing ever sets data-theme');
  assert.ok(/:root:not\(\[data-theme="dark"\]\)/.test(html),
    'an explicit dark choice must beat the system preference');
});

test('motion and focus are handled', () => {
  assert.ok(/@media \(prefers-reduced-motion:reduce\)/.test(html));
  assert.ok(/:focus-visible\{outline:3px solid var\(--focus\)/.test(html));
});

test('the no-WebGL fallback says what happened and shows the model anyway', () => {
  assert.ok(/body\.no-webgl #fallback\{display:grid\}/.test(html));
  const img = html.match(/<img src="\.\.\/renders\/[^>]*>/)[0];
  const alt = img.match(/alt="([^"]*)"/);
  assert.ok(alt && alt[1].length > 40,
    'the fallback image needs alt text that describes the city, not a filename');
});
