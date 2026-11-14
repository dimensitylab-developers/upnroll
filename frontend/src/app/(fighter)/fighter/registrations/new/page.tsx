import { requireActor } from "@/server/auth/session";
import { listOpenDivisionsForRegistration } from "@/server/services/registrationService";
import { getFighterProfile } from "@/server/services/fighterService";
import { NewRegistrationForm } from "@/features/registrations/new-registration-form";
import type { GrapplerDefaults } from "@/features/fighters/grappler-form";

/** Session/DB-bound route — allow blocking navigation under Cache Components. */
export const instant = false;

function yesNo(value: boolean | undefined) {
  return value ? "yes" : "no";
}

export default async function NewRegistrationPage() {
  const actor = await requireActor("FIGHTER");
  const [divisions, profile] = await Promise.all([
    listOpenDivisionsForRegistration(actor),
    getFighterProfile(actor),
  ]);

  const imageVersion = profile?.updatedAt ? String(new Date(profile.updatedAt).getTime()) : "0";
  const defaults: GrapplerDefaults = {
    displayName: profile?.displayName ?? "",
    dateOfBirth: profile?.dateOfBirth ?? "",
    age: profile?.age ? String(profile.age) : "",
    gender: profile?.gender ?? "",
    mobile: profile?.mobile ?? "",
    nationality: profile?.nationality ?? "",
    cityState: profile?.cityState ?? "",
    emergencyContactName: profile?.emergencyContactName ?? "",
    emergencyRelationship: profile?.emergencyRelationship ?? "",
    bloodGroup: profile?.bloodGroup ?? "",
    academy: profile?.academy ?? "",
    headCoach: profile?.headCoach ?? "",
    beltRank: profile?.beltRank ?? "",
    yearsTraining: profile?.yearsTraining ? String(profile.yearsTraining) : "",
    careerWins: profile?.careerWins != null ? String(profile.careerWins) : "0",
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
        Fill the grappler form for this card, upload your Aadhaar card image, pick a division, then continue to payment.
      </p>
      <NewRegistrationForm
        divisions={divisions.map((division) => ({
          id: String(division._id),
          eventId: String(division.eventId),
          name: division.name,
          discipline: division.discipline,
          eventName: division.event?.name ?? "Unknown event",
        }))}
        defaults={defaults}
        hasAadhaarImage={Boolean(profile?.aadhaarImageKey)}
        aadhaarImageVersion={imageVersion}
        waiverAcceptedAt={profile?.waiverAcceptedAt ? new Date(profile.waiverAcceptedAt).toISOString() : null}
      />
    </div>
  );
}
