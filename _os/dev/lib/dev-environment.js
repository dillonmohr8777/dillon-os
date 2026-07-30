'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { REPO_ROOT } = require('../../automation/lib/fsutil');

function insideRepo(candidate) {
  const absolute = path.resolve(REPO_ROOT, candidate || '.');
  const root = path.resolve(REPO_ROOT);
  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) {
    throw new Error(`Path escapes repository: ${candidate}`);
  }
  return absolute;
}

function readProfile(profileFile) {
  const absolute = path.resolve(profileFile);
  if (!fs.existsSync(absolute)) throw new Error(`Profile not found: ${absolute}`);
  const profile = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  for (const key of ['id', 'workspace', 'required_paths', 'required_skills', 'verify_steps']) {
    if (profile[key] == null) throw new Error(`Profile field is required: ${key}`);
  }
  if (!Array.isArray(profile.required_paths) || !Array.isArray(profile.required_skills) || !Array.isArray(profile.verify_steps)) {
    throw new Error('Profile path, skill, and verification fields must be arrays.');
  }
  insideRepo(profile.workspace);
  return profile;
}

function commandProbe(command, args = []) {
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: 10000,
    windowsHide: true,
    shell: false,
  });
  return {
    ok: result.status === 0,
    detail: String(result.stdout || result.stderr || '').trim().split(/\r?\n/)[0] || `exit ${result.status}`,
  };
}

function doctor(profile, options = {}) {
  const checks = [];
  const add = (id, ok, detail) => checks.push({ id, ok: Boolean(ok), detail: String(detail || '') });
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  add('node-version', nodeMajor >= 18, process.versions.node);
  const git = commandProbe('git', ['--version']);
  add('git', git.ok, git.detail);

  const workspace = insideRepo(profile.workspace);
  add('isolated-workspace', fs.existsSync(workspace), path.relative(REPO_ROOT, workspace));

  for (const required of profile.required_paths) {
    const absolute = insideRepo(required);
    add(`path:${required}`, fs.existsSync(absolute), fs.existsSync(absolute) ? 'present' : 'missing');
  }
  for (const skill of profile.required_skills) {
    const absolute = insideRepo(skill);
    add(`skill:${skill}`, fs.existsSync(absolute), fs.existsSync(absolute) ? 'present' : 'missing');
  }
  for (const step of profile.verify_steps) {
    const allowed = Array.isArray(profile.allowed_commands) && profile.allowed_commands.includes(step.command);
    add(`allowlist:${step.id}`, allowed, allowed ? step.command : `blocked command: ${step.command}`);
  }

  const failed = checks.filter((check) => !check.ok);
  return {
    command: 'doctor',
    profile_id: profile.id,
    status: failed.length ? 'fail' : 'pass',
    repository: REPO_ROOT,
    workspace: path.relative(REPO_ROOT, workspace),
    checks,
    recommended_actions: failed.map((check) => `Resolve ${check.id}: ${check.detail}`),
    dry_run: options.dryRun !== false,
  };
}

function verify(profile) {
  const diagnosis = doctor(profile);
  if (diagnosis.status !== 'pass') {
    return { command: 'verify', profile_id: profile.id, status: 'blocked', diagnosis, steps: [] };
  }
  const steps = [];
  for (const step of profile.verify_steps) {
    const started = Date.now();
    const result = spawnSync(step.command, step.args || [], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      timeout: Number(step.timeout_seconds || profile.timeout_seconds || 120) * 1000,
      windowsHide: true,
      shell: false,
      env: { ...process.env, DILLON_DEV_PROFILE: profile.id },
    });
    steps.push({
      id: step.id,
      command: [step.command, ...(step.args || [])],
      status: result.status === 0 ? 'pass' : 'fail',
      exit_code: result.status,
      duration_ms: Date.now() - started,
      output_tail: String(result.stdout || result.stderr || '').trim().split(/\r?\n/).slice(-8),
    });
    if (result.status !== 0) break;
  }
  return {
    command: 'verify',
    profile_id: profile.id,
    status: steps.length === profile.verify_steps.length && steps.every((step) => step.status === 'pass') ? 'pass' : 'fail',
    diagnosis,
    steps,
  };
}

module.exports = {
  insideRepo,
  readProfile,
  doctor,
  verify,
};
