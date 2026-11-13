import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getConfig } from "@/lib/config";

export const OAUTH_STATE_COOKIE = "upnroll_oauth_state";
/** Remembers whether Google OAuth started from login or register (for error redirects). */
export const OAUTH_ENTRY_COOKIE = "upnroll_oauth_entry";
export const OAUTH_STATE_MAX_AGE_SECONDS = 600;

export type OAuthEntry = "login" | "register";

export function parseOAuthEntry(value: string | undefined | null): OAuthEntry {
  return value === "register" ? "register" : "login";
}

export function oauthErrorPath(entry: OAuthEntry, reason: "unavailable" | "failed" | "disabled"): string {
  const base = entry === "register" ? "/register" : "/login";
  return `${base}?google=${reason}`;
}

function sign(value: string): string {
  const { SESSION_SECRET } = getConfig();
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

/** Create a signed OAuth state payload and the raw nonce stored in the cookie. */
export function issueOAuthState(): { stateParam: string; cookieValue: string } {
  const nonce = randomBytes(16).toString("hex");
  const cookieValue = `${nonce}.${sign(nonce)}`;
  // The query param carries a second signature so a stolen cookie alone is not enough
  // without also controlling the redirect, and vice versa.
  const stateParam = `${nonce}.${sign(`oauth:${nonce}`)}`;
  return { stateParam, cookieValue };
}

export function verifyOAuthState(stateParam: string | null, cookieValue: string | undefined | null): boolean {
  if (!stateParam || !cookieValue) return false;

  const stateDot = stateParam.lastIndexOf(".");
  const cookieDot = cookieValue.lastIndexOf(".");
  if (stateDot === -1 || cookieDot === -1) return false;

  const stateNonce = stateParam.slice(0, stateDot);
  const stateSig = stateParam.slice(stateDot + 1);
  const cookieNonce = cookieValue.slice(0, cookieDot);
  const cookieSig = cookieValue.slice(cookieDot + 1);

  if (stateNonce.length === 0 || stateNonce !== cookieNonce) return false;

  const expectedState = sign(`oauth:${stateNonce}`);
  const expectedCookie = sign(cookieNonce);

  const a = Buffer.from(stateSig);
  const b = Buffer.from(expectedState);
  const c = Buffer.from(cookieSig);
  const d = Buffer.from(expectedCookie);
  if (a.length !== b.length || c.length !== d.length) return false;
  return timingSafeEqual(a, b) && timingSafeEqual(c, d);
}
