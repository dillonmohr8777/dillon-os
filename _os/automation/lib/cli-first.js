'use strict';

const fs = require('fs');
const { repoPath } = require('./fsutil');

const SNAPSHOT_REL = '_os/automation/fixtures/cli-first/catalog-snapshot.json';
const LIVE_CATALOG_URL = 'https://reeceyang.sgp1.cdn.digitaloceanspaces.com/SKILL.md';

const VERDICTS = new Set([
  'fixed',
  'reduced',
  'partial',
  'already-unblocked',
  'not-fixed',
  'operator-install',
]);

function loadSnapshot(file = repoPath(SNAPSHOT_REL)) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!data || !Array.isArray(data.blockers) || !Array.isArray(data.entries)) {
    throw new Error('cli-first snapshot is missing blockers or entries');
  }
  for (const blocker of data.blockers) {
    if (!blocker.id || !VERDICTS.has(blocker.verdict)) {
      throw new Error(`invalid blocker ${blocker.id || '(missing id)'}`);
    }
  }
  return data;
}

const SHORT_TOKENS = new Set(['x']);

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9+]+/i)
    .filter((part) => part.length >= 2 || SHORT_TOKENS.has(part));
}

function idTokens(id) {
  return tokenize(String(id || '').replace(/-/g, ' '));
}

function haystack(item) {
  return [
    item.id,
    item.name,
    item.summary,
    item.description,
    item.category,
    item.command,
    item.install,
    item.caveat,
    item.next,
    ...(item.aliases || []),
    ...(item.fixes || []),
    ...(item.needs || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function scoreItem(item, terms) {
  if (!terms.length) return 0;
  const text = haystack(item);
  const parts = idTokens(item.id);
  const aliases = (item.aliases || []).map((alias) => String(alias).toLowerCase());
  const query = terms.join(' ');
  let score = 0;
  for (const term of terms) {
    if (item.id === term) score += 10;
    if (parts.includes(term)) score += 5;
    if ((item.fixes || []).some((fix) => fix === term || idTokens(fix).includes(term))) score += 6;
    if (aliases.includes(term) || aliases.some((alias) => alias.split(/\s+/).includes(term))) score += 8;
    else if (!SHORT_TOKENS.has(term) && text.includes(term)) score += 2;
  }
  if (aliases.some((alias) => alias.includes(' ') && query.includes(alias))) score += 12;
  return score;
}

function lookup(query, snapshot = loadSnapshot()) {
  const terms = tokenize(query);
  const blockers = snapshot.blockers
    .map((item) => ({ item, score: scoreItem(item, terms) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id))
    .map((row) => row.item);
  const entries = [...(snapshot.official_clis || []), ...snapshot.entries]
    .map((item) => ({ item, score: scoreItem(item, terms) }))
    .filter((row) => {
      if (row.score <= 0) return false;
      if (row.item.recommend === false && !explicitlyNamed(row.item, terms)) return false;
      return true;
    })
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id))
    .map((row) => row.item);
  return {
    query: String(query || '').trim(),
    updated: snapshot.updated,
    expires: snapshot.expires,
    source: snapshot.source,
    blockers,
    entries,
  };
}

function explicitlyNamed(item, terms) {
  const names = new Set([item.id, ...(item.aliases || []).map((alias) => String(alias).toLowerCase())]);
  return terms.some((term) => names.has(term));
}

function audit(snapshot = loadSnapshot()) {
  const counts = {};
  for (const blocker of snapshot.blockers) {
    counts[blocker.verdict] = (counts[blocker.verdict] || 0) + 1;
  }
  return {
    updated: snapshot.updated,
    expires: snapshot.expires,
    source: snapshot.source,
    repo: snapshot.repo,
    counts,
    blockers: snapshot.blockers,
    official_clis: snapshot.official_clis || [],
    entries: snapshot.entries,
  };
}

function parseCatalogMarkdown(markdown) {
  const entries = [];
  const row = /^\|\s+\*\*(.+?)\*\*\s+\|\s+(.+?)\s+\|\s+`?(cli-hub install [^`|]+|[^`|]+)`?\s+\|$/;
  for (const line of String(markdown || '').split('\n')) {
    const match = line.match(row);
    if (!match) continue;
    const name = match[1].trim();
    const description = match[2].trim();
    const install = match[3].trim();
    if (name === 'Name' || name.startsWith('---')) continue;
    entries.push({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      name,
      description,
      install,
    });
  }
  return entries;
}

async function fetchLiveCatalog(url = LIVE_CATALOG_URL, fetchImpl = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetchImpl(url, { redirect: 'follow', signal: controller.signal });
    if (!response.ok) {
      throw new Error(`live catalog HTTP ${response.status}`);
    }
    const markdown = await response.text();
    if (markdown.length > 200000) {
      throw new Error('live catalog exceeded 200KB');
    }
    return {
      url,
      entries: parseCatalogMarkdown(markdown),
    };
  } finally {
    clearTimeout(timer);
  }
}

function formatReport(result, { live = null } = {}) {
  const lines = [];
  if (result.query) lines.push(`Query: ${result.query}`);
  else lines.push('CLI-first audit (no query — full blocker map)');
  lines.push(`Snapshot: ${result.updated} (expires ${result.expires})`);
  lines.push(`Catalog: ${result.source}`);
  if (result.counts) {
    const summary = Object.entries(result.counts)
      .map(([verdict, count]) => `${verdict}=${count}`)
      .join(' · ');
    lines.push(`Verdicts: ${summary}`);
  }
  const official = result.official_clis || [];
  if (official.length) {
    lines.push('');
    lines.push('On-PATH CLIs');
    for (const entry of official) {
      lines.push(`- ${entry.id} [${entry.already_on_path ? 'on-PATH' : 'official'}] ${entry.name}`);
      if (entry.command) lines.push(`  command: ${entry.command}`);
    }
  }
  const blockers = result.blockers || [];
  if (blockers.length) {
    lines.push('');
    lines.push('Blockers');
    for (const blocker of blockers) {
      lines.push(`- ${blocker.id} [${blocker.verdict}] ${blocker.summary || blocker.next}`);
      if (blocker.next) lines.push(`  next: ${blocker.next}`);
    }
  }
  const entries = result.entries || [];
  if (entries.length) {
    lines.push('');
    lines.push('CLI matches');
    for (const entry of entries) {
      const label = entry.already_on_path ? 'on-PATH' : entry.verdict || 'catalog';
      lines.push(`- ${entry.id} [${label}] ${entry.name}`);
      if (entry.command) lines.push(`  command: ${entry.command}`);
      if (entry.install) lines.push(`  install: ${entry.install} (Tier 2 — do not run)`);
      if (entry.caveat) lines.push(`  caveat: ${entry.caveat}`);
    }
  }
  if (live && live.entries) {
    lines.push('');
    lines.push(`Live catalog hits (${live.url}): ${live.entries.length}`);
    for (const entry of live.entries.slice(0, 12)) {
      lines.push(`- ${entry.name} — ${entry.install} (Tier 2 — do not run)`);
    }
  }
  if (!blockers.length && !entries.length) {
    lines.push('');
    lines.push('No snapshot match. That usually means this is not a CLI-shaped gap.');
  }
  return `${lines.join('\n')}\n`;
}

function matchLive(query, liveEntries) {
  const terms = tokenize(query);
  if (!terms.length) return liveEntries;
  return liveEntries.filter((entry) => scoreItem(entry, terms) > 0);
}

module.exports = {
  LIVE_CATALOG_URL,
  SNAPSHOT_REL,
  VERDICTS,
  audit,
  fetchLiveCatalog,
  formatReport,
  loadSnapshot,
  lookup,
  matchLive,
  parseCatalogMarkdown,
  tokenize,
};
