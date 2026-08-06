import { and, count, desc, eq, inArray } from "drizzle-orm";
import seedSnapshot from "@/data/seed-snapshot.json";
import { getDb } from "@/db";
import {
  evaluationRuns,
  hostedChoices,
  operatorRequests,
  ownerIntents,
  studioSnapshots,
  trainingRuns
} from "@/db/schema";
import type {
  DecisionValue,
  OwnerIntentMode,
  OwnerIntentPriority,
  OwnerIntentState,
  OperatorRequestState,
  OperatorRequestType,
  StudioPayload,
  StudioSnapshot
} from "./studio-types";
import { sanitizeSnapshotForPersistence } from "./snapshot-sanitizer";

const CURRENT_SNAPSHOT_ID = "current";
const decisionValues: DecisionValue[] = ["accept", "modify", "defer", "reject"];
const decisions = new Set<DecisionValue>(decisionValues);
const requestTypes = new Set<OperatorRequestType>(["execute_local", "approve", "defer", "refresh_evidence"]);
const resolutionStates = new Set<OperatorRequestState>(["acknowledged", "completed", "failed", "superseded"]);
const intentModes = new Set<OwnerIntentMode>(["analyze", "prepare", "execute_safe", "draft_for_approval", "monitor"]);
const intentPriorities = new Set<OwnerIntentPriority>(["P0", "P1", "P2", "P3"]);
const intentResolutionStates = new Set<OwnerIntentState>(["acknowledged", "completed", "failed", "superseded"]);
const choiceResolutionStates = new Set(["imported", "superseded", "failed"]);
const PORTFOLIO_CLIENT_ID = "portfolio:active";
const safeResultReference = /^(?:queue-item|graph-run|artifact|sites-request):[A-Za-z0-9][A-Za-z0-9._:/-]{0,499}$/;
const safeCanonicalOutcomeId = /^(?:po-\d{14}-[a-f0-9]{8}|sites-choice:[A-Za-z0-9][A-Za-z0-9._:-]{7,159})$/;
const safeId = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,159}$/;
const prohibitedIntentContent = /(?:bw:\/\/item\/|(?:sk|nfc|ghp|xox[baprs])_[A-Za-z0-9_-]{10,}|authorization["']?\s*[:=]\s*["']?bearer|(?:password|passcode|api[_ -]?key|access[_ -]?token|session[_ -]?cookie|recovery[_ -]?code)\s*[:=]|(?:^|\s)\d{6}(?:\s|$))/i;

function isoNow() {
  return new Date().toISOString();
}

function localRunDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(date);
}

function boundedText(value: unknown, limit: number) {
  const text = String(value ?? "").trim();
  if (text.length > limit) throw new Error("The submitted text is too long.");
  return text;
}

async function ensureSeed() {
  const db = getDb();
  const bundled = seedSnapshot as unknown as StudioSnapshot;
  const rows = await db.select({ queueRevision: studioSnapshots.queueRevision })
    .from(studioSnapshots)
    .where(eq(studioSnapshots.id, CURRENT_SNAPSHOT_ID))
    .limit(1);
  const values = {
    snapshotJson: JSON.stringify(bundled),
    queueRevision: bundled.queue.revision,
    generatedAt: bundled.generatedAt,
    updatedAt: isoNow()
  };
  if (!rows[0]) {
    await db.insert(studioSnapshots).values({ id: CURRENT_SNAPSHOT_ID, ...values });
  } else if (rows[0].queueRevision < bundled.queue.revision) {
    await db.update(studioSnapshots).set(values).where(eq(studioSnapshots.id, CURRENT_SNAPSHOT_ID));
  }
}

async function currentSnapshot(): Promise<StudioSnapshot> {
  await ensureSeed();
  const rows = await getDb().select().from(studioSnapshots).where(eq(studioSnapshots.id, CURRENT_SNAPSHOT_ID)).limit(1);
  if (!rows[0]) throw new Error("Studio snapshot is unavailable.");
  return JSON.parse(rows[0].snapshotJson) as StudioSnapshot;
}

async function ensureDailyRun(snapshot: StudioSnapshot, labeledChoiceCount: number) {
  const db = getDb();
  const runDate = localRunDate();
  const fingerprint = `daily:${runDate}:${snapshot.queue.revision}`;
  await db.insert(trainingRuns).values({
    id: crypto.randomUUID(),
    fingerprint,
    runDate,
    trigger: "daily-mutation",
    queueRevision: snapshot.queue.revision,
    labeledChoiceCount,
    createdAt: isoNow()
  }).onConflictDoNothing();
}

function basisPoints(value: number) {
  return Math.round(Math.max(0, Math.min(1, value)) * 10_000);
}

interface EvaluationChoice {
  workItemId: string;
  workItemVersion: number;
  predictionLane: string;
  decision: string;
  predictedAction: string;
}

function labeledClientCoverage(snapshot: StudioSnapshot, choices: EvaluationChoice[]) {
  const activeClientIds = new Set(
    snapshot.clients
      .filter((client) => client.status === "active")
      .map((client) => client.id)
  );
  const activeClientCount = Math.max(
    activeClientIds.size,
    Number(snapshot.training.activeClients ?? 0),
    Number(snapshot.portfolio.activeClients ?? 0)
  );
  if (!activeClientCount) return 0;

  const workItemClients = new Map(snapshot.workItems.map((item) => [item.id, item.clientId]));
  const coveredClientIds = new Set(
    (snapshot.learning.patterns ?? [])
      .map((pattern) => pattern.clientId)
      .filter((clientId) => !activeClientIds.size || activeClientIds.has(clientId))
  );
  const seenBindings = new Set<string>();
  for (const choice of choices) {
    const binding = [
      choice.workItemId,
      choice.workItemVersion,
      choice.predictionLane,
      choice.predictedAction
    ].join("\u001f");
    if (seenBindings.has(binding)) continue;
    seenBindings.add(binding);
    const clientId = workItemClients.get(choice.workItemId);
    if (clientId && (!activeClientIds.size || activeClientIds.has(clientId))) coveredClientIds.add(clientId);
  }

  const reportedCoverage = Math.max(
    Number(snapshot.training.clientCoverage ?? 0),
    Number(snapshot.training.coveredClients ?? 0) / activeClientCount
  );
  return Math.max(0, Math.min(1, Math.max(reportedCoverage, coveredClientIds.size / activeClientCount)));
}

async function stableDigest(value: unknown) {
  const encoded = new TextEncoder().encode(JSON.stringify(value));
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function ensureEvaluation(snapshot: StudioSnapshot, choices: EvaluationChoice[]) {
  const db = getDb();
  const decisionComposition = Object.fromEntries(decisionValues.map((decision) => [
    decision,
    Number(snapshot.learning.decisionCounts[decision] ?? 0) +
      choices.filter((choice) => choice.decision === decision).length
  ])) as Record<DecisionValue, number>;
  const totalLabels = snapshot.training.labeledOutcomes + choices.length;
  const recommendationChecks = snapshot.recommendations.ranked.map((recommendation) => {
    const workItem = snapshot.workItems.find((item) => item.id === recommendation.workItemId);
    if (!workItem) return false;
    if (recommendation.lane === "automatic") {
      return workItem.automaticEligible && workItem.reversible && !workItem.externalAction;
    }
    return workItem.externalAction ? workItem.approvalStatus !== "not_required" : true;
  });
  const guardrailPassRate = recommendationChecks.length
    ? recommendationChecks.filter(Boolean).length / recommendationChecks.length
    : 1;
  const clientCoverage = labeledClientCoverage(snapshot, choices);
  const acceptanceRate = totalLabels ? decisionComposition.accept / totalLabels : 0;
  const staleSourceCount = Number(snapshot.health.stale) + Math.max(0, snapshot.health.revisionDrift);
  const outcomeBindings = snapshot.workItems
    .filter((item) => item.outcomeStatus || item.outcomeSummary)
    .map((item) => ({
      id: item.id,
      version: item.version,
      status: item.outcomeStatus ?? null,
      summary: item.outcomeSummary ?? null,
      updatedAt: item.updatedAt
    }))
    .sort((left, right) => `${left.id}:${left.version}`.localeCompare(`${right.id}:${right.version}`));
  const recommendationPolicy = (
    snapshot.recommendations as StudioSnapshot["recommendations"] & { policy?: Record<string, string> }
  ).policy ?? null;
  const fingerprint = `evaluation:${await stableDigest({
    queueRevision: snapshot.queue.revision,
    recommendationCount: snapshot.recommendations.ranked.length,
    recommendations: snapshot.recommendations.ranked.map((recommendation) => ({
      workItemId: recommendation.workItemId,
      workItemVersion: recommendation.workItemVersion,
      lane: recommendation.lane,
      score: recommendation.score,
      confidence: recommendation.confidence,
      nextAction: recommendation.nextAction
    })),
    totalLabels,
    decisionComposition,
    acceptanceRateBps: basisPoints(acceptanceRate),
    clientCoverageBps: basisPoints(clientCoverage),
    guardrailPassRateBps: basisPoints(guardrailPassRate),
    staleSourceCount,
    attentionItemCount: snapshot.queue.needsAttentionCount,
    outcomes: {
      total: snapshot.learning.totalOutcomes,
      labeled: snapshot.training.labeledOutcomes,
      bindings: outcomeBindings
    },
    policy: {
      trainingEngineVersion: snapshot.training.engineVersion ?? null,
      watchtowerPolicyVersion: snapshot.watchtower?.policyVersion ?? null,
      queueMode: snapshot.queue.mode ?? null,
      recommendationPolicy
    }
  })}`;
  await db.insert(evaluationRuns).values({
    id: crypto.randomUUID(),
    fingerprint,
    queueRevision: snapshot.queue.revision,
    recommendationCount: snapshot.recommendations.ranked.length,
    labeledChoiceCount: totalLabels,
    clientCoverageBps: basisPoints(clientCoverage),
    acceptanceRateBps: basisPoints(acceptanceRate),
    guardrailPassRateBps: basisPoints(guardrailPassRate),
    staleSourceCount,
    attentionItemCount: snapshot.queue.needsAttentionCount,
    createdAt: isoNow()
  }).onConflictDoNothing();
}

async function refreshLearningRuns(snapshot: StudioSnapshot) {
  const choices = await getDb().select({
    workItemId: hostedChoices.workItemId,
    workItemVersion: hostedChoices.workItemVersion,
    predictionLane: hostedChoices.predictionLane,
    decision: hostedChoices.decision,
    predictedAction: hostedChoices.predictedAction
  }).from(hostedChoices).where(eq(hostedChoices.state, "pending"));
  await Promise.all([
    ensureDailyRun(snapshot, snapshot.training.labeledOutcomes + choices.length),
    ensureEvaluation(snapshot, choices)
  ]);
}

export async function loadStudioPayload(identity: StudioPayload["identity"] = null): Promise<StudioPayload> {
  const db = getDb();
  const snapshot = await currentSnapshot();
  const [choices, choiceDecisions] = await Promise.all([
    db.select().from(hostedChoices).orderBy(desc(hostedChoices.createdAt)).limit(40),
    db.select({ decision: hostedChoices.decision }).from(hostedChoices).where(eq(hostedChoices.state, "pending"))
  ]);
  const [requests, intents, runs, evaluations, queuedCountRows, queuedIntentRows] = await Promise.all([
    db.select().from(operatorRequests).orderBy(desc(operatorRequests.createdAt)).limit(50),
    db.select().from(ownerIntents).orderBy(desc(ownerIntents.createdAt)).limit(100),
    db.select().from(trainingRuns).orderBy(desc(trainingRuns.createdAt)).limit(1),
    db.select().from(evaluationRuns).orderBy(desc(evaluationRuns.createdAt)).limit(12),
    db.select({ value: count() }).from(operatorRequests).where(eq(operatorRequests.state, "queued")),
    db.select({ value: count() }).from(ownerIntents).where(eq(ownerIntents.state, "queued"))
  ]);
  const queuedOperatorRequests = queuedCountRows[0]?.value ?? 0;
  const queuedOwnerIntents = queuedIntentRows[0]?.value ?? 0;
  return {
    snapshot,
    hostedChoices: choices as StudioPayload["hostedChoices"],
    operatorRequests: requests as StudioPayload["operatorRequests"],
    ownerIntents: intents as StudioPayload["ownerIntents"],
    evaluations: evaluations.map((evaluation) => ({
      id: evaluation.id,
      queueRevision: evaluation.queueRevision,
      recommendationCount: evaluation.recommendationCount,
      labeledChoiceCount: evaluation.labeledChoiceCount,
      clientCoverage: evaluation.clientCoverageBps / 10_000,
      acceptanceRate: evaluation.acceptanceRateBps / 10_000,
      guardrailPassRate: evaluation.guardrailPassRateBps / 10_000,
      staleSourceCount: evaluation.staleSourceCount,
      attentionItemCount: evaluation.attentionItemCount,
      createdAt: evaluation.createdAt
    })),
    identity,
    overlay: {
      persistedChoices: choiceDecisions.length,
      totalLabeledChoices: snapshot.training.labeledOutcomes + choiceDecisions.length,
      lastCalibrationAt: runs[0]?.createdAt ?? snapshot.training.dailyCalibration.lastRunAt,
      lastCalibrationTrigger: runs[0]?.trigger ?? snapshot.training.dailyCalibration.trigger,
      queuedOperatorRequests,
      queuedOwnerIntents,
      lastEvaluationAt: evaluations[0]?.createdAt ?? null
    }
  };
}

export async function recordHostedChoice(
  input: Record<string, unknown>,
  identity: NonNullable<StudioPayload["identity"]>
): Promise<StudioPayload> {
  const snapshot = await currentSnapshot();
  const workItemId = String(input.workItemId ?? "");
  const workItemVersion = Number(input.workItemVersion);
  const queueRevision = Number(input.queueRevision);
  const predictionLane = String(input.predictionLane ?? "");
  const decision = String(input.decision ?? "") as DecisionValue;
  const predictedAction = boundedText(input.predictedAction, 3_000);
  const replacementAction = boundedText(input.replacementAction, 3_000) || null;
  const rationale = boundedText(input.rationale, 1_200) || null;
  const recommendation = snapshot.recommendations.ranked.find((candidate) =>
    candidate.workItemId === workItemId &&
    candidate.workItemVersion === workItemVersion &&
    candidate.lane === predictionLane &&
    candidate.nextAction === predictedAction
  );

  if (!recommendation || queueRevision !== snapshot.queue.revision) throw new Error("The choice is stale. Refresh and choose again.");
  if (!decisions.has(decision)) throw new Error("Choose accept, modify, defer, or reject.");
  if (decision === "modify" && !replacementAction) throw new Error("A modified action is required.");

  const db = getDb();
  const existing = await db.select().from(hostedChoices).where(and(
    eq(hostedChoices.workItemId, workItemId),
    eq(hostedChoices.workItemVersion, workItemVersion),
    eq(hostedChoices.predictionLane, predictionLane),
    eq(hostedChoices.predictedAction, predictedAction)
  )).limit(1);
  const isExactReplay =
    existing[0]?.queueRevision === queueRevision &&
    existing[0]?.decision === decision &&
    existing[0]?.replacementAction === replacementAction &&
    existing[0]?.rationale === rationale;
  if (isExactReplay) return loadStudioPayload(identity);
  if (existing[0] && existing[0].state !== "pending") {
    throw new Error("This exact choice is already reconciled. Refresh for the next work-item version.");
  }

  const createdAt = isoNow();
  await db.insert(hostedChoices).values({
    id: crypto.randomUUID(),
    workItemId,
    workItemVersion,
    queueRevision,
    predictionLane,
    decision,
    predictedAction,
    replacementAction,
    rationale,
    state: "pending",
    createdBy: identity.email,
    createdAt,
    resolvedAt: null,
    resolvedBy: null,
    canonicalOutcomeId: null
  }).onConflictDoUpdate({
    target: [hostedChoices.workItemId, hostedChoices.workItemVersion, hostedChoices.predictionLane, hostedChoices.predictedAction],
    set: { decision, replacementAction, rationale, createdBy: identity.email, createdAt }
  });

  const [{ value: choiceCount = 0 } = { value: 0 }] = await db.select({ value: count() })
    .from(hostedChoices)
    .where(eq(hostedChoices.state, "pending"));
  const choiceFingerprint = `choice:${await stableDigest({
    workItemId,
    workItemVersion,
    queueRevision,
    predictionLane,
    decision,
    predictedAction,
    replacementAction,
    rationale
  })}`;
  await db.insert(trainingRuns).values({
    id: crypto.randomUUID(),
    fingerprint: choiceFingerprint,
    runDate: localRunDate(),
    trigger: "hosted-choice",
    queueRevision,
    labeledChoiceCount: snapshot.training.labeledOutcomes + choiceCount,
    createdAt
  }).onConflictDoNothing();
  await refreshLearningRuns(snapshot);
  return loadStudioPayload(identity);
}

export async function resolveHostedChoice(
  input: Record<string, unknown>,
  identity: NonNullable<StudioPayload["identity"]>
): Promise<StudioPayload> {
  const id = boundedText(input.id, 160);
  const state = boundedText(input.state, 32);
  const canonicalOutcomeId = boundedText(input.canonicalOutcomeId, 180) || null;
  if (!safeId.test(id) || !choiceResolutionStates.has(state)) {
    throw new Error("A valid hosted-choice resolution is required.");
  }
  if (canonicalOutcomeId && !safeCanonicalOutcomeId.test(canonicalOutcomeId)) {
    throw new Error("The canonical outcome identifier is not allowlisted.");
  }
  const existing = await getDb().select().from(hostedChoices).where(eq(hostedChoices.id, id)).limit(1);
  if (!existing[0]) throw new Error("The hosted choice was not found.");
  if (existing[0].state !== "pending" && existing[0].state !== state) {
    throw new Error("The hosted choice is already resolved to a different state.");
  }
  await getDb().update(hostedChoices).set({
    state,
    resolvedAt: isoNow(),
    resolvedBy: identity.email,
    canonicalOutcomeId
  }).where(eq(hostedChoices.id, id));
  await refreshLearningRuns(await currentSnapshot());
  return loadStudioPayload(identity);
}

export async function recordOperatorRequest(
  input: Record<string, unknown>,
  identity: NonNullable<StudioPayload["identity"]>
): Promise<StudioPayload> {
  const snapshot = await currentSnapshot();
  const workItemId = String(input.workItemId ?? "");
  const workItemVersion = Number(input.workItemVersion);
  const queueRevision = Number(input.queueRevision);
  const requestType = String(input.requestType ?? "") as OperatorRequestType;
  const rationale = boundedText(input.rationale, 1_200) || null;
  const workItem = snapshot.workItems.find((item) => item.id === workItemId && item.version === workItemVersion);
  if (!workItem || queueRevision !== snapshot.queue.revision) throw new Error("The operator request is stale. Refresh and choose again.");
  if (!requestTypes.has(requestType)) throw new Error("Choose an available operator request.");
  if (requestType === "execute_local" && (!workItem.automaticEligible || !workItem.reversible || workItem.externalAction)) {
    throw new Error("This action is not eligible for automatic local execution.");
  }
  if (requestType === "approve" && workItem.approvalStatus !== "pending") {
    throw new Error("This work item is not waiting for approval.");
  }
  const requestedAction = requestType === "refresh_evidence"
    ? `Refresh allowlisted evidence for ${workItem.title}`
    : workItem.nextAction;
  const fingerprint = `request:${workItemId}:${workItemVersion}:${queueRevision}:${requestType}`;
  await getDb().insert(operatorRequests).values({
    id: crypto.randomUUID(),
    fingerprint,
    workItemId,
    workItemVersion,
    queueRevision,
    requestType,
    requestedAction,
    rationale,
    state: "queued",
    requestedBy: identity.email,
    resolvedBy: null,
    createdAt: isoNow(),
    resolvedAt: null,
    resolutionSummary: null,
    safeResultRef: null
  }).onConflictDoUpdate({
    target: operatorRequests.fingerprint,
    set: {
      rationale,
      requestedBy: identity.email,
      resolvedBy: null,
      state: "queued",
      createdAt: isoNow(),
      resolvedAt: null,
      resolutionSummary: null,
      safeResultRef: null
    }
  });
  return loadStudioPayload(identity);
}

export async function resolveOperatorRequest(
  input: Record<string, unknown>,
  identity: NonNullable<StudioPayload["identity"]>
): Promise<StudioPayload> {
  const id = String(input.id ?? "");
  const state = String(input.state ?? "") as OperatorRequestState;
  const resolutionSummary = boundedText(input.resolutionSummary, 2_000);
  const safeResultRef = boundedText(input.safeResultRef, 500) || null;
  if (!id || !resolutionStates.has(state)) throw new Error("A valid operator resolution is required.");
  if (!resolutionSummary) throw new Error("A verified resolution summary is required.");
  if (safeResultRef && !safeResultReference.test(safeResultRef)) throw new Error("The result reference is not allowlisted.");
  const existing = await getDb().select().from(operatorRequests).where(eq(operatorRequests.id, id)).limit(1);
  if (!existing[0]) throw new Error("The operator request was not found.");
  await getDb().update(operatorRequests).set({
    state,
    resolvedAt: isoNow(),
    resolutionSummary,
    safeResultRef,
    resolvedBy: identity.email
  }).where(eq(operatorRequests.id, id));
  return loadStudioPayload(identity);
}

export async function captureOwnerIntent(
  input: Record<string, unknown>,
  identity: NonNullable<StudioPayload["identity"]>
): Promise<StudioPayload> {
  const snapshot = await currentSnapshot();
  const id = boundedText(input.id, 160);
  const clientId = boundedText(input.clientId, 160);
  const queueRevision = Number(input.queueRevision);
  const title = boundedText(input.title, 180);
  const instruction = boundedText(input.instruction, 3_000);
  const mode = String(input.mode ?? "") as OwnerIntentMode;
  const priority = String(input.priority ?? "") as OwnerIntentPriority;
  const dueAtText = boundedText(input.dueAt, 80);
  const dueAt = dueAtText || null;
  const isPortfolio = clientId === PORTFOLIO_CLIENT_ID;
  const selectedClient = snapshot.clients.find((candidate) => candidate.id === clientId);
  const targetClients = isPortfolio
    ? snapshot.clients.filter((candidate) => candidate.status === "active")
    : selectedClient?.status === "active" ? [selectedClient] : [];

  if (!safeId.test(id)) throw new Error("A valid owner intent identifier is required.");
  if (!targetClients.length) throw new Error(isPortfolio ? "No active canonical clients are available." : "Choose an active canonical client or the full active portfolio.");
  if (targetClients.length > 100) throw new Error("The active portfolio is too large for one governed command.");
  if (queueRevision !== snapshot.queue.revision) throw new Error("The owner intent is stale. Refresh and submit again.");
  if (!title || !instruction) throw new Error("A title and instruction are required.");
  if (!intentModes.has(mode)) throw new Error("Choose an available work mode.");
  if (!intentPriorities.has(priority)) throw new Error("Choose an available priority.");
  if (dueAt && (!Number.isFinite(Date.parse(dueAt)) || dueAt.length > 80)) throw new Error("Choose a valid due date.");
  if (prohibitedIntentContent.test(`${title}\n${instruction}`)) {
    throw new Error("Remove secrets, codes, or raw credential material before submitting this instruction.");
  }

  const db = getDb();
  const createdAt = isoNow();
  const bindings = await Promise.all(targetClients.map(async (client, index) => {
    const childId = isPortfolio
      ? `intent-${(await stableDigest({ batchId: id, clientId: client.id })).slice(0, 32)}`
      : id;
    return {
      id: childId,
      fingerprint: `intent:${childId}`,
      batchId: isPortfolio ? id : null,
      batchIndex: isPortfolio ? index + 1 : null,
      batchSize: isPortfolio ? targetClients.length : null,
      clientId: client.id,
      clientName: client.name,
      queueRevision,
      title,
      instruction,
      mode,
      priority,
      dueAt,
      state: "queued" as const,
      requestedBy: identity.email,
      resolvedBy: null,
      createdAt,
      resolvedAt: null,
      resolutionSummary: null,
      safeResultRef: null
    };
  }));
  const existingRows = await db.select().from(ownerIntents).where(inArray(
    ownerIntents.id,
    bindings.map((binding) => binding.id)
  ));
  const existingById = new Map(existingRows.map((existing) => [existing.id, existing]));
  bindings.forEach((binding) => {
    const existing = existingById.get(binding.id);
    if (!existing) return;
    const sameIntent =
      existing.clientId === binding.clientId &&
      existing.batchId === binding.batchId &&
      existing.batchIndex === binding.batchIndex &&
      existing.batchSize === binding.batchSize &&
      existing.queueRevision === queueRevision &&
      existing.title === title &&
      existing.instruction === instruction &&
      existing.mode === mode &&
      existing.priority === priority &&
      existing.dueAt === dueAt;
    if (!sameIntent) throw new Error("This owner intent identifier is already bound to different work.");
  });
  const missingBindings = bindings.filter((binding) => !existingById.has(binding.id));
  for (let index = 0; index < missingBindings.length; index += 5) {
    await db.insert(ownerIntents).values(missingBindings.slice(index, index + 5)).onConflictDoNothing();
  }
  return {
    ...await loadStudioPayload(identity),
    capture: {
      scope: isPortfolio ? "portfolio" : "client",
      clientCount: targetClients.length,
      batchId: isPortfolio ? id : null
    }
  };
}

export async function resolveOwnerIntent(
  input: Record<string, unknown>,
  identity: NonNullable<StudioPayload["identity"]>
): Promise<StudioPayload> {
  const id = boundedText(input.id, 160);
  const state = String(input.state ?? "") as OwnerIntentState;
  const resolutionSummary = boundedText(input.resolutionSummary, 2_000);
  const safeResultRef = boundedText(input.safeResultRef, 500) || null;
  if (!id || !intentResolutionStates.has(state)) throw new Error("A valid owner intent resolution is required.");
  if (!resolutionSummary) throw new Error("A verified owner intent resolution summary is required.");
  if (safeResultRef && !safeResultReference.test(safeResultRef)) throw new Error("The result reference is not allowlisted.");
  const existing = await getDb().select().from(ownerIntents).where(eq(ownerIntents.id, id)).limit(1);
  if (!existing[0]) throw new Error("The owner intent was not found.");
  await getDb().update(ownerIntents).set({
    state,
    resolvedAt: isoNow(),
    resolutionSummary,
    safeResultRef,
    resolvedBy: identity.email
  }).where(eq(ownerIntents.id, id));
  return loadStudioPayload(identity);
}

export async function syncStudioSnapshot(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("A hosted snapshot object is required.");
  const submitted = JSON.stringify(input);
  if (new TextEncoder().encode(submitted).byteLength > 2_000_000) throw new Error("The hosted snapshot is too large.");
  if (/(?:bw:\/\/item\/|nfc_[A-Za-z0-9]{10,}|authorization["']?\s*[:=]\s*["']?bearer|password\s*[:=])/i.test(submitted)) {
    throw new Error("The hosted snapshot contains a prohibited secret-shaped value.");
  }

  const candidate = sanitizeSnapshotForPersistence(input);
  const serialized = JSON.stringify(candidate);
  const clients = Array.isArray(candidate.clients) ? candidate.clients : [];
  const workItems = Array.isArray(candidate.workItems) ? candidate.workItems : [];
  const totalClients = Number(candidate.portfolio?.totalClients);
  const fullyIntegratedClients = Number(candidate.portfolio?.fullyIntegratedClients);
  const queueRevision = Number(candidate.queue?.revision);
  const clientIds = clients.map((client) => String(client?.id ?? ""));
  if (
    candidate.schemaVersion !== 2 ||
    !Number.isInteger(queueRevision) ||
    queueRevision < 0 ||
    !candidate.generatedAt ||
    clients.length < 1 ||
    clients.length > 200 ||
    workItems.length > 2_000 ||
    totalClients !== clients.length ||
    fullyIntegratedClients !== clients.length ||
    clientIds.some((id) => !id || id.length > 160) ||
    new Set(clientIds).size !== clientIds.length
  ) {
    throw new Error("The hosted snapshot failed its allowlisted shape checks.");
  }

  const current = await currentSnapshot();
  if (queueRevision < current.queue.revision) throw new Error("The hosted snapshot is stale.");
  const values = {
    snapshotJson: serialized,
    queueRevision,
    generatedAt: String(candidate.generatedAt),
    updatedAt: isoNow()
  };
  await getDb().update(studioSnapshots).set(values).where(eq(studioSnapshots.id, CURRENT_SNAPSHOT_ID));
  await refreshLearningRuns(candidate as StudioSnapshot);
  return {
    queueRevision,
    clientCount: clients.length,
    workItemCount: workItems.length,
    generatedAt: String(candidate.generatedAt)
  };
}
