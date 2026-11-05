"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileActionState } from "./actions";
import { GrapplerForm, type GrapplerDefaults } from "@/features/fighters/grappler-form";

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
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
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
  );
}
