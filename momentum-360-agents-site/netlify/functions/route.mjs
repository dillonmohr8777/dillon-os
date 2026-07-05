// POST /api/route — lightweight "who would take this question" preview.
// Embeds the draft question and returns the best-matching agent persona.

import { readFileSync } from "node:fs";

const INDEX = JSON.parse(
  readFileSync(new URL("./ask-data/kb-index.json", import.meta.url), "utf8")
);

const API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");

const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => t > now - 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 20;
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export default async (req, context) => {
  if (req.method !== "POST") return Response.json({ error: "POST only" }, { status: 405 });
  if (!API_KEY) return Response.json({}, { status: 503 });
  const ip = context.ip || req.headers.get("x-forwarded-for") || "unknown";
  if (rateLimited(ip)) return Response.json({}, { status: 429 });

  let body;
  try { body = await req.json(); } catch { return Response.json({}, { status: 400 }); }
  const question = String(body.question || "").trim().slice(0, 300);
  if (question.length < 8) return Response.json({}, { status: 400 });

  try {
    const res = await fetch(`${BASE_URL}/embeddings`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({ model: INDEX.embedModel, input: question }),
    });
    if (!res.ok) return Response.json({}, { status: 502 });
    const qVec = (await res.json()).data[0].embedding;
    const best = INDEX.agents
      .map((a) => ({ a, s: cosine(qVec, a.vec) }))
      .sort((x, y) => y.s - x.s)[0].a;
    return Response.json({ name: best.name, squad: best.squad });
  } catch {
    return Response.json({}, { status: 502 });
  }
};

export const config = { path: "/api/route" };
