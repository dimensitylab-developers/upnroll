import { NextResponse } from "next/server";
import {
  OAUTH_ENTRY_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_MAX_AGE_SECONDS,
  issueOAuthState,
  oauthErrorPath,
  parseOAuthEntry,
} from "@/server/auth/oauth-state";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const entry = parseOAuthEntry(url.searchParams.get("entry"));
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL(oauthErrorPath(entry, "unavailable"), url.origin));
  }

  const { stateParam, cookieValue } = issueOAuthState();
  const redirectUri = `${url.origin}/api/auth/google/callback`;
  const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", "openid email profile");
  auth.searchParams.set("state", stateParam);
  auth.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(auth);
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
  };
  response.cookies.set(OAUTH_STATE_COOKIE, cookieValue, cookieOpts);
  response.cookies.set(OAUTH_ENTRY_COOKIE, entry, cookieOpts);
  return response;
}
