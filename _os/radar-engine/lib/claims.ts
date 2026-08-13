'use strict';

const FACT_RE = /\b(\d{2,}(?:\.\d+)?%?|\d{1,3}(?:,\d{3})+)\b/g;

function factsIn(text) {
  const s = String(text || '');
  const numbers = [...s.matchAll(FACT_RE)].map((m) => m[1]);
  return { numbers, text: s };
}

function allowedBag(manifest) {
  const bag = new Set();
  const add = (v) => {
    String(v || '')
      .split(/[^A-Za-z0-9%+.-]+/)
      .filter((w) => w.length > 1)
      .forEach((w) => bag.add(w.toLowerCase()));
  };
  add(manifest.prospect?.business_name);
  add(manifest.prospect?.website);
  add(manifest.prospect?.city);
  add(manifest.prospect?.state);
  add(manifest.prospect?.vertical);
  add(manifest.selected_offer);
  add(manifest.brand?.name);
  for (const f of manifest.findings || []) {
    add(f.claim);
    add(f.allowed_wording);
    add(f.recommended_action);
  }
  for (const e of manifest.evidence || []) {
    add(e.metric);
    add(e.excerpt);
  }
  for (const [k, v] of Object.entries(manifest.scores || {})) {
    add(k);
    add(String(v));
  }
  ['needmomentum', 'momentum', 'seo', 'aeo', 'hvac', 'google', 'meta', 'places'].forEach((w) => bag.add(w));
  return bag;
}

function validateNarrative(manifest, narrative) {
  const bag = allowedBag(manifest);
  const { numbers, text } = factsIn(narrative);
  const unsupported = [];
  for (const n of numbers) {
    const ok =
      bag.has(n.toLowerCase()) ||
      Object.values(manifest.scores || {}).some((v) => String(v) === n) ||
      (manifest.evidence || []).some((e) => String(e.metric).includes(n) || String(e.excerpt).includes(n)) ||
      (manifest.findings || []).some((f) => f.claim.includes(n) || f.allowed_wording.includes(n));
    if (!ok) unsupported.push({ kind: 'number', value: n });
  }
  const competitorish = text.match(/\b(?:competitor|rivals?)\s+[A-Z][A-Za-z0-9&' -]{2,40}/g) || [];
  for (const c of competitorish) {
    if (!String(manifest.prospect?.business_name || '').includes(c.split(/\s+/).slice(1).join(' '))) {
      unsupported.push({ kind: 'competitor', value: c });
    }
  }
  return { ok: unsupported.length === 0, unsupported };
}

function paraphraseAllowed(finding) {
  return finding.allowed_wording || finding.claim;
}

module.exports = { validateNarrative, paraphraseAllowed, factsIn, allowedBag };
