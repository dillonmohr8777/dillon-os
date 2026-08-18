'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('./paths');
const { assertInside } = require('./sandbox');

const DEFAULT_VAULT = path.resolve(ROOT, '..');

const ALLOW_TOP = new Set([
  'INDEX.md',
  'Dashboard.md',
  'AGENTS.md',
  'CLAUDE.md',
  '12_Brain',
  '01_Clients',
  'System',
  'Daily-Briefs',
  '04_SOPs',
  '11_Agents',
  '00_Inbox',
]);

const SKIP_DIR = new Set([
  'private',
  'node_modules',
  '.git',
  'data',
  'queue',
  'dist',
  '.next',
  'generated-stock-library',
  'font-cache',
]);

const SKIP_FILE = /\.(env|key|pem|p12|sqlite|db)$/i;

// Words that carry no retrieval signal in an operator vault.
const STOP = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'are', 'was', 'were',
  'has', 'have', 'had', 'not', 'but', 'you', 'your', 'its', 'his', 'her',
  'what', 'when', 'where', 'which', 'who', 'how', 'why', 'can', 'will',
  'all', 'any', 'per', 'via', 'into', 'out', 'about', 'over', 'under',
  'more', 'most', 'some', 'such', 'than', 'then', 'them', 'they', 'there',
  'been', 'being', 'does', 'did', 'done', 'each', 'other', 'only', 'also',
]);

function vaultRoot() {
  return path.resolve(process.env.CLAW_VAULT_ROOT || DEFAULT_VAULT);
}

function isAllowedRel(rel) {
  const top = rel.split(/[\\/]/)[0];
  if (!ALLOW_TOP.has(top)) return false;
  const parts = rel.split(/[\\/]/);
  if (parts.some((p) => SKIP_DIR.has(p))) return false;
  if (SKIP_FILE.test(rel)) return false;
  if (rel.includes('12_Brain/private')) return false;
  return true;
}

function walkMarkdown(root, maxFiles = 1200) {
  const out = [];
  const stack = [root];
  while (stack.length && out.length < maxFiles) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const abs = path.join(dir, entry.name);
      const rel = path.relative(root, abs).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        if (SKIP_DIR.has(entry.name)) continue;
        if (dir === root && !ALLOW_TOP.has(entry.name)) continue;
        if (rel && !isAllowedRel(rel) && !ALLOW_TOP.has(entry.name)) continue;
        stack.push(abs);
        continue;
      }
      if (!entry.name.endsWith('.md')) continue;
      if (!isAllowedRel(rel)) continue;
      out.push({ abs, rel });
      if (out.length >= maxFiles) break;
    }
  }
  return out;
}

function tokens(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function parseFrontmatter(text) {
  if (!text.startsWith('---')) return { fm: {}, bodyStart: 0 };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { fm: {}, bodyStart: 0 };
  const fm = {};
  for (const line of text.slice(3, end).split('\n')) {
    const m = line.match(/^([a-z_][a-z0-9_]*):\s*(.*)$/i);
    if (m) fm[m[1].toLowerCase()] = m[2].trim();
  }
  return { fm, bodyStart: end + 4 };
}

function termFreq(list) {
  const tf = new Map();
  for (const w of list) tf.set(w, (tf.get(w) || 0) + 1);
  return tf;
}

// mtime-keyed cache: kb_search now runs on most turns, and re-reading 1200
// vault files per query is pure waste.
const CACHE = new Map();

function indexFile(file) {
  let stat;
  try {
    stat = fs.statSync(file.abs);
  } catch {
    return null;
  }
  if (stat.size > 400_000) return null;
  const hit = CACHE.get(file.abs);
  if (hit && hit.mtimeMs === stat.mtimeMs && hit.size === stat.size) return hit.entry;

  let text;
  try {
    text = fs.readFileSync(file.abs, 'utf8');
  } catch {
    return null;
  }
  const { fm, bodyStart } = parseFrontmatter(text);
  const body = text.slice(bodyStart);
  const base = path.basename(file.rel, '.md');
  const headings = (body.match(/^#{1,4} .*$/gm) || []).join(' ');

  const entry = {
    rel: file.rel,
    body,
    title: fm.title || base,
    titleTokens: new Set(tokens(`${base} ${fm.title || ''} ${fm.tags || ''} ${fm.area || ''}`)),
    headingTokens: new Set(tokens(headings)),
    updated: fm.updated || fm.created || '',
    generated: fm.generated === 'true' || /\/Generated\//.test(file.rel),
    noteType: fm.note_type || '',
    tf: termFreq(tokens(body)),
    len: 0,
  };
  entry.len = [...entry.tf.values()].reduce((a, b) => a + b, 0) || 1;
  CACHE.set(file.abs, { mtimeMs: stat.mtimeMs, size: stat.size, entry });
  return entry;
}

function buildIndex(root) {
  const out = [];
  for (const file of walkMarkdown(root)) {
    const entry = indexFile(file);
    if (entry) out.push(entry);
  }
  return out;
}

// Newer notes win ties. Smooth decay, roughly quarter-weight bonus decaying
// over six months.
function recencyBoost(updated) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(updated)) return 1;
  const days = (Date.now() - Date.parse(updated.slice(0, 10))) / 86400000;
  if (!Number.isFinite(days)) return 1;
  if (days < 0) return 1.25;
  return 1 + 0.25 * Math.exp(-days / 180);
}

const K1 = 1.5;
const B = 0.75;

// Smallest excerpt that actually carries the answer: slide a window over the
// lines, keep the densest run of query terms, then back up to the heading that
// owns it so the excerpt is sourced rather than dangling mid-section.
function bestExcerpt(entry, q, maxChars = 1200) {
  const lines = String(entry.body || '').split('\n');
  const hits = new Array(lines.length);
  for (let i = 0; i < lines.length; i += 1) {
    const low = lines[i].toLowerCase();
    let n = 0;
    for (const t of q) if (low.includes(t)) n += 1;
    hits[i] = n;
  }
  const win = Math.max(4, Math.round(maxChars / 90));
  let best = 0;
  let bestSum = -1;
  let run = 0;
  for (let i = 0; i < lines.length; i += 1) {
    run += hits[i];
    if (i >= win) run -= hits[i - win];
    if (run > bestSum) {
      bestSum = run;
      best = Math.max(0, i - win + 1);
    }
  }
  let head = best;
  for (let i = best; i >= 0 && best - i < 40; i -= 1) {
    if (/^#{1,6} /.test(lines[i])) { head = i; break; }
  }
  const slice = lines.slice(head, head + win + 6).join('\n').trim();
  return {
    text: slice.slice(0, maxChars),
    startLine: head + 1,
    endLine: Math.min(lines.length, head + win + 6),
    matchedLines: Math.max(0, bestSum),
  };
}

function searchKnowledge({ query, limit = 8, includeGenerated = false, noteType = '' } = {}) {
  const root = vaultRoot();
  const q = [...new Set(tokens(query))];
  if (!q.length) return [];

  let docs = buildIndex(root);
  if (!includeGenerated) docs = docs.filter((d) => !d.generated);
  if (noteType) docs = docs.filter((d) => d.noteType === noteType);
  if (!docs.length) return [];

  const N = docs.length;
  const avgLen = docs.reduce((a, d) => a + d.len, 0) / N;
  const idf = new Map();
  for (const term of q) {
    let df = 0;
    for (const d of docs) if (d.tf.has(term)) df += 1;
    idf.set(term, Math.log(1 + (N - df + 0.5) / (df + 0.5)));
  }

  const scored = [];
  for (const d of docs) {
    let bm25 = 0;
    let matched = 0;
    for (const term of q) {
      const f = d.tf.get(term) || 0;
      if (!f) continue;
      matched += 1;
      bm25 += idf.get(term) * ((f * (K1 + 1)) / (f + K1 * (1 - B + B * (d.len / avgLen))));
    }
    const titleHits = q.filter((t) => d.titleTokens.has(t)).length;
    const headHits = q.filter((t) => d.headingTokens.has(t)).length;
    if (!matched && !titleHits) continue;

    const why = [];
    if (titleHits) why.push(`title:${titleHits}`);
    if (headHits) why.push(`heading:${headHits}`);
    if (matched) why.push(`body:${matched}/${q.length}`);
    if (d.updated) why.push(`updated:${d.updated.slice(0, 10)}`);

    const score = (bm25 + titleHits * 2.5 + headHits * 1.2)
      * recencyBoost(d.updated)
      * (d.rel === 'INDEX.md' ? 1.3 : 1);

    scored.push({
      path: d.rel,
      score: Math.round(score * 1000) / 1000,
      title: d.title,
      updated: d.updated,
      note_type: d.noteType,
      why: why.join(' '),
      snippet: bestExcerpt(d, q, 420).text,
    });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

function resolveAllowed(relPath) {
  const root = vaultRoot();
  const rel = String(relPath || '').replace(/^\/+/, '').replace(/\\/g, '/');
  if (!rel || rel.includes('..')) throw new Error('path escapes knowledge base');
  if (!isAllowedRel(rel)) throw new Error('path is outside the knowledge allowlist');
  const abs = assertInside(root, rel);
  if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory()) {
    throw new Error('file not found');
  }
  return { abs, rel };
}

function readKnowledge(relPath) {
  const { abs, rel } = resolveAllowed(relPath);
  const text = fs.readFileSync(abs, 'utf8');
  return {
    ok: true,
    path: rel,
    bytes: text.length,
    truncated: text.length > 40000,
    content: text.slice(0, 40000),
  };
}

function openKnowledge({ path: relPath, query = '', maxChars = 1200 } = {}) {
  const { abs, rel } = resolveAllowed(relPath);
  const text = fs.readFileSync(abs, 'utf8');
  const { fm, bodyStart } = parseFrontmatter(text);
  const body = text.slice(bodyStart);
  const q = [...new Set(tokens(query))];
  const cap = Math.min(Math.max(200, Number(maxChars) || 1200), 8000);

  if (!q.length) {
    return {
      ok: true,
      path: rel,
      cite: `${rel}:1`,
      updated: fm.updated || '',
      lines: '1-',
      excerpt: body.trim().slice(0, cap),
      bytes: text.length,
      note: 'no query given; returned the head of the note',
    };
  }
  const ex = bestExcerpt({ body }, q, cap);
  return {
    ok: true,
    path: rel,
    cite: `${rel}:${ex.startLine}`,
    updated: fm.updated || '',
    lines: `${ex.startLine}-${ex.endLine}`,
    matchedLines: ex.matchedLines,
    excerpt: ex.text,
    bytes: text.length,
  };
}

/**
 * The one place CLAW may write into the vault. Deliberately narrower than the
 * read allowlist: Daily-Briefs/ only, .md only, no subdirectories, no
 * overwrite unless asked. Local file write only - publishing, sending, and
 * anything outward-facing stays approval-gated and is not reachable from here.
 */
const BRIEF_DIR = 'Daily-Briefs';

function writeBrief({ name, content, overwrite = false }) {
  const base = String(name || '').trim().replace(/\\/g, '/');
  if (!base || base.includes('/') || base.includes('..')) {
    throw new Error('brief name must be a bare filename, no paths');
  }
  const file = base.endsWith('.md') ? base : `${base}.md`;
  if (!/^[\w.\- ]+\.md$/.test(file)) {
    throw new Error('brief name must be a simple .md filename');
  }
  const body = String(content || '');
  if (!body.trim()) throw new Error('refusing to write an empty brief');

  const root = vaultRoot();
  const dir = path.join(root, BRIEF_DIR);
  // The name is already validated as a bare .md filename, so creating the
  // folder first is safe, and assertInside needs a real path to resolve.
  fs.mkdirSync(dir, { recursive: true });
  const abs = assertInside(dir, file);
  if (fs.existsSync(abs) && !overwrite) {
    throw new Error(`${BRIEF_DIR}/${file} already exists; pass overwrite to replace it`);
  }
  fs.writeFileSync(abs, body, 'utf8');
  return {
    ok: true,
    path: `${BRIEF_DIR}/${file}`,
    bytes: Buffer.byteLength(body),
    overwritten: Boolean(overwrite),
    note: 'Written locally. Nothing was sent, published, or deployed.',
  };
}

module.exports = {
  vaultRoot,
  isAllowedRel,
  writeBrief,
  BRIEF_DIR,
  searchKnowledge,
  readKnowledge,
  openKnowledge,
  walkMarkdown,
  parseFrontmatter,
  bestExcerpt,
};
