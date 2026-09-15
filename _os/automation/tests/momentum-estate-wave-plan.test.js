'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildMomentumWavePlan } = require('../lib/momentum-estate-wave-plan');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'System', 'outcome-graph', 'web-design', 'momentum-238-reconciled-manifest-2026-08-24.json'), 'utf8'));

test('238 records partition into bounded action-homogeneous waves', () => {
  const plan = buildMomentumWavePlan(manifest, { waveSize: 20, maxParallel: 3 });
  assert.equal(plan.state, 'planned_held_for_portfolio_terminal');
  assert.deepEqual(plan.counts, {
    logical_page_records: 238,
    active_validation_or_repair: 220,
    terminal_exclusions: 18,
    retain_waves: 7,
    repair_waves: 5,
    exclusion_waves: 1,
    total_waves: 13,
  });
  assert.equal(plan.waves.every((wave) => wave.task_count <= 20), true);
  assert.equal(plan.waves.every((wave) => wave.max_parallel === 3), true);
  assert.equal(plan.waves.every((wave) => wave.tasks.every((task) => task.classification === wave.classification)), true);
});

test('exclusions are terminal no-build records and active pages retain graph gates', () => {
  const plan = buildMomentumWavePlan(manifest);
  const tasks = plan.waves.flatMap((wave) => wave.tasks);
  const exclusions = tasks.filter((task) => task.classification === 'exclude');
  const active = tasks.filter((task) => task.classification !== 'exclude');
  assert.equal(exclusions.length, 18);
  assert.equal(exclusions.every((task) => task.stages.length === 2 && task.max_repair_passes === 0), true);
  assert.equal(active.length, 220);
  assert.equal(active.every((task) => task.stages.includes('independent_craft_gate')), true);
  assert.equal(active.every((task) => task.stages.includes('terminal_rerender')), true);
  assert.equal(active.every((task) => task.stages.includes('prospect_particle_binding')), true);
  assert.equal(active.every((task) => task.presentation_contract?.exact_logo_required === true), true);
  assert.equal(active.every((task) => task.presentation_contract?.particle_resolve_required === true), true);
  assert.equal(active.every((task) => task.presentation_contract?.generic_logo_substitution_allowed === false), true);
  assert.equal(exclusions.every((task) => task.presentation_contract === null), true);
  assert.equal(tasks.every((task) => task.external_mutation_allowed === false), true);
});

test('repair waves require brand-specific image direction and Impeccable candidates', () => {
  const plan = buildMomentumWavePlan(manifest);
  const repairs = plan.waves.flatMap((wave) => wave.tasks).filter((task) => task.classification === 'repair');
  assert.equal(repairs.length, 87);
  assert.equal(repairs.every((task) => task.stages.includes('brand_image_direction')), true);
  assert.equal(repairs.every((task) => task.stages.includes('verified_or_generated_image_board')), true);
  assert.equal(repairs.every((task) => task.stages.includes('isolated_impeccable_candidate')), true);
  assert.equal(repairs.every((task) => /generated image board/.test(task.presentation_contract.image_policy)), true);
  assert.equal(plan.acceptance.exact_logo_particle_binding_required_for_active_records, true);
  assert.equal(plan.acceptance.brand_specific_image_provenance_required, true);
  assert.equal(plan.acceptance.generic_template_substitution_allowed, false);
});

test('plan is deterministic, collision-safe, and cannot bypass the portfolio gate', () => {
  const first = buildMomentumWavePlan(manifest);
  const second = buildMomentumWavePlan(manifest);
  const tasks = first.waves.flatMap((wave) => wave.tasks);
  assert.equal(first.plan_fingerprint_sha256, second.plan_fingerprint_sha256);
  assert.equal(new Set(tasks.map((task) => task.page_id)).size, 238);
  assert.equal(new Set(tasks.map((task) => task.collision_key)).size, 238);
  assert.equal(first.portfolio_terminal_gate.required, true);
  assert.equal(first.portfolio_terminal_gate.current_state, 'pending');
  assert.equal(first.authority.portfolio_gate_bypass_authorized, false);
  assert.equal(first.authority.deployment_authorized, false);
});
