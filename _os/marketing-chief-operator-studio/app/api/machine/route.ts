import { NextResponse } from "next/server";
import { loadStudioPayload, resolveHostedChoice, resolveOperatorRequest, resolveOwnerIntent, syncStudioSnapshot } from "@/app/studio-store";
import { runtimeValue } from "@/app/runtime-env";

export const dynamic = "force-dynamic";

const machineIdentity = {
  displayName: "Marketing Chief Windows",
  email: "marketing-chief-windows@local"
};

async function authorized(request: Request) {
  const expected = runtimeValue("MC_MACHINE_SYNC_TOKEN");
  const authorization = request.headers.get("authorization") ?? "";
  const provided = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (expected.length < 32 || provided.length < 32) return false;
  const encoder = new TextEncoder();
  const [expectedHash, providedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
    crypto.subtle.digest("SHA-256", encoder.encode(provided))
  ]);
  const left = new Uint8Array(expectedHash);
  const right = new Uint8Array(providedHash);
  let difference = left.length ^ right.length;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

export async function GET(request: Request) {
  if (!await authorized(request)) return NextResponse.json({ error: "Machine authentication is required." }, { status: 401 });
  try {
    const payload = await loadStudioPayload(null);
    return NextResponse.json({
      schemaVersion: 1,
      snapshot: payload.snapshot,
      hostedChoices: payload.hostedChoices,
      operatorRequests: payload.operatorRequests,
      ownerIntents: payload.ownerIntents,
      evaluations: payload.evaluations,
      overlay: payload.overlay
    }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Machine sync is temporarily unavailable." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await authorized(request)) return NextResponse.json({ error: "Machine authentication is required." }, { status: 401 });
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 2_100_000) return NextResponse.json({ error: "Machine sync payload is too large." }, { status: 413 });
    const candidate: unknown = await request.json();
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      return NextResponse.json({ error: "A machine sync object is required." }, { status: 400 });
    }
    const body = candidate as Record<string, unknown>;
    const action = String(body.action ?? "");
    if (action === "sync-snapshot") {
      return NextResponse.json({ ok: true, snapshot: await syncStudioSnapshot(body.snapshot) });
    }
    if (action === "resolve-choice") {
      const payload = await resolveHostedChoice(body, machineIdentity);
      const choiceId = String(body.id ?? "");
      return NextResponse.json({
        ok: true,
        hostedChoice: payload.hostedChoices.find((item) => item.id === choiceId) ?? null
      });
    }
    if (action === "resolve-operator") {
      const payload = await resolveOperatorRequest(body, machineIdentity);
      const requestId = String(body.id ?? "");
      return NextResponse.json({
        ok: true,
        operatorRequest: payload.operatorRequests.find((item) => item.id === requestId) ?? null
      });
    }
    if (action === "resolve-intent") {
      const payload = await resolveOwnerIntent(body, machineIdentity);
      const intentId = String(body.id ?? "");
      return NextResponse.json({
        ok: true,
        ownerIntent: payload.ownerIntents.find((item) => item.id === intentId) ?? null
      });
    }
    return NextResponse.json({ error: "The machine sync action is unavailable." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Machine sync failed.";
    const isValidationError = /required|large|prohibited|shape|stale|allowlisted|not found|resolution|intent/i.test(message);
    return NextResponse.json(
      { error: isValidationError ? message : "Machine sync is temporarily unavailable." },
      { status: isValidationError ? 400 : 500 }
    );
  }
}
