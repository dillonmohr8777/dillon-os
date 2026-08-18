'use strict';

const fs = require('fs');
const path = require('path');

function numberOrNull(value) {
  if (value == null || String(value).trim() === '') return null;
  const number = Number(String(value).replace(/[$,]/g, ''));
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function summarize(records) {
  const mailed = records.reduce((sum, record) => {
    const pieces = numberOrNull(record.pieces_mailed);
    if (pieces != null) return sum + pieces;
    return sum + (record.mailed_on ? 1 : 0);
  }, 0);
  const scans = records.reduce((sum, record) => sum + (numberOrNull(record.scans) || 0), 0);
  const calls = records.reduce((sum, record) => sum + (numberOrNull(record.calls_booked) || 0), 0);
  const closes = records.reduce((sum, record) => sum + (numberOrNull(record.closes) || 0), 0);
  const revenue = records.reduce((sum, record) => sum + (numberOrNull(record.revenue) || 0), 0);
  return {
    prospects: records.length,
    mailed,
    scans,
    calls_booked: calls,
    closes,
    revenue,
    scan_rate: mailed ? scans / mailed : null,
    call_rate: mailed ? calls / mailed : null,
    close_rate: mailed ? closes / mailed : null,
  };
}

function groupSummary(records, field) {
  const groups = new Map();
  records.forEach((record) => {
    const key = String(record[field] || 'unknown').toLowerCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  });
  return Object.fromEntries([...groups.entries()].map(([key, rows]) => [key, summarize(rows)]));
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function buildLearningProfile(records) {
  const overall = summarize(records);
  const verticals = groupSummary(records, 'vertical');
  for (const summary of Object.values(verticals)) {
    summary.sample_size = summary.mailed;
    if (summary.mailed < 10 || !overall.mailed) {
      summary.score_adjustment = 0;
      summary.confidence = 'insufficient-sample';
      continue;
    }
    const overallCallRate = overall.call_rate || 0;
    const overallCloseRate = overall.close_rate || 0;
    const callLift = (summary.call_rate || 0) - overallCallRate;
    const closeLift = (summary.close_rate || 0) - overallCloseRate;
    summary.score_adjustment = clamp(Math.round(callLift * 20 + closeLift * 30), -5, 5);
    summary.confidence = summary.mailed >= 25 ? 'high' : 'directional';
  }
  return {
    version: 1,
    generated_at: new Date().toISOString(),
    minimum_sample_for_scoring: 10,
    overall,
    verticals,
    attitudes: groupSummary(records, 'attitude'),
  };
}

function findResultFiles(root) {
  if (!root || !fs.existsSync(root)) return [];
  const files = [];
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && entry.name === 'results.json') files.push(full);
    }
  }
  return files.sort();
}

function loadAllResults(root) {
  return findResultFiles(root).flatMap((file) => {
    try {
      const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
      return Array.isArray(doc) ? doc : doc.records || [];
    } catch {
      return [];
    }
  });
}

module.exports = {
  numberOrNull,
  summarize,
  groupSummary,
  buildLearningProfile,
  findResultFiles,
  loadAllResults,
};
