// Subscription entitlements, fed by App Store Server Notifications V2.
//
// Storage is a write-through JSON file (ENTITLEMENTS_FILE, default
// ./data/entitlements.json), durable across restarts and swappable for a DB.
//
// Notifications are signature-verified before they can grant anything: the
// JWS x5c chain must link cert-to-cert AND terminate at the Apple root whose
// SHA-256 fingerprint is configured in APPLE_ROOT_CA_FINGERPRINT, and the
// payload signature must validate against the leaf key. Without a configured
// fingerprint the receiver FAILS CLOSED in production (grants nothing) so an
// unauthenticated POST can't forge entitlements.

import { X509Certificate } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { importX509, jwtVerify } from "jose";

interface Entitlement {
  productId: string;
  expiresAt: number;
}

const storePath = resolve(process.env.ENTITLEMENTS_FILE ?? "./data/entitlements.json");
// Apple Root CA - G3 SHA-256 fingerprint (hex, no colons/spaces, lowercased).
// Published at https://www.apple.com/certificateauthority/ — set it in the env.
const appleRootFingerprint = (process.env.APPLE_ROOT_CA_FINGERPRINT ?? "")
  .replace(/[^0-9a-fA-F]/g, "")
  .toLowerCase();
const isProd = process.env.NODE_ENV === "production";

// keyed by appAccountToken (the per-user UUID issued at /v1/auth/apple)
const entitlements = new Map<string, Entitlement>(loadStore());

function loadStore(): [string, Entitlement][] {
  try {
    return Object.entries(JSON.parse(readFileSync(storePath, "utf8")));
  } catch {
    return [];
  }
}

function persist(): void {
  mkdirSync(dirname(storePath), { recursive: true });
  const tmp = `${storePath}.tmp`;
  writeFileSync(tmp, JSON.stringify(Object.fromEntries(entitlements), null, 2));
  renameSync(tmp, storePath);
}

export function isSubscribed(accountToken: string): boolean {
  if (process.env.ALLOW_UNSUBSCRIBED === "true") return true;
  const entitlement = entitlements.get(accountToken.toLowerCase());
  return !!entitlement && entitlement.expiresAt > Date.now();
}

function fingerprintHex(cert: X509Certificate): string {
  return cert.fingerprint256.replace(/[^0-9a-fA-F]/g, "").toLowerCase();
}

// Verify a JWS signed by Apple: x5c leaf → intermediate → root, root pinned by
// fingerprint, and the payload signature valid against the leaf. Returns the
// decoded payload, or throws.
async function verifyAppleJWS(jws: string): Promise<any> {
  const headerB64 = jws.split(".")[0];
  const header = JSON.parse(Buffer.from(headerB64, "base64url").toString());
  const chain: string[] = header.x5c;
  if (!Array.isArray(chain) || chain.length < 2) throw new Error("missing x5c chain");

  const certs = chain.map(
    (der) => new X509Certificate(Buffer.from(der, "base64")),
  );

  // Each cert must be signed by the next; the last must match the pinned root.
  for (let i = 0; i < certs.length - 1; i++) {
    const issuerKey = certs[i + 1].publicKey;
    if (!certs[i].verify(issuerKey)) throw new Error(`broken chain link at ${i}`);
  }
  if (!appleRootFingerprint) {
    throw new Error("APPLE_ROOT_CA_FINGERPRINT not configured");
  }
  if (fingerprintHex(certs[certs.length - 1]) !== appleRootFingerprint) {
    throw new Error("chain does not terminate at the pinned Apple root");
  }

  const leafKey = await importX509(certs[0].toString(), header.alg ?? "ES256");
  const { payload } = await jwtVerify(jws, leafKey);
  return payload;
}

// Handle an App Store Server Notification V2 body: { signedPayload: "<jws>" }.
// Throws if the notification can't be verified — the caller returns 4xx and
// grants nothing.
export async function handleAppStoreNotification(body: { signedPayload?: string }): Promise<void> {
  if (!body.signedPayload) throw new Error("missing signedPayload");

  // In production a misconfigured verifier must never silently grant. In
  // development, allow unverified payloads only when explicitly opted in.
  const allowUnverified = !isProd && process.env.ALLOW_UNVERIFIED_APPSTORE === "true";

  let notification: any;
  try {
    notification = await verifyAppleJWS(body.signedPayload);
  } catch (error) {
    if (!allowUnverified) throw error;
    console.warn("appstore: accepting UNVERIFIED notification (dev only):", (error as Error).message);
    notification = JSON.parse(
      Buffer.from(body.signedPayload.split(".")[1], "base64url").toString(),
    );
  }

  const signedTransaction = notification?.data?.signedTransactionInfo;
  if (!signedTransaction) return;
  const transaction = allowUnverified
    ? JSON.parse(Buffer.from(signedTransaction.split(".")[1], "base64url").toString())
    : await verifyAppleJWS(signedTransaction);

  const accountToken: string | undefined = transaction.appAccountToken;
  if (!accountToken) return;
  const key = accountToken.toLowerCase();

  switch (notification.notificationType) {
    case "SUBSCRIBED":
    case "DID_RENEW":
    case "DID_CHANGE_RENEWAL_STATUS":
    case "OFFER_REDEEMED":
      entitlements.set(key, {
        productId: transaction.productId,
        expiresAt: transaction.expiresDate ?? 0,
      });
      persist();
      break;
    case "EXPIRED":
    case "REVOKE":
    case "REFUND":
      entitlements.delete(key);
      persist();
      break;
  }
}

// Grant an entitlement directly from a StoreKit transaction the app just made,
// so a fresh subscriber isn't gated while Apple's async notification catches up.
// The transaction JWS is signature-verified the same way as notifications.
export async function grantFromTransaction(signedTransaction: string): Promise<boolean> {
  const allowUnverified = !isProd && process.env.ALLOW_UNVERIFIED_APPSTORE === "true";
  let transaction: any;
  try {
    transaction = await verifyAppleJWS(signedTransaction);
  } catch (error) {
    if (!allowUnverified) throw error;
    transaction = JSON.parse(
      Buffer.from(signedTransaction.split(".")[1], "base64url").toString(),
    );
  }
  const accountToken: string | undefined = transaction.appAccountToken;
  const expiresAt: number = transaction.expiresDate ?? 0;
  if (!accountToken || expiresAt <= Date.now()) return false;
  entitlements.set(accountToken.toLowerCase(), { productId: transaction.productId, expiresAt });
  persist();
  return true;
}
