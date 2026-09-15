'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { REPO_ROOT } = require('./fsutil');
const { sha256, stableJson, validateContract } = require('./outcome-graph');

const EXECUTABLE_ROUTINE_IDS = Object.freeze([
  'D03', 'D07', 'D10', 'D11', 'D12', 'D13', 'D14', 'D16', 'D17', 'D18',
  'D19', 'D24', 'D25', 'D26', 'W04', 'W05', 'W06', 'W08', 'W09', 'W10',
  'W11', 'M02', 'M03', 'M04', 'M05', 'E04', 'E05', 'E10', 'E11',
]);

// These weekly routes intentionally remain non-executable in the legacy
// worker registry because they touch canonical queue, private communications,
// or paid-media account authority. Outcome Graph may verify read-only shadow
// evidence for them; it may not use this catalog to grant execution authority.
const GOVERNED_WEEKLY_ROUTE_IDS = Object.freeze(['W01', 'W02', 'W03', 'W07']);

const SHARED_FORBIDDEN = Object.freeze([
  'send',
  'post',
  'publish',
  'schedule',
  'deploy',
  'spend',
  'purchase',
  'account_change',
  'credential_read',
  'delete',
  'canonical_queue_write',
  'self_approve',
]);

function artifact(role, pattern) {
  return { role, pattern };
}

function assertion(id, predicate) {
  return { id, predicate };
}

/*
 * These are outcome definitions, not prompt text. Each assertion is a required
 * independently measured fact in the terminal evidence packet. A loop log,
 * routine checkpoint, or generic stage count cannot satisfy any of them.
 */
const ROUTINE_SPECS = Object.freeze({
  W01: {
    objective: 'Reconcile every active client commitment, deadline, route, finish line, and approval state to the current canonical queue while leaving every queue change as a Marketing Chief proposal.',
    isolation_key: 'canonical_work_item_id',
    canonical_state: 'client-operations/queue/work-items.json plus current client registry, portfolio ranking, calendars, and health projection',
    source_probe: 'canonical_queue',
    freshness_hours: 192,
    artifacts: [artifact('operating_slate', 'System/outcome-graph/readiness-*/W01-weekly-operating-slate.json')],
    assertions: [
      assertion('every_unresolved_work_item_reconciled', 'Every unresolved canonical work item is represented exactly once.'),
      assertion('client_outcome_owner_deadline_and_finish_line_exact', 'Every priority has a resolved active client, observable outcome, owner, evidenced deadline state, and definition of done.'),
      assertion('queue_portfolio_calendar_and_projection_integrity_checked', 'Queue revision, portfolio eligibility, calendar commitments, control projection, and system health reconcile.'),
      assertion('stale_ambiguous_and_blocked_states_visible', 'Stale routes, stale evidence, ambiguity, missing deadlines, blocks, and approvals remain explicit.'),
      assertion('proposal_only_marketing_chief_is_writer', 'The graph performs no canonical queue write and Marketing Chief remains the only writer.'),
    ],
  },
  W02: {
    objective: 'Produce the first weekly read-only paid-media review per exact client, account, brand, channel, and date window from current delivery, tracking, attribution, and downstream evidence.',
    isolation_key: 'client_account_channel_review_window_a',
    canonical_state: 'exact authenticated paid-media accounts plus current tracking, attribution, CRM, and client routing evidence',
    source_probe: 'external_connector',
    freshness_hours: 96,
    artifacts: [
      artifact('review_packet', 'System/outcome-graph/routines/W02/*/paid-media-review-a.json'),
      artifact('source_ledger', 'System/outcome-graph/routines/W02/*/source-ledger.json'),
    ],
    assertions: [
      assertion('d17_delivery_evidence_contract_passes', 'Current read-only delivery evidence passes the D17 account, date, source, tracking, and no-mutation contract.'),
      assertion('d18_attribution_contract_passes', 'Attribution and downstream outcome evidence passes the D18 definition, latency, tracking, reconciliation, and pending-validation contract.'),
      assertion('every_review_is_client_account_brand_and_channel_isolated', 'No account, brand, channel, or client is blended.'),
      assertion('delivery_or_tracking_anomalies_are_source_bound', 'Every anomaly and trend statement is measured from named fields and current capture times.'),
      assertion('bounded_tests_have_hypothesis_metric_owner_and_gate', 'Each recommendation is a proposal with hypothesis, metric, owner, approval, and next review state.'),
      assertion('no_spend_configuration_crm_or_delivery_mutation', 'The review performs no spend, bid, targeting, creative, CRM, or delivery action.'),
    ],
  },
  W03: {
    objective: 'Produce the second weekly read-only paid-media review by comparing the exact pass-A binding with fresh account and downstream evidence, separating real change from attribution latency or reporting delay.',
    isolation_key: 'client_account_channel_review_window_b',
    canonical_state: 'exact pass-A artifact binding plus current paid-media, tracking, attribution, CRM, and client routing evidence',
    source_probe: 'external_connector',
    freshness_hours: 96,
    artifacts: [
      artifact('review_packet', 'System/outcome-graph/routines/W03/*/paid-media-review-b.json'),
      artifact('comparison_ledger', 'System/outcome-graph/routines/W03/*/pass-a-comparison-ledger.json'),
    ],
    assertions: [
      assertion('pass_a_artifact_hash_and_scope_revalidate', 'The comparison uses the exact prior review artifact, client, account, channel, dates, and SHA-256.'),
      assertion('fresh_d17_and_d18_contracts_pass', 'Current delivery and attribution evidence independently satisfy D17 and D18.'),
      assertion('material_change_distinguished_from_latency_or_delay', 'Trend claims account for attribution windows, platform latency, tracking health, and reporting delay.'),
      assertion('new_downstream_outcomes_reconciled', 'New CRM, booking, and lead-quality evidence is source-bound or marked pending.'),
      assertion('tests_close_continue_or_hold_from_predeclared_evidence', 'Experiment decisions follow their prior hypothesis and metric without hindsight substitution.'),
      assertion('no_spend_configuration_crm_or_delivery_mutation', 'The review performs no spend, bid, targeting, creative, CRM, or delivery action.'),
    ],
  },
  W07: {
    objective: 'Reconcile every intended outreach or follow-up draft and Drive list projection to one exact active route, full source context, body and signature readback, stable identity, and pending exact approval without sending or mutating contacts.',
    isolation_key: 'client_thread_or_list_workflow',
    canonical_state: 'exact client registry and queue plus redacted Gmail draft and Google Drive list snapshots',
    source_probe: 'external_connector',
    freshness_hours: 192,
    artifacts: [artifact('draft_readiness', 'System/outcome-graph/readiness-*/W07-unsent-draft-queue.json')],
    assertions: [
      assertion('every_draft_and_list_workflow_reconciled', 'Every in-window draft and current Drive outreach workflow is represented exactly once.'),
      assertion('route_thread_recipient_body_signature_and_source_pass', 'Each draft passes active-client routing, complete-thread readback, Reply All, recipient, clean body, exact signature, and source-binding checks.'),
      assertion('drive_lists_have_stable_identity_and_exact_projections', 'List partitions and named subsets derive from one stable identity-keyed canonical source with unambiguous instructions.'),
      assertion('privacy_safe_fingerprints_only', 'No raw message, address, phone, contact row, provider ID, or secret enters the graph artifact.'),
      assertion('title_or_show_state_never_implies_send_approval', 'List labels, screen-share clearance, and verified outcome remain separate from exact preview approval.'),
      assertion('no_send_sequence_activation_or_contact_mutation', 'No send, sequence, call, CRM write, or contact mutation occurs.'),
    ],
  },
  D03: {
    objective: 'Classify every in-scope overnight automation from current scheduler, runtime, checkpoint, and delivery evidence, then return one bounded action for each failure.',
    isolation_key: 'automation_id',
    canonical_state: 'scheduled-task registry plus current runtime logs and checkpoints',
    artifacts: [
      artifact('health_brief', 'System/outcome-graph/routines/D03/*/automation-health-brief.json'),
      artifact('source_ledger', 'System/outcome-graph/routines/D03/*/source-ledger.json'),
    ],
    assertions: [
      assertion('active_automation_inventory_complete', 'Every active scheduled automation in scope is represented exactly once.'),
      assertion('runtime_and_delivery_truth_separated', 'Configured, locally healthy, externally delivered, degraded, blocked, stale, and retired states are not conflated.'),
      assertion('failure_packets_are_actionable', 'Every failure names its exact boundary, evidence, impact, and next safe action.'),
      assertion('failed_checkpoints_not_advanced', 'No failed or incomplete automation checkpoint advanced.'),
      assertion('no_restart_retry_or_provider_mutation', 'The graph performed no restart, retry, provider, permission, or secret mutation.'),
    ],
  },
  D07: {
    objective: 'Reduce current monitoring signals into deduplicated incident packets with explicit impact, scope, evidence, and the smallest reversible recovery proposal.',
    isolation_key: 'incident_fingerprint',
    canonical_state: 'monitoring alert stream plus affected runtime and deployment evidence',
    artifacts: [
      artifact('incident_packet', 'System/outcome-graph/routines/D07/*/incident-triage.json'),
      artifact('source_ledger', 'System/outcome-graph/routines/D07/*/source-ledger.json'),
    ],
    assertions: [
      assertion('alert_freshness_proven', 'Every represented alert is current for the event window and source-bound.'),
      assertion('duplicate_alerts_collapsed', 'Repeated signals are collapsed only when their incident fingerprints match.'),
      assertion('impact_scope_and_evidence_explicit', 'User impact, affected surface, time window, and evidence are explicit.'),
      assertion('recovery_is_smallest_reversible_step', 'The proposed recovery is bounded, reversible, and tied to the observed failure.'),
      assertion('no_destructive_or_production_mutation', 'No destructive recovery or production mutation occurred.'),
    ],
  },
  D10: {
    objective: 'Turn each actionable but underspecified request into the smallest reviewable deliverable contract without broadening the requested business outcome.',
    isolation_key: 'request_or_work_item_id',
    canonical_state: 'client-operations canonical work item or exact user request',
    artifacts: [
      artifact('deliverable_contract', 'System/outcome-graph/routines/D10/*/deliverable-contract.json'),
      artifact('source_binding', 'System/outcome-graph/routines/D10/*/source-binding.json'),
    ],
    assertions: [
      assertion('business_outcome_is_observable', 'The desired business outcome can be observed independently.'),
      assertion('artifact_audience_and_acceptance_named', 'Artifact, audience, required inputs, and acceptance assertions are explicit.'),
      assertion('lifecycle_states_separated', 'Build, review, approval, adoption, and external delivery are separate states.'),
      assertion('scope_not_materially_broadened', 'The inferred artifact does not authorize a materially different action.'),
    ],
  },
  D11: {
    objective: 'Produce a bounded dependency graph in which every node has exact inputs, outputs, owner, isolation, limits, failure state, and approval boundary.',
    isolation_key: 'graph_node_id',
    canonical_state: 'approved deliverable contract plus client-operations canonical route',
    artifacts: [
      artifact('execution_graph', 'System/outcome-graph/routines/D11/*/bounded-execution-graph.json'),
      artifact('approval_map', 'System/outcome-graph/routines/D11/*/approval-map.json'),
    ],
    assertions: [
      assertion('every_node_has_input_output_and_owner', 'Every graph node names its input contract, output contract, owner, and dependency edges.'),
      assertion('maker_checker_independence', 'Maker, checker, reducer, and terminal verifier roles are not self-approving.'),
      assertion('parallel_work_has_unique_isolation', 'Parallel nodes have collision-resistant ownership keys.'),
      assertion('loops_have_hard_limits', 'Iterations, attempts, concurrency, timeout, and budget are finite.'),
      assertion('approval_and_abstain_states_explicit', 'External action, adoption, human gate, failure, and abstain states are explicit.'),
      assertion('no_agent_grants_itself_authority', 'No node expands its own permissions or canonical write boundary.'),
    ],
  },
  D12: {
    objective: 'Bind implementation work to the exact repository, branch, project rules, dirty-tree boundary, and verified deployment mapping before any edit.',
    isolation_key: 'repository_branch_work_item',
    canonical_state: 'exact repository HEAD, branch, worktree status, project rules, and deployment mapping',
    artifacts: [
      artifact('preflight_receipt', 'System/outcome-graph/routines/D12/*/preflight-receipt.json'),
      artifact('worktree_evidence', 'System/outcome-graph/routines/D12/*/worktree-evidence.json'),
    ],
    assertions: [
      assertion('repository_branch_and_root_exact', 'Repository root, remote identity, branch, and requested scope are exact.'),
      assertion('project_rules_loaded', 'All applicable AGENTS.md and task-specific rules are source-bound.'),
      assertion('dirty_paths_classified', 'Intended paths and unrelated existing changes are separated.'),
      assertion('deployment_mapping_verified_when_relevant', 'Any publishable task names and verifies its existing deployment target.'),
      assertion('no_destructive_worktree_action', 'No reset, discard, broad move, or deletion occurred.'),
    ],
  },
  D13: {
    objective: 'Produce one traceable design-context receipt from product truth, a resolved surface mode, and at least one real visual authority source.',
    isolation_key: 'repository_surface',
    canonical_state: 'PRODUCT.md, DESIGN.md, surface context, existing coherent UI, and approved assets',
    artifacts: [
      artifact('design_context', 'System/outcome-graph/routines/D13/*/design-context-receipt.json'),
      artifact('visual_authority', 'System/outcome-graph/routines/D13/*/visual-authority-ledger.json'),
    ],
    assertions: [
      assertion('surface_mode_resolved', 'The surface is explicitly Persuade, Operate, Read, or Experience.'),
      assertion('product_truth_bound', 'Audience, positioning, constraints, and claims trace to product authority.'),
      assertion('real_visual_authority_inspected', 'At least one approved token, theme, component, stylesheet, or asset is evidenced.'),
      assertion('design_system_context_and_checks_recorded', 'Required context and design-system checks have receipts.'),
      assertion('no_invented_brand_system_or_claim', 'No unsupported brand rule, visual authority, or product claim was created.'),
    ],
  },
  D14: {
    objective: 'Build one requested local web surface that succeeds in production build and independent desktop, mobile, state, accessibility, and console review.',
    isolation_key: 'repository_surface_deliverable',
    canonical_state: 'exact repository source plus approved product and design authority',
    artifacts: [
      artifact('build_receipt', 'System/outcome-graph/routines/D14/*/build-receipt.json'),
      artifact('independent_qa', 'System/outcome-graph/routines/D14/*/independent-qa.json'),
      artifact('artifact_manifest', 'System/outcome-graph/routines/D14/*/artifact-manifest.json'),
    ],
    assertions: [
      assertion('requested_surface_build_succeeds', 'The exact requested production build exits successfully.'),
      assertion('desktop_and_mobile_review_passes', 'The real surface passes bounded desktop and mobile inspection.'),
      assertion('interactive_and_system_states_pass', 'Keyboard, focus, reduced motion, overflow, loading, empty, and error behavior pass where applicable.'),
      assertion('tests_console_accessibility_and_detector_pass', 'Focused tests, console, accessibility, build, and design detector gates pass or have narrow documented exceptions.'),
      assertion('deployment_boundary_is_exact', 'Result is local-only or bound to one verified existing deployment target.'),
      assertion('no_ambiguous_or_new_public_deployment', 'No ambiguous deployment or unauthorized new public site occurred.'),
    ],
  },
  D16: {
    objective: 'Create one audience-specific content artifact whose material facts are sourced and whose voice, intent, proof sequence, search structure, and conversion path align.',
    isolation_key: 'client_deliverable_channel',
    canonical_state: 'exact client route, approved brand truth, source evidence, and requested channel',
    artifacts: [
      artifact('content_artifact', 'System/outcome-graph/routines/D16/*/content-artifact.*'),
      artifact('evidence_map', 'System/outcome-graph/routines/D16/*/evidence-map.json'),
    ],
    assertions: [
      assertion('audience_and_outcome_resolved', 'Audience, channel, intent, and desired action are explicit.'),
      assertion('facts_and_strategy_separated', 'Sourced facts, inference, and proposed strategy are distinguishable.'),
      assertion('material_claims_have_sources', 'Every material product, performance, price, integration, and outcome claim has authority.'),
      assertion('voice_proof_and_conversion_align', 'Voice, search intent, answer structure, proof, and conversion path cohere.'),
      assertion('no_invented_claims', 'No testimonial, price, integration, outcome, or product claim was invented.'),
    ],
  },
  D17: {
    objective: 'Produce a read-only paid-media packet in which every metric is bound to one exact client, account, brand, channel, date range, timezone, source, and freshness state.',
    isolation_key: 'client_account_channel_date_window',
    canonical_state: 'exact authenticated advertising account and current read-only platform evidence',
    artifacts: [
      artifact('media_evidence', 'System/outcome-graph/routines/D17/*/paid-media-evidence.json'),
      artifact('tracking_receipt', 'System/outcome-graph/routines/D17/*/tracking-health.json'),
    ],
    assertions: [
      assertion('client_account_brand_and_channel_exact', 'Every record maps to one resolved client, account, brand, and channel.'),
      assertion('date_range_timezone_and_freshness_exact', 'Reporting dates, timezone, platform latency, source, and capture time are explicit.'),
      assertion('delivery_spend_and_tracking_source_bound', 'Delivery, spend, and tracking health come from named fields.'),
      assertion('platforms_and_brands_not_blended', 'Google, Meta, other channels, and distinct brands remain separate.'),
      assertion('inaccessible_fields_are_pending', 'Unavailable data is pending rather than estimated.'),
      assertion('no_paid_media_mutation', 'No budget, bid, targeting, creative, activation, or spend change occurred.'),
    ],
  },
  D18: {
    objective: 'Resolve every proposed conversion or lead claim to a verified attribution definition and downstream outcome, or label it pending validation.',
    isolation_key: 'client_conversion_definition_date_window',
    canonical_state: 'exact platform attribution settings plus current CRM or booking read-only evidence',
    artifacts: [
      artifact('attribution_receipt', 'System/outcome-graph/routines/D18/*/attribution-validation.json'),
      artifact('downstream_ledger', 'System/outcome-graph/routines/D18/*/downstream-source-ledger.json'),
    ],
    assertions: [
      assertion('conversion_definition_window_and_latency_verified', 'Conversion definition, attribution window, reporting dates, timezone, and latency are explicit.'),
      assertion('tracking_health_verified', 'Tracking health is checked before outcome language is accepted.'),
      assertion('platform_and_downstream_outcomes_reconciled', 'Platform events and CRM, booking, or lead outcomes are reconciled without blending.'),
      assertion('lead_quality_state_explicit', 'Lead-quality evidence and limitations are explicit.'),
      assertion('unsupported_outcomes_marked_pending', 'Any indefensible result uses pending-validation language.'),
      assertion('no_crm_or_provider_mutation', 'No CRM, booking, attribution, or provider state was changed.'),
    ],
  },
  D19: {
    objective: 'Produce one client-separated report whose derived KPIs recompute from named source fields and whose dates, definitions, limitations, decision, and owner are explicit.',
    isolation_key: 'client_report_type_date_window',
    canonical_state: 'client-specific source ledger plus exact reporting definitions',
    artifacts: [
      artifact('report', 'System/outcome-graph/routines/D19/*/report.*'),
      artifact('source_ledger', 'System/outcome-graph/routines/D19/*/source-ledger.json'),
    ],
    assertions: [
      assertion('client_and_date_window_isolated', 'The report represents exactly one client and reporting window unless a cross-client view was explicitly approved.'),
      assertion('derived_kpis_recompute', 'Every derived KPI recomputes from named source fields.'),
      assertion('definitions_dates_and_sources_visible', 'KPI definitions, dates, source systems, freshness, and pending fields are visible.'),
      assertion('limitations_and_business_meaning_explicit', 'The report explains meaning, uncertainty, and limitations.'),
      assertion('next_decision_and_owner_named', 'The report ends with a bounded decision, owner, and next review state.'),
      assertion('no_fabricated_or_blended_totals', 'No metric is fabricated and no client or brand is silently blended.'),
    ],
  },
  D24: {
    objective: 'Independently try to falsify a maker claim against the exact artifact hash and acceptance contract, then return pass, revise, or blocked with reproducible defects.',
    isolation_key: 'artifact_sha256_acceptance_contract',
    canonical_state: 'maker artifact manifest plus immutable acceptance contract',
    artifacts: [
      artifact('qa_verdict', 'System/outcome-graph/routines/D24/*/independent-qa-verdict.json'),
      artifact('reproduction_receipt', 'System/outcome-graph/routines/D24/*/reproduction-receipt.json'),
    ],
    assertions: [
      assertion('checker_is_independent_from_maker', 'Checker identity differs from maker identity and has no self-approval path.'),
      assertion('exact_artifact_hash_reproduced', 'The reviewed artifact path, byte count, and SHA-256 match the maker claim.'),
      assertion('desktop_mobile_and_interaction_reproduced', 'Relevant desktop, mobile, keyboard, focus, reduced-motion, and overflow checks are reproduced.'),
      assertion('tests_build_console_accessibility_reproduced', 'Relevant tests, build, console, accessibility, and detector checks are reproduced.'),
      assertion('verdict_and_exact_defects_present', 'Verdict is pass, revise, or blocked and every non-pass state names exact defects.'),
      assertion('acceptance_contract_unchanged', 'The checker did not silently weaken or alter acceptance criteria.'),
    ],
  },
  D25: {
    objective: 'Create a final handoff that lets a reviewer distinguish complete, partial, blocked, drafted, staged, deployed, and sent from exact artifact and external readback evidence.',
    isolation_key: 'work_item_version_outcome_claim',
    canonical_state: 'version-bound Marketing Chief work item plus verified artifact and delivery evidence',
    artifacts: [
      artifact('status_receipt', 'System/outcome-graph/routines/D25/*/final-status-receipt.json'),
      artifact('artifact_manifest', 'System/outcome-graph/routines/D25/*/artifact-manifest.json'),
    ],
    assertions: [
      assertion('status_vocabulary_is_exact', 'The handoff uses an exact state and does not collapse local, staged, deployed, or sent.'),
      assertion('artifact_paths_hashes_and_bytes_present', 'Every claimed artifact has a verified path, SHA-256, and byte count.'),
      assertion('local_and_external_proof_separated', 'Local validation and external delivery readback are separate evidence classes.'),
      assertion('risks_and_one_next_action_present', 'Unresolved risk and one next safest action are explicit.'),
      assertion('marketing_chief_owns_canonical_completion', 'Only Marketing Chief can adopt the terminal claim into canonical queue state.'),
    ],
  },
  D26: {
    objective: 'Create one source-located, deduplicated, client-separated, reversible knowledge proposal for a durable decision, SOP, preference, source, project lesson, or review.',
    isolation_key: 'canonical_note_change_fingerprint',
    canonical_state: 'Dillon OS vault plus canonical client and project records',
    artifacts: [
      artifact('knowledge_proposal', '00_Inbox/Agent-Proposals/*/*knowledge-proposal*.md'),
      artifact('source_ledger', 'System/outcome-graph/routines/D26/*/source-ledger.json'),
    ],
    assertions: [
      assertion('knowledge_type_and_canonical_page_resolved', 'Knowledge type and one canonical destination are identified.'),
      assertion('duplicate_search_completed', 'Existing notes and proposals were checked before creating another record.'),
      assertion('source_locator_and_freshness_present', 'The proposal carries source location, capture time, and confidence.'),
      assertion('client_and_project_boundaries_preserved', 'No client, account, project, or public-private state is blended.'),
      assertion('proposal_is_narrow_and_reversible', 'The change is a bounded proposal rather than an unreviewable rewrite.'),
      assertion('no_unauthorized_canonical_write', 'No worker wrote canonical queue or durable vault truth outside its authorized lane.'),
    ],
  },
  W04: {
    objective: 'Produce a client-separated weekly content calendar only from current canonical commitments, with purpose, channel, owner, source, date, and approval state for every item.',
    isolation_key: 'client_content_commitment',
    canonical_state: 'current client-specific commitments and approved brand evidence',
    artifacts: [artifact('production_calendar', 'System/outcome-graph/tranche-*/W04-production-calendar.json')],
    assertions: [
      assertion('every_item_has_client_purpose_channel_owner_and_date', 'Every scheduled item is client-separated and fully owned.'),
      assertion('every_item_has_current_source_commitment', 'Every calendar row traces to a current canonical commitment.'),
      assertion('claims_assets_and_approval_state_explicit', 'Claims, assets, review, and approval states are visible.'),
      assertion('no_scheduling_or_publication_implied', 'The artifact authorizes no scheduling or publication.'),
    ],
  },
  W05: {
    objective: 'Certify exactly 20 fresh, policy-eligible, isolated, local noindex prospect sites through source, selection, build, browser, asset, detector, independent checker, and mail-hold gates.',
    isolation_key: 'prospect_identity_slug',
    canonical_state: 'automation/prospect-radar-next20/latest-daily-state.json plus exact batch and run evidence',
    artifacts: [artifact('factory_readiness', 'System/outcome-graph/factory-*/W05-website-factory-readiness.json')],
    assertions: [
      assertion('fresh_source_ready_pool_has_at_least_20', 'The fresh eligible pool contains at least 20 unique source-ready candidates.'),
      assertion('selection_is_exactly_20_and_collision_free', 'Selection contains exactly 20 unique identities and slugs with required source assets.'),
      assertion('all_20_build_browser_and_route_checks_pass', 'All 20 local sites pass build, route, browser, and final-audit gates.'),
      assertion('all_required_assets_and_detector_checks_pass', 'Generated assets, assignments, and Impeccable detector checks pass.'),
      assertion('independent_checker_and_recording_pass', 'A different checker signs the hashed desktop-mobile review recording.'),
      assertion('mail_hold_and_local_only_boundary_preserved', 'mail_ready remains hold and no deployment, outreach, CRM, billing, or queue mutation occurs.'),
    ],
  },
  W06: {
    objective: 'Produce one client-separated weekly report package per in-scope source package, with recomputable KPI math, neutral pending-validation language, and unsent delivery state.',
    isolation_key: 'client_report_window',
    canonical_state: 'client-specific reporting source packages and exact reporting definitions',
    artifacts: [artifact('report_packages', 'System/outcome-graph/tranche-*/W06-client-report-packages.json')],
    assertions: [
      assertion('every_in_scope_client_has_one_separate_package', 'Every discovered report source package is represented exactly once by client.'),
      assertion('kpi_math_recomputes_from_named_fields', 'Every derived KPI recomputes from the source ledger.'),
      assertion('dates_definitions_freshness_and_pending_fields_explicit', 'Definitions, dates, freshness, latency, and inaccessible fields are explicit.'),
      assertion('unsupported_conversion_language_absent', 'No unsupported zero-conversion or insufficient-conversion claim appears.'),
      assertion('delivery_remains_unsent_and_separately_approved', 'No report or draft is sent and approval remains separate.'),
    ],
  },
  W08: {
    objective: 'Classify every current experiment as continue, stop, scale, or inconclusive only from its predeclared hypothesis, metric, data-quality, duration, and retained outcome evidence.',
    isolation_key: 'experiment_id',
    canonical_state: 'current experiment registry and retained verified outcome receipts',
    artifacts: [artifact('experiment_ledger', 'System/outcome-graph/tranche-*/W08-experiment-decision-ledger.json')],
    assertions: [
      assertion('every_experiment_has_hypothesis_metric_and_owner', 'Every current experiment has its original decision contract.'),
      assertion('data_quality_duration_and_outcome_receipt_checked', 'Decision inputs are independently verified.'),
      assertion('decision_follows_predeclared_evidence', 'Continue, stop, scale, or inconclusive follows the evidence without hindsight substitution.'),
      assertion('uncertainty_and_next_review_explicit', 'Uncertainty, next smallest test, owner, and review date are explicit.'),
      assertion('no_live_traffic_spend_price_or_offer_change', 'No live experiment state changed.'),
    ],
  },
  W09: {
    objective: 'Classify every active scheduled automation as verified, degraded, blocked, stale, or retired from current runtime, checkpoint, artifact, and delivery evidence.',
    isolation_key: 'automation_id',
    canonical_state: 'current scheduler, routine registry, runtime logs, checkpoints, and external readback evidence',
    artifacts: [artifact('reliability_report', 'System/outcome-graph/shadow-*/W09-automation-reliability.json')],
    assertions: [
      assertion('active_inventory_complete', 'Every active scheduled automation is represented.'),
      assertion('declared_artifacts_and_terminal_assertions_checked', 'Completion is tested against routine-specific artifacts and value signals.'),
      assertion('stale_checkpoints_false_completion_and_duplicates_visible', 'False completion, stale state, lease conflict, and duplicate storms remain visible.'),
      assertion('external_readback_not_inferred', 'Configuration and local health never substitute for provider delivery evidence.'),
      assertion('no_secret_permission_or_checkpoint_mutation', 'No broad permission, secret, or failed checkpoint mutation occurs.'),
    ],
  },
  W10: {
    objective: 'Reduce the verified weekly evidence set into a small ranked decision proposal with owners, due states, approval needs, risks, and evidence links without writing a second queue.',
    isolation_key: 'decision_proposal_id',
    canonical_state: 'client-operations canonical queue plus current verified weekly artifacts',
    artifacts: [artifact('executive_review', 'System/outcome-graph/tranche-*/W10-executive-weekly-review.json')],
    assertions: [
      assertion('verified_wins_separated_from_activity', 'The review distinguishes outputs, outcomes, and unverified activity.'),
      assertion('risks_blockers_experiments_and_capacity_covered', 'Current operating evidence is reconciled without omission or invention.'),
      assertion('ranked_decisions_have_owner_due_state_and_approval', 'Each proposed next bet or stop decision is actionable and bounded.'),
      assertion('evidence_links_revalidate', 'Every material claim links to current hashed evidence.'),
      assertion('proposal_only_no_canonical_write', 'No strategic decision or queue mutation is adopted by the graph.'),
    ],
  },
  W11: {
    objective: 'Prove the current Dillon OS knowledge graph is structurally healthy and that current operating changes are discoverable, then propose one narrow reversible correction.',
    isolation_key: 'knowledge_check_or_proposal_id',
    canonical_state: 'Dillon OS Obsidian vault and current generated graph indexes',
    artifacts: [artifact('knowledge_health', 'System/outcome-graph/shadow-*/W11-knowledge-graph-health.json')],
    assertions: [
      assertion('bounded_structural_checks_reproduce', 'Frontmatter, links, indexes, and bounded health checks reproduce.'),
      assertion('current_changes_discoverable_from_authority_paths', 'Home, project, client, protocol, and evidence routes expose current operating truth.'),
      assertion('duplicates_orphans_and_stale_indexes_reported', 'Negative graph findings remain visible.'),
      assertion('proposal_is_one_narrow_reversible_change', 'The correction proposal has source and rollback.'),
      assertion('no_broad_vault_rewrite_or_deletion', 'No broad rewrite or deletion occurs.'),
    ],
  },
  M02: {
    objective: 'Evaluate every in-scope agent against sampled output quality, acceptance contracts, maker-checker independence, tool permissions, authority, and a retain, revise, or retire disposition.',
    isolation_key: 'agent_id_evaluation_window',
    canonical_state: 'current agent registry, permission policy, sampled outputs, and acceptance contracts',
    artifacts: [
      artifact('agent_scorecard', 'System/outcome-graph/routines/M02/*/agent-evaluation-scorecard.json'),
      artifact('sample_ledger', 'System/outcome-graph/routines/M02/*/sample-ledger.json'),
    ],
    assertions: [
      assertion('every_agent_has_scope_tools_authority_and_disposition', 'Every in-scope agent has a complete governance record and decision.'),
      assertion('output_samples_bound_to_acceptance_contracts', 'Measured quality traces to exact outputs and acceptance assertions.'),
      assertion('maker_checker_independence_measured', 'Self-approval and evaluation conflicts are detected.'),
      assertion('redundant_or_unsafe_agents_identified', 'Overlapping command centers, unsafe permissions, and low-value agents are visible.'),
      assertion('no_permission_expansion_or_deletion', 'The audit changes no permissions and deletes no agent.'),
    ],
  },
  M03: {
    objective: 'Map every recurring automation cost and usage unit to verified outputs, failures, business value, and one continue, change, or stop proposal.',
    isolation_key: 'scheduled_routine_cost_period',
    canonical_state: 'current scheduler inventory, usage ledger, billing evidence, and verified outcome receipts',
    artifacts: [
      artifact('value_cost_report', 'System/outcome-graph/routines/M03/*/automation-value-cost-report.json'),
      artifact('schedule_inventory', 'System/outcome-graph/routines/M03/*/schedule-inventory.json'),
    ],
    assertions: [
      assertion('scheduled_inventory_complete', 'Every active recurring routine in the period is represented.'),
      assertion('verified_outputs_failures_and_usage_measured', 'Success, failure, retries, usage, and source freshness are evidence-backed.'),
      assertion('costs_reconcile_to_named_sources', 'Recurring costs and usage totals recompute from named source fields.'),
      assertion('cost_maps_to_outcome_or_stop_proposal', 'Each cost maps to business value or a clear bounded disposition.'),
      assertion('no_schedule_subscription_or_billing_change', 'No schedule, subscription, or billing state changed.'),
    ],
  },
  M04: {
    objective: 'Prove every sampled route, asset, communication, metric, and access record maps to exactly one canonical client or is quarantined as ambiguous.',
    isolation_key: 'sampled_record_client_surface',
    canonical_state: 'client-operations/registry/clients.json plus sampled client-specific records',
    artifacts: [
      artifact('separation_audit', 'System/outcome-graph/routines/M04/*/client-separation-audit.json'),
      artifact('quarantine_proposals', 'System/outcome-graph/routines/M04/*/quarantine-proposals.json'),
    ],
    assertions: [
      assertion('sample_covers_required_surfaces', 'Routes, assets, communications, metrics, accounts, and access metadata are sampled.'),
      assertion('every_sample_maps_to_one_client_or_quarantine', 'No ambiguous record is silently assigned.'),
      assertion('canonical_registry_binding_current', 'Client identity and status reconcile to the exact current registry.'),
      assertion('cross_client_blending_reported', 'Any contamination is named with source and scope.'),
      assertion('no_record_move_or_provider_mutation', 'The audit performs no record move or provider mutation.'),
    ],
  },
  M05: {
    objective: 'Produce source-located proposals for stale or conflicting operating rules, brand voice, and design truth, with exact authority, scope, conflict, and effective date.',
    isolation_key: 'authority_document_rule_id',
    canonical_state: 'current global and project rules, PRODUCT.md, DESIGN.md, generated sidecars, and behavior evidence',
    artifacts: [
      artifact('refresh_proposal', 'System/outcome-graph/routines/M05/*/documentation-refresh-proposal.json'),
      artifact('conflict_map', 'System/outcome-graph/routines/M05/*/authority-conflict-map.json'),
    ],
    assertions: [
      assertion('current_behavior_compared_to_durable_rules', 'Observed behavior and durable instructions are source-bound and compared.'),
      assertion('global_project_and_surface_scope_resolved', 'Every proposal names its owning authority layer.'),
      assertion('stale_brand_and_design_guidance_identified', 'Stale or conflicting brand and design truth is specific.'),
      assertion('proposal_names_source_conflict_and_effective_date', 'Every update is reviewable and time-bounded.'),
      assertion('generated_sidecars_use_supported_tools', 'Generated metadata is changed only through supported generators.'),
      assertion('no_silent_canonical_overwrite', 'No canonical truth is silently overwritten.'),
    ],
  },
  E04: {
    objective: 'Recover the exact failed connector or collector through its supported account and overlap path, or preserve state and emit one source-backed blocked receipt.',
    isolation_key: 'connector_account_checkpoint_window',
    canonical_state: 'exact connector account, Access Broker route, collector checkpoint, and persisted source state',
    artifacts: [
      artifact('recovery_receipt', 'System/outcome-graph/routines/E04/*/recovery-or-blocked-receipt.json'),
      artifact('checkpoint_readback', 'System/outcome-graph/routines/E04/*/checkpoint-readback.json'),
    ],
    assertions: [
      assertion('pre_failure_checkpoint_preserved', 'Checkpoint and overlap state are captured before recovery.'),
      assertion('exact_connector_and_account_verified', 'Recovery uses the required connector, account, client, and environment.'),
      assertion('bounded_supported_recovery_attempted', 'Only supported login or collector recovery steps occur.'),
      assertion('same_overlap_rerun_and_read_back', 'The same bounded window is rerun and external or persisted state is reread.'),
      assertion('recovered_or_truthfully_blocked', 'Recovered data is source-backed or the state remains explicitly blocked.'),
      assertion('no_fabrication_secret_exposure_substitution_or_false_advance', 'No fabricated record, secret exposure, provider substitution, or failed checkpoint advance occurs.'),
    ],
  },
  E05: {
    objective: 'Produce an evidence-backed operating guide for one previously unseen repository, including exact route, rules, architecture, commands, tests, ownership, git state, and deployment boundary.',
    isolation_key: 'repository_identity',
    canonical_state: 'exact repository filesystem, git metadata, project rules, and verified deployment configuration',
    artifacts: [
      artifact('onboarding_receipt', 'System/outcome-graph/routines/E05/*/codebase-onboarding-receipt.json'),
      artifact('architecture_map', 'System/outcome-graph/routines/E05/*/architecture-command-map.json'),
    ],
    assertions: [
      assertion('canonical_project_route_verified', 'Repository root, remote, branch, owner, and project identity are exact.'),
      assertion('applicable_rules_and_docs_loaded', 'All applicable project rules and primary docs are evidenced.'),
      assertion('architecture_commands_tests_and_owners_mapped', 'Runtime shape and supported commands are source-backed.'),
      assertion('git_and_deployment_state_inspected', 'Dirty state, branch, remotes, CI, and deployment targets are explicit.'),
      assertion('read_only_without_implementation_authority', 'No edit occurs unless the request separately authorizes implementation.'),
    ],
  },
  E10: {
    objective: 'Recover or take over one bounded live agent runtime and prove sustained end-to-end behavior from current process, log, checkpoint, inbound, and reply evidence.',
    isolation_key: 'runtime_instance_route',
    canonical_state: 'current process table, runtime logs, checkpoints, routing registry, and end-to-end behavior evidence',
    artifacts: [
      artifact('runtime_receipt', 'System/outcome-graph/routines/E10/*/runtime-recovery-receipt.json'),
      artifact('behavior_evidence', 'System/outcome-graph/routines/E10/*/sustained-behavior-evidence.json'),
    ],
    assertions: [
      assertion('current_process_logs_and_state_inspected', 'Claims derive from live process and log evidence rather than configuration presence.'),
      assertion('competing_workers_and_stale_state_resolved', 'Parallel command centers, duplicate workers, and stale checkpoints are detected.'),
      assertion('recovery_is_bounded_and_reversible', 'Only the exact failing runtime is changed through a reversible path.'),
      assertion('sustained_inbound_and_reply_behavior_verified', 'End-to-end behavior persists across the defined observation window.'),
      assertion('marketing_chief_receives_exact_evidence', 'Final evidence and unresolved risk route back to Marketing Chief.'),
      assertion('no_token_exposure_parallel_command_center_or_false_completion', 'Secrets, authority, and completion truth remain bounded.'),
    ],
  },
  E11: {
    objective: 'Define one newly observed repeated workflow with a unique trigger, observable finish line, exact inputs and outputs, privacy and approval boundaries, and a passing synthetic canary.',
    isolation_key: 'routine_trigger_finish_line_fingerprint',
    canonical_state: 'current routine registry, recording ledger, observed workflow evidence, and approval policy',
    artifacts: [
      artifact('routine_definition', 'System/outcome-graph/routines/E11/*/routine-definition.json'),
      artifact('canary_receipt', 'System/outcome-graph/routines/E11/*/synthetic-canary-receipt.json'),
      artifact('ledger_proposal', 'System/outcome-graph/routines/E11/*/manifest-ledger-proposal.json'),
    ],
    assertions: [
      assertion('trigger_and_finish_line_unique_and_observable', 'The routine is neither duplicate nor activity-only.'),
      assertion('inputs_steps_outputs_systems_and_client_scope_complete', 'The demonstrated workflow can be reproduced without guessing its route.'),
      assertion('approvals_and_never_record_surfaces_explicit', 'Privacy, credentials, human gates, and prohibited captures are explicit.'),
      assertion('synthetic_canary_passes_terminal_verifier', 'A synthetic run proves positive completion and a negative false-completion case.'),
      assertion('manifest_and_ledger_change_is_proposal_only', 'Canonical adoption remains with Marketing Chief.'),
      assertion('permissions_do_not_exceed_demonstrated_task', 'The proposed routine inherits no broader capability.'),
    ],
  },
});

const DEEP_SHADOW_EVIDENCE = Object.freeze({
  D10: {
    receipt: 'System/outcome-graph/routines/D10/2026-08-24-foundation-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/D10/2026-08-24-foundation-shadow/deliverable-contract.json',
  },
  D11: {
    receipt: 'System/outcome-graph/routines/D11/2026-08-24-foundation-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/D11/2026-08-24-foundation-shadow/bounded-execution-graph.json',
  },
  D12: {
    receipt: 'System/outcome-graph/routines/D12/2026-08-24-foundation-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/D12/2026-08-24-foundation-shadow/preflight-receipt.json',
  },
  D13: {
    receipt: 'System/outcome-graph/routines/D13/2026-08-24-foundation-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/D13/2026-08-24-foundation-shadow/design-context-receipt.json',
  },
  D14: {
    receipt: 'System/outcome-graph/routines/D14/2026-08-24-foundation-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/D14/2026-08-24-foundation-shadow/build-receipt.json',
  },
  D16: {
    receipt: 'System/outcome-graph/routines/D16/2026-08-24-foundation-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/D16/2026-08-24-foundation-shadow/content-artifact.json',
  },
  D24: {
    receipt: 'System/outcome-graph/routines/D24/2026-08-24-foundation-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/D24/2026-08-24-foundation-shadow/independent-qa-verdict.json',
  },
  D25: {
    receipt: 'System/outcome-graph/routines/D25/2026-08-24-foundation-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/D25/2026-08-24-foundation-shadow/final-status-receipt.json',
  },
  D26: {
    receipt: 'System/outcome-graph/routines/D26/2026-08-24-governance-shadow/run-receipt.json',
    artifact: '00_Inbox/Agent-Proposals/Codex/2026-08-24-outcome-graph-knowledge-proposal.md',
  },
  D03: {
    receipt: 'System/outcome-graph/routines/D03/2026-08-24-reliability-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/D03/2026-08-24-reliability-shadow/automation-health-brief.json',
  },
  D07: {
    receipt: 'System/outcome-graph/routines/D07/2026-08-24-reliability-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/D07/2026-08-24-reliability-shadow/incident-triage.json',
  },
  D17: {
    receipt: 'System/outcome-graph/routines/D17/2026-08-24-performance-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/D17/2026-08-24-performance-shadow/paid-media-evidence.json',
  },
  D18: {
    receipt: 'System/outcome-graph/routines/D18/2026-08-24-performance-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/D18/2026-08-24-performance-shadow/attribution-validation.json',
  },
  D19: {
    receipt: 'System/outcome-graph/routines/D19/2026-08-24-performance-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/D19/2026-08-24-performance-shadow/report.json',
  },
  E04: {
    receipt: 'System/outcome-graph/routines/E04/2026-08-24-reliability-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/E04/2026-08-24-reliability-shadow/recovery-or-blocked-receipt.json',
  },
  E05: {
    receipt: 'System/outcome-graph/routines/E05/2026-08-24-foundation-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/E05/2026-08-24-foundation-shadow/codebase-onboarding-receipt.json',
  },
  E10: {
    receipt: 'System/outcome-graph/routines/E10/2026-08-24-reliability-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/E10/2026-08-24-reliability-shadow/runtime-recovery-receipt.json',
  },
  E11: {
    receipt: 'System/outcome-graph/routines/E11/2026-08-24-governance-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/E11/2026-08-24-governance-shadow/routine-definition.json',
  },
  M02: {
    receipt: 'System/outcome-graph/routines/M02/2026-08-24-governance-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/M02/2026-08-24-governance-shadow/agent-evaluation-scorecard.json',
  },
  M03: {
    receipt: 'System/outcome-graph/routines/M03/2026-08-24-governance-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/M03/2026-08-24-governance-shadow/automation-value-cost-report.json',
  },
  M04: {
    receipt: 'System/outcome-graph/routines/M04/2026-08-24-governance-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/M04/2026-08-24-governance-shadow/client-separation-audit.json',
  },
  M05: {
    receipt: 'System/outcome-graph/routines/M05/2026-08-24-governance-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/M05/2026-08-24-governance-shadow/documentation-refresh-proposal.json',
  },
  W01: {
    receipt: 'System/outcome-graph/readiness-2026-08-24-run-2-durable/run-receipt.json',
    artifact: 'System/outcome-graph/readiness-2026-08-24-run-2-durable/W01-weekly-operating-slate.json',
  },
  W02: {
    receipt: 'System/outcome-graph/routines/W02/2026-W35A-live-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/W02/2026-W35A-live-shadow/paid-media-review-a.json',
  },
  W03: {
    receipt: 'System/outcome-graph/routines/W03/2026-W35B-live-shadow/run-receipt.json',
    artifact: 'System/outcome-graph/routines/W03/2026-W35B-live-shadow/paid-media-review-b.json',
  },
  W07: {
    receipt: 'System/outcome-graph/readiness-2026-08-24-run-2-durable/run-receipt.json',
    artifact: 'System/outcome-graph/readiness-2026-08-24-run-2-durable/W07-unsent-draft-queue.json',
  },
  W04: {
    receipt: 'System/outcome-graph/tranche-2026-08-24-run-2-durable/run-receipt.json',
    artifact: 'System/outcome-graph/tranche-2026-08-24-run-2-durable/W04-production-calendar.json',
  },
  W05: {
    receipt: 'System/outcome-graph/factory-2026-08-24-run-1-durable/run-receipt.json',
    artifact: 'System/outcome-graph/factory-2026-08-24-run-1-durable/W05-website-factory-readiness.json',
  },
  W06: {
    receipt: 'System/outcome-graph/tranche-2026-08-24-run-2-durable/run-receipt.json',
    artifact: 'System/outcome-graph/tranche-2026-08-24-run-2-durable/W06-client-report-packages.json',
  },
  W08: {
    receipt: 'System/outcome-graph/tranche-2026-08-24-run-2-durable/run-receipt.json',
    artifact: 'System/outcome-graph/tranche-2026-08-24-run-2-durable/W08-experiment-decision-ledger.json',
  },
  W09: {
    receipt: 'System/outcome-graph/shadow-2026-08-24-run-6-durable/run-receipt.json',
    artifact: 'System/outcome-graph/shadow-2026-08-24-run-6-durable/W09-automation-reliability.json',
  },
  W10: {
    receipt: 'System/outcome-graph/tranche-2026-08-24-run-2-durable/run-receipt.json',
    artifact: 'System/outcome-graph/tranche-2026-08-24-run-2-durable/W10-executive-weekly-review.json',
  },
  W11: {
    receipt: 'System/outcome-graph/shadow-2026-08-24-run-6-durable/run-receipt.json',
    artifact: 'System/outcome-graph/shadow-2026-08-24-run-6-durable/W11-knowledge-graph-health.json',
  },
});

function normalize(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\/+/, '');
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function cadenceToken(cadence) {
  if (cadence === 'daily') return 'date';
  if (cadence === 'monthly') return 'month';
  if (cadence === 'event') return 'event_fingerprint';
  return 'week';
}

function safeAllowedActions(moduleName) {
  const common = ['read_named_sources', 'write_isolated_local_artifacts', 'hash_artifacts', 'record_corrections'];
  const byModule = {
    Command: ['build_local_plan', 'rank_proposals'],
    Communications: ['build_unsent_or_proposal_artifact', 'validate_routing'],
    Growth: ['build_local_content_or_experiment_artifact', 'validate_claims'],
    Performance: ['read_metrics', 'recompute_metrics', 'build_local_report'],
    Reliability: ['read_runtime_state', 'classify_health', 'propose_reversible_recovery'],
    Web: ['inspect_repository', 'build_local_artifact', 'run_local_tests'],
  };
  return unique([...common, ...(byModule[moduleName] || [])]);
}

function makeContract(routine, spec, generatedAt) {
  const maxAttempts = Math.max(1, Number(routine.retry_policy?.max_attempts || 2));
  const maxAgeHours = Math.max(1, Number(spec.freshness_hours || routine.source_freshness?.window_hours || 6));
  const parallelByModule = {
    Command: 4,
    Communications: 4,
    Growth: 4,
    Performance: 3,
    Reliability: 4,
    Web: 3,
  };
  const id = routine.routine_id;
  return {
    schema_version: 1,
    graph_id: `routine-${id.toLowerCase()}-outcome`,
    objective: spec.objective,
    value_signal: routine.value_signal,
    constraints: unique([
      routine.approval_boundary,
      'Source, artifact, approval, and delivery states must remain distinct.',
      'A loop log, checkpoint, stage count, or generic health receipt cannot prove the routine outcome.',
      'Client, account, repository, thread, surface, and reporting boundaries must not be blended.',
    ]),
    upstream_artifacts: unique([
      spec.canonical_state,
      `source probe: ${spec.source_probe || routine.source_freshness?.probe || 'named_source'}`,
      ...(routine.recorded_steps || []).map((step) => `procedure: ${step}`),
    ]),
    scope: {
      root: routine.route || `${routine.module}/${id}`,
      isolation_key: spec.isolation_key,
      data_class: ['D17', 'D18', 'D19', 'W06', 'M04'].includes(id)
        ? 'client-confidential'
        : 'internal-redacted',
    },
    source_freshness: {
      checked_at: generatedAt,
      max_age_seconds: maxAgeHours * 3600,
      evidence: `Fail-closed ${spec.source_probe || routine.source_freshness?.probe || 'named_source'} probe plus hashed source ledger before planning and at terminal verification.`,
    },
    finish_line: {
      predicate: `${spec.objective} All ${spec.assertions.length} routine-specific terminal assertions pass against fresh hashed evidence.`,
      required_artifacts: spec.artifacts.map((item) => item.pattern),
    },
    stopping: {
      max_graph_iterations: 2,
      max_worker_attempts: maxAttempts,
      timeout_seconds: Math.max(1, Number(routine.timeout_seconds || 900)),
      max_parallel: parallelByModule[routine.module] || 3,
      budget_units: Math.max(10, Math.ceil(Number(routine.budget_tokens || 8000) / 1000) * maxAttempts),
    },
    adapters: {
      planner: `${id.toLowerCase()}-source-bound-planner`,
      maker: `${id.toLowerCase()}-isolated-maker`,
      checker: `${id.toLowerCase()}-independent-checker`,
      reducer: `${id.toLowerCase()}-collision-safe-reducer`,
      terminal_verifier: 'routine-catalog-terminal-verifier',
      learner: `${id.toLowerCase()}-correction-ledger`,
    },
    approval: {
      external_actions: false,
      required_before: ['adopt', 'external_action'],
    },
    governance: {
      orchestrator: 'Codex acting as Marketing Chief',
      canonical_state: spec.canonical_state,
      dedupe_key: `${routine.dedupe_key_pattern || `{scope}:${cadenceToken(routine.cadence)}:${id}`}:canonical_binding_sha256`,
      checkpoint: `12_Brain/state/outcome-graph/routines/${id}/checkpoint.json`,
      rollback: 'Discard unadopted isolated artifacts, release the lease, and preserve the prior canonical, checkpoint, provider, and external state.',
      escalation: routine.escalation || 'Return exact failed assertions and source locators to Marketing Chief.',
      allowed_actions: safeAllowedActions(routine.module),
      forbidden_actions: unique([...(routine.forbidden_actions || []), ...SHARED_FORBIDDEN]),
    },
    learning: {
      fingerprint_inputs: [
        'canonical-binding',
        'source-manifest',
        'plan-signature',
        'artifact-hashes',
        'terminal-assertions',
        'approval-state',
      ],
      corrections_ledger: `12_Brain/state/outcome-graph/routines/${id}/corrections.jsonl`,
    },
  };
}

function makeTerminalSpec(routine, spec) {
  return {
    verifier_id: 'routine-catalog-terminal-verifier',
    routine_id: routine.routine_id,
    authoritative_output: routine.artifact,
    source_probe: spec.source_probe || routine.source_freshness?.probe || 'named_source',
    required_artifact_roles: spec.artifacts,
    assertions: spec.assertions,
    authority_predicate: 'external_action_attempted === false && canonical_write_attempted === false && checker.passed === true && checker.adapter !== maker.adapter',
    outcome_states: ['verified_not_adopted', 'held', 'blocked', 'adopted_by_marketing_chief'],
  };
}

function loadRegistry(repoRoot = REPO_ROOT) {
  const file = path.join(repoRoot, '11_Agents', 'claude-operating-team.json');
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  return { file, text, registry: JSON.parse(text) };
}

function buildRoutineCatalog(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  const generatedAt = options.generatedAt || new Date().toISOString();
  const { file, text, registry } = loadRegistry(repoRoot);
  const executable = (registry.routines || []).filter((routine) =>
    routine.claude_may_execute === true && routine.claude_role !== 'never'
  );
  const byId = new Map((registry.routines || []).map((routine) => [routine.routine_id, routine]));
  function buildRecord(id, governedRoute) {
    const routine = byId.get(id);
    const spec = ROUTINE_SPECS[id];
    if (!routine) throw new Error(`Routine ${id} is missing from the operating-team registry.`);
    if (!spec) throw new Error(`Outcome specification ${id} is missing.`);
    const contract = makeContract(routine, spec, generatedAt);
    return {
      routine_id: id,
      name: routine.name,
      module: routine.module,
      cadence: routine.cadence,
      trigger: routine.trigger,
      registry_artifact: routine.artifact,
      registry_value_signal: routine.value_signal,
      registry_checkpoint: routine.checkpoint_resume,
      registry_source_freshness: routine.source_freshness,
      execution_authority: governedRoute
        ? 'read_only_shadow_verification_only'
        : 'bounded_by_registry_and_contract',
      registry_execution_allowed: routine.claude_may_execute === true,
      contract,
      terminal_spec: makeTerminalSpec(routine, spec),
      migration: deepShadowStatus(id, repoRoot),
    };
  }
  const records = EXECUTABLE_ROUTINE_IDS.map((id) => buildRecord(id, false));
  const governedWeeklyRoutes = GOVERNED_WEEKLY_ROUTE_IDS.map((id) => buildRecord(id, true));
  return {
    schema_version: 1,
    generated_at: generatedAt,
    authority: {
      orchestrator: 'Codex acting as Marketing Chief',
      canonical_queue: 'client-operations/queue/work-items.json',
      overlay_role: 'Outcome contracts and terminal-verifier specifications; not a second queue or permission source.',
      scheduler_cutover_authorized: false,
    },
    source: {
      locator: normalize(path.relative(repoRoot, file)),
      sha256: sha256(text),
      registered_routines: (registry.routines || []).length,
      executable_routines: executable.length,
    },
    routines: records,
    governed_weekly_routes: governedWeeklyRoutes,
  };
}

function deepShadowStatus(id, repoRoot) {
  const evidence = DEEP_SHADOW_EVIDENCE[id];
  if (!evidence) {
    return {
      status: 'contract_defined_shadow_pending',
      durable_runtime_verified: false,
      legacy_cutover_allowed: false,
      evidence: null,
    };
  }
  const errors = [];
  const receiptFile = path.join(repoRoot, evidence.receipt);
  const artifactFile = path.join(repoRoot, evidence.artifact);
  let receipt = null;
  let artifactHash = null;
  if (!fs.existsSync(receiptFile)) errors.push('missing durable receipt');
  if (!fs.existsSync(artifactFile)) errors.push('missing final artifact');
  if (errors.length === 0) {
    receipt = JSON.parse(fs.readFileSync(receiptFile, 'utf8'));
    const bytes = fs.readFileSync(artifactFile);
    artifactHash = sha256(bytes);
    const declared = (receipt.terminal_evidence?.artifact_manifest || [])
      .find((item) => normalize(item.path) === normalize(evidence.artifact));
    if (receipt.outcome !== 'complete' || receipt.terminal_truth !== true) {
      errors.push('receipt does not carry terminal truth');
    }
    if (!declared) errors.push('artifact absent from terminal manifest');
    if (declared && (declared.sha256 !== artifactHash || declared.bytes !== bytes.length)) {
      errors.push('artifact hash or byte count does not match terminal manifest');
    }
  }
  return {
    status: errors.length === 0 ? 'deep_shadow_verified' : 'deep_shadow_evidence_invalid',
    durable_runtime_verified: errors.length === 0,
    legacy_cutover_allowed: false,
    evidence: {
      receipt: evidence.receipt,
      artifact: evidence.artifact,
      artifact_sha256: artifactHash,
      run_id: receipt?.run_id || null,
      errors,
    },
  };
}

function auditRoutineCatalog(catalog) {
  const errors = [];
  const ids = catalog.routines.map((record) => record.routine_id);
  const expected = [...EXECUTABLE_ROUTINE_IDS];
  const missing = expected.filter((id) => !ids.includes(id));
  const unexpected = ids.filter((id) => !expected.includes(id));
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const contractFindings = [];
  const governedFindings = [];
  for (const record of catalog.routines) {
    const validation = validateContract(record.contract);
    const assertionIds = record.terminal_spec.assertions.map((item) => item.id);
    const roleIds = record.terminal_spec.required_artifact_roles.map((item) => item.role);
    const findings = [...validation.errors];
    if (record.contract.adapters.maker === record.contract.adapters.checker) {
      findings.push('maker and checker adapters are identical');
    }
    if (record.contract.adapters.terminal_verifier === record.contract.adapters.maker ||
        record.contract.adapters.terminal_verifier === record.contract.adapters.reducer) {
      findings.push('terminal verifier is not independent');
    }
    if (assertionIds.length < 3) findings.push('fewer than three routine-specific assertions');
    if (new Set(assertionIds).size !== assertionIds.length) findings.push('duplicate assertion IDs');
    if (new Set(roleIds).size !== roleIds.length) findings.push('duplicate artifact roles');
    if (record.contract.finish_line.required_artifacts.length !== roleIds.length) {
      findings.push('finish-line artifact and terminal-role count mismatch');
    }
    if (!record.contract.governance.dedupe_key.includes('canonical_binding_sha256')) {
      findings.push('dedupe key is not canonical-binding-scoped');
    }
    if (!record.contract.governance.checkpoint.includes(`/routines/${record.routine_id}/`)) {
      findings.push('durable checkpoint is not routine-isolated');
    }
    if (findings.length > 0) errors.push(...findings.map((finding) => `${record.routine_id}: ${finding}`));
    contractFindings.push({
      routine_id: record.routine_id,
      contract_valid: findings.length === 0,
      objective_present: Boolean(record.contract.objective),
      source_freshness_present: Boolean(record.contract.source_freshness?.evidence),
      required_artifact_roles: roleIds.length,
      terminal_assertions: assertionIds.length,
      independent_verifier: record.contract.adapters.terminal_verifier === 'routine-catalog-terminal-verifier' &&
        record.contract.adapters.maker !== record.contract.adapters.checker,
      stopping_limits_present: Object.values(record.contract.stopping).every((value) =>
        Number.isInteger(value) && value > 0
      ),
      canonical_binding_required: record.contract.governance.dedupe_key.includes('canonical_binding_sha256'),
      isolated_checkpoint: record.contract.governance.checkpoint.includes(`/routines/${record.routine_id}/`),
      rollback_present: Boolean(record.contract.governance.rollback),
      approval_separate: record.contract.approval.external_actions === false &&
        record.contract.approval.required_before.includes('adopt'),
      learning_present: record.contract.learning.fingerprint_inputs.length > 0 &&
        Boolean(record.contract.learning.corrections_ledger),
      migration_status: record.migration.status,
    });
  }
  const governedIds = (catalog.governed_weekly_routes || []).map((record) => record.routine_id);
  for (const record of catalog.governed_weekly_routes || []) {
    const validation = validateContract(record.contract);
    const assertionIds = record.terminal_spec.assertions.map((item) => item.id);
    const roleIds = record.terminal_spec.required_artifact_roles.map((item) => item.role);
    const findings = [...validation.errors];
    if (record.registry_execution_allowed !== false) {
      findings.push('governed route unexpectedly carries registry execution authority');
    }
    if (record.execution_authority !== 'read_only_shadow_verification_only') {
      findings.push('governed route is not restricted to read-only shadow verification');
    }
    if (record.contract.approval.external_actions !== false) {
      findings.push('governed route permits external actions');
    }
    if (record.contract.adapters.maker === record.contract.adapters.checker ||
        record.contract.adapters.terminal_verifier === record.contract.adapters.maker) {
      findings.push('governed route lacks independent verification');
    }
    if (assertionIds.length < 3 || new Set(assertionIds).size !== assertionIds.length) {
      findings.push('governed route assertion contract is incomplete');
    }
    if (roleIds.length === 0 || new Set(roleIds).size !== roleIds.length) {
      findings.push('governed route artifact-role contract is incomplete');
    }
    if (findings.length > 0) {
      errors.push(...findings.map((finding) => `${record.routine_id}: ${finding}`));
    }
    governedFindings.push({
      routine_id: record.routine_id,
      contract_valid: findings.length === 0,
      registry_execution_allowed: record.registry_execution_allowed,
      execution_authority: record.execution_authority,
      required_artifact_roles: roleIds.length,
      terminal_assertions: assertionIds.length,
      migration_status: record.migration.status,
    });
  }
  if (missing.length > 0) errors.push(`missing executable IDs: ${missing.join(', ')}`);
  if (unexpected.length > 0) errors.push(`unexpected executable IDs: ${unexpected.join(', ')}`);
  if (duplicateIds.length > 0) errors.push(`duplicate executable IDs: ${unique(duplicateIds).join(', ')}`);
  if (catalog.source.executable_routines !== expected.length) {
    errors.push(`registry reports ${catalog.source.executable_routines} executable routines; expected ${expected.length}`);
  }
  const missingGoverned = GOVERNED_WEEKLY_ROUTE_IDS.filter((id) => !governedIds.includes(id));
  const unexpectedGoverned = governedIds.filter((id) => !GOVERNED_WEEKLY_ROUTE_IDS.includes(id));
  if (missingGoverned.length > 0) errors.push(`missing governed weekly IDs: ${missingGoverned.join(', ')}`);
  if (unexpectedGoverned.length > 0) errors.push(`unexpected governed weekly IDs: ${unexpectedGoverned.join(', ')}`);
  const deepVerified = catalog.routines.filter((record) =>
    record.migration.status === 'deep_shadow_verified'
  ).length;
  const invalidDeepEvidence = catalog.routines.filter((record) =>
    record.migration.status === 'deep_shadow_evidence_invalid'
  ).map((record) => record.routine_id);
  if (invalidDeepEvidence.length > 0) {
    errors.push(`invalid deep shadow evidence: ${invalidDeepEvidence.join(', ')}`);
  }
  const invalidGovernedEvidence = (catalog.governed_weekly_routes || []).filter((record) =>
    record.migration.status === 'deep_shadow_evidence_invalid'
  ).map((record) => record.routine_id);
  if (invalidGovernedEvidence.length > 0) {
    errors.push(`invalid governed-route shadow evidence: ${invalidGovernedEvidence.join(', ')}`);
  }
  return {
    schema_version: 1,
    audited_at: catalog.generated_at,
    catalog_sha256: sha256(stableJson([...catalog.routines, ...(catalog.governed_weekly_routes || [])].map((record) => ({
      routine_id: record.routine_id,
      contract: record.contract,
      terminal_spec: record.terminal_spec,
    })))),
    counts: {
      registered_routines: catalog.source.registered_routines,
      executable_routines: catalog.source.executable_routines,
      explicit_outcome_contracts: catalog.routines.length,
      executable_terminal_specs: contractFindings.filter((item) => item.independent_verifier).length,
      contract_complete: contractFindings.filter((item) => item.contract_valid).length,
      deep_shadow_verified: deepVerified,
      contract_defined_shadow_pending: catalog.routines.filter((record) =>
        record.migration.status === 'contract_defined_shadow_pending'
      ).length,
      governed_weekly_route_contracts: governedFindings.length,
      governed_weekly_readiness_verified: (catalog.governed_weekly_routes || []).filter((record) =>
        record.migration.status === 'deep_shadow_verified'
      ).length,
      paid_media_weekly_shadow_pending: (catalog.governed_weekly_routes || []).filter((record) =>
        ['W02', 'W03'].includes(record.routine_id) &&
        record.migration.status === 'contract_defined_shadow_pending'
      ).length,
    },
    exact_id_parity: missing.length === 0 && unexpected.length === 0 && duplicateIds.length === 0,
    catalog_finish_line_met: errors.length === 0 && contractFindings.length === expected.length,
    legacy_retirement_ready: errors.length === 0 && deepVerified === expected.length,
    scheduler_cutover_authorized: catalog.authority.scheduler_cutover_authorized === true,
    legacy_retirement_reason: deepVerified === expected.length
      ? 'All executable routines have deep durable shadow evidence. This satisfies the evidence precondition only; explicit Marketing Chief cutover review and authorization remain required.'
      : `Only ${deepVerified} of ${expected.length} executable routines have deep durable shadow evidence; structural-only scheduling remains unchanged.`,
    errors,
    routines: contractFindings,
    governed_weekly_routes: governedFindings,
  };
}

function validSha(value) {
  return /^[a-f0-9]{64}$/i.test(String(value || ''));
}

function globRegex(pattern) {
  const escaped = normalize(pattern).replace(/[.+^${}()|[\]\\]/g, '\\$&');
  return new RegExp('^' + escaped
    .replace(/\*\*/g, '::DOUBLE_STAR::')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]')
    .replace(/::DOUBLE_STAR::/g, '.*') + '$');
}

function verifyRoutineEvidence(record, evidence, options = {}) {
  const repoRoot = path.resolve(options.repoRoot || REPO_ROOT);
  const now = new Date(options.now || new Date());
  const assertions = [];
  function check(id, passed, detail) {
    assertions.push({ id, passed: passed === true, detail });
  }
  const validation = validateContract(record.contract);
  check('contract-valid', validation.ok, validation.errors.join('; ') || 'Outcome Graph v1 contract is valid.');
  check('routine-id-bound', evidence?.routine_id === record.routine_id, 'Evidence must target the exact routine.');
  const binding = evidence?.canonical_binding || {};
  check('canonical-binding-complete', Boolean(binding.locator && binding.version && validSha(binding.sha256) && binding.captured_at),
    'Canonical locator, version, SHA-256, and capture time are required.');

  const sourceItems = Array.isArray(evidence?.source?.items) ? evidence.source.items : [];
  const maxAge = record.contract.source_freshness.max_age_seconds * 1000;
  const sourceValid = sourceItems.length > 0 && sourceItems.every((item) => {
    const captured = new Date(item.captured_at);
    const age = now.getTime() - captured.getTime();
    return Boolean(item.locator) && validSha(item.sha256) && Number.isInteger(item.bytes) && item.bytes >= 0 &&
      Number.isFinite(captured.getTime()) && age >= -300000 && age <= maxAge;
  });
  check('fresh-source-manifest', sourceValid && evidence?.source?.probe === record.terminal_spec.source_probe,
    'At least one hashed, byte-counted source must pass the exact fail-closed freshness probe.');

  const declaredArtifacts = Array.isArray(evidence?.artifacts) ? evidence.artifacts : [];
  const verifiedArtifacts = [];
  for (const required of record.terminal_spec.required_artifact_roles) {
    const candidate = declaredArtifacts.find((item) => item.role === required.role);
    let passed = Boolean(candidate && globRegex(required.pattern).test(normalize(candidate.path)) &&
      validSha(candidate.sha256) && Number.isInteger(candidate.bytes) && candidate.bytes > 0);
    let detail = candidate ? `Checked ${normalize(candidate.path)}.` : `Missing role ${required.role}.`;
    if (passed && options.rehash !== false) {
      const absolute = path.resolve(repoRoot, normalize(candidate.path));
      if (absolute !== repoRoot && !absolute.startsWith(repoRoot + path.sep)) {
        passed = false;
        detail = 'Artifact path escapes the repository root.';
      } else if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
        passed = false;
        detail = 'Artifact file is missing.';
      } else {
        const bytes = fs.readFileSync(absolute);
        passed = candidate.sha256 === sha256(bytes) && candidate.bytes === bytes.length;
        detail = passed ? 'Artifact path, pattern, SHA-256, and byte count revalidated.' : 'Artifact hash or byte count changed.';
      }
    }
    check(`artifact-${required.role}`, passed, detail);
    if (passed) verifiedArtifacts.push(candidate);
  }

  const knownHashes = new Set([
    ...sourceItems.map((item) => item.sha256),
    ...verifiedArtifacts.map((item) => item.sha256),
  ]);
  const measured = new Map((evidence?.measurements || []).map((item) => [item.id, item]));
  for (const required of record.terminal_spec.assertions) {
    const result = measured.get(required.id);
    const evidenceBound = Array.isArray(result?.evidence_sha256s) &&
      result.evidence_sha256s.length > 0 &&
      result.evidence_sha256s.every((hash) => knownHashes.has(hash));
    check(`predicate-${required.id}`, result?.passed === true && evidenceBound,
      required.predicate + ' Measurement must pass and bind only to current source or artifact hashes.');
  }

  const maker = evidence?.maker || {};
  const checker = evidence?.checker || {};
  check('maker-checker-independent', maker.adapter === record.contract.adapters.maker &&
    checker.adapter === record.contract.adapters.checker &&
    maker.adapter !== checker.adapter && checker.passed === true,
  'The named independent checker must pass and differ from the maker.');
  check('authority-boundary', evidence?.authority?.external_action_attempted === false &&
    evidence?.authority?.canonical_write_attempted === false &&
    record.terminal_spec.outcome_states.includes(evidence?.authority?.outcome_state),
  'No external or canonical write is allowed, and outcome truth must remain distinct from adoption.');
  check('learning-receipt', validSha(evidence?.learning?.correction_receipt_sha256) &&
    validSha(evidence?.learning?.drift_fingerprint),
  'A correction receipt and drift fingerprint are required even when no correction is adopted.');

  return {
    schema_version: 1,
    routine_id: record.routine_id,
    verifier_id: record.terminal_spec.verifier_id,
    passed: assertions.every((item) => item.passed),
    assertions,
    artifact_manifest: verifiedArtifacts.map((item) => ({
      role: item.role,
      path: normalize(item.path),
      sha256: item.sha256,
      bytes: item.bytes,
    })),
    checked_at: now.toISOString(),
  };
}

function createRoutineCatalogReport(options = {}) {
  const catalog = buildRoutineCatalog(options);
  const audit = auditRoutineCatalog(catalog);
  return { ...catalog, audit };
}

module.exports = {
  DEEP_SHADOW_EVIDENCE,
  EXECUTABLE_ROUTINE_IDS,
  GOVERNED_WEEKLY_ROUTE_IDS,
  ROUTINE_SPECS,
  auditRoutineCatalog,
  buildRoutineCatalog,
  createRoutineCatalogReport,
  verifyRoutineEvidence,
};
