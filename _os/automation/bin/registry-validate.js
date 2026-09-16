#!/usr/bin/env node
'use strict';
// Registry check: 12_Brain/registry/automations.json is the single roster.
// Fails (exit 1) if any record lacks a boolean `enabled` / string `lifecycle`,
// or if a cadence manifest job has no registry record. Warns on drift between
// the manifest's advisory `enabled` and the registry's switch.
// State: 12_Brain/state/registry-validate.json (same pattern as frontmatter-validate).

const fs = require('fs');
const path = require('path');

const VAULT = path.resolve(__dirname, '..', '..', '..');
const REGISTRY = path.join(VAULT, '12_Brain/registry/automations.json');
const CADENCE = path.join(VAULT, '_os/automation/cadence');
const STATE = path.join(VAULT, '12_Brain/state/registry-validate.json');

// Manifests are flat; a regex walk is enough and avoids a yaml dependency.
function manifestJobs(file) {
  const jobs = [];
  let cur = null;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const id = line.match(/^\s*-\s*id:\s*(\S+)/);
    if (id) { cur = { id: id[1], enabled: null }; jobs.push(cur); continue; }
    const en = cur && line.match(/^\s*enabled:\s*(true|false)/);
    if (en) cur.enabled = en[1] === 'true';
  }
  return jobs;
}

function main() {
  const reg = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  const byId = new Map(reg.automations.map((a) => [a.id, a]));
  const errors = [];
  const warnings = [];

  for (const a of reg.automations) {
    if (typeof a.enabled !== 'boolean') errors.push(`${a.id}: enabled must be boolean`);
    if (typeof a.lifecycle !== 'string') errors.push(`${a.id}: lifecycle missing`);
  }

  for (const cadence of ['daily', 'weekly', 'monthly']) {
    const file = path.join(CADENCE, `${cadence}.yaml`);
    if (!fs.existsSync(file)) continue;
    for (const job of manifestJobs(file)) {
      const rec = byId.get(job.id);
      if (!rec) { errors.push(`${cadence}.yaml job "${job.id}" has no record in automations.json`); continue; }
      if (job.enabled !== null && job.enabled !== rec.enabled) {
        warnings.push(`${job.id}: manifest enabled=${job.enabled} but registry enabled=${rec.enabled} (registry wins)`);
      }
    }
  }

  const state = {
    schema: 'registry-validate/1',
    generated_at: new Date().toISOString(),
    records: reg.automations.length,
    enabled: reg.automations.filter((a) => a.enabled).length,
    errors,
    warnings,
  };
  fs.mkdirSync(path.dirname(STATE), { recursive: true });
  fs.writeFileSync(STATE, JSON.stringify(state, null, 2) + '\n');

  for (const w of warnings) console.warn('warn:', w);
  for (const e of errors) console.error('error:', e);
  console.log(`registry-validate: ${state.records} records, ${state.enabled} enabled, ${errors.length} errors, ${warnings.length} warnings`);
  process.exit(errors.length ? 1 : 0);
}

main();
