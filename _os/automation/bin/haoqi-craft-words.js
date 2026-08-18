#!/usr/bin/env node
'use strict';

const { repoPath, readJson } = require('../lib/fsutil');
const { rankRadar } = require('../lib/haoqi-craft-words');

const registry = readJson(repoPath('12_Brain/state/radar/registry.json'), null);
if (!registry || !registry.prospects) {
  console.error('No radar registry.');
  process.exit(1);
}

const report = rankRadar(registry.prospects, { limit: 100, perWord: 15 });
const out = {
  scanned: report.scanned,
  eligible: report.eligible,
  skipped: report.skipped,
  unlock: report.unlock,
  top: report.top.map((r) => ({
    word: r.word,
    name: r.name,
    domain: r.domain,
    vertical: r.vertical,
    verdict: r.verdict,
    opportunity: r.opportunity,
    quality: r.quality,
    score: Math.round(r.score * 10) / 10,
    why: r.why,
  })),
};
process.stdout.write(JSON.stringify(out, null, 2) + '\n');
