"use server";

import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { connectDB } from "@/server/db/connect";
import { User } from "@/server/models/User";
import { FighterProfile } from "@/server/models/FighterProfile";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { createSession, destroySession, getSession } from "@/server/auth/session";
import { writeAuditLog } from "@/server/audit/log";
import { checkRateLimit } from "@/server/http/rateLimit";
import { getClientIp } from "@/server/http/clientIp";
import { loginSchema } from "./schemas";
import { registerSchema } from "@/features/fighters/grappler-schema";
import { sendVerificationCode, confirmVerificationCode } from "@/server/services/verificationMail";

export type AuthActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const DB_UNAVAILABLE =
  "Could not reach the database. Check your connection and try again in a moment.";

function isDbConnectivityError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const name = "name" in err ? String(err.name) : "";
  return (
    name === "MongoNetworkTimeoutError" ||
    name === "MongoNetworkError" ||
    name === "MongoServerSelectionError" ||
    name === "MongooseServerSelectionError"
  );
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "fighter"}-${randomBytes(2).toString("hex")}`;
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const ip = await getClientIp();
  const rate = checkRateLimit(`register:${ip}`);
  if (!rate.allowed) {
    return { error: `Too many attempts. Try again in about ${rate.retryAfterSeconds}s.` };
  }

  const parsed = registerSchema.safeParse({
    displayName: formData.get("displayName"),
    mobile: formData.get("mobile"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { displayName, mobile, email, password } = parsed.data;

  try {
    await connectDB();

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return { error: "An account with this email already exists." };
    }

    const passwordHash = await hashPassword(password);
    // Public registration only ever creates FIGHTER accounts — see Part M:
    // admin accounts are created exclusively via scripts/create-admin.ts.
    const user = await User.create({ email, passwordHash, role: "FIGHTER", emailVerified: false });

    let slug = slugify(displayName);
    for (let attempt = 0; attempt < 5; attempt++) {
      const taken = await FighterProfile.findOne({ slug }).lean();
      if (!taken) break;
      slug = slugify(displayName);
    }
    await FighterProfile.create({
      userId: user._id,
      slug,
      displayName,
      mobile,
      discipline: "No-Gi",
    });

    await writeAuditLog({ actorId: String(user._id), action: "USER_REGISTERED", targetType: "User", targetId: String(user._id) });
    await sendVerificationCode(String(user._id), email);
  } catch (err) {
    if (isDbConnectivityError(err)) return { error: DB_UNAVAILABLE };
    throw err;
  }

  redirect(`/verify?email=${encodeURIComponent(email)}`);
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const ip = await getClientIp();
  const rate = checkRateLimit(`login:${ip}`);
  if (!rate.allowed) {
    return { error: `Too many attempts. Try again in about ${rate.retryAfterSeconds}s.` };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { email, password } = parsed.data;

  let role: string;
  try {
    await connectDB();

    const user = await User.findOne({ email });
    const genericError = { error: "Incorrect email or password." };

    if (!user || user.status !== "ACTIVE") return genericError;
    if (user.emailVerified === false) {
      return { error: "Confirm the code we sent to your email before you sign in." };
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return genericError;

    await createSession(String(user._id));
    await writeAuditLog({ actorId: String(user._id), action: "USER_LOGIN", targetType: "User", targetId: String(user._id) });
    role = user.role;
  } catch (err) {
    if (isDbConnectivityError(err)) return { error: DB_UNAVAILABLE };
    throw err;
  }

  redirect(role === "ADMIN" ? "/admin" : "/fighter/dashboard");
}

export async function verifyEmailAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const ip = await getClientIp();
  const rate = checkRateLimit(`verify:${ip}`);
  if (!rate.allowed) {
    return { error: `Too many attempts. Try again in about ${rate.retryAfterSeconds}s.` };
  }

  const email = String(formData.get("email") ?? "");
  const code = String(formData.get("code") ?? "");
  if (!email || !code.trim()) return { error: "Enter the code from your email." };

  const confirmed = await confirmVerificationCode(email, code);
  if (!confirmed) return { error: "That code does not match, or it has expired." };

  await createSession(confirmed.userId);
  redirect("/fighter/dashboard");
}

export async function resendCodeAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const ip = await getClientIp();
  const rate = checkRateLimit(`resend:${ip}`);
  if (!rate.allowed) {
    return { error: `Too many attempts. Try again in about ${rate.retryAfterSeconds}s.` };
  }

  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  await connectDB();
  const user = await User.findOne({ email }).lean();
  if (user && user.emailVerified === false) {
    await sendVerificationCode(String(user._id), email);
  }
  return { error: "If this account is waiting on a code, a new one is on its way." };
}

export async function logoutAction(): Promise<void> {
  const current = await getSession();
  await destroySession();
  if (current) {
    await writeAuditLog({
      actorId: String(current.user._id),
      action: "USER_LOGOUT",
      targetType: "User",
      targetId: String(current.user._id),
    });
  }
  redirect("/login");
}
