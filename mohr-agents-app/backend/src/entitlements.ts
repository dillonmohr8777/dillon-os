// Subscription entitlements, fed by App Store Server Notifications V2.
//
// Storage is a write-through JSON file (ENTITLEMENTS_FILE, default
// ./data/entitlements.json) — durable across restarts and trivially
// swappable for a real database. Scaffold gap that remains before
// production: verify the JWS signature chain against Apple's root CA
// (or use the `app-store-server-api` npm package, which does both), and
// set the server notification URL in App Store Connect to
// https://<your-host>/v1/webhooks/appstore

import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

interface Entitlement {
  productId: string;
  expiresAt: number;
}

const storePath = resolve(process.env.ENTITLEMENTS_FILE ?? "./data/entitlements.json");

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
  const entitlement = entitlements.get(accountToken);
  return !!entitlement && entitlement.expiresAt > Date.now();
}

function decodeJWSPayload(jws: string): any {
  const payload = jws.split(".")[1];
  return JSON.parse(Buffer.from(payload, "base64url").toString());
}

// Handle an App Store Server Notification V2 body: { signedPayload: "<jws>" }
export function handleAppStoreNotification(body: { signedPayload?: string }): void {
  if (!body.signedPayload) return;
  const notification = decodeJWSPayload(body.signedPayload);
  const signedTransaction = notification?.data?.signedTransactionInfo;
  if (!signedTransaction) return;

  const transaction = decodeJWSPayload(signedTransaction);
  const accountToken: string | undefined = transaction.appAccountToken;
  if (!accountToken) return;

  switch (notification.notificationType) {
    case "SUBSCRIBED":
    case "DID_RENEW":
    case "DID_CHANGE_RENEWAL_STATUS":
    case "OFFER_REDEEMED":
      entitlements.set(accountToken.toLowerCase(), {
        productId: transaction.productId,
        expiresAt: transaction.expiresDate ?? 0,
      });
      persist();
      break;
    case "EXPIRED":
    case "REVOKE":
    case "REFUND":
      entitlements.delete(accountToken.toLowerCase());
      persist();
      break;
  }
}
