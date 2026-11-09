import { actorFromSession, requireSession } from "@/server/auth/session";
import { listOpenDivisionsForRegistration } from "@/server/services/registrationService";
import { getFighterProfile } from "@/server/services/fighterService";
import { NewRegistrationForm } from "@/features/registrations/new-registration-form";
import type { GrapplerDefaults } from "@/features/fighters/grappler-form";

function yesNo(value: boolean | undefined) {
  return value ? "yes" : "no";
}

export default async function NewRegistrationPage() {
  const actor = actorFromSession(await requireSession());
  const [divisions, profile] = await Promise.all([
    listOpenDivisionsForRegistration(),
    getFighterProfile(actor),
  ]);

  const defaults: GrapplerDefaults = {
    displayName: profile?.displayName ?? "",
    dateOfBirth: profile?.dateOfBirth ?? "",
    age: profile?.age ? String(profile.age) : "",
    gender: profile?.gender ?? "",
    mobile: profile?.mobile ?? "",
    nationality: profile?.nationality ?? "",
    aadhaar: profile?.aadhaar ?? "",
    cityState: profile?.cityState ?? "",
    emergencyContactName: profile?.emergencyContactName ?? "",
    emergencyRelationship: profile?.emergencyRelationship ?? "",
    bloodGroup: profile?.bloodGroup ?? "",
    academy: profile?.academy ?? "",
    headCoach: profile?.headCoach ?? "",
    beltRank: profile?.beltRank ?? "",
    yearsTraining: profile?.yearsTraining ? String(profile.yearsTraining) : "",
    weightDivision: profile?.weightDivision ?? "",
    heardAbout: profile?.heardAbout ?? "",
    hasMedicalCondition: profile ? yesNo(Boolean(profile.hasMedicalCondition)) : "",
    medicalConditionDetail: profile?.medicalConditionDetail ?? "",
    hasAllergies: profile ? yesNo(Boolean(profile.hasAllergies)) : "",
    allergiesDetail: profile?.allergiesDetail ?? "",
    takingMedication: profile ? yesNo(Boolean(profile.takingMedication)) : "",
    medicallyFit: profile?.medicallyFit ? "yes" : "",
  };

  return (
    <div className="mx-auto max-w-3xl manga-panel p-6 sm:p-8">
      <h1 className="mb-2 text-display text-2xl font-semibold">Register for an event</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Fill the grappler form for this card, pick a division, then continue to payment.
      </p>
      <NewRegistrationForm
        divisions={divisions.map((division) => ({
          id: String(division._id),
          name: division.name,
          discipline: division.discipline,
          eventName: division.event?.name ?? "Unknown event",
        }))}
        defaults={defaults}
        hasPhoto={Boolean(profile?.photoKey)}
        photoVersion={profile?.updatedAt ? String(new Date(profile.updatedAt).getTime()) : "0"}
        waiverAcceptedAt={profile?.waiverAcceptedAt ? new Date(profile.waiverAcceptedAt).toISOString() : null}
      />
    </div>
  );
}
