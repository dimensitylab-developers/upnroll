import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/server/db/connect";
import { User } from "@/server/models/User";
import { FighterProfile } from "@/server/models/FighterProfile";
import { hashPassword } from "@/server/auth/password";
import { createSession } from "@/server/auth/session";
import { writeAuditLog } from "@/server/audit/log";
import {
  OAUTH_ENTRY_COOKIE,
  OAUTH_STATE_COOKIE,
  oauthErrorPath,
  parseOAuthEntry,
  verifyOAuthState,
  type OAuthEntry,
} from "@/server/auth/oauth-state";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "grappler"}-${randomBytes(2).toString("hex")}`;
}

function clearOAuthCookies(response: NextResponse) {
  const clear = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
  response.cookies.set(OAUTH_STATE_COOKIE, "", clear);
  response.cookies.set(OAUTH_ENTRY_COOKIE, "", clear);
}

function failRedirect(origin: string, entry: OAuthEntry, reason: "failed" | "disabled" = "failed") {
  const response = NextResponse.redirect(new URL(oauthErrorPath(entry, reason), origin));
  clearOAuthCookies(response);
  return response;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const entry = parseOAuthEntry(request.cookies.get(OAUTH_ENTRY_COOKIE)?.value);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const code = url.searchParams.get("code");
  const stateCookie = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!clientId || !clientSecret || !code || !verifyOAuthState(url.searchParams.get("state"), stateCookie)) {
    return failRedirect(url.origin, entry, "failed");
  }

  const redirectUri = `${url.origin}/api/auth/google/callback`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenResponse.ok) {
    return failRedirect(url.origin, entry, "failed");
  }
  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!token.access_token) {
    return failRedirect(url.origin, entry, "failed");
  }

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!profileResponse.ok) {
    return failRedirect(url.origin, entry, "failed");
  }
  const profile = (await profileResponse.json()) as { email?: string; name?: string };
  const email = profile.email?.toLowerCase().trim();
  if (!email) {
    return failRedirect(url.origin, entry, "failed");
  }

  await connectDB();
  let user = await User.findOne({ email });
  if (user && user.status !== "ACTIVE") {
    return failRedirect(url.origin, entry, "disabled");
  }

  const googleName = profile.name?.trim() || email.split("@")[0] || "Grappler";
  let createdAccount = false;
  if (!user) {
    user = await User.create({
      email,
      passwordHash: await hashPassword(randomBytes(32).toString("hex")),
      role: "FIGHTER",
      emailVerified: true,
      emailVerifiedAt: new Date(),
      displayName: googleName,
    });
    createdAccount = true;
  } else if (user.emailVerified === false) {
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    if (!user.displayName?.trim()) user.displayName = googleName;
    await user.save();
  } else if (!user.displayName?.trim()) {
    user.displayName = googleName;
    await user.save();
  }

  const existingProfile = await FighterProfile.findOne({ userId: user._id }).lean();
  let createdProfile = false;
  let profileId = existingProfile ? String(existingProfile._id) : "";
  if (!existingProfile) {
    let slug = slugify(googleName);
    for (let attempt = 0; attempt < 5; attempt++) {
      const taken = await FighterProfile.findOne({ slug }).lean();
      if (!taken) break;
      slug = slugify(googleName);
    }
    const created = await FighterProfile.create({
      userId: user._id,
      displayName: googleName,
      slug,
      discipline: "No-Gi",
    });
    profileId = String(created._id);
    createdProfile = true;
  }

  await createSession(String(user._id));
  if (createdAccount) {
    await writeAuditLog({ actorId: String(user._id), action: "USER_REGISTERED", targetType: "User", targetId: String(user._id) });
  }
  if (createdProfile) {
    await writeAuditLog({
      actorId: String(user._id),
      action: "FIGHTER_PROFILE_CREATED",
      targetType: "FighterProfile",
      targetId: profileId,
    });
  }
  await writeAuditLog({
    actorId: String(user._id),
    action: "USER_LOGIN",
    targetType: "User",
    targetId: String(user._id),
    after: { via: "google" },
  });
  const next = user.role === "ADMIN" ? "/admin" : "/fighter/dashboard";
  const response = NextResponse.redirect(new URL(next, url.origin));
  clearOAuthCookies(response);
  return response;
}
