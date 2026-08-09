#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..');
const registryPath = path.join(__dirname, 'registry.json');

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function requiredFiles(skill) {
  return [...new Set([skill.skillPath, ...(skill.fixtures || []), ...(skill.expectedFiles || [])])];
}

function inspectContract(skill) {
  const failures = [];
  for (const relativePath of requiredFiles(skill)) {
    if (!fs.existsSync(path.join(repoRoot, relativePath))) failures.push(`missing file: ${relativePath}`);
  }
  const skillPath = path.join(repoRoot, skill.skillPath);
  if (fs.existsSync(skillPath)) {
    const text = fs.readFileSync(skillPath, 'utf8');
    for (const pattern of skill.requiredPatterns || []) {
      if (!text.includes(pattern)) failures.push(`missing required pattern in ${skill.skillPath}: ${pattern}`);
    }
    for (const pattern of skill.forbiddenPatterns || []) {
      if (text.includes(pattern)) failures.push(`forbidden pattern in ${skill.skillPath}: ${pattern}`);
    }
  }
  if (skill.independentReview !== true) failures.push('independentReview must be true');
  if (!Array.isArray(skill.reviewCommands) || !skill.reviewCommands.length) {
    failures.push('at least one independent review command is required');
  }
  const makerCommands = new Set((skill.commands || []).map((command) => JSON.stringify(command)));
  for (const command of skill.reviewCommands || []) {
    if (makerCommands.has(JSON.stringify(command))) failures.push('review command must be distinct from maker command');
  }
  return failures;
}

function verifyReceipt(skill, receipt) {
  const failures = inspectContract(skill);
  if (receipt?.schemaVersion !== 1) failures.push('receipt schemaVersion must be 1');
  if (receipt?.skillId !== skill.id) failures.push(`receipt skill mismatch: expected ${skill.id}`);
  if (!Array.isArray(receipt?.contractFailures) || receipt.contractFailures.length) {
    failures.push('maker contract inspection did not pass cleanly');
  }
  const commandResults = Array.isArray(receipt?.commands) ? receipt.commands : [];
  if (commandResults.length !== skill.commands.length) failures.push('maker command receipt count mismatch');
  for (let index = 0; index < skill.commands.length; index += 1) {
    const expected = skill.commands[index].join(' ');
    const result = commandResults[index];
    if (!result || result.command !== expected) failures.push(`maker command receipt mismatch at index ${index}`);
    if (!result || result.status !== 0 || result.error) failures.push(`maker command did not pass: ${expected}`);
  }

  const expectedPaths = requiredFiles(skill);
  const evidence = Array.isArray(receipt?.evidence) ? receipt.evidence : [];
  if (evidence.length !== expectedPaths.length) failures.push('evidence file count mismatch');
  const evidenceByPath = new Map(evidence.map((item) => [item?.path, item]));
  for (const relativePath of expectedPaths) {
    const item = evidenceByPath.get(relativePath);
    const absolute = path.join(repoRoot, relativePath);
    if (!item) {
      failures.push(`missing receipt evidence: ${relativePath}`);
      continue;
    }
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
      failures.push(`review evidence is not a file: ${relativePath}`);
      continue;
    }
    const bytes = fs.readFileSync(absolute);
    if (item.bytes !== bytes.length || item.sha256 !== sha256(bytes)) {
      failures.push(`review evidence hash mismatch: ${relativePath}`);
    }
  }
  for (const item of evidence) {
    if (!expectedPaths.includes(item?.path)) failures.push(`unexpected receipt evidence: ${item?.path}`);
  }
  return failures;
}

function main() {
  const receiptPath = argValue('--receipt');
  const skillId = argValue('--skill');
  if (!receiptPath || !skillId) throw new Error('Usage: verify-run.js --receipt <json> --skill <id>');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const skill = registry.skills.find((entry) => entry.id === skillId);
  if (!skill) throw new Error(`Unknown acceptance skill: ${skillId}`);
  const receipt = JSON.parse(fs.readFileSync(path.resolve(receiptPath), 'utf8'));
  const failures = verifyReceipt(skill, receipt);
  const result = {
    schemaVersion: 1,
    skillId,
    verifier: 'independent-receipt-hash-review',
    passed: failures.length === 0,
    reviewedFiles: requiredFiles(skill).length,
    failures,
  };
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.passed ? 0 : 1;
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { inspectContract, requiredFiles, verifyReceipt };
