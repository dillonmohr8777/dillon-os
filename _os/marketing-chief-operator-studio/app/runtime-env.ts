import { env } from "cloudflare:workers";

export function runtimeValue(name: string): string {
  const bindings = env as unknown as Record<string, unknown>;
  const bound = bindings[name];
  if (typeof bound === "string" && bound) return bound;
  return process.env[name] ?? "";
}
