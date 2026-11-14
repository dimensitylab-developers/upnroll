"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createRegistrationAction, type RegistrationActionState } from "./actions";
import { GrapplerForm, type GrapplerDefaults } from "@/features/fighters/grappler-form";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { SectionBanner } from "@/components/home/section-banner";
import { CouponField } from "./coupon-field";

type ExperienceLevel = "BEGINNER" | "INTERMEDIATE";

type DivisionOption = {
  id: string;
  eventId: string;
  name: string;
  discipline: string;
  eventName: string;
  experienceLevel: "" | ExperienceLevel;
};

const initialState: RegistrationActionState = {};

function weightClassLabel(name: string) {
  return name.replace(/\s*·\s*(Beginner|Intermediate)\s*$/i, "").trim() || name;
}

export function NewRegistrationForm({
  divisions,
  defaults,
  hasAadhaarImage,
  aadhaarImageVersion,
  waiverAcceptedAt,
}: {
  divisions: DivisionOption[];
  defaults: GrapplerDefaults;
  hasAadhaarImage: boolean;
  aadhaarImageVersion: string;
  waiverAcceptedAt: string | null;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createRegistrationAction, initialState);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">("");
  const [divisionId, setDivisionId] = useState("");
  const [consent, setConsent] = useState(false);
  const [agreement, setAgreement] = useState(false);

  const hasTaxonomy = divisions.some((d) => d.experienceLevel === "BEGINNER" || d.experienceLevel === "INTERMEDIATE");
  const filteredDivisions = !hasTaxonomy
    ? divisions
    : experienceLevel
      ? divisions.filter((d) => d.experienceLevel === experienceLevel || d.experienceLevel === "")
      : [];
  const selectedDivision = divisions.find((d) => d.id === divisionId) ?? null;

  useEffect(() => {
    if (state.redirectTo) router.push(state.redirectTo);
  }, [state.redirectTo, router]);

  useEffect(() => {
    if (!divisionId) return;
    if (!filteredDivisions.some((d) => d.id === divisionId)) {
      setDivisionId("");
    }
  }, [divisionId, filteredDivisions]);

  if (divisions.length === 0) {
    return <p className="text-sm text-muted-foreground">No open cards are available for registration right now.</p>;
  }

  const navigating = Boolean(state.redirectTo);

  return (
    <GrapplerForm
      id="registration-main"
      mode="event"
      state={navigating ? { ...state, error: undefined } : state}
      formAction={formAction}
      pending={pending || navigating}
      submitDisabled={!divisionId || !consent || !agreement || navigating}
      defaults={defaults}
      hasAadhaarImage={hasAadhaarImage}
      aadhaarImageVersion={aadhaarImageVersion}
      waiverAcceptedAt={waiverAcceptedAt}
      submitLabel={navigating ? "Opening payment…" : "Continue to payment"}
      top={
        <section className="space-y-4">
          <SectionBanner>The card</SectionBanner>
          <div className="grid max-w-md gap-4">
            {hasTaxonomy && (
              <div>
                <Label htmlFor="experienceLevel" className="mb-1.5 block">
                  Experience level
                </Label>
                <Select
                  value={experienceLevel}
                  onValueChange={(value) => {
                    setExperienceLevel(value as ExperienceLevel);
                    setDivisionId("");
                  }}
                >
                  <SelectTrigger id="experienceLevel" aria-label="Experience level">
                    <SelectValue placeholder="Select Beginner or Intermediate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="divisionId" className="mb-1.5 block">
                Weight class
              </Label>
              <input type="hidden" name="divisionId" value={divisionId} />
              <Select
                value={divisionId}
                onValueChange={setDivisionId}
                disabled={hasTaxonomy && !experienceLevel}
              >
                <SelectTrigger id="divisionId" aria-label="Weight class">
                  <SelectValue
                    placeholder={
                      hasTaxonomy && !experienceLevel
                        ? "Choose experience level first"
                        : "Select a weight class"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredDivisions.map((division) => (
                    <SelectItem key={division.id} value={division.id}>
                      {division.eventName} — {weightClassLabel(division.name)} ({division.discipline})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <CouponField eventId={selectedDivision?.eventId ?? null} disabled={pending || navigating} />
        </section>
      }
      bottom={
        <section className="space-y-4">
          <SectionBanner>Consent</SectionBanner>
          <input type="hidden" name="consent" value={consent ? "yes" : ""} />
          <input type="hidden" name="agreement" value={agreement ? "yes" : ""} />
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            <span>Consent. I agree to compete under the published rules and I accept the risks of combat sports.</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={agreement} onChange={(event) => setAgreement(event.target.checked)} />
            <span>
              Agreement. There is no full refund on cancellation. I may transfer my spot to a friend, or accept a 50% cut when a cancellation is approved. Mouthguard is compulsory — if I forget mine, I will buy one from the mouthguard sponsor on site.
            </span>
          </label>
        </section>
      }
    />
  );
}
