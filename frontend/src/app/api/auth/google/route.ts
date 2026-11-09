import { createHmac, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getConfig } from "@/lib/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?google=unavailable", url.origin));
  }

  const { SESSION_SECRET } = getConfig();
  const state = randomBytes(16).toString("hex");
  const signature = createHmac("sha256", SESSION_SECRET).update(state).digest("hex");
  const redirectUri = `${url.origin}/api/auth/google/callback`;
  const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", "openid email profile");
  auth.searchParams.set("state", `${state}.${signature}`);
  auth.searchParams.set("prompt", "select_account");
  return NextResponse.redirect(auth);
}
