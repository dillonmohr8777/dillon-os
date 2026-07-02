import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SignJWT, importPKCS8 } from "jose";

// Builds an EC root CA and a leaf cert signed by it (mirroring Apple's
// notification signing chain), so tests can exercise the real JWS verification
// path — a valid chain that terminates at the configured root, and a forged
// self-signed chain that must be rejected.
export interface CertChain {
  rootFingerprintHex: string; // sha256, lowercased hex, no colons
  leafKeyPem: string;         // PKCS8 private key for signing the JWS
  x5c: [string, string];      // [leaf DER b64, root DER b64] for the JWS header
}

function openssl(args: string[], cwd: string): void {
  execFileSync("openssl", args, { cwd, stdio: "pipe" });
}

export function makeChain(commonName = "Test"): CertChain {
  const dir = mkdtempSync(join(tmpdir(), "ma-certs-"));

  // Root CA (self-signed).
  openssl(["ecparam", "-name", "prime256v1", "-genkey", "-noout", "-out", "root.key"], dir);
  openssl(
    ["req", "-x509", "-new", "-key", "root.key", "-days", "1", "-out", "root.pem",
     "-subj", `/CN=${commonName} Root`],
    dir,
  );

  // Leaf key + CSR, signed by the root.
  openssl(["ecparam", "-name", "prime256v1", "-genkey", "-noout", "-out", "leaf.key"], dir);
  openssl(["pkcs8", "-topk8", "-nocrypt", "-in", "leaf.key", "-out", "leaf.pk8"], dir);
  openssl(["req", "-new", "-key", "leaf.key", "-out", "leaf.csr", "-subj", `/CN=${commonName} Leaf`], dir);
  openssl(
    ["x509", "-req", "-in", "leaf.csr", "-CA", "root.pem", "-CAkey", "root.key",
     "-CAcreateserial", "-days", "1", "-out", "leaf.pem"],
    dir,
  );

  const rootFingerprintHex = execFileSync(
    "openssl",
    ["x509", "-in", "root.pem", "-noout", "-fingerprint", "-sha256"],
    { cwd: dir, encoding: "utf8" },
  )
    .split("=")[1]
    .replace(/[^0-9a-fA-F]/g, "")
    .toLowerCase();

  const derB64 = (pem: string): string => {
    const body = pem
      .replace(/-----BEGIN CERTIFICATE-----/, "")
      .replace(/-----END CERTIFICATE-----/, "")
      .replace(/\s+/g, "");
    return body;
  };

  return {
    rootFingerprintHex,
    leafKeyPem: readFileSync(join(dir, "leaf.pk8"), "utf8"),
    x5c: [derB64(readFileSync(join(dir, "leaf.pem"), "utf8")),
          derB64(readFileSync(join(dir, "root.pem"), "utf8"))],
  };
}

// Sign a JSON payload as an ES256 JWS with an x5c header, the way Apple signs
// notification and transaction payloads.
export async function signJWS(payload: Record<string, unknown>, chain: CertChain): Promise<string> {
  const key = await importPKCS8(chain.leafKeyPem, "ES256");
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "ES256", x5c: chain.x5c })
    .sign(key);
}
