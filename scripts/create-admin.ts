/**
 * Local-only admin bootstrap. NOT an HTTP endpoint — per Part M, there is
 * no public admin registration. Run with:
 *   npx tsx --env-file=.env.local scripts/create-admin.ts --email you@example.com --password "..."
 * or pass --email/--password directly with MONGODB_URI/SESSION_SECRET already exported.
 */
import { connectDB } from "../backend/db/connect";
import { User } from "../backend/models/User";
import { hashPassword } from "../backend/auth/password";

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const email = (getArg("--email") ?? process.env.ADMIN_SEED_EMAIL ?? "").toLowerCase().trim();
  const password = getArg("--password") ?? process.env.ADMIN_SEED_PASSWORD ?? "";
  const displayName = (getArg("--name") ?? process.env.ADMIN_SEED_NAME ?? "").trim();

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create-admin.ts --email <email> --password <password> [--name \"James\"]");
    process.exit(1);
  }
  if (password.length < 10) {
    console.error("Password must be at least 10 characters.");
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "ADMIN";
    existing.passwordHash = await hashPassword(password);
    if (displayName) existing.displayName = displayName;
    await existing.save();
    console.log(`Updated existing user ${email} to role ADMIN.`);
  } else {
    await User.create({
      email,
      passwordHash: await hashPassword(password),
      role: "ADMIN",
      displayName: displayName || "",
    });
    console.log(`Created admin user ${email}.`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
