'use strict';

const { sha256, stableJson } = require('./outcome-graph');

const ACTIONS = Object.freeze({
  retain: {
    purpose: 'Bind the exact prospect logo to the Mohr Media particle presentation, then re-render and validate the existing Impeccable concept without speculative redesign.',
    stages: [
      'source_revalidate',
      'exact_logo_revalidate',
      'prospect_particle_binding',
      'image_and_layout_authority_gate',
      'desktop_render',
      'mobile_render',
      'functional_gate',
      'responsive_gate',
      'accessibility_gate',
      'performance_gate',
      'content_truth_gate',
      'design_system_gate',
      'independent_craft_gate',
      'terminal_rerender',
    ],
    mutation_allowed: false,
  },
  repair: {
    purpose: 'Bind the exact prospect logo to the Mohr Media particle presentation, art-direct one brand-specific Impeccable repair candidate with verified or generated imagery, run a different checker, allow one bounded repair, then terminally re-render.',
    stages: [
      'source_revalidate',
      'exact_logo_revalidate',
      'prospect_particle_binding',
      'surface_brief',
      'brand_image_direction',
      'verified_or_generated_image_board',
      'isolated_impeccable_candidate',
      'desktop_render',
      'mobile_render',
      'functional_gate',
      'responsive_gate',
      'accessibility_gate',
      'performance_gate',
      'content_truth_gate',
      'design_system_gate',
      'independent_craft_gate',
      'bounded_repair_if_needed',
      'confirmation_gate',
      'terminal_rerender',
    ],
    mutation_allowed: true,
  },
  exclude: {
    purpose: 'Preserve the exclusion as terminal truth; do not build, pitch, deploy, or contact.',
    stages: ['verify_exclusion_binding', 'terminal_exclusion_receipt'],
    mutation_allowed: false,
  },
});

function chunk(rows, size) {
  const chunks = [];
  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }
  return chunks;
}

function taskFromRecord(record, classification) {
  const action = ACTIONS[classification];
  return {
    page_id: record.page_id,
    business_id: record.business_id,
    business: record.current_record.business,
    current_state: record.current_record.state,
    current_url: record.current_record.concept_url,
    source_locator: record.source_locator,
    source_fingerprint_sha256: record.source_fingerprint_sha256,
    collision_key: record.collision_key,
    classification,
    stages: action.stages,
    max_repair_passes: classification === 'repair' ? 1 : 0,
    max_confirmation_passes: classification === 'exclude' ? 0 : 1,
    external_mutation_allowed: false,
    presentation_contract: classification === 'exclude' ? null : {
      surface: 'mohr_media_personalized_prospect_experience',
      exact_logo_required: true,
      particle_resolve_required: true,
      generic_logo_substitution_allowed: false,
      linked_concept_required: true,
      concept_layout_system: 'impeccable',
      image_policy: classification === 'repair'
        ? 'verified source imagery or brand-specific generated image board with recorded provenance'
        : 'preserve existing imagery only when authority, relevance, and rendered quality pass',
    },
  };
}

function buildMomentumWavePlan(manifest, options = {}) {
  const waveSize = Number(options.waveSize || 20);
  const maxParallel = Number(options.maxParallel || 3);
  if (manifest?.state !== 'identity_reconciled' || !Array.isArray(manifest.records)) {
    throw new Error('A reconciled Momentum estate manifest is required.');
  }
  if (!Number.isInteger(waveSize) || waveSize < 1) throw new Error('waveSize must be a positive integer.');
  if (!Number.isInteger(maxParallel) || maxParallel < 1) throw new Error('maxParallel must be a positive integer.');

  const waves = [];
  for (const classification of ['retain', 'repair', 'exclude']) {
    const records = manifest.records
      .filter((row) => row.classification === classification)
      .sort((a, b) => a.business_id.localeCompare(b.business_id) || a.page_id.localeCompare(b.page_id));
    const groups = chunk(records, waveSize);
    groups.forEach((group, index) => {
      const tasks = group.map((record) => taskFromRecord(record, classification));
      const waveNumber = String(index + 1).padStart(2, '0');
      waves.push({
        wave_id: `M360-${classification.toUpperCase()}-${waveNumber}`,
        classification,
        purpose: ACTIONS[classification].purpose,
        task_count: tasks.length,
        max_parallel: maxParallel,
        maker_checker_must_differ: classification !== 'exclude',
        terminal_verifier_must_differ: classification !== 'exclude',
        candidate_mutation_allowed: ACTIONS[classification].mutation_allowed,
        external_mutation_allowed: false,
        state: 'blocked_by_portfolio_pilot',
        checkpoint_key: `momentum-estate/${classification}/${waveNumber}`,
        tasks,
      });
    });
  }

  const tasks = waves.flatMap((wave) => wave.tasks);
  const activeTasks = tasks.filter((task) => task.classification !== 'exclude');
  if (tasks.length !== 238) throw new Error(`Expected 238 planned records; received ${tasks.length}.`);
  if (activeTasks.length !== 220) throw new Error(`Expected 220 active records; received ${activeTasks.length}.`);
  if (new Set(tasks.map((task) => task.page_id)).size !== 238) throw new Error('Wave plan duplicated a page ID.');
  if (waves.some((wave) => wave.task_count > waveSize)) throw new Error('Wave size exceeded.');

  const planCore = {
    source_reconciliation_id: manifest.reconciliation_id,
    source_manifest_sha256: sha256(stableJson(manifest)),
    wave_size: waveSize,
    max_parallel: maxParallel,
    waves,
  };

  return {
    schema_version: 1,
    plan_id: 'momentum-238-closed-loop-waves-2026-08-24',
    state: 'planned_held_for_portfolio_terminal',
    portfolio_terminal_gate: {
      required: true,
      current_state: 'pending',
      acceptance: 'Craft average at least 8.0, every category at least 7.0, all deterministic gates passing, zero open major defects, and terminal desktop/mobile re-render from the same source binding.',
    },
    counts: {
      logical_page_records: tasks.length,
      active_validation_or_repair: activeTasks.length,
      terminal_exclusions: tasks.length - activeTasks.length,
      retain_waves: waves.filter((wave) => wave.classification === 'retain').length,
      repair_waves: waves.filter((wave) => wave.classification === 'repair').length,
      exclusion_waves: waves.filter((wave) => wave.classification === 'exclude').length,
      total_waves: waves.length,
    },
    acceptance: {
      craft_average_minimum: 8,
      craft_category_minimum: 7,
      open_major_defects_required: 0,
      terminal_truth_required: true,
      exact_source_binding_required: true,
      exact_logo_particle_binding_required_for_active_records: true,
      brand_specific_image_provenance_required: true,
      generic_template_substitution_allowed: false,
    },
    checkpoint_contract: {
      atomic_compare_and_swap: true,
      resume_requires_source_and_artifact_hash_revalidation: true,
      max_graph_iterations: 2,
      max_repair_passes_per_surface: 1,
      max_confirmation_passes_per_surface: 1,
    },
    plan_fingerprint_sha256: sha256(stableJson(planCore)),
    waves,
    authority: {
      planning_only: true,
      portfolio_gate_bypass_authorized: false,
      deployment_authorized: false,
      external_contact_authorized: false,
      spend_authorized: false,
      scheduler_mutation_authorized: false,
    },
  };
}

module.exports = { ACTIONS, buildMomentumWavePlan };
