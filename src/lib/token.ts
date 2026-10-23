import { randomBytes, createHash } from "node:crypto";
/** 256-bit URL-safe token; only the SHA-256 hash is stored (as a Postgres bytea hex literal). */
export function newToken() {
  const raw = randomBytes(32).toString("base64url");
  return { raw, hash: "\\x" + createHash("sha256").update(raw).digest("hex") };
}
