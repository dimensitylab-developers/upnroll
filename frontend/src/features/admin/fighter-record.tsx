import type { AdminFighterView } from "@/server/services/fighterService";
import { SectionBanner } from "@/components/home/section-banner";
import { WAIVER_CLAUSES, WAIVER_IMPORTANT } from "@/features/fighters/waiver";

function shown(value: string) {
  return value.trim() || "—";
}

function yesNo(ready: boolean, value: boolean) {
  if (!ready) return "—";
  return value ? "Yes" : "No";
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words">{value}</dd>
    </div>
  );
}

/** Read-only mirror of the fighter registration / profile form sections. */
export function FighterRecord({ fighter }: { fighter: AdminFighterView }) {
  const ready = Boolean(fighter.dateOfBirth);
  const name = shown(fighter.displayName);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start gap-4 border-2 border-black bg-black px-4 py-5 text-white shadow-[5px_5px_0_0_#c8102e] sm:px-5">
        <div className="w-full max-w-[7.5rem] aspect-[3/4] overflow-hidden border-2 border-white bg-white flex items-center justify-center">
          {fighter.hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/v1/admin/fighters/${fighter.userId}/photo`}
              alt={`${name} passport photograph`}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="px-2 text-center text-[10px] uppercase tracking-wider text-black/50">No photograph</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red">Full name (as per ID)</p>
          <h2 className="text-display mt-1 text-2xl font-semibold sm:text-3xl">{name}</h2>
          <p className="mt-2 break-all text-sm text-white/70">{shown(fighter.email)}</p>
          <p className="mt-1 text-xs text-white/50">
            {[fighter.academy, fighter.cityState, fighter.weightDivision].filter((part) => part.trim()).join(" · ") || "Profile incomplete"}
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <SectionBanner>1. Personal information</SectionBanner>
        <dl className="grid gap-x-4 gap-y-3 border-2 border-black bg-white p-4 sm:grid-cols-2 sm:p-5">
          <Line label="Full name (as per ID)" value={name} />
          <Line label="Email" value={shown(fighter.email)} />
          <Line label="Date of birth" value={shown(fighter.dateOfBirth)} />
          <Line label="Age" value={ready ? String(fighter.age) : "—"} />
          <Line label="Gender" value={shown(fighter.gender)} />
          <Line label="Mobile number" value={shown(fighter.mobile)} />
          <Line label="Nationality" value={shown(fighter.nationality)} />
          <Line label="Aadhaar card number" value={shown(fighter.aadhaar)} />
          <Line label="City / State" value={shown(fighter.cityState)} />
          <Line label="Emergency contact name" value={shown(fighter.emergencyContactName)} />
          <Line label="Relationship" value={shown(fighter.emergencyRelationship)} />
          <Line label="Blood group" value={shown(fighter.bloodGroup)} />
        </dl>
      </section>

      <section className="space-y-4">
        <SectionBanner>2. Competition details</SectionBanner>
        <dl className="grid gap-x-4 gap-y-3 border-2 border-black bg-white p-4 sm:grid-cols-2 sm:p-5">
          <Line label="Academy / team name" value={shown(fighter.academy)} />
          <Line label="Head coach / coach name" value={shown(fighter.headCoach)} />
          <Line label="Belt rank" value={shown(fighter.beltRank)} />
          <Line label="Years training" value={ready ? String(fighter.yearsTraining) : "—"} />
          <Line label="Weight division" value={shown(fighter.weightDivision)} />
          <Line label="How did you hear about Up ’n Roll?" value={shown(fighter.heardAbout)} />
        </dl>
      </section>

      <section className="space-y-4">
        <SectionBanner>3. Medical information</SectionBanner>
        <dl className="grid gap-x-4 gap-y-3 border-2 border-black bg-white p-4 sm:grid-cols-2 sm:p-5">
          <Line label="Medical condition / injury?" value={yesNo(ready, fighter.hasMedicalCondition)} />
          <Line label="If yes, please specify" value={shown(fighter.medicalConditionDetail)} />
          <Line label="Any allergies?" value={yesNo(ready, fighter.hasAllergies)} />
          <Line label="If yes, please specify" value={shown(fighter.allergiesDetail)} />
          <Line label="Currently taking medication?" value={yesNo(ready, fighter.takingMedication)} />
          <Line label="Medically fit to compete?" value={yesNo(ready, fighter.medicallyFit)} />
        </dl>
      </section>

      <section className="space-y-4">
        <SectionBanner>4. Terms and conditions</SectionBanner>
        <ol className="list-decimal space-y-2 border-2 border-black bg-white p-4 pl-8 text-sm">
          {WAIVER_CLAUSES.map((clause) => (
            <li key={clause}>{clause}</li>
          ))}
        </ol>
        <p className="border-2 border-black bg-amber-50 px-4 py-3 text-sm">{WAIVER_IMPORTANT}</p>
        <p className="text-sm text-muted-foreground">
          {fighter.waiverAcceptedAt
            ? `Agreed on ${new Date(fighter.waiverAcceptedAt).toLocaleString("en-IN")}.`
            : "Terms not marked as agreed on this profile yet."}
        </p>
      </section>
    </div>
  );
}
