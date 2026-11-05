import { getSession } from "@/server/auth/session";
import { connectDB } from "@/server/db/connect";
import { FighterProfile } from "@/server/models/FighterProfile";
import { ProfileForm } from "@/features/profile/profile-form";

export default async function FighterProfilePage() {
  const session = await getSession();
  await connectDB();
  const profile = session ? await FighterProfile.findOne({ userId: session.user._id }).lean() : null;

  return (
    <div className="manga-panel p-8 max-w-sm mx-auto">
      <h1 className="text-display text-2xl font-semibold mb-6">Your profile</h1>
      <ProfileForm
        displayName={profile?.displayName ?? ""}
        gym={profile?.gym ?? ""}
        discipline={profile?.discipline ?? ""}
      />
    </div>
  );
}
