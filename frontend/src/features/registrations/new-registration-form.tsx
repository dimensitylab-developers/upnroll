"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createRegistrationAction, type RegistrationActionState } from "./actions";
import { GrapplerForm, type GrapplerDefaults } from "@/features/fighters/grappler-form";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { SectionBanner } from "@/components/home/section-banner";
import { CouponField } from "./coupon-field";

type DivisionOption = {
  id: string;
  eventId: string;
  name: string;
  discipline: string;
  eventName: string;
};

const initialState: RegistrationActionState = {};

export function NewRegistrationForm({
  divisions,
  defaults,
  hasPhoto,
  photoVersion,
  waiverAcceptedAt,
}: {
  divisions: DivisionOption[];
  defaults: GrapplerDefaults;
  hasPhoto: boolean;
  photoVersion: string;
  waiverAcceptedAt: string | null;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createRegistrationAction, initialState);
  const [divisionId, setDivisionId] = useState("");
  const [consent, setConsent] = useState(false);
  const [agreement, setAgreement] = useState(false);
  const selectedDivision = divisions.find((d) => d.id === divisionId) ?? null;

  useEffect(() => {
    if (state.redirectTo) router.push(state.redirectTo);
  }, [state.redirectTo, router]);

  if (divisions.length === 0) {
    return <p className="text-sm text-muted-foreground">No divisions are currently open for registration.</p>;
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
      hasPhoto={hasPhoto}
      photoVersion={photoVersion}
      waiverAcceptedAt={waiverAcceptedAt}
      submitLabel={navigating ? "Opening payment…" : "Continue to payment"}
      top={
        <section className="space-y-4">
          <SectionBanner>The card</SectionBanner>
          <div className="max-w-md">
            <Label htmlFor="divisionId" className="mb-1.5 block">Division</Label>
            <input type="hidden" name="divisionId" value={divisionId} />
            <Select value={divisionId} onValueChange={setDivisionId}>
              <SelectTrigger id="divisionId" aria-label="Division">
                <SelectValue placeholder="Select a division" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((division) => (
                  <SelectItem key={division.id} value={division.id}>
                    {division.eventName} — {division.name} ({division.discipline})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <span>Agreement. I agree to the cancellation rule: a cancellation one month before the event is a 50% refund. Inside that month there is no refund.</span>
          </label>
        </section>
      }
    />
  );
}
