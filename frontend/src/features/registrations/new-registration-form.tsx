"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createRegistrationAction, type RegistrationActionState } from "./actions";
import { GrapplerForm, type GrapplerDefaults } from "@/features/fighters/grappler-form";
import { divisionGenderCode } from "@/features/fighters/weight-bands";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { SectionBanner } from "@/components/home/section-banner";

type ExperienceLevel = "BEGINNER" | "INTERMEDIATE";

type DivisionOption = {
  id: string;
  eventId: string;
  name: string;
  discipline: string;
  eventName: string;
  experienceLevel: "" | ExperienceLevel;
  gender: string;
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
  initialEventId = "",
}: {
  divisions: DivisionOption[];
  defaults: GrapplerDefaults;
  hasAadhaarImage: boolean;
  aadhaarImageVersion: string;
  hasParentalConsentImage: boolean;
  parentalConsentImageVersion: string;
  waiverAcceptedAt: string | null;
  initialEventId?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createRegistrationAction, initialState);

  const events = useMemo(() => {
    const seen = new Map<string, string>();
    for (const division of divisions) {
      if (!seen.has(division.eventId)) seen.set(division.eventId, division.eventName);
    }
    return [...seen.entries()].map(([id, name]) => ({ id, name }));
  }, [divisions]);

  const preferredEventId = useMemo(() => {
    if (initialEventId && events.some((event) => event.id === initialEventId)) return initialEventId;
    if (events.length === 1) return events[0].id;
    return "";
  }, [events, initialEventId]);

  const [eventId, setEventId] = useState(preferredEventId);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">("");
  const [divisionId, setDivisionId] = useState("");
  const [consent, setConsent] = useState(false);
  const [agreement, setAgreement] = useState(false);
  const [gender, setGender] = useState(defaults.gender ?? "");

  const eventDivisions = useMemo(
    () => (eventId ? divisions.filter((d) => d.eventId === eventId) : []),
    [divisions, eventId]
  );

  const hasTaxonomy = eventDivisions.some(
    (d) => d.experienceLevel === "BEGINNER" || d.experienceLevel === "INTERMEDIATE"
  );

  const filteredDivisions = useMemo(() => {
    const code = divisionGenderCode(gender);
    const byGender = !code
      ? eventDivisions
      : eventDivisions.filter((division) => !division.gender || division.gender === code);

    if (!hasTaxonomy) return byGender;
    if (!experienceLevel) return [];
    return byGender.filter((d) => d.experienceLevel === experienceLevel || d.experienceLevel === "");
  }, [eventDivisions, experienceLevel, gender, hasTaxonomy]);

  useEffect(() => {
    if (state.redirectTo) router.push(state.redirectTo);
  }, [state.redirectTo, router]);

  useEffect(() => {
    if (!eventId && preferredEventId) setEventId(preferredEventId);
  }, [eventId, preferredEventId]);

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
  const eventLocked = events.length === 1;

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
      hasParentalConsentImage={hasParentalConsentImage}
      parentalConsentImageVersion={parentalConsentImageVersion}
      waiverAcceptedAt={waiverAcceptedAt}
      submitLabel={navigating ? "Opening payment…" : "Continue to payment"}
      onGenderChange={setGender}
      top={
        <section className="space-y-4">
          <SectionBanner>Event entry</SectionBanner>
          <div className="grid max-w-md gap-4">
            <div>
              <Label htmlFor="eventId" className="mb-1.5 block">
                Event
              </Label>
              <Select
                value={eventId}
                onValueChange={(value) => {
                  setEventId(value);
                  setExperienceLevel("");
                  setDivisionId("");
                }}
                disabled={eventLocked}
              >
                <SelectTrigger id="eventId" aria-label="Event">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {eventLocked ? (
                <p className="mt-1 text-xs text-muted-foreground">Only this event is open for registration.</p>
              ) : null}
            </div>
            {hasTaxonomy && (
              <div>
                <Label htmlFor="experienceLevel" className="mb-1.5 block">
                  Division
                </Label>
                <Select
                  value={experienceLevel}
                  onValueChange={(value) => {
                    setExperienceLevel(value as ExperienceLevel);
                    setDivisionId("");
                  }}
                  disabled={!eventId}
                >
                  <SelectTrigger id="experienceLevel" aria-label="Division">
                    <SelectValue
                      placeholder={eventId ? "Select Beginner or Intermediate" : "Choose an event first"}
                    />
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
                disabled={!eventId || (hasTaxonomy && !experienceLevel)}
              >
                <SelectTrigger id="divisionId" aria-label="Weight class">
                  <SelectValue
                    placeholder={
                      !eventId
                        ? "Choose an event first"
                        : hasTaxonomy && !experienceLevel
                          ? "Choose experience level first"
                          : !gender
                            ? "Set gender in personal information below"
                            : "Select a weight class"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredDivisions.map((division) => (
                    <SelectItem key={division.id} value={division.id}>
                      {weightClassLabel(division.name)} ({division.discipline})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                Weight classes follow your gender and experience level. Beginner is white belt only; Intermediate is blue or purple.
              </p>
              {eventId && gender && filteredDivisions.length === 0 && (!hasTaxonomy || experienceLevel) && (
                <p className="mt-1 text-xs text-muted-foreground">No open divisions match this gender and level yet.</p>
              )}
            </div>
          </div>
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
              Agreement. There is no full refund on cancellation. I may transfer my spot to a friend, or accept a 50% refund when cancellation is approved one month or more before the event. Mouthguard is compulsory; I bring my own.
            </span>
          </label>
        </section>
      }
    />
  );
}
