import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const studioSnapshots = sqliteTable("studio_snapshots", {
  id: text("id").primaryKey(),
  snapshotJson: text("snapshot_json").notNull(),
  queueRevision: integer("queue_revision").notNull(),
  generatedAt: text("generated_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const hostedChoices = sqliteTable(
  "hosted_choices",
  {
    id: text("id").primaryKey(),
    workItemId: text("work_item_id").notNull(),
    workItemVersion: integer("work_item_version").notNull(),
    queueRevision: integer("queue_revision").notNull(),
    predictionLane: text("prediction_lane").notNull(),
    decision: text("decision").notNull(),
    predictedAction: text("predicted_action").notNull(),
    replacementAction: text("replacement_action"),
    rationale: text("rationale"),
    state: text("state").notNull().default("pending"),
    createdBy: text("created_by").notNull().default("owner"),
    createdAt: text("created_at").notNull(),
    resolvedAt: text("resolved_at"),
    resolvedBy: text("resolved_by"),
    canonicalOutcomeId: text("canonical_outcome_id")
  },
  (table) => [
    uniqueIndex("hosted_choice_binding_idx").on(
      table.workItemId,
      table.workItemVersion,
      table.predictionLane,
      table.predictedAction
    )
  ]
);

export const operatorRequests = sqliteTable(
  "operator_requests",
  {
    id: text("id").primaryKey(),
    fingerprint: text("fingerprint").notNull(),
    workItemId: text("work_item_id").notNull(),
    workItemVersion: integer("work_item_version").notNull(),
    queueRevision: integer("queue_revision").notNull(),
    requestType: text("request_type").notNull(),
    requestedAction: text("requested_action").notNull(),
    rationale: text("rationale"),
    state: text("state").notNull(),
    requestedBy: text("requested_by").notNull(),
    resolvedBy: text("resolved_by"),
    createdAt: text("created_at").notNull(),
    resolvedAt: text("resolved_at"),
    resolutionSummary: text("resolution_summary"),
    safeResultRef: text("safe_result_ref")
  },
  (table) => [uniqueIndex("operator_request_fingerprint_idx").on(table.fingerprint)]
);

export const ownerIntents = sqliteTable(
  "owner_intents",
  {
    id: text("id").primaryKey(),
    fingerprint: text("fingerprint").notNull(),
    batchId: text("batch_id"),
    batchIndex: integer("batch_index"),
    batchSize: integer("batch_size"),
    clientId: text("client_id").notNull(),
    clientName: text("client_name").notNull(),
    queueRevision: integer("queue_revision").notNull(),
    title: text("title").notNull(),
    instruction: text("instruction").notNull(),
    mode: text("mode").notNull(),
    priority: text("priority").notNull(),
    dueAt: text("due_at"),
    state: text("state").notNull(),
    requestedBy: text("requested_by").notNull(),
    resolvedBy: text("resolved_by"),
    createdAt: text("created_at").notNull(),
    resolvedAt: text("resolved_at"),
    resolutionSummary: text("resolution_summary"),
    safeResultRef: text("safe_result_ref")
  },
  (table) => [uniqueIndex("owner_intent_fingerprint_idx").on(table.fingerprint)]
);

export const trainingRuns = sqliteTable(
  "training_runs",
  {
    id: text("id").primaryKey(),
    fingerprint: text("fingerprint").notNull(),
    runDate: text("run_date").notNull(),
    trigger: text("trigger").notNull(),
    queueRevision: integer("queue_revision").notNull(),
    labeledChoiceCount: integer("labeled_choice_count").notNull(),
    createdAt: text("created_at").notNull()
  },
  (table) => [uniqueIndex("training_run_fingerprint_idx").on(table.fingerprint)]
);

export const evaluationRuns = sqliteTable(
  "evaluation_runs",
  {
    id: text("id").primaryKey(),
    fingerprint: text("fingerprint").notNull(),
    queueRevision: integer("queue_revision").notNull(),
    recommendationCount: integer("recommendation_count").notNull(),
    labeledChoiceCount: integer("labeled_choice_count").notNull(),
    clientCoverageBps: integer("client_coverage_bps").notNull(),
    acceptanceRateBps: integer("acceptance_rate_bps").notNull(),
    guardrailPassRateBps: integer("guardrail_pass_rate_bps").notNull(),
    staleSourceCount: integer("stale_source_count").notNull(),
    attentionItemCount: integer("attention_item_count").notNull(),
    createdAt: text("created_at").notNull()
  },
  (table) => [uniqueIndex("evaluation_run_fingerprint_idx").on(table.fingerprint)]
);
