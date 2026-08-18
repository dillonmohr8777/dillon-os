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

function writeMemory({ text, kind = 'note', pin = false, maxBytes }) {
  if (fileSize(LONG_TERM) >= maxBytes) {
    throw new Error('long-term memory is at the configured disk ceiling');
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
  searchMemory,
  stats,
  memoryMdPath,
  dailyPath,
  readIfExists,
  todayStamp,
};
