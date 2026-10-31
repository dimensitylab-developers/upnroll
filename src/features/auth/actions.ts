"use server";

import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { connectDB } from "@/server/db/connect";
import { User } from "@/server/models/User";
import { FighterProfile } from "@/server/models/FighterProfile";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { createSession, destroySession, getSession } from "@/server/auth/session";
import { writeAuditLog } from "@/server/audit/log";
import { registerSchema, loginSchema } from "./schemas";

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
  const parsed = registerSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { displayName, email, password } = parsed.data;

  await connectDB();

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);
  // Public registration only ever creates FIGHTER accounts — see Part M:
  // admin accounts are created exclusively via scripts/create-admin.ts.
  const user = await User.create({ email, passwordHash, role: "FIGHTER" });

  let slug = slugify(displayName);
  for (let attempt = 0; attempt < 5; attempt++) {
    const taken = await FighterProfile.findOne({ slug }).lean();
    if (!taken) break;
    slug = slugify(displayName);
  }
  await FighterProfile.create({ userId: user._id, displayName, slug });

  await createSession(String(user._id));
  await writeAuditLog({ actorId: String(user._id), action: "USER_REGISTERED", targetType: "User", targetId: String(user._id) });

  redirect("/fighter/dashboard");
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
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

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return genericError;

  await createSession(String(user._id));
  await writeAuditLog({ actorId: String(user._id), action: "USER_LOGIN", targetType: "User", targetId: String(user._id) });

  redirect(user.role === "ADMIN" ? "/admin" : "/fighter/dashboard");
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
