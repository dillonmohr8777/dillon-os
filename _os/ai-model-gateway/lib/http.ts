export function jsonError(message: string, status: number): Response {
  return Response.json(
    {
      error: {
        message,
        type: "model_gateway_error",
      },
    },
    {
      status,
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}

const REQUEST_HEADERS = new Set([
  "accept",
  "ai-model-id",
  "content-type",
  "idempotency-key",
  "openai-beta",
  "x-client-request-id",
]);

export function upstreamRequestHeaders(
  request: Request,
  credential: string,
): Headers {
  const headers = new Headers({
    authorization: `Bearer ${credential}`,
  });

  for (const [name, value] of request.headers.entries()) {
    if (REQUEST_HEADERS.has(name.toLowerCase())) {
      headers.set(name, value);
    }
  }

  return headers;
}

const RESPONSE_HEADERS = new Set([
  "cache-control",
  "content-disposition",
  "content-length",
  "content-type",
  "etag",
  "retry-after",
  "x-request-id",
]);

export function downstreamResponseHeaders(upstream: Headers): Headers {
  const headers = new Headers();

  for (const [name, value] of upstream.entries()) {
    const normalized = name.toLowerCase();
    if (
      RESPONSE_HEADERS.has(normalized) ||
      normalized.startsWith("x-ratelimit-") ||
      normalized.startsWith("openai-")
    ) {
      headers.set(name, value);
    }
  }

  headers.set("x-content-type-options", "nosniff");
  return headers;
}
