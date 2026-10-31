import { getSession } from "@/server/auth/session";
import { connectDB } from "@/server/db/connect";
import { FighterProfile } from "@/server/models/FighterProfile";

export default async function FighterDashboardPage() {
  const session = await getSession();
  await connectDB();
  const profile = session ? await FighterProfile.findOne({ userId: session.user._id }).lean() : null;

  return (
    <div className="manga-panel p-8 max-w-xl mx-auto">
      <p className="text-xs uppercase tracking-widest text-brand-red font-semibold mb-2">Phase 2 foundation</p>
      <h1 className="text-display text-2xl font-semibold mb-2">
        Welcome, {profile?.displayName ?? session?.user.email}
      </h1>
      <p className="text-sm text-muted-foreground">
        This confirms your session and role are working end to end. Registrations, payments,
        matches, and rankings are built in later phases — see{" "}
        <code className="text-xs">docs/architecture/route-map.md</code>.
      </p>
    </div>
  );
}
