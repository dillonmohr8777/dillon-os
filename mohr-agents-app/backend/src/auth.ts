import { createHmac, timingSafeEqual } from "node:crypto";
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
