import { authorizeClient, getUpstreamCredential } from "@/lib/auth";
import {
  downstreamResponseHeaders,
  jsonError,
  upstreamRequestHeaders,
} from "@/lib/http";
import {
  isAllowedGatewayPath,
  normalizeAndValidateJsonBody,
  RequestPolicyError,
} from "@/lib/request-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

const GATEWAY_ORIGIN = "https://ai-gateway.vercel.sh";
const BODY_METHODS = new Set(["POST", "PUT", "PATCH"]);

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function gatewayBody(
  request: Request,
  path: string,
): Promise<BodyInit | undefined> {
  if (!BODY_METHODS.has(request.method)) {
    return undefined;
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (
    contentType.includes("application/json") &&
    (path === "v1/responses" || path === "v1/chat/completions")
  ) {
    const body = await request.json();
    return JSON.stringify(normalizeAndValidateJsonBody(path, body));
  }

  return request.arrayBuffer();
}

async function handler(request: Request, context: RouteContext): Promise<Response> {
  const authorization = authorizeClient(request);
  if (!authorization.ok) {
    return jsonError(authorization.message, authorization.status);
  }

  const upstreamCredential = getUpstreamCredential();
  if (!upstreamCredential.ok) {
    return jsonError(
      "No Vercel AI Gateway credential is available. Enable AI Gateway OIDC or set AI_GATEWAY_API_KEY.",
      503,
    );
  }

  const { path: segments } = await context.params;
  const path = segments.join("/");
  if (!isAllowedGatewayPath(path)) {
    return jsonError("This AI Gateway endpoint is not allowed.", 404);
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(`/${path}`, GATEWAY_ORIGIN);
  upstreamUrl.search = incomingUrl.search;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers: upstreamRequestHeaders(request, upstreamCredential.value),
      body: await gatewayBody(request, path),
      redirect: "manual",
      cache: "no-store",
    });

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: downstreamResponseHeaders(upstream.headers),
    });
  } catch (error) {
    if (error instanceof RequestPolicyError) {
      return jsonError(error.message, 400);
    }

    if (error instanceof SyntaxError) {
      return jsonError("Request body must be valid JSON.", 400);
    }

    return jsonError("The upstream AI Gateway request failed.", 502);
  }
}

export const GET = handler;
export const POST = handler;
export const DELETE = handler;
