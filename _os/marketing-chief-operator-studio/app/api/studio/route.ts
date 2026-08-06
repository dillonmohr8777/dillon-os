import { NextResponse } from "next/server";
import { getChatGPTUser, isStudioOwner } from "@/app/chatgpt-auth";
import {
  captureOwnerIntent,
  loadStudioPayload,
  recordHostedChoice,
  recordOperatorRequest
} from "@/app/studio-store";

export const dynamic = "force-dynamic";

async function identity() {
  const user = await getChatGPTUser();
  if (!user || !isStudioOwner(user.email)) return null;
  return { displayName: user.displayName, email: user.email };
}

export async function GET() {
  try {
    const owner = await identity();
    if (!owner) return NextResponse.json({ error: "Owner authentication is required." }, { status: 401 });
    return NextResponse.json(await loadStudioPayload(owner), { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Studio storage is temporarily unavailable." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const owner = await identity();
    if (!owner) return NextResponse.json({ error: "Owner authentication is required." }, { status: 401 });
    const candidate: unknown = await request.json();
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      return NextResponse.json({ error: "A choice object is required." }, { status: 400 });
    }
    const body = candidate as Record<string, unknown>;
    const action = String(body.action ?? "record-choice");
    if (action === "record-choice") return NextResponse.json(await recordHostedChoice(body, owner));
    if (action === "request-operator") return NextResponse.json(await recordOperatorRequest(body, owner));
    if (action === "capture-intent") return NextResponse.json(await captureOwnerIntent(body, owner));
    return NextResponse.json({ error: "The requested Studio action is unavailable." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Choice could not be recorded.";
    const isValidationError = /stale|choose|required|too long|eligible|waiting|available|not found|allowlisted|intent|client|priority|mode|secrets|codes|credential/i.test(message);
    return NextResponse.json(
      { error: isValidationError ? message : "Choice storage is temporarily unavailable." },
      { status: isValidationError ? 400 : 500 }
    );
  }
}
