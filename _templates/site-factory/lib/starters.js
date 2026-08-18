/**
 * Canonical website-factory starter templates.
 * One brief per attitude, mapped to the verticals we actually build.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { assertSafeSlug } = require('./validate');

const STARTERS_DIR = path.join(__dirname, '..', 'starters');
const CATALOG_PATH = path.join(STARTERS_DIR, 'catalog.json');
const EXAMPLE_BRIEF_PATH = path.join(__dirname, '..', 'example-brief.json');

function loadCatalog() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  if (!Array.isArray(catalog.starters) || catalog.starters.length !== 6) {
    throw new Error('starter catalog must list exactly 6 templates');
  }
  return catalog;
}

function listStarters() {
  return loadCatalog().starters.slice();
}

function starterPath(slug) {
  return path.join(STARTERS_DIR, `${assertSafeSlug(slug)}.json`);
}

function loadStarterBySlug(slug) {
  const file = starterPath(slug);
  if (!fs.existsSync(file)) {
    throw new Error(`starter not found: ${slug}`);
  }
  const brief = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (brief.slug !== slug) {
    throw new Error(`starter slug mismatch in ${path.basename(file)}: ${brief.slug}`);
  }
  return brief;
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreEntry(entry, query) {
  const q = normalize(query);
  if (!q) return 0;
  let score = 0;
  if (normalize(entry.id) === q) score = Math.max(score, 100);
  if (normalize(entry.slug) === q) score = Math.max(score, 100);
  if (normalize(entry.attitude) === q) score = Math.max(score, 90);
  if (normalize(entry.category) === q) score = Math.max(score, 70);
  for (const alias of entry.aliases || []) {
    const aliasNorm = normalize(alias);
    if (!aliasNorm) continue;
    if (aliasNorm === q) score = Math.max(score, 80);
    else if (q.includes(aliasNorm) && aliasNorm.length >= 3) score = Math.max(score, 55);
    else if (aliasNorm.includes(q) && q.length >= 3) score = Math.max(score, 45);
  }
  const vertical = normalize(entry.vertical);
  if (vertical && (vertical === q || q.includes(vertical))) score = Math.max(score, 15);
  return score;
}

function pickStarter(query) {
  const catalog = loadCatalog();
  const ranked = catalog.starters
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) {
    return {
      ok: true,
      matched: false,
      ambiguous: false,
      fallback: true,
      reason: 'no-match',
      slug: null,
      path: EXAMPLE_BRIEF_PATH,
      score: 0,
    };
  }

  const top = ranked[0].score;
  const tied = ranked.filter((row) => row.score === top);
  if (tied.length > 1) {
    return {
      ok: false,
      matched: false,
      ambiguous: true,
      fallback: false,
      reason: 'ambiguous',
      slug: null,
      path: null,
      score: top,
      candidates: tied.map((row) => row.entry),
    };
  }

  const entry = ranked[0].entry;
  return {
    ok: true,
    matched: true,
    ambiguous: false,
    fallback: false,
    reason: 'matched',
    ...entry,
    score: ranked[0].score,
    path: starterPath(entry.slug),
  };
}

module.exports = {
  STARTERS_DIR,
  CATALOG_PATH,
  EXAMPLE_BRIEF_PATH,
  loadCatalog,
  listStarters,
  starterPath,
  loadStarterBySlug,
  pickStarter,
  normalize,
};
