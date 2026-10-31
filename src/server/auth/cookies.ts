import { createHmac, timingSafeEqual } from "node:crypto";
import { getConfig } from "@/lib/config";

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "./cookie-name";

function sign(value: string): string {
  const { SESSION_SECRET } = getConfig();
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

/** Packs a raw session token into a tamper-evident cookie value: `token.signature`. */
export function packCookieValue(rawToken: string): string {
  return `${rawToken}.${sign(rawToken)}`;
}

/** Verifies and unpacks a cookie value. Returns the raw token, or null if tampered/malformed. */
export function unpackCookieValue(cookieValue: string | undefined | null): string | null {
  if (!cookieValue) return null;
  const dot = cookieValue.lastIndexOf(".");
  if (dot === -1) return null;

  const rawToken = cookieValue.slice(0, dot);
  const signature = cookieValue.slice(dot + 1);
  const expected = sign(rawToken);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  return rawToken;
}
