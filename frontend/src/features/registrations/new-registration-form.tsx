"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createRegistrationAction, type RegistrationActionState } from "./actions";
import { GrapplerForm, type GrapplerDefaults } from "@/features/fighters/grappler-form";
import { formGenderToDivisionGender } from "@/features/fighters/grappler-schema";
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
  gender: "" | "MALE" | "FEMALE";
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
  hasParentalConsentImage,
  parentalConsentImageVersion,
  waiverAcceptedAt,
}: {
  divisions: DivisionOption[];
  defaults: GrapplerDefaults;
  hasAadhaarImage: boolean;
  aadhaarImageVersion: string;
  hasParentalConsentImage: boolean;
  parentalConsentImageVersion: string;
  waiverAcceptedAt: string | null;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createRegistrationAction, initialState);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">("");
  const [formGender, setFormGender] = useState(defaults.gender || "");
  const [divisionId, setDivisionId] = useState("");
  const [consent, setConsent] = useState(false);
  const [agreement, setAgreement] = useState(false);

  const hasTaxonomy = divisions.some((d) => d.experienceLevel === "BEGINNER" || d.experienceLevel === "INTERMEDIATE");
  const divisionGender = formGenderToDivisionGender(formGender);
  const filteredDivisions = !hasTaxonomy
    ? divisions
    : experienceLevel
      ? divisions.filter((d) => {
          const experienceOk = d.experienceLevel === experienceLevel || d.experienceLevel === "";
          const genderOk =
            !d.gender || !divisionGender || d.gender === divisionGender;
          return experienceOk && genderOk;
        })
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
    return <p className="text-sm text-muted-foreground">No events are open for registration right now.</p>;
  }

  const navigating = Boolean(state.redirectTo);
  const formDefaults = { ...defaults, gender: formGender || defaults.gender };

  return (
    <GrapplerForm
      id="registration-main"
      mode="event"
      state={navigating ? { ...state, error: undefined } : state}
      formAction={formAction}
      pending={pending || navigating}
      submitDisabled={!divisionId || !consent || !agreement || navigating}
      defaults={formDefaults}
      onGenderChange={(gender) => {
        setFormGender(gender);
        setDivisionId("");
      }}
      hasAadhaarImage={hasAadhaarImage}
      aadhaarImageVersion={aadhaarImageVersion}
      hasParentalConsentImage={hasParentalConsentImage}
      parentalConsentImageVersion={parentalConsentImageVersion}
      waiverAcceptedAt={waiverAcceptedAt}
      submitLabel={navigating ? "Opening payment…" : "Continue to payment"}
      top={
        <section className="space-y-4">
          <SectionBanner>Event entry</SectionBanner>
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
                    <SelectItem value="BEGINNER">Beginner (white belts)</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate (blue & purple)</SelectItem>
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
                        : !formGender
                          ? "Set gender in personal information below"
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
              <p className="mt-1 text-xs text-muted-foreground">
                Weight classes follow your gender and experience level. Beginner is white belt only; Intermediate is blue or purple.
              </p>
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
              Agreement. There is no full refund on cancellation. I may transfer my spot to a friend, or accept a 50% refund when cancellation is approved one month or more before the event. Mouthguard is compulsory.
            </span>
          </label>
        </section>
      }
    />
  );
}
