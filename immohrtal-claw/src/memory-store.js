'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { WORKSPACE, LONG_TERM, NOTES } = require('./paths');
const { appendJsonl, readLastBytes, parseJsonlChunk, fileSize } = require('./jsonl');

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function memoryMdPath() {
  return path.join(WORKSPACE, 'MEMORY.md');
}

function dailyPath(day = todayStamp()) {
  const [y, m] = day.split('-');
  const dir = path.join(WORKSPACE, 'memory', `${y}-${m}`);
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${day}.md`);
}

function readIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function tokenish(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((w) => w.length > 2);
}

/**
 * Credentials must never reach disk, and pinned memory rides in every single
 * prompt, so a leaked token would be re-sent to every provider on every turn.
 * Targeted patterns only - known key shapes, PEM blocks, and labelled
 * credential assignments. Generic high-entropy matching is deliberately not
 * used: it would reject git SHAs and ordinary IDs and train the operator to
 * work around the guard.
 */
const SECRET_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{16,}/,
  /\bsk-ant-[A-Za-z0-9_-]{16,}/,
  /\bxai-[A-Za-z0-9_-]{16,}/,
  /\bAIza[A-Za-z0-9_-]{30,}/,
  /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}/,
  /\bxox[baprs]-[A-Za-z0-9-]{10,}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bBearer\s+[A-Za-z0-9._-]{20,}/i,
  /\b(?:pass(?:word|wd)?|secret|api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|recovery[_-]?code|mfa|otp|totp)\b\s*[:=]\s*\S{6,}/i,
];

function findSecret(text) {
  const raw = String(text || '');
  for (const re of SECRET_PATTERNS) {
    if (re.test(raw)) return true;
  }
  return false;
}

function writeMemory({ text, kind = 'note', pin = false, maxBytes }) {
  if (fileSize(LONG_TERM) >= maxBytes) {
    throw new Error('long-term memory is at the configured disk ceiling');
  }
  // Refuse without echoing the value back into logs, traces, or the transcript.
  if (findSecret(text)) {
    throw new Error(
      'refusing to persist this: it looks like a credential (key, token, password, or MFA value). '
      + 'Secrets belong in .env on the box, never in memory. Store a pointer such as '
      + '"the xAI key is in immohrtal-claw/.env" instead.',
    );
  }
  const record = {
    ts: new Date().toISOString(),
    kind,
    pin: Boolean(pin),
    text: String(text || '').trim(),
  };
  if (!record.text) throw new Error('memory text is empty');
  appendJsonl(LONG_TERM, record);

  const daily = dailyPath();
  const block = `\n## ${record.ts}\n\n${record.text}\n`;
  fs.appendFileSync(daily, fs.existsSync(daily) ? block : `# ${todayStamp()}\n${block}`, 'utf8');

  if (pin) {
    const md = memoryMdPath();
    const current = readIfExists(md);
    const next = `${current.trim()}\n\n- ${record.text}\n`;
    fs.writeFileSync(md, next.trimStart(), 'utf8');
  }
  return record;
}

function searchMemory({ query, scanBytes, limit = 8 }) {
  const q = tokenish(query);
  const scored = [];

  const files = [
    { source: 'MEMORY.md', text: readIfExists(memoryMdPath()) },
    { source: `daily:${todayStamp()}`, text: readIfExists(dailyPath()) },
  ];
  for (const file of files) {
    if (!file.text) continue;
    const hits = q.filter((w) => file.text.toLowerCase().includes(w)).length;
    if (!q.length || hits) {
      scored.push({ source: file.source, score: hits + 1, text: file.text.slice(0, 2000) });
    }
  }

  const chunk = readLastBytes(LONG_TERM, scanBytes);
  for (const rec of parseJsonlChunk(chunk).reverse()) {
    const hay = String(rec.text || '').toLowerCase();
    const hits = q.filter((w) => hay.includes(w)).length;
    const bonus = rec.pin ? 2 : 0;
    if (hits > 0 || !q.length) {
      scored.push({
        source: `long-term:${rec.ts}`,
        score: hits + bonus,
        text: rec.text,
        kind: rec.kind,
      });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Compile the day into a tape. long-term.jsonl stays the raw record; the daily
 * markdown is what actually enters the prompt, so a busy day would otherwise
 * push a growing wall of duplicate timestamps into every turn. Grouping by
 * kind and dropping duplicates keeps the day readable at a fixed cost.
 * Preferences lead, because those are the ones that should steer behaviour.
 */
function compileDailyTape({ day = todayStamp(), scanBytes = 8 * 1024 * 1024 } = {}) {
  const records = parseJsonlChunk(readLastBytes(LONG_TERM, scanBytes))
    .filter((r) => String(r.ts || '').startsWith(day));

  const seen = new Set();
  const groups = new Map();
  for (const rec of records) {
    const text = String(rec.text || '').trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    const kind = rec.pin ? 'pinned' : (rec.kind || 'note');
    if (!groups.has(kind)) groups.set(kind, []);
    groups.get(kind).push({ text, ts: rec.ts });
  }

  const order = ['pinned', 'pref', 'decision', 'note'];
  const kinds = [...groups.keys()].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
  });

  const lines = [`# ${day}`, '', `_Compiled tape. ${records.length} raw entries, ${seen.size} unique._`];
  for (const kind of kinds) {
    lines.push('', `## ${kind}`, '');
    for (const item of groups.get(kind)) {
      lines.push(`- ${item.text.replace(/\s*\n\s*/g, ' ')}`);
    }
  }
  const body = `${lines.join('\n')}\n`;
  const file = dailyPath(day);
  fs.writeFileSync(file, body, 'utf8');

  return {
    ok: true,
    day,
    raw: records.length,
    unique: seen.size,
    kinds,
    path: file,
    bytes: Buffer.byteLength(body),
  };
}

function stats() {
  return {
    memoryMdBytes: fileSize(memoryMdPath()),
    longTermBytes: fileSize(LONG_TERM),
    notesDir: NOTES,
  };
}

function bootstrap() {
  fs.mkdirSync(path.dirname(LONG_TERM), { recursive: true });
  fs.mkdirSync(NOTES, { recursive: true });
  fs.mkdirSync(path.join(WORKSPACE, 'memory'), { recursive: true });
  if (!fs.existsSync(memoryMdPath())) {
    fs.writeFileSync(memoryMdPath(), '# Memory\n\nPinned facts live here.\n', 'utf8');
  }
}

module.exports = {
  bootstrap,
  writeMemory,
  compileDailyTape,
  findSecret,
  searchMemory,
  stats,
  memoryMdPath,
  dailyPath,
  readIfExists,
  todayStamp,
};
