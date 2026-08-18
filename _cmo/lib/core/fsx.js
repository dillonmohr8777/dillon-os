/**
 * Filesystem helpers with crash-safe writes.
 *
 * Every JSON write goes to a temp file in the same directory and is then
 * renamed over the target. A power loss mid-write leaves either the old file
 * or the new one, never a truncated one - which matters because the approval
 * queue and the cost ledger are the two files you least want corrupted.
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

export async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
  return dir;
}

export function ensureDirSync(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function writeAtomic(file, contents) {
  const dir = path.dirname(file);
  await ensureDir(dir);
  const tmp = path.join(dir, `.${path.basename(file)}.${randomBytes(4).toString('hex')}.tmp`);
  await fsp.writeFile(tmp, contents, 'utf8');
  await fsp.rename(tmp, file);
  return file;
}

export async function writeJson(file, value, { pretty = true } = {}) {
  return writeAtomic(file, `${JSON.stringify(value, null, pretty ? 2 : 0)}\n`);
}

export async function readJson(file, fallback = null) {
  try {
    const raw = await fsp.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    if (err instanceof SyntaxError) {
      const wrapped = new Error(`corrupt JSON at ${file}: ${err.message}`);
      wrapped.code = 'CORRUPT_JSON';
      wrapped.file = file;
      throw wrapped;
    }
    throw err;
  }
}

/** Append one record as a JSON line. Creates the file and parents if needed. */
export async function appendJsonl(file, record) {
  await ensureDir(path.dirname(file));
  await fsp.appendFile(file, `${JSON.stringify(record)}\n`, 'utf8');
  return record;
}

/**
 * Read a JSONL file. `tail` returns only the last N records without holding
 * the whole file in memory twice. Malformed lines are skipped, not fatal -
 * an append-only log that a crash truncated mid-line must still be readable.
 */
export async function readJsonl(file, { limit = null, tail = false } = {}) {
  let raw;
  try {
    raw = await fsp.readFile(file, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
  const out = [];
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line));
    } catch {
      // Skip a torn line rather than failing the whole read. A crash during
      // append leaves a partial final line; the rest of the log is still good.
    }
  }
  // Slice AFTER parsing: `tail` must return the last N *valid* records, not
  // the last N lines (a torn final line would otherwise eat a tail slot).
  if (limit == null) return out;
  return tail ? out.slice(-limit) : out.slice(0, limit);
}

export async function listFiles(dir, { ext = null } = {}) {
  try {
    const names = await fsp.readdir(dir);
    return names
      .filter((n) => !n.startsWith('.'))
      .filter((n) => (ext ? n.endsWith(ext) : true))
      .sort();
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

export async function exists(target) {
  try {
    await fsp.access(target);
    return true;
  } catch {
    return false;
  }
}

export async function removeQuiet(target) {
  await fsp.rm(target, { recursive: true, force: true });
}

/** Guard against ids that would escape their collection directory. */
export function safeSegment(value, what = 'id') {
  const s = String(value ?? '');
  if (!s || s === '.' || s === '..' || /[/\\]/.test(s) || s.includes('\0')) {
    throw new Error(`unsafe ${what}: ${JSON.stringify(s)}`);
  }
  return s;
}
