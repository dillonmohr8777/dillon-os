#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { buildDriveSnapshot } from './drive-snapshot-adapter.mjs';
import { sha256 } from './policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function argsOf(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 2) {
    if (!argv[index]?.startsWith('--') || !argv[index + 1]) throw new Error(`Invalid argument near ${argv[index] || '(end)'}.`);
    args[argv[index].slice(2)] = argv[index + 1];
  }
  return args;
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temp, file);
}

const args = argsOf(process.argv.slice(2));
const runtime = path.resolve(args.output || path.join(root, '.runtime'));
const raw = path.resolve(args.raw || path.join(runtime, 'raw'));
const metadata = JSON.parse(fs.readFileSync(path.resolve(args.metadata || path.join(root, 'config', 'source-metadata.json')), 'utf8'));
const capturedAt = args['captured-at'] || new Date().toISOString();
const result = buildDriveSnapshot({
  clearedText: fs.readFileSync(path.join(raw, 'cleared.csv'), 'utf8'),
  holdText: fs.readFileSync(path.join(raw, 'hold.csv'), 'utf8'),
  doNotPitchText: fs.readFileSync(path.join(raw, 'do-not-pitch.csv'), 'utf8'),
  metadata,
  capturedAt
});
const inputPath = path.join(runtime, 'current-prospects.json');
const suppressionPath = path.join(runtime, 'current-suppressions.json');
writeJson(inputPath, result.input);
writeJson(suppressionPath, result.suppressions);
writeJson(path.join(runtime, 'intake-receipt.json'), {
  status: 'complete', captured_at: capturedAt, sources: metadata.sources, counts: result.counts,
  sha256: { input: sha256(result.input), suppressions: sha256(result.suppressions) }
});
process.stdout.write(`${JSON.stringify({ ok: true, input: inputPath, suppressions: suppressionPath, counts: result.counts })}\n`);
