import { getSession } from "@/server/auth/session";
import { connectDB } from "@/server/db/connect";
import { FighterProfile } from "@/server/models/FighterProfile";
import { ProfileForm } from "@/features/profile/profile-form";
import type { GrapplerDefaults } from "@/features/fighters/grappler-form";

function yesNo(value: boolean | undefined, ready: boolean): string {
  if (!ready) return "";
  return value ? "yes" : "no";
}

export default async function FighterProfilePage() {
  const session = await getSession();
  await connectDB();
  const profile = session ? await FighterProfile.findOne({ userId: session.user._id }).lean() : null;
  const ready = Boolean(profile?.dateOfBirth);
  const defaults: GrapplerDefaults = {
    displayName: profile?.displayName ?? "",
    dateOfBirth: profile?.dateOfBirth ?? "",
    age: ready ? String(profile?.age ?? "") : "",
    gender: profile?.gender ?? "",
    mobile: profile?.mobile ?? "",
    nationality: profile?.nationality ?? "",
    aadhaar: profile?.aadhaar ?? "",
    cityState: profile?.cityState ?? "",
    emergencyContactName: profile?.emergencyContactName ?? "",
    emergencyRelationship: profile?.emergencyRelationship ?? "",
    bloodGroup: profile?.bloodGroup ?? "",
    academy: profile?.academy || profile?.gym || "",
    headCoach: profile?.headCoach ?? "",
    beltRank: profile?.beltRank ?? "",
    yearsTraining: ready ? String(profile?.yearsTraining ?? 0) : "",
    weightDivision: profile?.weightDivision ?? "",
    heardAbout: profile?.heardAbout ?? "",
    hasMedicalCondition: yesNo(profile?.hasMedicalCondition, ready),
    medicalConditionDetail: profile?.medicalConditionDetail ?? "",
    hasAllergies: yesNo(profile?.hasAllergies, ready),
    allergiesDetail: profile?.allergiesDetail ?? "",
    takingMedication: yesNo(profile?.takingMedication, ready),
    medicallyFit: yesNo(profile?.medicallyFit, ready),
  };

  return (
    <div className="manga-panel p-6 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-display text-2xl font-semibold mb-2">Your profile</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Belt, years training, academy, and coach are what the seeding board reads. Aadhaar and medical answers stay on this page.
      </p>
      <ProfileForm
        defaults={defaults}
        hasPhoto={Boolean(profile?.photoKey)}
        photoVersion={profile?.updatedAt ? new Date(profile.updatedAt).getTime().toString() : ""}
        waiverAcceptedAt={profile?.waiverAcceptedAt ? new Date(profile.waiverAcceptedAt).toISOString() : null}
      />
    </div>
  );
}
