/**
 * Snapshot integrity for the Grok 4.6 field dashboard.
 * Run: node --test _os/test/grok-46-dashboard.test.js
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VAULT = path.resolve(__dirname, '..', '..');
const HTML = path.join(VAULT, 'grok-46-dashboard/index.html');
const SNAP = path.join(VAULT, 'grok-46-dashboard/snapshot.json');
const RESEARCH = path.join(VAULT, '12_Brain/research/Grok 4.6 Frontier Comparison.md');
const RAW = path.join(
  VAULT,
  '12_Brain/raw/research/2026-08-12 - research - grok-4.6-benchmarks.md',
);
const INDEX = path.join(VAULT, '12_Brain/INDEX.md');

describe('Grok 4.6 field dashboard', () => {
  const html = fs.readFileSync(HTML, 'utf8');
  const snap = JSON.parse(fs.readFileSync(SNAP, 'utf8'));
  const research = fs.readFileSync(RESEARCH, 'utf8');
  const raw = fs.readFileSync(RAW, 'utf8');
  const index = fs.readFileSync(INDEX, 'utf8');

  it('pins the independent AA scores on the document', () => {
    assert.equal(snap.aaIndex.grok46, 61);
    assert.equal(snap.aaIndex.grok45, 56);
    assert.equal(snap.aaIndex.opus5Max, 63);
    assert.match(html, /data-aa-grok46="61"/);
    assert.match(html, /data-aa-grok45="56"/);
    assert.match(html, /data-aa-opus5-max="63"/);
    assert.match(html, /data-snapshot="2026-08-12"/);
  });

  it('keeps Terminal-Bench versions from collapsing', () => {
    assert.match(
      html,
      /Terminal-Bench \*\*v2\.1\*\* \(AA, 88\.4%\) is not Terminal-Bench \*\*v3\.0\*\* \(vendor, 26%\)|Terminal-Bench v2\.1 \(AA, 88\.4%\) is not Terminal-Bench v3\.0 \(vendor, 26%\)/,
    );
    assert.match(html, /Terminal-Bench v2\.1/);
    assert.match(html, /Terminal-Bench v3\.0/);
    assert.match(html, /88\.4%/);
  });

  it('does not print killed claims', () => {
    assert.doesNotMatch(html, /1\.5 trillion/i);
    assert.doesNotMatch(html, /world'?s third-best/i);
    assert.doesNotMatch(html, /August 7/);
    assert.doesNotMatch(research, /1\.5 trillion/i);
  });

  it('links primary sources', () => {
    for (const url of [
      'https://x.ai/news/grok-4-6',
      'https://media.x.ai/v1/website/card-7f81d41b.pdf',
      'https://artificialanalysis.ai/leaderboards/models',
      'https://artificialanalysis.ai/models/grok-4-6',
      'https://docs.x.ai/developers/models',
    ]) {
      assert.ok(html.includes(url), `missing ${url}`);
      assert.ok(raw.includes(url), `raw missing ${url}`);
    }
  });

  it('compiled page carries source, expiry, and INDEX row', () => {
    assert.match(research, /source:.*2026-08-12 - research - grok-4\.6-benchmarks/);
    assert.match(research, /expires: 2026-11-10/);
    assert.match(index, /Grok 4\.6 Frontier Comparison/);
  });

  it('markdown board is readable without HTML preview', () => {
    assert.match(research, /Cursor mobile cannot preview HTML/);
    assert.match(research, /\|\s*\*\*Grok 4\.6 \(high\)\*\*\s*\|\s*SpaceXAI\s*\|\s*\*\*61\*\*/);
    assert.match(research, /\| AA Intelligence Index \| \*\*61\*\* \| 56 \|/);
  });

  it('labels vendor-compiled evals and skips unconfirmed Harvey LAB', () => {
    assert.match(html, /Vendor-compiled/);
    assert.doesNotMatch(html, /Harvey LAB[\s\S]{0,80}15\.8%/);
  });
});
