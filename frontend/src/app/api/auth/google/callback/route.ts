import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getConfig } from "@/lib/config";
import { connectDB } from "@/server/db/connect";
import { User } from "@/server/models/User";
import { FighterProfile } from "@/server/models/FighterProfile";
import { hashPassword } from "@/server/auth/password";
import { createSession } from "@/server/auth/session";

function validState(state: string | null): boolean {
  if (!state) return false;
  const dot = state.lastIndexOf(".");
  if (dot === -1) return false;
  const raw = state.slice(0, dot);
  const signature = state.slice(dot + 1);
  const { SESSION_SECRET } = getConfig();
  const expected = createHmac("sha256", SESSION_SECRET).update(raw).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "grappler"}-${randomBytes(2).toString("hex")}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fail = new URL("/login?google=failed", url.origin);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const code = url.searchParams.get("code");
  if (!clientId || !clientSecret || !code || !validState(url.searchParams.get("state"))) {
    return NextResponse.redirect(fail);
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
  if (!tokenResponse.ok) return NextResponse.redirect(fail);
  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!token.access_token) return NextResponse.redirect(fail);

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!profileResponse.ok) return NextResponse.redirect(fail);
  const profile = (await profileResponse.json()) as { email?: string; name?: string };
  const email = profile.email?.toLowerCase().trim();
  if (!email) return NextResponse.redirect(fail);

  await connectDB();
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      passwordHash: await hashPassword(randomBytes(32).toString("hex")),
      role: "FIGHTER",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });
  } else if (user.emailVerified === false) {
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();
  }

  const existingProfile = await FighterProfile.findOne({ userId: user._id }).lean();
  if (!existingProfile) {
    const displayName = profile.name?.trim() || email.split("@")[0];
    let slug = slugify(displayName);
    for (let attempt = 0; attempt < 5; attempt++) {
      const taken = await FighterProfile.findOne({ slug }).lean();
      if (!taken) break;
      slug = slugify(displayName);
    }
    await FighterProfile.create({ userId: user._id, displayName, slug, discipline: "No-Gi" });
  }

  await createSession(String(user._id));
  const next = user.role === "ADMIN" ? "/admin" : "/fighter/dashboard";
  return NextResponse.redirect(new URL(next, url.origin));
}
