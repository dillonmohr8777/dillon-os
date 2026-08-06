import seedSnapshot from "@/data/seed-snapshot.json";
import type { StudioSnapshot, WatchtowerStatus } from "./studio-types";

const dynamicRecordPaths = new Set([
  "queue.statusCounts",
  "learning.correctionCategories",
  "learning.decisionCounts"
]);
const forbiddenFieldNames = new Set([
  "authorization",
  "channelid",
  "cookie",
  "lastsummary",
  "logs",
  "logtext",
  "messagebody",
  "messagecontent",
  "messagetext",
  "password",
  "permalink",
  "rawcontent",
  "rawmessage",
  "sourcelocator",
  "stderr",
  "stdout",
  "token",
  "transcript",
  "userid",
  "workeroutput"
]);
const directSlackReference =
  /(?:https?:\/\/[A-Za-z0-9.-]*slack\.com\/(?:archives|files)\/|(?:^|[^A-Za-z0-9])[UWGCD][A-Z0-9]{8,15}(?=$|[^A-Za-z0-9]))/;
const safeDynamicKey = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,79}$/;
const safeCategory = /^[a-z0-9][a-z0-9_.:-]{0,119}$/;
const safeClientId = /^[a-z0-9][a-z0-9-]{0,79}$/;
const safeSignalId = /^intake-[a-z0-9]{8,80}$/;
const safeEpisodeId = /^(?:episode|run|watchtower)-[A-Za-z0-9][A-Za-z0-9._-]{0,119}$/;
const watchtowerStatuses = new Set(["active", "polling", "delayed", "paused", "degraded", "unavailable"]);
const processStates = new Set(["healthy", "active", "ready", "running", "queued", "waiting", "idle", "blocked", "warning", "delayed", "paused", "degraded", "unavailable", "complete"]);
const signalChannels = new Set(["slack", "gmail", "inbox", "unknown"]);
const signalStates = new Set(["pending", "quarantined", "resolved", "acknowledged"]);
const stageIds = new Set(["watch", "route", "prioritize", "build", "verify", "learn", "final_gate"]);
const seed = seedSnapshot as unknown as Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasMaterialValue(value: unknown) {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (isRecord(value)) return Object.keys(value).length > 0;
  return true;
}

function assertNoPrivatePayload(value: unknown, depth = 0) {
  if (depth > 20) throw new Error("The hosted snapshot is nested too deeply.");
  if (typeof value === "string") {
    if (value.length > 20_000) throw new Error("The hosted snapshot contains oversized text.");
    if (directSlackReference.test(value)) {
      throw new Error("The hosted snapshot contains a prohibited direct Slack reference.");
    }
    return;
  }
  if (Array.isArray(value)) {
    if (value.length > 5_000) throw new Error("The hosted snapshot contains an oversized list.");
    for (const item of value) assertNoPrivatePayload(item, depth + 1);
    return;
  }
  if (!isRecord(value)) return;
  if (Object.keys(value).length > 500) throw new Error("The hosted snapshot contains an oversized object.");
  for (const [key, nested] of Object.entries(value)) {
    if (forbiddenFieldNames.has(key.toLocaleLowerCase()) && hasMaterialValue(nested)) {
      throw new Error(`The hosted snapshot contains prohibited private telemetry: ${key}.`);
    }
    assertNoPrivatePayload(nested, depth + 1);
  }
}

function scalar(value: unknown): string | number | boolean | null | undefined {
  if (value === null) return null;
  if (typeof value === "string") return value.slice(0, 20_000);
  if (typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return undefined;
}

function alternativeTemplate(path: string): unknown {
  if (path === "recommendations.nextAutomatic") {
    const recommendations = seed.recommendations as Record<string, unknown>;
    return recommendations.nextDecision ?? (recommendations.ranked as unknown[])[0];
  }
  return undefined;
}

function projectAllowlisted(value: unknown, template: unknown, path: string): unknown {
  if (dynamicRecordPaths.has(path)) {
    if (!isRecord(value)) return {};
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => safeDynamicKey.test(key))
        .slice(0, 200)
        .flatMap(([key, nested]) => {
          const projected = scalar(nested);
          return projected === undefined ? [] : [[key, projected]];
        })
    );
  }

  if (Array.isArray(template)) {
    if (!Array.isArray(value)) return [];
    const itemTemplate = template[0];
    if (itemTemplate === undefined) {
      return value.slice(0, 5_000).flatMap((item) => {
        const projected = scalar(item);
        return projected === undefined ? [] : [projected];
      });
    }
    return value.slice(0, 5_000).map((item) => projectAllowlisted(item, itemTemplate, `${path}[]`));
  }

  if (isRecord(template)) {
    if (!isRecord(value)) return {};
    const output: Record<string, unknown> = {};
    for (const key of Object.keys(template)) {
      if (!(key in value)) continue;
      output[key] = projectAllowlisted(value[key], template[key], path ? `${path}.${key}` : key);
    }
    return output;
  }

  if (template === null) {
    const alternate = alternativeTemplate(path);
    if (alternate !== undefined && isRecord(value)) return projectAllowlisted(value, alternate, path);
    return scalar(value) ?? null;
  }

  if (typeof template === "number") {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }
  if (typeof template === "boolean") return value === true;
  if (typeof template === "string") return typeof value === "string" ? value.slice(0, 20_000) : String(value ?? "");
  return undefined;
}

function isoDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null;
}

function category(value: unknown, fallback: string) {
  const candidate = String(value ?? "").trim().toLocaleLowerCase();
  return safeCategory.test(candidate) ? candidate : fallback;
}

function boundedInteger(value: unknown, maximum = 1_000_000) {
  const numeric = Number(value);
  return Number.isSafeInteger(numeric) && numeric >= 0 && numeric <= maximum ? numeric : 0;
}

function exitCode(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= -2_147_483_648 && numeric <= 2_147_483_647
    ? numeric
    : null;
}

function sanitizeWatchtower(value: unknown): WatchtowerStatus | undefined {
  if (!isRecord(value)) return undefined;
  const slack = isRecord(value.slack) ? value.slack : {};
  const worker = isRecord(value.worker) ? value.worker : {};
  const intake = isRecord(value.intake) ? value.intake : {};
  const status = category(value.status, "unavailable");
  const stages = Array.isArray(value.stages)
    ? value.stages.flatMap((candidate) => {
        if (!isRecord(candidate)) return [];
        const id = category(candidate.id, "");
        const state = category(candidate.state, "unavailable");
        if (!stageIds.has(id) || !processStates.has(state)) return [];
        return [{ id, state, observedAt: isoDate(candidate.observedAt) }];
      }).filter((stage, index, all) => all.findIndex((candidate) => candidate.id === stage.id) === index)
    : [];
  const signals = Array.isArray(value.signals)
    ? value.signals.slice(0, 20).flatMap((candidate) => {
        if (!isRecord(candidate)) return [];
        const id = String(candidate.id ?? "");
        const sourceChannel = category(candidate.sourceChannel, "unknown");
        const state = category(candidate.state, "");
        const receivedAt = isoDate(candidate.receivedAt);
        const clientId = candidate.clientId === null ? null : String(candidate.clientId ?? "");
        const clientName = candidate.clientName === null ? null : String(candidate.clientName ?? "").slice(0, 160);
        const quarantineReason = candidate.quarantineReason === null
          ? null
          : category(candidate.quarantineReason, "unreported");
        if (
          !safeSignalId.test(id) ||
          !receivedAt ||
          !signalChannels.has(sourceChannel) ||
          !signalStates.has(state) ||
          (clientId !== null && !safeClientId.test(clientId))
        ) return [];
        return [{
          id,
          receivedAt,
          sourceChannel,
          clientId,
          clientName,
          route: category(candidate.route, "unreported"),
          state,
          quarantineReason
        }];
      })
    : [];
  const lastEpisodeId = worker.lastEpisodeId === null || worker.lastEpisodeId === undefined
    ? null
    : String(worker.lastEpisodeId);

  return {
    observedAt: isoDate(value.observedAt),
    status: (watchtowerStatuses.has(status) ? status : "unavailable") as WatchtowerStatus["status"],
    policyVersion: category(value.policyVersion, "unreported"),
    slack: {
      state: processStates.has(category(slack.state, "unavailable")) ? category(slack.state, "unavailable") : "unavailable",
      mode: "read-only",
      intervalMinutes: boundedInteger(slack.intervalMinutes, 1_440),
      lastPollAt: isoDate(slack.lastPollAt),
      nextPollAt: isoDate(slack.nextPollAt),
      lastResult: exitCode(slack.lastResult)
    },
    worker: {
      state: processStates.has(category(worker.state, "unavailable")) ? category(worker.state, "unavailable") : "unavailable",
      intervalMinutes: boundedInteger(worker.intervalMinutes, 1_440),
      lastRunAt: isoDate(worker.lastRunAt),
      nextRunAt: isoDate(worker.nextRunAt),
      lastResult: exitCode(worker.lastResult),
      lastEpisodeId: lastEpisodeId && safeEpisodeId.test(lastEpisodeId) ? lastEpisodeId : null
    },
    intake: {
      pending: boundedInteger(intake.pending),
      quarantined: boundedInteger(intake.quarantined),
      resolved: boundedInteger(intake.resolved),
      acknowledged: boundedInteger(intake.acknowledged),
      occurrenceDuplicates: boundedInteger(intake.occurrenceDuplicates),
      semanticDuplicates: boundedInteger(intake.semanticDuplicates)
    },
    stages: stages as WatchtowerStatus["stages"],
    signals: signals as WatchtowerStatus["signals"]
  };
}

export function sanitizeSnapshotForPersistence(input: unknown): StudioSnapshot {
  if (!isRecord(input)) throw new Error("A hosted snapshot object is required.");
  assertNoPrivatePayload(input);
  const projected = projectAllowlisted(input, seed, "") as Record<string, unknown>;
  const watchtower = sanitizeWatchtower(input.watchtower);
  if (watchtower) projected.watchtower = watchtower;
  return projected as unknown as StudioSnapshot;
}
