#!/usr/bin/env node
const fs = require('node:fs');
const crypto = require('node:crypto');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..', '..');
const registryPath = path.join(__dirname, 'registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const selected = requested.length
  ? registry.skills.filter((skill) => requested.includes(skill.id))
  : registry.skills;

if (!selected.length) {
  console.error(`No registered production skill matched: ${requested.join(', ')}`);
  process.exit(2);
}

function inspectContract(skill) {
  const failures = [];
  const requiredFiles = [skill.skillPath, ...(skill.fixtures || []), ...(skill.expectedFiles || [])];
  for (const relativePath of requiredFiles) {
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
  if (!Number.isFinite(skill.timeoutSeconds) || skill.timeoutSeconds <= 0) failures.push('invalid timeoutSeconds');
  if (!Number.isInteger(skill.retryLimit) || skill.retryLimit < 0) failures.push('invalid retryLimit');
  if (!Array.isArray(skill.commands) || !skill.commands.length) failures.push('at least one command is required');
  return failures;
}

function runCommand(command, timeoutSeconds, retryLimit, replacements = {}) {
  const expanded = command.map((part) => Object.entries(replacements).reduce(
    (value, [token, replacement]) => value.replaceAll(token, replacement),
    part,
  ));
  let last;
  for (let attempt = 0; attempt <= retryLimit; attempt += 1) {
    last = spawnSync(expanded[0], expanded.slice(1), {
      cwd: repoRoot,
      encoding: 'utf8',
      timeout: timeoutSeconds * 1000,
      windowsHide: true,
    });
    if (last.status === 0 && !last.error) break;
  }
  return {
    command: expanded.join(' '),
    status: last.status,
    signal: last.signal,
    error: last.error ? last.error.message : null,
    stdout: (last.stdout || '').trim().split(/\r?\n/).slice(-12).join('\n'),
    stderr: (last.stderr || '').trim().split(/\r?\n/).slice(-12).join('\n'),
  };
}

function receiptEvidence(skill) {
  const relativePaths = [...new Set([skill.skillPath, ...(skill.fixtures || []), ...(skill.expectedFiles || [])])];
  return relativePaths.map((relativePath) => {
    const bytes = fs.readFileSync(path.join(repoRoot, relativePath));
    return {
      path: relativePath,
      bytes: bytes.length,
      sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    };
  });
}

const results = [];
for (const skill of selected) {
  const contractFailures = inspectContract(skill);
  const commands = contractFailures.length
    ? []
    : skill.commands.map((command) => runCommand(command, skill.timeoutSeconds, skill.retryLimit));
  let reviews = [];
  let receiptDirectory = null;
  if (!contractFailures.length) {
    receiptDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'dillon-os-acceptance-'));
    const receiptPath = path.join(receiptDirectory, `${skill.id}.json`);
    const receipt = {
      schemaVersion: 1,
      skillId: skill.id,
      contractFailures,
      commands,
      evidence: receiptEvidence(skill),
    };
    fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
    reviews = skill.reviewCommands.map((command) => runCommand(
      command,
      skill.timeoutSeconds,
      0,
      { '{receipt}': receiptPath, '{skillId}': skill.id },
    ));
  }
  const passed = contractFailures.length === 0
    && commands.every((command) => command.status === 0 && !command.error)
    && reviews.length > 0
    && reviews.every((review) => review.status === 0 && !review.error);
  results.push({ id: skill.id, passed, contractFailures, commands, reviews });
  if (receiptDirectory) fs.rmSync(receiptDirectory, { recursive: true, force: true });
}

const output = {
  schemaVersion: 1,
  registry: path.relative(repoRoot, registryPath).split(path.sep).join('/'),
  passed: results.every((result) => result.passed),
  results,
};
console.log(JSON.stringify(output, null, 2));
process.exitCode = output.passed ? 0 : 1;
