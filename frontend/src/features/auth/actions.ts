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
import { grapplerFieldIssues, grapplerFromForm, registerSchema, toProfileFields } from "@/features/fighters/grappler-schema";
import { readProfilePhoto, saveProfilePhoto } from "@/server/services/profilePhoto";
import { sendVerificationCode, confirmVerificationCode } from "@/server/services/verificationMail";

export type AuthActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

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
    ...grapplerFromForm(formData),
    email: formData.get("email"),
    password: formData.get("password"),
    agree: formData.get("agree") ?? "",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const issues = grapplerFieldIssues(parsed.data, { requireAgree: true });
  if (Object.keys(issues).length > 0) return { fieldErrors: issues };

  const photo = await readProfilePhoto(formData.get("photo"));
  if ("empty" in photo) return { error: "Add a passport size photograph." };
  if ("error" in photo) return { error: photo.error };

  const { displayName, email, password } = parsed.data;

  await connectDB();

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);
  // Public registration only ever creates FIGHTER accounts — see Part M:
  // admin accounts are created exclusively via scripts/create-admin.ts.
  const user = await User.create({ email, passwordHash, role: "FIGHTER", emailVerified: false });
  const photoKey = await saveProfilePhoto(String(user._id), photo.bytes, photo.ext);

  let slug = slugify(displayName);
  for (let attempt = 0; attempt < 5; attempt++) {
    const taken = await FighterProfile.findOne({ slug }).lean();
    if (!taken) break;
    slug = slugify(displayName);
  }
  await FighterProfile.create({
    userId: user._id,
    slug,
    discipline: "No-Gi",
    photoKey,
    waiverAcceptedAt: new Date(),
    ...toProfileFields(parsed.data),
  });

  await writeAuditLog({ actorId: String(user._id), action: "USER_REGISTERED", targetType: "User", targetId: String(user._id) });
  await sendVerificationCode(String(user._id), email);

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

  redirect(user.role === "ADMIN" ? "/admin" : "/fighter/dashboard");
}

export async function verifyEmailAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
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
