import assert from "node:assert/strict";
import { before, test } from "node:test";

let auth: typeof import("../src/auth.ts");

before(async () => {
  process.env.SESSION_SECRET = "test-secret-value";
  auth = await import("../src/auth.ts");
});

test("accountUUID is deterministic and a valid v4-shaped UUID", () => {
  const a = auth.accountUUID("apple-sub-123");
  const b = auth.accountUUID("apple-sub-123");
  assert.equal(a, b);
  assert.match(a, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.notEqual(a, auth.accountUUID("apple-sub-456"));
});

test("session token round-trips the user id", () => {
  const token = auth.issueSessionToken("user-42");
  assert.equal(auth.verifySessionToken(token), "user-42");
});

test("a tampered signature is rejected", () => {
  const token = auth.issueSessionToken("user-42");
  const [body, , mac] = token.split(".");
  const forged = `${body}.${Buffer.from("999999999999").toString("base64url")}.${mac}`;
  assert.equal(auth.verifySessionToken(forged), null);
});

test("an expired token is rejected", () => {
  const token = auth.issueSessionToken("user-42", -1); // already expired
  assert.equal(auth.verifySessionToken(token), null);
});

test("malformed tokens return null, not a throw", () => {
  assert.equal(auth.verifySessionToken("not-a-token"), null);
  assert.equal(auth.verifySessionToken(""), null);
  assert.equal(auth.verifySessionToken("a.b"), null);
});
