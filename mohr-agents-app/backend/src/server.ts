import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import { agents, publicCatalog, type AgentConfig } from "./agents.js";
import { accountUUID, issueSessionToken, verifyAppleIdentityToken, verifySessionToken } from "./auth.js";
import { handleAppStoreNotification, isSubscribed } from "./entitlements.js";

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY
const app = express();
app.use(express.json({ limit: "1mb" }));

// ---- auth ------------------------------------------------------------------

app.post("/v1/auth/apple", async (req, res) => {
  try {
    const { identity_token } = req.body ?? {};
    if (typeof identity_token !== "string") {
      return res.status(400).json({ error: "identity_token required" });
    }
    const userId = await verifyAppleIdentityToken(identity_token);
    res.json({
      token: issueSessionToken(userId),
      // Set as StoreKit's appAccountToken so App Store Server Notifications
      // map back to this user (entitlements.ts keys on it).
      app_account_token: accountUUID(userId),
    });
  } catch {
    res.status(401).json({ error: "invalid Apple identity token" });
  }
});

function requireAuth(req: express.Request): string | null {
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  return token ? verifySessionToken(token) : null;
}

// ---- catalog ---------------------------------------------------------------

app.get("/v1/agents", (_req, res) => {
  res.json({ agents: publicCatalog() });
});

// ---- chat ------------------------------------------------------------------

interface IncomingMessage {
  role: "user" | "assistant";
  text: string;
}

interface ChatTurn {
  agent: AgentConfig;
  system: string;
  history: { role: "user" | "assistant"; content: string }[];
}

// Shared validation for both chat endpoints. Writes the error response and
// returns null when the request is not serviceable.
function prepareChatTurn(req: express.Request, res: express.Response): ChatTurn | null {
  const userId = requireAuth(req);
  if (!userId) {
    res.status(401).json({ error: "sign in required" });
    return null;
  }
  if (!isSubscribed(accountUUID(userId))) {
    res.status(402).json({ error: "subscription required" });
    return null;
  }

  const agent = agents.get(req.params.id);
  if (!agent) {
    res.status(404).json({ error: "unknown agent" });
    return null;
  }

  const incoming: IncomingMessage[] = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const history = incoming
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
    .slice(-20) // cap context per request
    .map((m) => ({ role: m.role, content: m.text }));
  if (history.length === 0 || history[history.length - 1].role !== "user") {
    res.status(400).json({ error: "messages must end with a user message" });
    return null;
  }

  const business = typeof req.body?.business === "string" ? req.body.business : null;
  const system = business
    ? `${agent.system}\n\nBusiness context provided by the user: ${business}`
    : agent.system;

  return { agent, system, history };
}

function chatParams({ agent, system, history }: ChatTurn) {
  return {
    model: "claude-fable-5",
    max_tokens: 2048,
    betas: ["server-side-fallback-2026-06-01"],
    fallbacks: [{ model: "claude-opus-4-8" }],
    output_config: { effort: agent.effort },
    system: [{ type: "text" as const, text: system, cache_control: { type: "ephemeral" as const } }],
    messages: history,
  };
}

const REFUSAL_REPLY =
  "I can't help with that one — try rephrasing, or ask me something about your marketing.";
const ERROR_REPLY = "The agent hit a snag — try again in a moment.";

app.post("/v1/agents/:id/messages", async (req, res) => {
  const turn = prepareChatTurn(req, res);
  if (!turn) return;

  try {
    const response = await anthropic.beta.messages.create(chatParams(turn));
    if (response.stop_reason === "refusal") {
      return res.json({ reply: REFUSAL_REPLY });
    }
    const reply = response.content
      .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");
    res.json({ reply });
  } catch (error) {
    console.error(`agent ${turn.agent.id} error:`, error);
    res.status(502).json({ error: ERROR_REPLY });
  }
});

// SSE variant: emits `data: {"delta": "..."}` chunks, then `data: {"done": true}`.
app.post("/v1/agents/:id/messages/stream", async (req, res) => {
  const turn = prepareChatTurn(req, res);
  if (!turn) return;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const emit = (event: object) => res.write(`data: ${JSON.stringify(event)}\n\n`);

  try {
    const stream = anthropic.beta.messages.stream(chatParams(turn));
    stream.on("text", (delta) => emit({ delta }));
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") emit({ delta: REFUSAL_REPLY });
    emit({ done: true });
  } catch (error) {
    console.error(`agent ${turn.agent.id} stream error:`, error);
    emit({ error: ERROR_REPLY });
  }
  res.end();
});

// ---- App Store Server Notifications V2 --------------------------------------

app.post("/v1/webhooks/appstore", (req, res) => {
  try {
    handleAppStoreNotification(req.body ?? {});
  } catch (error) {
    console.error("appstore webhook error:", error);
  }
  res.sendStatus(200); // always ack; Apple retries on non-2xx
});

app.get("/healthz", (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => console.log(`mohr-agents backend on :${port}`));
