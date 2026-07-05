// POST /api/ask — RAG endpoint for Momentum 360 Agents.
// Embeds the question, retrieves the top knowledge-base chunks, routes to
// the best-matching specialist agent, and answers with the chat model
// grounded in that context.

import { readFileSync } from "node:fs";

const INDEX = JSON.parse(
  readFileSync(new URL("./ask-data/kb-index.json", import.meta.url), "utf8")
);

const API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const CHAT_MODEL = process.env.OPENAI_MODEL || "gpt-5.5";
const FALLBACK_MODEL = process.env.OPENAI_FALLBACK_MODEL || "gpt-4o";
const LEAD_WEBHOOK_URL = process.env.LEAD_WEBHOOK_URL;

const TOP_CHUNKS = 6;
const MIN_SCORE = 0.2;

// best-effort per-IP rate limit (resets on cold start)
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const windowStart = now - 60_000;
  const list = (hits.get(ip) || []).filter((t) => t > windowStart);
  list.push(now);
  hits.set(ip, list);
  return list.length > 10;
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function openai(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = new Error(`OpenAI ${path} ${res.status}: ${(await res.text()).slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function systemPrompt(agent, contextChunks) {
  const context = contextChunks
    .map((c, i) => `[${i + 1}] ${c.title} — ${c.section}\n${c.text}`)
    .join("\n\n---\n\n");
  return `You are ${agent.name}, a specialist marketing agent at Momentum 360 Agents (squad: ${agent.squad}). ${agent.persona}

Momentum 360 is a Philadelphia-based, Google Partner, Inc. 5000 digital marketing agency serving local service and healthcare businesses nationwide. Phone: (215) 607-6482.

Answer the business owner's question using the playbook context below. Rules:
- Plain English, 6th–8th grade reading level. No jargon, no filler, no hype.
- Be concrete and actionable: numbered steps, specific numbers and timeframes from the playbooks where relevant.
- Keep it under 250 words. Lead with the direct answer, then the steps.
- If the question is outside marketing/growing a business, say so briefly and steer back to what you can help with.
- If a job needs a human crew (shoots, full campaign builds, website rebuilds), say Momentum 360's human team can take the handoff — call (215) 607-6482.
- Never invent client names, prices, or statistics that are not in the context.
- Do not use em dashes or en dashes anywhere; use commas, colons, or periods instead.
- After your answer, on a new line, write ||| followed by 2 short follow-up questions the owner would naturally ask next, separated by |. Keep each under 60 characters.

PLAYBOOK CONTEXT:
${context}`;
}

export default async (req, context) => {
  if (req.method !== "POST") {
    return Response.json({ error: "POST only" }, { status: 405 });
  }
  if (!API_KEY) {
    return Response.json(
      { error: "The agents are not configured yet (missing API key). Call (215) 607-6482." },
      { status: 503 }
    );
  }
  const ip = context.ip || req.headers.get("x-forwarded-for") || "unknown";
  if (rateLimited(ip)) {
    return Response.json(
      { error: "Easy there — a few questions per minute, please. Try again shortly." },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const question = String(body.question || "").trim().slice(0, 1200);
  if (question.length < 5) {
    return Response.json({ error: "Please ask a full question." }, { status: 400 });
  }

  try {
    // 1. embed the question
    const emb = await openai("/embeddings", { model: INDEX.embedModel, input: question });
    const qVec = emb.data[0].embedding;

    // 2. retrieve top chunks + route to the best agent
    const scored = INDEX.chunks
      .map((c) => ({ c, s: cosine(qVec, c.vec) }))
      .sort((a, b) => b.s - a.s);
    const top = scored.slice(0, TOP_CHUNKS).filter((x) => x.s >= MIN_SCORE).map((x) => x.c);
    const agent = INDEX.agents
      .map((a) => ({ a, s: cosine(qVec, a.vec) }))
      .sort((x, y) => y.s - x.s)[0].a;

    // 3. answer, grounded in the retrieved playbook context
    // optional capped history: [{q, a}] pairs from prior turns this session
    const history = Array.isArray(body.history) ? body.history.slice(-2) : [];
    const messages = [
      { role: "system", content: systemPrompt(agent, top) },
      ...history.flatMap((h) => [
        { role: "user", content: String(h.q || "").slice(0, 1200) },
        { role: "assistant", content: String(h.a || "").slice(0, 2400) },
      ]),
      { role: "user", content: question },
    ];
    let completion;
    try {
      completion = await openai("/chat/completions", {
        model: CHAT_MODEL, messages, max_tokens: 700, temperature: 0.4,
      });
    } catch (e) {
      if (e.status === 404 || /model/i.test(String(e.message))) {
        completion = await openai("/chat/completions", {
          model: FALLBACK_MODEL, messages, max_tokens: 700, temperature: 0.4,
        });
      } else throw e;
    }
    const raw = completion.choices[0].message.content.trim();
    const [answerPart, followPart] = raw.split(/\n?\|\|\|/);
    const answer = answerPart.trim();
    const followups = (followPart || "")
      .split("|")
      .map((s) => s.trim())
      .filter((s) => s.length > 5 && s.length < 90)
      .slice(0, 3);

    // 4. optional lead forward (fire-and-forget)
    if (LEAD_WEBHOOK_URL && (body.email || body.name)) {
      fetch(LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: body.name || "", email: body.email || "", phone: body.phone || "",
          business: body.business || "", question,
          agent: agent.name, source: "momentum-360-agents-site",
        }),
      }).catch(() => {});
    }

    return Response.json({
      answer,
      followups,
      agent: { name: agent.name, squad: agent.squad },
      sources: [...new Set(top.map((c) => c.title))],
    });
  } catch (e) {
    console.error("ask error:", e);
    return Response.json(
      { error: "The agents hit a snag answering that. Try again in a minute, or call (215) 607-6482." },
      { status: 502 }
    );
  }
};

export const config = { path: "/api/ask" };
