import { NextResponse } from "next/server";
import { OAUTH_STATE_COOKIE, OAUTH_STATE_MAX_AGE_SECONDS, issueOAuthState } from "@/server/auth/oauth-state";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?google=unavailable", url.origin));
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
  response.cookies.set(OAUTH_STATE_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
  });
  return response;
}
