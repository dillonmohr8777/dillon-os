// Path resolution for the studio. All hot I/O (DB, CAS, work dirs, locks)
// lives under a non-synced local root; the repo holds code, config, and
// sanitized human-facing artifacts only.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

export const STUDIO_ROOT = path.resolve(HERE, "..");
export const REPO_ROOT = path.resolve(STUDIO_ROOT, "..", "..", "..");

export function loadConfig() {
  const p = path.join(STUDIO_ROOT, "config", "studio.config.json");
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export function dataRoot(config = loadConfig()) {
  const fromEnv = process.env[config.dataRootEnv];
  if (fromEnv && fromEnv.trim()) return path.resolve(fromEnv.trim());
  const local = process.env.LOCALAPPDATA;
  if (!local) throw new Error("LOCALAPPDATA is not set and no override provided");
  return path.join(local, "prospect-radar-studio");
}

const SUBDIRS = ["state", "cas", "work", "artifacts", "authority", "locks", "review", "cache", "cache/fonts", "cache/logos", "cache/pages", "cache/images"];

export function ensureDataTree(root = dataRoot()) {
  for (const d of SUBDIRS) fs.mkdirSync(path.join(root, d), { recursive: true });
  const stamp = path.join(root, "stamp.json");
  if (!fs.existsSync(stamp)) {
    fs.writeFileSync(stamp, JSON.stringify({ createdAt: new Date().toISOString(), repo: REPO_ROOT }, null, 2));
  }
  return root;
}

export function dbPath(root = dataRoot()) {
  return path.join(root, "state", "state.db");
}

export function workDir(runId, root = dataRoot()) {
  return path.join(root, "work", runId);
}

export function artifactsDir(runId, root = dataRoot()) {
  return path.join(root, "artifacts", runId);
}

export function casPath(sha256, ext, root = dataRoot()) {
  return path.join(root, "cas", sha256.slice(0, 2), `${sha256}${ext ? "." + ext.replace(/^\./, "") : ""}`);
}

export function enginePath(config = loadConfig()) {
  return path.join(REPO_ROOT, config.enginePath);
}
