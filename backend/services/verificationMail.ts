import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { connectDB } from "@/server/db/connect";
import { EmailVerification } from "@/server/models/EmailVerification";
import { User } from "@/server/models/User";
import { getEmailAdapter } from "@/server/email/console";
import { greetingLine } from "@/server/email/greeting";
import { simpleEmail } from "@/server/email/templates/simple";

const CODE_TTL_MS = 15 * 60 * 1000;

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function sendVerificationCode(userId: string, email: string): Promise<void> {
  await connectDB();
  const code = String(randomInt(100000, 1000000));
  await EmailVerification.deleteMany({ userId });
  await EmailVerification.create({
    userId,
    codeHash: hashCode(code),
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  });
  const message = simpleEmail({
    subject: "Your Up 'n Roll code",
    badge: "VERIFICATION",
    headline: "Your verification code",
    paragraphs: [`Your code is ${code}. It expires in 15 minutes.`],
    preheader: `Your Up 'n Roll code is ${code}.`,
  });
  await getEmailAdapter().send({ to: email, ...message });
}

export async function confirmVerificationCode(email: string, code: string): Promise<{ userId: string; displayName: string } | null> {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || user.emailVerified !== false) return null;

  const pending = await EmailVerification.findOne({ userId: user._id }).sort({ createdAt: -1 });
  if (!pending || pending.expiresAt.getTime() < Date.now()) return null;

  const given = Buffer.from(hashCode(code.trim()));
  const stored = Buffer.from(pending.codeHash);
  if (given.length !== stored.length || !timingSafeEqual(given, stored)) return null;

  user.emailVerified = true;
  user.emailVerifiedAt = new Date();
  await user.save();
  await EmailVerification.deleteMany({ userId: user._id });

  const { FighterProfile } = await import("@/server/models/FighterProfile");
  const profile = await FighterProfile.findOne({ userId: user._id }).lean();
  const name = profile?.displayName || email;
  const welcome = simpleEmail({
    subject: "Welcome to Up 'n Roll",
    badge: "WELCOME",
    headline: "You're in.",
    greeting: greetingLine(name),
    paragraphs: [
      "Your account is ready. The next card is Up 'n Roll Superfight on Saturday 23 January 2027.",
    ],
    cta: { label: "Visit Up 'n Roll", href: "/" },
    preheader: "Your Up 'n Roll account is ready.",
  });
  await getEmailAdapter().send({ to: email, ...welcome });

  return { userId: String(user._id), displayName: name };
}
