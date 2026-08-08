#!/usr/bin/env node
const fs = require('node:fs');
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
  if (!Number.isFinite(skill.timeoutSeconds) || skill.timeoutSeconds <= 0) failures.push('invalid timeoutSeconds');
  if (!Number.isInteger(skill.retryLimit) || skill.retryLimit < 0) failures.push('invalid retryLimit');
  if (!Array.isArray(skill.commands) || !skill.commands.length) failures.push('at least one command is required');
  return failures;
}

function runCommand(command, timeoutSeconds, retryLimit) {
  let last;
  for (let attempt = 0; attempt <= retryLimit; attempt += 1) {
    last = spawnSync(command[0], command.slice(1), {
      cwd: repoRoot,
      encoding: 'utf8',
      timeout: timeoutSeconds * 1000,
      windowsHide: true,
    });
    if (last.status === 0 && !last.error) break;
  }
  return {
    command: command.join(' '),
    status: last.status,
    signal: last.signal,
    error: last.error ? last.error.message : null,
    stdout: (last.stdout || '').trim().split(/\r?\n/).slice(-12).join('\n'),
    stderr: (last.stderr || '').trim().split(/\r?\n/).slice(-12).join('\n'),
  };
}

const results = [];
for (const skill of selected) {
  const contractFailures = inspectContract(skill);
  const commands = contractFailures.length
    ? []
    : skill.commands.map((command) => runCommand(command, skill.timeoutSeconds, skill.retryLimit));
  const passed = contractFailures.length === 0 && commands.every((command) => command.status === 0 && !command.error);
  results.push({ id: skill.id, passed, contractFailures, commands });
}

const output = {
  schemaVersion: 1,
  registry: path.relative(repoRoot, registryPath).split(path.sep).join('/'),
  passed: results.every((result) => result.passed),
  results,
};
console.log(JSON.stringify(output, null, 2));
process.exitCode = output.passed ? 0 : 1;
