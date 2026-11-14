"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { claimTeammateTransferAction, type ClaimTransferActionState } from "./actions";
import { GrapplerForm, type GrapplerDefaults } from "@/features/fighters/grappler-form";
import { SectionBanner } from "@/components/home/section-banner";

const initialState: ClaimTransferActionState = {};

export function ClaimTransferForm({
  token,
  eventName,
  divisionName,
  defaults,
  hasAadhaarImage,
  aadhaarImageVersion,
  hasParentalConsentImage,
  parentalConsentImageVersion,
  waiverAcceptedAt,
}: {
  token: string;
  eventName: string;
  divisionName: string;
  defaults: GrapplerDefaults;
  hasAadhaarImage: boolean;
  aadhaarImageVersion: string;
  hasParentalConsentImage: boolean;
  parentalConsentImageVersion: string;
  waiverAcceptedAt: string | null;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(claimTeammateTransferAction, initialState);
  const [consent, setConsent] = useState(false);
  const [agreement, setAgreement] = useState(false);

  useEffect(() => {
    if (state.redirectTo) router.push(state.redirectTo);
  }, [state.redirectTo, router]);

  const navigating = Boolean(state.redirectTo);

  return (
    <GrapplerForm
      id="claim-transfer-main"
      mode="event"
      state={navigating ? { ...state, error: undefined } : state}
      formAction={formAction}
      pending={pending || navigating}
      submitDisabled={!consent || !agreement || navigating}
      defaults={defaults}
      hasAadhaarImage={hasAadhaarImage}
      aadhaarImageVersion={aadhaarImageVersion}
      hasParentalConsentImage={hasParentalConsentImage}
      parentalConsentImageVersion={parentalConsentImageVersion}
      waiverAcceptedAt={waiverAcceptedAt}
      submitLabel={navigating ? "Taking the spot…" : "Take this spot"}
      top={
        <section className="space-y-3">
          <SectionBanner>Transfer seat</SectionBanner>
          <input type="hidden" name="token" value={token} />
          <p className="text-sm text-muted-foreground">
            Taking seat: <span className="font-semibold text-foreground">{eventName}</span>
            {" · "}
            <span className="font-semibold text-foreground">{divisionName}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Complete your grappler details, upload identity proof, and agree to the terms. Your gender and belt must
            match this division. This is free — you replace your teammate in the same bracket spot.
          </p>
        </section>
      }
      bottom={
        <section className="space-y-4">
          <SectionBanner>Consent</SectionBanner>
          <input type="hidden" name="consent" value={consent ? "yes" : ""} />
          <input type="hidden" name="agreement" value={agreement ? "yes" : ""} />
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>Consent. I agree to compete under the published rules and I accept the risks of combat sports.</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={agreement}
              onChange={(event) => setAgreement(event.target.checked)}
            />
            <span>
              Agreement. I take this transferred seat by choice. Mouthguard is compulsory; I bring my own. There is no
              full refund on cancellation after I hold the spot.
            </span>
          </label>
        </section>
      }
    />
  );
}
