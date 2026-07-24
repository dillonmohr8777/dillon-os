import { timingSafeEqual } from "node:crypto";

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export type AuthorizationResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; message: string };

export function authorizeClient(request: Request): AuthorizationResult {
  const expected = process.env.MODEL_GATEWAY_ACCESS_TOKEN?.trim();
  if (!expected) {
    return {
      ok: false,
      status: 503,
      message:
        "Gateway access is not configured. Set MODEL_GATEWAY_ACCESS_TOKEN in Vercel.",
    };
  }

  const header = request.headers.get("authorization");
  const provided = header?.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (!provided || !safeEqual(provided, expected)) {
    return {
      ok: false,
      status: 401,
      message: "Missing or invalid bearer token.",
    };
  }

  return { ok: true };
}

export function getUpstreamCredential():
  | { ok: true; value: string; source: "api-key" | "oidc" }
  | { ok: false } {
  const apiKey = process.env.AI_GATEWAY_API_KEY?.trim();
  if (apiKey) {
    return { ok: true, value: apiKey, source: "api-key" };
  }

  const oidc = process.env.VERCEL_OIDC_TOKEN?.trim();
  if (oidc) {
    return { ok: true, value: oidc, source: "oidc" };
  }

  return { ok: false };
}
