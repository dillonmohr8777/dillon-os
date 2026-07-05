// POST /api/lead — captures a lead after an answer (conversion rail, report
// card, gated demos). Forwards to LEAD_WEBHOOK_URL when configured.

const LEAD_WEBHOOK_URL = process.env.LEAD_WEBHOOK_URL;

const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => t > now - 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 6;
}

export default async (req, context) => {
  if (req.method !== "POST") return Response.json({ error: "POST only" }, { status: 405 });
  const ip = context.ip || req.headers.get("x-forwarded-for") || "unknown";
  if (rateLimited(ip)) return Response.json({ error: "Too many requests" }, { status: 429 });

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const email = String(body.email || "").trim().slice(0, 200);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: "Please add a valid email." }, { status: 400 });
  }
  const payload = {
    email,
    phone: String(body.phone || "").trim().slice(0, 40),
    name: String(body.name || "").trim().slice(0, 120),
    business: String(body.business || "").trim().slice(0, 160),
    question: String(body.question || "").trim().slice(0, 1200),
    agent: String(body.agent || "").trim().slice(0, 80),
    source: String(body.source || "momentum-360-agents-site").slice(0, 80),
    at: new Date().toISOString(),
  };
  if (LEAD_WEBHOOK_URL) {
    try {
      await fetch(LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error("lead webhook failed:", e);
    }
  } else {
    console.log("lead (no webhook configured):", JSON.stringify(payload));
  }
  return Response.json({ ok: true });
};

export const config = { path: "/api/lead" };
