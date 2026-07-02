import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface AgentConfig {
  id: string;
  name: string;
  tag: string;
  group: "found" | "win" | "run";
  effort: "low" | "medium" | "high";
  system: string;
}

const agentsDir = join(dirname(fileURLToPath(import.meta.url)), "agents");

// Each agent is one JSON file in src/agents/ — drop a new file in, restart,
// and it's live. The iOS catalog mirrors these ids.
export const agents: Map<string, AgentConfig> = new Map(
  readdirSync(agentsDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const config = JSON.parse(readFileSync(join(agentsDir, f), "utf8")) as AgentConfig;
      return [config.id, config];
    }),
);

// Public catalog shape (no system prompts — those never leave the server).
export function publicCatalog() {
  return [...agents.values()].map(({ id, name, tag, group }) => ({ id, name, tag, group }));
}
