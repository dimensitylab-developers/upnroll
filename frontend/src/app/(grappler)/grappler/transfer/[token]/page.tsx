import { requireActor } from "@/server/auth/session";
import { getFighterProfile } from "@/server/services/fighterService";
import { peekTeammateTransfer } from "@/server/services/teammateTransfer";
import { toAppError } from "@/server/http/errors";
import { ClaimTransferForm } from "@/features/requests/claim-transfer-form";
import type { GrapplerDefaults } from "@/features/fighters/grappler-form";
import { normalizeWeightBand } from "@/features/fighters/weight-bands";
import Link from "next/link";

/** Session/DB-bound route; never instant-prerender. */
export const instant = false;

function yesNo(value: boolean | undefined) {
  return value ? "yes" : "no";
}

export default async function ClaimTransferPage({ params }: { params: Promise<{ token: string }> }) {
  const actor = await requireActor("GRAPPLER");
  const { token } = await params;

  let seat: Awaited<ReturnType<typeof peekTeammateTransfer>>;
  try {
    seat = await peekTeammateTransfer(token);
  } catch (err) {
    return (
      <div className="manga-panel mx-auto max-w-lg space-y-3 p-8">
        <h1 className="text-display text-2xl font-semibold">Transfer link</h1>
        <p className="text-sm text-primary">{toAppError(err).message}</p>
        <Link href="/grappler/dashboard" className="text-sm font-semibold underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const profile = await getFighterProfile(actor);
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
    instagramHandle: profile?.instagramHandle ?? "",
    academy: profile?.academy ?? "",
    headCoach: profile?.headCoach ?? "",
    beltRank: profile?.beltRank ?? "",
    yearsTraining: profile?.yearsTraining ? String(profile.yearsTraining) : "",
    pastRecord: profile?.pastRecord ?? "",
    weightDivision: normalizeWeightBand(profile?.weightDivision ?? "", profile?.gender ?? ""),
    heardAbout: profile?.heardAbout ?? "",
    hasMedicalCondition: profile ? yesNo(Boolean(profile.hasMedicalCondition)) : "",
    medicalConditionDetail: profile?.medicalConditionDetail ?? "",
    hasAllergies: profile ? yesNo(Boolean(profile.hasAllergies)) : "",
    allergiesDetail: profile?.allergiesDetail ?? "",
    takingMedication: profile ? yesNo(Boolean(profile.takingMedication)) : "",
    medicallyFit: profile?.medicallyFit ? "yes" : "",
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl manga-panel overflow-visible p-6 sm:p-8">
      <h1 className="mb-2 text-display text-2xl font-semibold">Take a teammate&apos;s spot</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Fill the grappler form for this seat (identity proof, medical answers, and waiver), then confirm. Your teammate
        leaves the event when you finish.
      </p>
      <ClaimTransferForm
        token={token}
        eventName={seat.eventName}
        divisionName={seat.divisionName}
        defaults={defaults}
        hasAadhaarImage={Boolean(profile?.aadhaarImageKey)}
        aadhaarImageVersion={imageVersion}
        hasParentalConsentImage={Boolean(profile?.parentalConsentImageKey)}
        parentalConsentImageVersion={imageVersion}
        waiverAcceptedAt={profile?.waiverAcceptedAt ? new Date(profile.waiverAcceptedAt).toISOString() : null}
      />
    </div>
  );
}