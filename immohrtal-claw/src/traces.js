'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { TRACES } = require('./paths');
const { appendJsonl } = require('./jsonl');

function tracePath(turnId) {
  return path.join(TRACES, `${turnId}.jsonl`);
}

function emit(turnId, event) {
  appendJsonl(tracePath(turnId), {
    ts: new Date().toISOString(),
    ...event,
  });
}

function loadTrace(turnId) {
  const file = tracePath(turnId);
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

module.exports = { emit, loadTrace, tracePath };
