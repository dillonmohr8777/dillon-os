import { authorizeClient } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { GPT_56_REASONING_EFFORTS } from "@/lib/request-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type GatewayModel = {
  id: string;
  name?: string;
  owned_by?: string;
  type?: string;
};

type GatewayCatalog = {
  data?: GatewayModel[];
};

export async function GET(request: Request): Promise<Response> {
  const authorization = authorizeClient(request);
  if (!authorization.ok) {
    return jsonError(authorization.message, authorization.status);
  }

  try {
    const response = await fetch("https://ai-gateway.vercel.sh/v1/models", {
      cache: "no-store",
    });

    if (!response.ok) {
      return jsonError("Vercel AI Gateway catalog is unavailable.", 502);
    }

    const payload = (await response.json()) as GatewayCatalog;
    const models = Array.isArray(payload.data) ? payload.data : [];
    const providerCounts = models.reduce<Record<string, number>>((counts, model) => {
      const provider = model.id.split("/")[0] || "unknown";
      counts[provider] = (counts[provider] ?? 0) + 1;
      return counts;
    }, {});

    const gpt56 = models
      .filter((model) => /^openai\/gpt-5\.6-(sol|terra|luna)$/.test(model.id))
      .map((model) => ({
        ...model,
        reasoningEfforts: GPT_56_REASONING_EFFORTS,
        defaultReasoningEffort: "medium",
        responsesApi: true,
      }));

    return Response.json(
      {
        object: "gateway.catalog",
        generatedAt: new Date().toISOString(),
        total: models.length,
        providerCounts,
        gpt56,
        models,
        notes: [
          "Catalog presence means the model is supported by Vercel AI Gateway.",
          "Successful inference also requires Vercel project credits and any applicable provider eligibility.",
        ],
      },
      {
        headers: {
          "cache-control": "private, no-store",
          "x-content-type-options": "nosniff",
        },
      },
    );
  } catch {
    return jsonError("Vercel AI Gateway catalog is unavailable.", 502);
  }
}
