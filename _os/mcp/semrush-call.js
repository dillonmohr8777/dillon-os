#!/usr/bin/env node
/**
 * Agent-facing Semrush MCP CLI (HTTP + Apikey).
 *
 * Usage:
 *   node _os/mcp/semrush-call.js units
 *   node _os/mcp/semrush-call.js tools
 *   node _os/mcp/semrush-call.js call <toolName> '<json args>'
 *   node _os/mcp/semrush-call.js report <reportName> '<json params>'
 *
 * Auth: SEMRUSH_API_KEY or 12_Brain/private/access/semrush-api.md
 */
"use strict";

const fs = require("fs");
const path = require("path");

const MCP_URL = process.env.SEMRUSH_MCP_URL || "https://mcp.semrush.com/v2/mcp";
const ROOT = process.env.DILLON_OS_ROOT || process.cwd();
const NOTE = path.resolve(ROOT, "12_Brain/private/access/semrush-api.md");
const UNITS_URL = "https://www.semrush.com/users/countapiunits.html";
const TOPUP_URL = "https://www.semrush.com/mcp-access";

function loadKey() {
  if (process.env.SEMRUSH_API_KEY?.trim()) return process.env.SEMRUSH_API_KEY.trim();
  if (!fs.existsSync(NOTE)) {
    throw new Error(`No SEMRUSH_API_KEY and missing ${NOTE}`);
  }
  const text = fs.readFileSync(NOTE, "utf8");
  const fence = text.match(/```(?:\n|\r\n)([a-f0-9]{32,})(?:\n|\r\n)```/i);
  if (fence) return fence[1].trim();
  const line = text.match(/\b([a-f0-9]{32,})\b/i);
  if (line) return line[1].trim();
  throw new Error("Could not parse API key from private note");
}

async function mcp(method, params, id = 1) {
  const key = loadKey();
  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      Authorization: `Apikey ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 400)}`);
  if (text.trim().startsWith("{")) return JSON.parse(text);
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith("data:")) return JSON.parse(line.slice(5).trim());
  }
  throw new Error(`Unrecognized MCP response: ${text.slice(0, 200)}`);
}

async function units() {
  const key = loadKey();
  const res = await fetch(`${UNITS_URL}?key=${encodeURIComponent(key)}`);
  const body = (await res.text()).trim();
  const n = Number(body);
  return {
    units: Number.isFinite(n) ? n : body,
    topup: TOPUP_URL,
    mcp_ready: Number.isFinite(n) ? n > 0 : false,
  };
}

async function main() {
  const [cmd, a, b] = process.argv.slice(2);
  if (!cmd || cmd === "help" || cmd === "-h") {
    console.log(`Usage:
  node _os/mcp/semrush-call.js units
  node _os/mcp/semrush-call.js tools
  node _os/mcp/semrush-call.js call <toolName> '<json>'
  node _os/mcp/semrush-call.js report <reportName> '<json params>'`);
    process.exit(0);
  }

  if (cmd === "units") {
    console.log(JSON.stringify(await units(), null, 2));
    return;
  }

  if (cmd === "tools") {
    const init = await mcp("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "dillon-os-semrush-call", version: "1.0.0" },
    });
    await mcp("notifications/initialized", {}, null).catch(() => {});
    const listed = await mcp("tools/list", {}, 2);
    const tools = listed.result?.tools?.map((t) => t.name) || [];
    console.log(
      JSON.stringify(
        { server: init.result?.serverInfo, tools, count: tools.length },
        null,
        2
      )
    );
    return;
  }

  if (cmd === "call") {
    const name = a;
    const args = b ? JSON.parse(b) : {};
    if (!name) throw new Error("tool name required");
    const bal = await units();
    if (!bal.mcp_ready) {
      console.log(
        JSON.stringify(
          {
            error: "api_units_zero",
            units: bal.units,
            action: `Get more API units: ${TOPUP_URL}`,
          },
          null,
          2
        )
      );
      process.exit(3);
    }
    const result = await mcp("tools/call", { name, arguments: args }, 3);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (cmd === "report") {
    const report = a;
    const params = b ? JSON.parse(b) : {};
    if (!report) throw new Error("report name required");
    const bal = await units();
    if (!bal.mcp_ready) {
      console.log(
        JSON.stringify(
          {
            error: "api_units_zero",
            units: bal.units,
            action: `Get more API units: ${TOPUP_URL}`,
          },
          null,
          2
        )
      );
      process.exit(3);
    }
    const result = await mcp(
      "tools/call",
      { name: "execute_report", arguments: { report, params } },
      3
    );
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  throw new Error(`Unknown command: ${cmd}`);
}

main().catch((err) => {
  console.error(String(err.stack || err));
  process.exit(1);
});
