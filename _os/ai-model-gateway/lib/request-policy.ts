export const GPT_56_REASONING_EFFORTS = [
  "none",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
] as const;

export type Gpt56ReasoningEffort =
  (typeof GPT_56_REASONING_EFFORTS)[number];

const GPT_56_MODELS = new Set([
  "openai/gpt-5.6-sol",
  "openai/gpt-5.6-terra",
  "openai/gpt-5.6-luna",
]);

const EFFORTS = new Set<string>(GPT_56_REASONING_EFFORTS);
const PRO_EFFORTS = new Set<string>(["medium", "high", "xhigh", "max"]);

export class RequestPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestPolicyError";
  }
}

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeModelId(model: string): string {
  const trimmed = model.trim();

  if (trimmed === "gpt-5.6") {
    return "openai/gpt-5.6-sol";
  }

  if (
    trimmed === "gpt-5.6-sol" ||
    trimmed === "gpt-5.6-terra" ||
    trimmed === "gpt-5.6-luna"
  ) {
    return `openai/${trimmed}`;
  }

  return trimmed;
}

function validateProviderModel(model: string): void {
  if (!model.includes("/")) {
    throw new RequestPolicyError(
      "Vercel AI Gateway model IDs must use provider/model format.",
    );
  }
}

function validateEffort(value: unknown, field: string): void {
  if (value !== undefined && (typeof value !== "string" || !EFFORTS.has(value))) {
    throw new RequestPolicyError(
      `${field} must be one of: ${GPT_56_REASONING_EFFORTS.join(", ")}.`,
    );
  }
}

function validateResponsesRequest(body: JsonObject): void {
  const reasoning = body.reasoning;
  if (reasoning === undefined) {
    return;
  }

  if (!isObject(reasoning)) {
    throw new RequestPolicyError("reasoning must be an object.");
  }

  validateEffort(reasoning.effort, "reasoning.effort");

  if (reasoning.mode !== undefined && reasoning.mode !== "pro") {
    throw new RequestPolicyError(
      'reasoning.mode is optional; when set, it must be "pro".',
    );
  }

  if (reasoning.mode === "pro") {
    const effort = reasoning.effort ?? "medium";
    if (typeof effort !== "string" || !PRO_EFFORTS.has(effort)) {
      throw new RequestPolicyError(
        "GPT-5.6 Pro mode supports medium, high, xhigh, or max effort.",
      );
    }
  }
}

function validateChatCompletionsRequest(body: JsonObject): void {
  validateEffort(body.reasoning_effort, "reasoning_effort");

  const hasFunctionTools =
    Array.isArray(body.tools) &&
    body.tools.some(
      (tool) => isObject(tool) && (tool.type === "function" || "function" in tool),
    );

  const effectiveEffort = body.reasoning_effort ?? "medium";
  if (hasFunctionTools && effectiveEffort !== "none") {
    throw new RequestPolicyError(
      "GPT-5.6 Chat Completions function tools require reasoning_effort none. Use /v1/responses for reasoning with tools.",
    );
  }
}

export function normalizeAndValidateJsonBody(
  gatewayPath: string,
  value: unknown,
): unknown {
  if (!isObject(value)) {
    return value;
  }

  if (typeof value.model !== "string") {
    return value;
  }

  const model = normalizeModelId(value.model);
  validateProviderModel(model);

  const body: JsonObject = { ...value, model };
  if (!GPT_56_MODELS.has(model)) {
    return body;
  }

  if (gatewayPath === "v1/responses") {
    validateResponsesRequest(body);
  } else if (gatewayPath === "v1/chat/completions") {
    validateChatCompletionsRequest(body);
  }

  return body;
}

export function isAllowedGatewayPath(path: string): boolean {
  if (!/^[A-Za-z0-9._~/-]+$/.test(path) || path.includes("..")) {
    return false;
  }

  return (
    path === "v1/models" ||
    path.startsWith("v1/models/") ||
    path === "v1/responses" ||
    path.startsWith("v1/responses/") ||
    path === "v1/chat/completions" ||
    path === "v1/embeddings" ||
    path === "v1/images/generations" ||
    path === "v1/moderations" ||
    path.startsWith("v4/ai/")
  );
}
