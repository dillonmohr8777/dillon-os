// Build-time RAG indexer: chunks kb/*.md, embeds chunks + agent routing
// descriptions via the OpenAI embeddings API, and writes a single JSON
// index that the ask function loads at runtime.
//
// Runs as the Netlify build command. Requires OPENAI_API_KEY.

import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KB_DIR = join(ROOT, "kb");
const OUT_FILE = join(ROOT, "netlify", "functions", "ask-data", "kb-index.json");

const API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
const EMBED_MODEL = process.env.EMBED_MODEL || "text-embedding-3-small";

if (!API_KEY) {
  console.error(
    "\nERROR: OPENAI_API_KEY is not set.\n" +
      "Add it in Netlify: Site configuration -> Environment variables -> OPENAI_API_KEY.\n" +
      "The knowledge-base index cannot be built without it.\n"
  );
  process.exit(1);
}

// --- chunking: split each doc on ## headings, then cap section size ---
const MAX_CHARS = 2400;

function chunkDoc(title, text) {
  const sections = text.split(/\n(?=## )/);
  const chunks = [];
  for (const sec of sections) {
    const headingMatch = sec.match(/^#{1,2} (.+)/);
    const section = headingMatch ? headingMatch[1].trim() : title;
    const body = sec.trim();
    if (body.length <= MAX_CHARS) {
      if (body.length > 80) chunks.push({ title, section, text: body });
      continue;
    }
    // split long sections on paragraph boundaries
    let buf = "";
    for (const para of body.split(/\n\n+/)) {
      if (buf.length + para.length > MAX_CHARS && buf.length > 0) {
        chunks.push({ title, section, text: buf.trim() });
        buf = "";
      }
      buf += para + "\n\n";
    }
    if (buf.trim().length > 80) chunks.push({ title, section, text: buf.trim() });
  }
  return chunks;
}

async function embedBatch(inputs) {
  const res = await fetch(`${BASE_URL}/embeddings`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: EMBED_MODEL, input: inputs }),
  });
  if (!res.ok) {
    throw new Error(`Embeddings API ${res.status}: ${(await res.text()).slice(0, 500)}`);
  }
  const data = await res.json();
  return data.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding.map((v) => Math.round(v * 1e5) / 1e5));
}

async function embedAll(texts, batchSize = 64) {
  const out = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    out.push(...(await embedBatch(texts.slice(i, i + batchSize))));
    console.log(`  embedded ${Math.min(i + batchSize, texts.length)}/${texts.length}`);
  }
  return out;
}

// --- gather ---
const chunks = [];
for (const file of readdirSync(KB_DIR).filter((f) => f.endsWith(".md")).sort()) {
  const text = readFileSync(join(KB_DIR, file), "utf8");
  const title = (text.match(/^# (.+)/) || [null, file])[1].trim();
  const docChunks = chunkDoc(title, text);
  chunks.push(...docChunks);
  console.log(`${file}: ${docChunks.length} chunks`);
}

const { agents } = JSON.parse(readFileSync(join(KB_DIR, "agents.json"), "utf8"));

console.log(`Embedding ${chunks.length} chunks + ${agents.length} agent routes with ${EMBED_MODEL}...`);
const chunkVecs = await embedAll(chunks.map((c) => `${c.title}\n${c.section}\n${c.text}`));
const agentVecs = await embedAll(agents.map((a) => `${a.name} (${a.squad}): ${a.route}`));

const index = {
  builtAt: new Date().toISOString(),
  embedModel: EMBED_MODEL,
  chunks: chunks.map((c, i) => ({ ...c, vec: chunkVecs[i] })),
  agents: agents.map((a, i) => ({ ...a, vec: agentVecs[i] })),
};

mkdirSync(dirname(OUT_FILE), { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(index));
console.log(`Wrote ${OUT_FILE} (${(JSON.stringify(index).length / 1024).toFixed(0)} KB)`);
