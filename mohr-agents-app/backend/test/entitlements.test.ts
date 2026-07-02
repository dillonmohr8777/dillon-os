import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { before, test } from "node:test";
import { makeChain, signJWS, type CertChain } from "./helpers/certs.ts";

// The module reads APPLE_ROOT_CA_FINGERPRINT and ENTITLEMENTS_FILE at load
// time, so configure the env before importing it.
let appleChain: CertChain;
let attackerChain: CertChain;
let entitlements: typeof import("../src/entitlements.ts");

const farFuture = Date.now() + 30 * 86_400_000;

before(async () => {
  appleChain = makeChain("Apple");
  attackerChain = makeChain("Evil"); // valid chain, but not the pinned root
  process.env.APPLE_ROOT_CA_FINGERPRINT = appleChain.rootFingerprintHex;
  process.env.ENTITLEMENTS_FILE = join(mkdtempSync(join(tmpdir(), "ma-ent-")), "e.json");
  process.env.NODE_ENV = "production";
  delete process.env.ALLOW_UNSUBSCRIBED;
  delete process.env.ALLOW_UNVERIFIED_APPSTORE;
  entitlements = await import("../src/entitlements.ts");
});

async function signedNotification(chain: CertChain, accountToken: string, type = "SUBSCRIBED"): Promise<{ signedPayload: string }> {
  const txn = await signJWS(
    { appAccountToken: accountToken, productId: "com.mohrmedia.mohragents.pro.monthly", expiresDate: farFuture },
    chain,
  );
  const signedPayload = await signJWS(
    { notificationType: type, data: { signedTransactionInfo: txn } },
    chain,
  );
  return { signedPayload };
}

test("a properly-signed notification chained to the pinned root grants the entitlement", async () => {
  const token = "11111111-1111-4111-8111-111111111111";
  await entitlements.handleAppStoreNotification(await signedNotification(appleChain, token));
  assert.equal(entitlements.isSubscribed(token), true);
});

test("a forged notification signed by a non-Apple root is rejected and grants nothing", async () => {
  const token = "22222222-2222-4222-8222-222222222222";
  const forged = await signedNotification(attackerChain, token);
  await assert.rejects(() => entitlements.handleAppStoreNotification(forged));
  assert.equal(entitlements.isSubscribed(token), false);
});

test("an unsigned/tampered payload (alg=none) is rejected", async () => {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ notificationType: "SUBSCRIBED" })).toString("base64url");
  await assert.rejects(() => entitlements.handleAppStoreNotification({ signedPayload: `${header}.${body}.` }));
});

test("EXPIRED revokes an existing entitlement", async () => {
  const token = "33333333-3333-4333-8333-333333333333";
  await entitlements.handleAppStoreNotification(await signedNotification(appleChain, token, "SUBSCRIBED"));
  assert.equal(entitlements.isSubscribed(token), true);
  await entitlements.handleAppStoreNotification(await signedNotification(appleChain, token, "EXPIRED"));
  assert.equal(entitlements.isSubscribed(token), false);
});

test("grantFromTransaction accepts a valid transaction and is token-case-insensitive", async () => {
  const token = "AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA";
  const txn = await signJWS(
    { appAccountToken: token, productId: "com.mohrmedia.mohragents.pro.yearly", expiresDate: farFuture },
    appleChain,
  );
  assert.equal(await entitlements.grantFromTransaction(txn), true);
  // isSubscribed lowercases, so the mixed-case token resolves.
  assert.equal(entitlements.isSubscribed(token.toLowerCase()), true);
});

test("grantFromTransaction refuses an already-expired transaction", async () => {
  const token = "BBBBBBBB-BBBB-4BBB-8BBB-BBBBBBBBBBBB";
  const txn = await signJWS(
    { appAccountToken: token, productId: "x", expiresDate: Date.now() - 1000 },
    appleChain,
  );
  assert.equal(await entitlements.grantFromTransaction(txn), false);
});
