import type { Metadata } from "next";
import { actorFromSession, getSession } from "@/server/auth/session";
import { getFighterProfile } from "@/server/services/fighterService";
import { ProfileForm } from "@/features/profile/profile-form";
import type { GrapplerDefaults } from "@/features/fighters/grappler-form";

/** Session/DB-bound route — allow blocking navigation under Cache Components. */
export const instant = false;

export const metadata: Metadata = { title: "Profile" };

function yesNo(value: boolean | undefined, ready: boolean): string {
  if (!ready) return "";
  return value ? "yes" : "no";
}

export default async function FighterProfilePage() {
  const session = await getSession();
  const profile = session ? await getFighterProfile(actorFromSession(session)) : null;
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
        Belt, years training, academy, and coach are what the seeding board reads. Aadhaar and medical answers stay off public pages. Organizers see the full form in the admin panel.
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
