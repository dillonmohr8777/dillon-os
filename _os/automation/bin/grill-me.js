#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { GrillSession } = require('../lib/grill-me.js');

function value(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

function main() {
  const command = process.argv[2];
  const sessionPath = value('--session');
  if (!command || !sessionPath) throw new Error('Usage: grill-me.js <start|next|answer|resolve-source|status|block> --session <json> [options]');
  let session;
  if (command === 'start') {
    const inputPath = value('--input');
    if (!inputPath) throw new Error('start requires --input <json>');
    session = new GrillSession({ sessionPath, ...readJson(inputPath) });
  } else {
    session = new GrillSession({ sessionPath });
  }
  if (command === 'start' || command === 'status') return session.session;
  if (command === 'next') return session.askNext();
  if (command === 'answer') {
    const resolutionPath = value('--resolution');
    if (!resolutionPath) throw new Error('answer requires --resolution <json>');
    const resolution = readJson(resolutionPath);
    return session.answerCurrent(resolution.answer, resolution.evidenceLocators || []);
  }
  if (command === 'resolve-source') {
    const branchId = value('--branch');
    const resolutionPath = value('--resolution');
    if (!branchId || !resolutionPath) throw new Error('resolve-source requires --branch <id> --resolution <json>');
    return session.resolveFromSource(branchId, readJson(resolutionPath));
  }
  if (command === 'block') return session.block(value('--reason'));
  throw new Error(`unknown Grill Me command: ${command}`);
}

try {
  const result = main();
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
