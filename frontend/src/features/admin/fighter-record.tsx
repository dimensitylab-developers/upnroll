import type { AdminFighterView } from "@/server/services/fighterService";

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

export function FighterRecord({ fighter }: { fighter: AdminFighterView }) {
  const ready = Boolean(fighter.dateOfBirth);

  return (
    <div className="grid sm:grid-cols-[7.5rem_1fr] gap-4 items-start">
      <div className="border-2 border-black bg-white w-full max-w-[7.5rem] aspect-[3/4] overflow-hidden flex items-center justify-center">
        {fighter.hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/v1/admin/fighters/${fighter.userId}/photo`}
            alt={`${fighter.displayName} passport photograph`}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-[10px] uppercase tracking-wider text-center px-2 text-muted-foreground">No photograph</span>
        )}
      </div>
      <dl className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
        <Line label="Full name" value={shown(fighter.displayName)} />
        <Line label="Email" value={shown(fighter.email)} />
        <Line label="Date of birth" value={shown(fighter.dateOfBirth)} />
        <Line label="Age" value={ready ? String(fighter.age) : "—"} />
        <Line label="Gender" value={shown(fighter.gender)} />
        <Line label="Mobile" value={shown(fighter.mobile)} />
        <Line label="Nationality" value={shown(fighter.nationality)} />
        <Line label="Aadhaar" value={shown(fighter.aadhaar)} />
        <Line label="City / State" value={shown(fighter.cityState)} />
        <Line label="Emergency contact" value={shown(fighter.emergencyContactName)} />
        <Line label="Relationship" value={shown(fighter.emergencyRelationship)} />
        <Line label="Blood group" value={shown(fighter.bloodGroup)} />
        <Line label="Academy / team" value={shown(fighter.academy)} />
        <Line label="Head coach" value={shown(fighter.headCoach)} />
        <Line label="Belt rank" value={shown(fighter.beltRank)} />
        <Line label="Years training" value={ready ? String(fighter.yearsTraining) : "—"} />
        <Line label="Weight division" value={shown(fighter.weightDivision)} />
        <Line label="Heard about Up ’n Roll" value={shown(fighter.heardAbout)} />
        <Line label="Medical condition" value={yesNo(ready, fighter.hasMedicalCondition)} />
        <Line label="Condition detail" value={shown(fighter.medicalConditionDetail)} />
        <Line label="Allergies" value={yesNo(ready, fighter.hasAllergies)} />
        <Line label="Allergy detail" value={shown(fighter.allergiesDetail)} />
        <Line label="Taking medication" value={yesNo(ready, fighter.takingMedication)} />
        <Line label="Medically fit" value={yesNo(ready, fighter.medicallyFit)} />
        <Line
          label="Terms agreed"
          value={fighter.waiverAcceptedAt ? new Date(fighter.waiverAcceptedAt).toLocaleString("en-IN") : "—"}
        />
      </dl>
    </div>
  );
}
