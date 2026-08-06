export type StudioLane = "automatic" | "decision" | "unblock";
export type DecisionValue = "accept" | "modify" | "defer" | "reject";

export interface StudioRecommendation {
  lane: StudioLane;
  workItemId: string;
  workItemVersion: number;
  clientId: string;
  clientName: string;
  title: string;
  status: string;
  priority: string;
  score: number;
  dueAt: string | null;
  nextAction: string;
  replacementAction?: string | null;
  why: string;
  confidence: number;
  actionClass: string;
  learnedSampleCount: number;
  learnedAdjustment: number;
  feedbackDecision: DecisionValue | null;
  automaticEligibilityReasons?: string[];
}

export interface StudioWorkItem {
  id: string;
  version: number;
  clientId: string;
  clientName: string;
  title: string;
  status: string;
  lane: string;
  priority: string;
  nextAction: string;
  actionClass: string;
  automaticEligible: boolean;
  reversible: boolean;
  externalAction: boolean;
  dueAt: string | null;
  reviewAt?: string | null;
  evidenceFreshness?: string;
  evidenceAsOf?: string | null;
  approvalTier: string;
  approvalStatus: string;
  confidence: number;
  dependencyCount: number;
  artifactCount: number;
  outcomeStatus?: string | null;
  outcomeSummary?: string | null;
  updatedAt: string | null;
}

export interface WatchtowerSignal {
  id: string;
  receivedAt: string;
  sourceChannel: "slack" | "gmail" | "inbox" | "unknown";
  clientId: string | null;
  clientName: string | null;
  route: string;
  state: "pending" | "quarantined" | "resolved" | "acknowledged";
  quarantineReason: string | null;
}

export interface WatchtowerStatus {
  observedAt: string | null;
  status: "active" | "polling" | "delayed" | "paused" | "degraded" | "unavailable";
  policyVersion: string;
  slack: {
    state: string;
    mode: "read-only";
    intervalMinutes: number;
    lastPollAt: string | null;
    nextPollAt: string | null;
    lastResult: number | null;
  };
  worker: {
    state: string;
    intervalMinutes: number;
    lastRunAt: string | null;
    nextRunAt: string | null;
    lastResult: number | null;
    lastEpisodeId: string | null;
  };
  intake: {
    pending: number;
    quarantined: number;
    resolved: number;
    acknowledged: number;
    occurrenceDuplicates: number;
    semanticDuplicates: number;
  };
  stages?: Array<{
    id: "watch" | "route" | "prioritize" | "build" | "verify" | "learn" | "final_gate";
    state: string;
    observedAt: string | null;
  }>;
  signals: WatchtowerSignal[];
}

export interface GraphNodeSummary {
  id: string;
  kind: string;
  owner: string;
  status: string;
  task: string;
  requirementCount: number;
  attemptCount: number;
  maxAttempts: number;
  approvalGate: boolean;
}

export interface ExecutionGraphSummary {
  graphRunId: string;
  graphRevision: number;
  status: string;
  workItemId: string;
  workItemTitle: string;
  updatedAt: string | null;
  nodeCount: number;
  edgeCount: number;
  blockerCount: number;
  warningCount: number;
  nodes: GraphNodeSummary[];
}

export interface LearningPattern {
  clientId: string;
  clientName: string;
  predictionLane: string;
  actionClass: string;
  sampleCount: number;
  eligible: boolean;
  adjustment: number;
  accepted: number;
  modified: number;
  deferred: number;
  rejected: number;
  lastObservedAt: string | null;
}

export interface ClientProfile {
  id: string;
  name: string;
  status: string;
  integrationState: "complete" | "partial";
  knowledgeSources: string[];
  portfolioRank: number | null;
  portfolioTier: string;
  portfolioConfidence: number;
  priorityRationale: string;
  routeStatus: string;
  contextSignals: string[];
  gmailEvidenceConfidence: number | null;
  slackEvidenceConfidence: number | null;
  paidMediaPlatforms: string[];
  accessReferenceCount: number;
  workItemCount: number;
  attentionCount: number;
  topWorkItemTitle: string | null;
  topWorkItemStatus: string | null;
  topWorkItemPriority: string | null;
  nextAction: string | null;
}

export interface StudioSnapshot {
  schemaVersion: 2;
  generatedAt: string;
  queue: {
    revision: number;
    updatedAt?: string;
    updatedBy?: string;
    mode?: string;
    workItemCount: number;
    statusCounts?: Record<string, number>;
    activeCount: number;
    needsAttentionCount: number;
    normalWip: { used: number; limit: number };
    emergencyWip: { used: number; limit: number };
    intakeCount: number;
  };
  recommendations: {
    nextAutomatic: StudioRecommendation | null;
    nextDecision: StudioRecommendation | null;
    nextUnblock: StudioRecommendation | null;
    ranked: StudioRecommendation[];
  };
  workItems: StudioWorkItem[];
  portfolio: {
    totalClients: number;
    activeClients: number;
    fullyIntegratedClients: number;
    clientsWithContext: number;
    clientsNeedingAttention: number;
  };
  clients: ClientProfile[];
  graphs: ExecutionGraphSummary[];
  learning: {
    totalOutcomes: number;
    totalCorrections: number;
    totalMutations: number;
    activePatternCount: number;
    minimumSamples: number;
    decisionCounts: Record<string, number>;
    patterns?: LearningPattern[];
  };
  training: {
    engineVersion?: string;
    state: "cold-start" | "calibrating" | "active";
    compiledAt?: string;
    method: string;
    totalSignals: number;
    labeledOutcomes: number;
    correctionSignals: number;
    queueObservations: number;
    observedPatterns: number;
    eligiblePatterns: number;
    sourceObservations: {
      promotedContextSignals: number;
      intakeItems: number;
      gmailBaseMessages: number;
      gmailSupplementMessages: number;
      slackMessagesReviewed: number;
      executionNodes: number;
    };
    dailyCalibration: {
      configured: boolean;
      lastRunAt: string | null;
      trigger: string;
      queueRevision: number;
    };
    operatorWorkflow: string[];
    safeguards: string[];
    coveredClients?: number;
    activeClients?: number;
    clientCoverage?: number;
    acceptanceRate?: number;
  };
  health: {
    overall: string;
    observedAt?: string | null;
    reportedQueueRevision?: number;
    currentQueueRevision?: number;
    revisionDrift: number;
    stale: boolean;
    scheduledTaskCount: number;
    scheduledTaskIssueCount: number;
    humanGateCount: number;
    warningCount: number;
    clientRegistryValid?: boolean;
    accessBrokerValid?: boolean;
    accessCoverageValid?: boolean;
    credentialBridgeState?: string;
    intakeState?: string;
  };
  aiStack?: {
    observedAt: string | null;
    status: string;
    gateway: {
      name: string;
      version: string;
      status: string;
      loopbackOnly: boolean;
      doctorFailures: number;
      mcpToolCount: number;
      catalogRouteCount: number;
      providerModelRouteCount: number;
      aliasRouteCount: number;
      freeProviderCount: number;
      connectedProviderCount: number;
      dashboardUrl: string;
      apiUrl: string;
    };
    localRuntime: {
      name: string;
      version: string;
      status: string;
      loopbackOnly: boolean;
      endpoint: string;
      modelCount: number;
      models: Array<{
        id: string;
        role: string;
        sizeGb: number;
        status: string;
        capabilities: string[];
      }>;
    };
    clients: Array<{
      name: string;
      version: string;
      status: string;
      connection: string;
    }>;
    mcpServers: Array<{
      name: string;
      version: string;
      status: string;
      scope: string;
    }>;
    schedules: Array<{
      name: string;
      frequency: string;
      status: string;
    }>;
    policy: {
      dataBoundary: string;
      externalProviderGate: string;
      updateCadence: string;
    };
    pendingGates: string[];
  };
  watchtower?: WatchtowerStatus;
}

export interface HostedChoice {
  id: string;
  workItemId: string;
  workItemVersion: number;
  queueRevision: number;
  predictionLane: string;
  decision: DecisionValue;
  predictedAction: string;
  replacementAction: string | null;
  rationale: string | null;
  state: "pending" | "imported" | "superseded" | "failed";
  createdBy: string;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  canonicalOutcomeId: string | null;
}

export type OperatorRequestType = "execute_local" | "approve" | "defer" | "refresh_evidence";
export type OperatorRequestState = "queued" | "acknowledged" | "completed" | "failed" | "superseded";

export interface OperatorRequest {
  id: string;
  workItemId: string;
  workItemVersion: number;
  queueRevision: number;
  requestType: OperatorRequestType;
  requestedAction: string;
  rationale: string | null;
  state: OperatorRequestState;
  requestedBy: string;
  resolvedBy: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolutionSummary: string | null;
  safeResultRef: string | null;
}

export type OwnerIntentMode = "analyze" | "prepare" | "execute_safe" | "draft_for_approval" | "monitor";
export type OwnerIntentPriority = "P0" | "P1" | "P2" | "P3";
export type OwnerIntentState = "queued" | "acknowledged" | "completed" | "failed" | "superseded";

export interface OwnerIntent {
  id: string;
  batchId: string | null;
  batchIndex: number | null;
  batchSize: number | null;
  clientId: string;
  clientName: string;
  queueRevision: number;
  title: string;
  instruction: string;
  mode: OwnerIntentMode;
  priority: OwnerIntentPriority;
  dueAt: string | null;
  state: OwnerIntentState;
  requestedBy: string;
  resolvedBy: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolutionSummary: string | null;
  safeResultRef: string | null;
}

export interface EvaluationRun {
  id: string;
  queueRevision: number;
  recommendationCount: number;
  labeledChoiceCount: number;
  clientCoverage: number;
  acceptanceRate: number;
  guardrailPassRate: number;
  staleSourceCount: number;
  attentionItemCount: number;
  createdAt: string;
}

export interface StudioPayload {
  snapshot: StudioSnapshot;
  hostedChoices: HostedChoice[];
  operatorRequests: OperatorRequest[];
  ownerIntents: OwnerIntent[];
  evaluations: EvaluationRun[];
  identity: {
    displayName: string;
    email: string;
  } | null;
  overlay: {
    persistedChoices: number;
    totalLabeledChoices: number;
    lastCalibrationAt: string | null;
    lastCalibrationTrigger: string | null;
    queuedOperatorRequests: number;
    queuedOwnerIntents: number;
    lastEvaluationAt: string | null;
  };
  capture?: {
    scope: "client" | "portfolio";
    clientCount: number;
    batchId: string | null;
  };
}
