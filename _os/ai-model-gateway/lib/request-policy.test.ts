import { describe, expect, it } from "vitest";

import {
  GPT_56_REASONING_EFFORTS,
  isAllowedGatewayPath,
  normalizeAndValidateJsonBody,
  normalizeModelId,
  RequestPolicyError,
} from "./request-policy";

describe("normalizeModelId", () => {
  it("maps the GPT-5.6 alias to the gateway Sol slug", () => {
    expect(normalizeModelId("gpt-5.6")).toBe("openai/gpt-5.6-sol");
  });

  it("adds the OpenAI provider to GPT-5.6 tier slugs", () => {
    expect(normalizeModelId("gpt-5.6-terra")).toBe(
      "openai/gpt-5.6-terra",
    );
  });
});

describe("GPT-5.6 request policy", () => {
  it.each(GPT_56_REASONING_EFFORTS)(
    "accepts Responses effort %s",
    (effort) => {
      expect(
        normalizeAndValidateJsonBody("v1/responses", {
          model: "gpt-5.6-sol",
          reasoning: { effort },
          input: "Hello",
        }),
      ).toMatchObject({
        model: "openai/gpt-5.6-sol",
        reasoning: { effort },
      });
    },
  );

  it("accepts Pro mode at medium and above", () => {
    expect(
      normalizeAndValidateJsonBody("v1/responses", {
        model: "openai/gpt-5.6-sol",
        reasoning: { mode: "pro", effort: "max" },
      }),
    ).toMatchObject({
      reasoning: { mode: "pro", effort: "max" },
    });
  });

  it("rejects Pro mode at low effort", () => {
    expect(() =>
      normalizeAndValidateJsonBody("v1/responses", {
        model: "openai/gpt-5.6-sol",
        reasoning: { mode: "pro", effort: "low" },
      }),
    ).toThrow(RequestPolicyError);
  });

  it("requires none for Chat Completions function tools", () => {
    expect(() =>
      normalizeAndValidateJsonBody("v1/chat/completions", {
        model: "openai/gpt-5.6-sol",
        tools: [{ type: "function", function: { name: "lookup" } }],
      }),
    ).toThrow(/require reasoning_effort none/);
  });

  it("allows Chat Completions function tools at none", () => {
    expect(
      normalizeAndValidateJsonBody("v1/chat/completions", {
        model: "openai/gpt-5.6-luna",
        reasoning_effort: "none",
        tools: [{ type: "function", function: { name: "lookup" } }],
      }),
    ).toMatchObject({
      model: "openai/gpt-5.6-luna",
      reasoning_effort: "none",
    });
  });

  it("requires provider/model format for other models", () => {
    expect(() =>
      normalizeAndValidateJsonBody("v1/responses", {
        model: "claude-opus",
      }),
    ).toThrow(/provider\/model/);
  });
});

describe("gateway path allowlist", () => {
  it.each([
    "v1/models",
    "v1/responses",
    "v1/responses/resp_123",
    "v1/chat/completions",
    "v1/embeddings",
    "v1/images/generations",
    "v4/ai/speech-model",
    "v4/ai/transcription-model",
  ])("allows %s", (path) => {
    expect(isAllowedGatewayPath(path)).toBe(true);
  });

  it.each(["v1/files", "v1/../admin", "v2/responses", "v4/settings"])(
    "rejects %s",
    (path) => {
      expect(isAllowedGatewayPath(path)).toBe(false);
    },
  );
});
