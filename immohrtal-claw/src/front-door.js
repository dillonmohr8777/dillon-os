'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { vaultRoot, isAllowedRel, parseFrontmatter } = require('./knowledge');

/**
 * The always-on brief. Every turn should be able to see where the operator
 * actually stands without swallowing the vault: a few hundred tokens compiled
 * from four fixed sources, never a recursive crawl.
 *
 * approval-queue.md is ~95KB, so it contributes headings and open item titles
 * only. Nothing here reaches 12_Brain/private or .env - it routes through the
 * same allowlist as kb_read.
 */
const SOURCES = [
  { rel: 'INDEX.md', mode: 'head', chars: 700 },
  { rel: 'System/operating-status.md', mode: 'head', chars: 700 },
  { rel: 'System/approval-queue.md', mode: 'titles', max: 12 },
  { rel: '12_Brain/05_Projects/IMMOHRTAL CLAW.md', mode: 'head', chars: 700 },
];

const TTL_MS = 60000;
let cached = null;

function readAllowed(rel) {
  if (!isAllowedRel(rel)) return null;
  const abs = path.join(vaultRoot(), rel);
  try {
    if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory()) return null;
    return fs.readFileSync(abs, 'utf8');
  } catch {
    return null;
  }
}

function stripLinks(line) {
  return line.replace(/\[\[([^\]]+)\]\]/g, '$1').replace(/\s+/g, ' ').trim();
}

// Titles only: headings, plus unchecked checklist items, which is where the
// queue actually keeps the open work.
function titlesOf(body, max) {
  const out = [];
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    const head = line.match(/^#{2,4}\s+(.*)$/);
    if (head) {
      out.push(`## ${stripLinks(head[1])}`);
    } else if (/^[-*]\s+\[ \]\s+/.test(line)) {
      out.push(`- ${stripLinks(line.replace(/^[-*]\s+\[ \]\s+/, '')).slice(0, 120)}`);
    }
    if (out.length >= max) break;
  }
  return out;
}

function headOf(body, chars) {
  const trimmed = body
    .split('\n')
    .filter((l) => !/^\s*$/.test(l))
    .join('\n')
    .trim();
  return trimmed.length > chars ? `${trimmed.slice(0, chars)}...` : trimmed;
}

function compileBrief({ force = false } = {}) {
  if (!force && cached && Date.now() - cached.at < TTL_MS) return cached.brief;

  const blocks = [];
  const missing = [];
  for (const src of SOURCES) {
    const text = readAllowed(src.rel);
    if (text == null) {
      missing.push(src.rel);
      continue;
    }
    const { fm, bodyStart } = parseFrontmatter(text);
    const body = text.slice(bodyStart);
    const stamp = fm.updated || fm.last_updated || fm.last_scan || '';
    const label = stamp ? `${src.rel} (updated ${stamp.slice(0, 10)})` : src.rel;

    if (src.mode === 'titles') {
      const titles = titlesOf(body, src.max);
      blocks.push(`### ${label} - open items, titles only\n${titles.join('\n') || '(none listed)'}`);
    } else {
      blocks.push(`### ${label}\n${headOf(body, src.chars)}`);
    }
  }

  const brief = [
    'These four sources are compiled fresh each turn. They are the operator front door,',
    'not the whole vault. For anything else run kb_search then kb_open and cite the path.',
    ...blocks,
    missing.length ? `### Missing on this box\n${missing.join('\n')}` : '',
  ].filter(Boolean).join('\n\n');

  cached = { at: Date.now(), brief };
  return brief;
}

module.exports = { compileBrief, SOURCES };
