import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

const APPLE_ISSUER = "https://appleid.apple.com";
const appleJWKS = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

const sessionSecret = process.env.SESSION_SECRET ?? "dev-only-secret";
const bundleId = process.env.APPLE_BUNDLE_ID ?? "com.mohrmedia.mohragents";

// Verify a Sign in with Apple identity token and return the stable Apple user id.
export async function verifyAppleIdentityToken(identityToken: string): Promise<string> {
  const { payload } = await jwtVerify(identityToken, appleJWKS, {
    issuer: APPLE_ISSUER,
    audience: bundleId,
  });
  if (!payload.sub) throw new Error("Apple token missing sub");
  return payload.sub;
}

// Deterministic UUID for a user, used as StoreKit's appAccountToken. App Store
// Server Notifications echo it back, letting entitlements.ts map transactions
// to users without a database lookup by transaction id.
export function accountUUID(userId: string): string {
  const hex = createHash("sha256").update(`mohragents:${userId}`).digest("hex");
  const bytes = hex.slice(0, 32).split("");
  bytes[12] = "4"; // version 4 nibble
  bytes[16] = ((parseInt(bytes[16], 16) & 0x3) | 0x8).toString(16); // variant
  const raw = bytes.join("");
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}

// Signed opaque session tokens: base64url(userId).base64url(expiry).hmac
// Good enough for the scaffold; swap for real JWTs + a user table later.
export function issueSessionToken(userId: string, ttlDays = 90): string {
  const expiry = String(Date.now() + ttlDays * 86_400_000);
  const body = `${Buffer.from(userId).toString("base64url")}.${Buffer.from(expiry).toString("base64url")}`;
  const mac = createHmac("sha256", sessionSecret).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function verifySessionToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const body = `${parts[0]}.${parts[1]}`;
  const expected = createHmac("sha256", sessionSecret).update(body).digest();
  const provided = Buffer.from(parts[2], "base64url");
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;

  const expiry = Number(Buffer.from(parts[1], "base64url").toString());
  if (!Number.isFinite(expiry) || Date.now() > expiry) return null;
  return Buffer.from(parts[0], "base64url").toString();
}
