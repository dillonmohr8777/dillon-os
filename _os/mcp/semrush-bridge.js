#!/usr/bin/env node
/**
 * Semrush MCP stdio bridge.
 *
 * Cursor's remote MCP client prefers Semrush OAuth discovery and often ignores
 * static Authorization headers. This bridge speaks MCP over stdio and forwards
 * JSON-RPC to https://mcp.semrush.com/v2/mcp with Authorization: Apikey …
 *
 * Key resolution order:
 *   1. SEMRUSH_API_KEY env
 *   2. 12_Brain/private/access/semrush-api.md (gitignored vault note)
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { Buffer } = require("buffer");

const MCP_URL = process.env.SEMRUSH_MCP_URL || "https://mcp.semrush.com/v2/mcp";
const VAULT_KEY_NOTE = path.resolve(
  process.env.DILLON_OS_ROOT || process.cwd(),
  "12_Brain/private/access/semrush-api.md"
);

function loadApiKey() {
  if (process.env.SEMRUSH_API_KEY && process.env.SEMRUSH_API_KEY.trim()) {
    return process.env.SEMRUSH_API_KEY.trim();
  }
  if (!fs.existsSync(VAULT_KEY_NOTE)) {
    throw new Error(
      "SEMRUSH_API_KEY not set and private note missing: " + VAULT_KEY_NOTE
    );
  }
  const text = fs.readFileSync(VAULT_KEY_NOTE, "utf8");
  const fence = text.match(/```(?:\n|\r\n)([a-f0-9]{32,})(?:\n|\r\n)```/i);
  if (fence) return fence[1].trim();
  const line = text.match(/\b([a-f0-9]{32,})\b/i);
  if (line) return line[1].trim();
  throw new Error("Could not parse Semrush API key from private note");
}

let apiKey;
try {
  apiKey = loadApiKey();
} catch (err) {
  process.stderr.write(`[semrush-bridge] ${err.message}\n`);
  process.exit(1);
}

let sessionId = null;

function writeMessage(obj) {
  const body = Buffer.from(JSON.stringify(obj), "utf8");
  const header = Buffer.from(`Content-Length: ${body.length}\r\n\r\n`, "utf8");
  process.stdout.write(header);
  process.stdout.write(body);
}

async function forward(message) {
  const headers = {
    Authorization: `Apikey ${apiKey}`,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;

  const res = await fetch(MCP_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(message),
  });

  const sid = res.headers.get("mcp-session-id");
  if (sid) sessionId = sid;

  const text = await res.text();
  if (!res.ok) {
    const errPayload = {
      jsonrpc: "2.0",
      id: Object.prototype.hasOwnProperty.call(message, "id")
        ? message.id
        : null,
      error: {
        code: -32000,
        message: `Semrush MCP HTTP ${res.status}: ${text.slice(0, 500)}`,
      },
    };
    if (message.id !== undefined) writeMessage(errPayload);
    return;
  }

  // Notifications may return empty / 202
  if (!text.trim()) return;

  // JSON response
  if (text.trim().startsWith("{")) {
    const obj = JSON.parse(text);
    if (message.id !== undefined || obj.id !== undefined) writeMessage(obj);
    return;
  }

  // SSE: data: {...}
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    const obj = JSON.parse(payload);
    if (obj.id !== undefined || message.id !== undefined) writeMessage(obj);
  }
}

let buf = Buffer.alloc(0);

function consume() {
  while (true) {
    const headerEnd = buf.indexOf("\r\n\r\n");
    if (headerEnd === -1) return;
    const header = buf.slice(0, headerEnd).toString("utf8");
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) {
      process.stderr.write("[semrush-bridge] missing Content-Length\n");
      buf = buf.slice(headerEnd + 4);
      continue;
    }
    const len = parseInt(match[1], 10);
    const start = headerEnd + 4;
    if (buf.length < start + len) return;
    const body = buf.slice(start, start + len).toString("utf8");
    buf = buf.slice(start + len);
    let message;
    try {
      message = JSON.parse(body);
    } catch (err) {
      process.stderr.write(`[semrush-bridge] bad JSON: ${err.message}\n`);
      continue;
    }
    // Fire and forget per message; preserve order roughly via await chain
    queue = queue.then(() => forward(message)).catch((err) => {
      process.stderr.write(`[semrush-bridge] forward error: ${err.message}\n`);
      if (message && message.id !== undefined) {
        writeMessage({
          jsonrpc: "2.0",
          id: message.id,
          error: { code: -32000, message: String(err.message || err) },
        });
      }
    });
  }
}

let queue = Promise.resolve();

process.stdin.on("data", (chunk) => {
  buf = Buffer.concat([buf, chunk]);
  consume();
});

process.stdin.on("end", () => {
  queue.finally(() => process.exit(0));
});

process.stderr.write(
  `[semrush-bridge] ready → ${MCP_URL} (apikey auth, sideless until server sets one)\n`
);
