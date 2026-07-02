// Subscription entitlements, fed by App Store Server Notifications V2.
//
// Scaffold status: in-memory store + notification decoding without signature
// verification. Before production:
//   1. Verify the JWS signature chain against Apple's root CA
//      (or use the `app-store-server-api` npm package, which does both).
//   2. Persist entitlements in a real database keyed by appAccountToken.
//   3. Set the server notification URL in App Store Connect to
//      https://<your-host>/v1/webhooks/appstore

interface Entitlement {
  productId: string;
  expiresAt: number;
}

const entitlements = new Map<string, Entitlement>(); // appAccountToken (= our userId) → entitlement

export function isSubscribed(userId: string): boolean {
  if (process.env.ALLOW_UNSUBSCRIBED === "true") return true;
  const entitlement = entitlements.get(userId);
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
  const userId: string | undefined = transaction.appAccountToken;
  if (!userId) return;

  switch (notification.notificationType) {
    case "SUBSCRIBED":
    case "DID_RENEW":
    case "DID_CHANGE_RENEWAL_STATUS":
    case "OFFER_REDEEMED":
      entitlements.set(userId, {
        productId: transaction.productId,
        expiresAt: transaction.expiresDate ?? 0,
      });
      break;
    case "EXPIRED":
    case "REVOKE":
    case "REFUND":
      entitlements.delete(userId);
      break;
  }
}
