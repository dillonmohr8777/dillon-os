import assert from "node:assert/strict";
import { before, test } from "node:test";

let checkRateLimit: (userId: string) => number | null;

before(async () => {
  process.env.RATE_WINDOW_MS = "60000";
  process.env.RATE_MAX_PER_WINDOW = "3";
  ({ checkRateLimit } = await import("../src/ratelimit.ts"));
});

test("allows up to the max, then rate-limits with a positive retry delay", () => {
  const user = "rl-user-1";
  assert.equal(checkRateLimit(user), null);
  assert.equal(checkRateLimit(user), null);
  assert.equal(checkRateLimit(user), null);
  const retry = checkRateLimit(user);
  assert.ok(typeof retry === "number" && retry > 0, "4th call should be limited");
  assert.ok(retry <= 60, "retry seconds within the window");
});

test("separate users have independent windows", () => {
  const a = "rl-user-a";
  const b = "rl-user-b";
  for (let i = 0; i < 3; i++) checkRateLimit(a);
  assert.ok((checkRateLimit(a) ?? 0) > 0, "user a limited");
  assert.equal(checkRateLimit(b), null, "user b unaffected");
});
