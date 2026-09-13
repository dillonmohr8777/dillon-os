import { getUpstreamCredential } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const upstream = getUpstreamCredential();

  return Response.json(
    {
      status: "ok",
      clientAccessConfigured: Boolean(
        process.env.MODEL_GATEWAY_ACCESS_TOKEN?.trim(),
      ),
      upstreamAccessConfigured: upstream.ok,
      upstreamAccessMode: upstream.ok ? upstream.source : "none",
    },
    {
      headers: {
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      },
    },
  );
}
