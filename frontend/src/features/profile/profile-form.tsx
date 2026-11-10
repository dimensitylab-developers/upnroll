"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction, type ProfileActionState } from "./actions";
import { GrapplerForm, type GrapplerDefaults } from "@/features/fighters/grappler-form";
import { ActionStatusDialog } from "@/components/action-status-dialog";

const initialState: ProfileActionState = {};

export function ProfileForm({
  defaults,
  hasPhoto,
  photoVersion,
  waiverAcceptedAt,
}: {
  defaults: GrapplerDefaults;
  hasPhoto: boolean;
  photoVersion: string;
  waiverAcceptedAt: string | null;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  const fieldErrorCount = state.fieldErrors
    ? Object.values(state.fieldErrors).filter((list) => list && list.length > 0).length
    : 0;

  const dialogError =
    state.error ||
    (fieldErrorCount > 0
      ? `Could not save yet — fix ${fieldErrorCount} field${fieldErrorCount === 1 ? "" : "s"} on the form (Aadhaar must be 12 digits, medical fitness must be Yes, and required grappler details cannot be blank).`
      : undefined);

  useEffect(() => {
    if (!state.success) return;
    // Reload server defaults so the fighter sees what was stored.
    router.refresh();
  }, [state.success, router]);

  return (
    <>
      <ActionStatusDialog
        error={dialogError}
        success={state.success}
        errorTitle="Profile not saved"
        successTitle="Profile saved"
        successMessage="Your fighter details were stored. Open your public card from Rankings when you want to check how it looks."
      />
      <GrapplerForm
        mode="profile"
        state={state}
        formAction={formAction}
        pending={pending}
        defaults={defaults}
        hasPhoto={hasPhoto}
        photoVersion={photoVersion}
        waiverAcceptedAt={waiverAcceptedAt}
      />
    </>
  );
}
